import { For, JSX, ParentProps, createSignal, onCleanup, onMount } from "solid-js";
import { HTMLDomAttrs } from "./dom-attrs";
import { createDockViewContext, DockViewContext } from "./context";
import { DockviewEventListeners, dockviewEventNames } from "./events";
import { strictKeys } from "./utils";
import style from "./style.scss?inline";
import type { DockviewComponent, DockviewComponentOptions } from "dockview-core";
import { DockViewCreateTabComponentProps, DockViewGroupHeaderComponentProps, DockViewWatermarkProps } from "./user-component";

let styleLoadCounter = 0;

export type DockViewProps = ParentProps<
  Partial<DockviewEventListeners> & {
    /** called before initializing a DockviewComponent. you can modify the options here */
    onBeforeCreate?: (options: DockviewComponentOptions, props: any) => void;

    /** called after DockviewComponent created, before panels' initializing */
    onReady?: (event: { dockview: DockviewComponent }) => void;
    onDispose?: (event: { dockview: DockviewComponent }) => void;

    watermarkComponent?: (props: DockViewWatermarkProps) => JSX.Element;
    leftHeaderActionsComponent?: (props: DockViewGroupHeaderComponentProps) => JSX.Element;
    prefixHeaderActionsComponent?: (props: DockViewGroupHeaderComponentProps) => JSX.Element;
    rightHeaderActionsComponent?: (props: DockViewGroupHeaderComponentProps) => JSX.Element;
    createTabComponent?: (props: DockViewCreateTabComponentProps) => JSX.Element;
    defaultTabComponent?: DockviewComponentOptions["defaultTabComponent"];
    scrollbars?: DockviewComponentOptions["scrollbars"];
    debug?: DockviewComponentOptions["debug"];
    defaultRenderer?: DockviewComponentOptions["defaultRenderer"];
    dndEdges?: DockviewComponentOptions["dndEdges"];
    popoutUrl?: DockviewComponentOptions["popoutUrl"];
    noPanelsOverlay?: DockviewComponentOptions["noPanelsOverlay"];
    disableAutoResizing?: DockviewComponentOptions["disableAutoResizing"];
    disableTabsOverflowList?: DockviewComponentOptions["disableTabsOverflowList"];
    createComponent?: DockviewComponentOptions["createComponent"];
    hideBorders?: DockviewComponentOptions["hideBorders"];
    theme?: DockviewComponentOptions["theme"];
    class?: DockviewComponentOptions["className"];
    locked?: DockviewComponentOptions["locked"];
    disableDnd?: DockviewComponentOptions["disableDnd"];
    singleTabMode?: DockviewComponentOptions["singleTabMode"];
    disableFloatingGroups?: DockviewComponentOptions["disableFloatingGroups"];
    floatingGroupBounds?: DockviewComponentOptions["floatingGroupBounds"];
  }
>;

export const dockViewPropKeys = strictKeys<DockViewProps>()([
  "children",
  // events
  ...dockviewEventNames,
  "onBeforeCreate",
  "onReady",
  "onDispose",

  "watermarkComponent",
  "leftHeaderActionsComponent",
  "prefixHeaderActionsComponent",
  "rightHeaderActionsComponent",

  "defaultRenderer",
  "defaultTabComponent",
  "scrollbars",
  "debug",
  "dndEdges",
  "popoutUrl",
  "noPanelsOverlay",
  "disableAutoResizing",
  "disableTabsOverflowList",
  "createComponent",
  "hideBorders",
  "createTabComponent",
  "theme",
  "class",
  "locked",
  "disableDnd",
  "singleTabMode",
  "disableFloatingGroups",
  "floatingGroupBounds",
]) satisfies readonly string[];

export function DockView(props: DockViewProps & HTMLDomAttrs) {
  const context = createDockViewContext(props);

  if (styleLoadCounter++ === 0) {
    const styleElement = document.createElement("style");
    const parent = document.head || document.body;
    styleElement.textContent = style;
    parent.appendChild(styleElement);
    onCleanup(() => {
      if (!--styleLoadCounter) parent.removeChild(styleElement);
    });
  }

  const [ready, setReady] = createSignal(false);
  onMount(() => {
    const { clientWidth, clientHeight } = context.element;
    context.dockview.layout(clientWidth, clientHeight);
    setReady(true);
    props.onReady?.({ dockview: context.dockview });
  });

  onCleanup(() => {
    props.onDispose?.({ dockview: context.dockview });
    context.dockview.dispose();
  });

  return (
    <DockViewContext.Provider value={context}>
      {context.element}
      {ready() && props.children}
      <For each={context.extraRenders()}>{(el) => el()}</For>
    </DockViewContext.Provider>
  );
}
