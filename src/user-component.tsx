import {
  DockviewApi,
  DockviewGroupPanel,
  DockviewGroupPanelApi,
  IDockviewPanel,
  WatermarkRendererInitParameters,
  TabPartInitParameters
} from "dockview-core";

export interface DockViewWatermarkProps extends WatermarkRendererInitParameters {
  /** if this watermark places in an empty group, close it. */
  close(): void;
}

export interface DockViewCreateTabComponentProps extends TabPartInitParameters {
  close(): void;
}

export interface DockViewGroupHeaderComponentProps {
  containerApi: DockviewApi;
  api: DockviewGroupPanelApi;
  group: DockviewGroupPanel;

  // reactive
  isGroupActive: boolean;
  activePanel: IDockviewPanel | undefined;
}
