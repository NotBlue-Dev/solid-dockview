import { Accessor, JSXElement, createContext, createSignal, onCleanup } from "solid-js";
import { DockviewComponent, DockviewComponentOptions, DockviewPanel } from "dockview-core";

import { useSyncDOMAttrs } from "./dom-attrs";
import { dockviewEventNames } from "./events";
import type { DockPanelProps, DockViewProps } from "./index";
import { keyedDebounce, watch } from "./utils";
import { panelStateLUT } from "./global-api";
import { dockViewPropKeys } from "./DockView";
import {
  PanelContentRenderer,
  PanelTabRenderer,
  createGroupHeaderComponent,
  createTabComponent,
  createWatermarkComponent,
} from "./glue-component";

export const DockViewContext = createContext<ReturnType<typeof createDockViewContext>>();

export function createDockViewContext(props: DockViewProps) {
  const element = document.createElement("div");
  useSyncDOMAttrs(element, props, dockViewPropKeys);

  const [extraRenders, updateExtraRenders] = createSignal<Accessor<JSXElement>[]>([]);
  const addExtraRender = (render: Accessor<JSXElement>) => {
    updateExtraRenders((x) => x.concat(render));
    return () => {
      updateExtraRenders((arr) => arr.filter((x) => x !== render));
    };
  };

  const WatermarkComponentClass = createWatermarkComponent(props, addExtraRender);
  const TabComponentClass = createTabComponent(props, addExtraRender);

  const options: DockviewComponentOptions = {
    createComponent: (options) => new PanelContentRenderer(),
    createTabComponent: (options) => props.createTabComponent ? new TabComponentClass() : new PanelTabRenderer(),
    defaultTabComponent: props.defaultTabComponent,
    singleTabMode: props.singleTabMode,
    defaultRenderer: props.defaultRenderer,
    theme: props.theme,
    className: props.class,
    hideBorders: props.hideBorders,
    locked: props.locked,
    disableDnd: props.disableDnd,
    disableFloatingGroups: props.disableFloatingGroups,
    floatingGroupBounds: props.floatingGroupBounds,
    createWatermarkComponent: () => new WatermarkComponentClass(),
    createPrefixHeaderActionComponent: createGroupHeaderComponent(props, "prefixHeaderActionsComponent", addExtraRender),
    createLeftHeaderActionComponent: createGroupHeaderComponent(props, "leftHeaderActionsComponent", addExtraRender),
    createRightHeaderActionComponent: createGroupHeaderComponent(props, "rightHeaderActionsComponent", addExtraRender),
    scrollbars: props.scrollbars,
    debug: props.debug,
    dndEdges: props.dndEdges,
    popoutUrl: props.popoutUrl,
    noPanelsOverlay: props.noPanelsOverlay,
    disableAutoResizing: props.disableAutoResizing,
    disableTabsOverflowList: props.disableTabsOverflowList,
  };

  props.onBeforeCreate?.(options, props);
  const dockview = new DockviewComponent(element, options);

  // add event listeners
  dockviewEventNames.forEach((eventName) => {
    watch(
      () => props[eventName],
      (listener: any) => {
        if (typeof listener !== "function") return;

        const disposable = dockview[eventName](listener);
        onCleanup(() => disposable.dispose());
      },
    );
  });

  const setPanelOpenStatus = keyedDebounce(
    (panel: DockviewPanel, isOpen: boolean) => (panelStateLUT.get(panel)!.isOpen = isOpen),
  );
  dockview.onDidAddPanel((panel) => setPanelOpenStatus(panel as DockviewPanel, true));
  dockview.onDidRemovePanel((panel) => setPanelOpenStatus(panel as DockviewPanel, false));

  return {
    element,
    dockview,
    extraRenders,
    props,
  };
}

export interface PanelContentRendererParams {
  contentElement: HTMLElement;
  tabElement: HTMLElement;
  props: DockPanelProps;
}
