import * as React from "react";
import { 
  A11yTitleType,
  GapType,
  GridAreaType,
  MarginType,
} from "../../utils";
import { ChartProps } from "../Chart";
import { GridProps } from "../Grid";

type ChartType = {
  key: string;
  a11yTitle?: A11yTitleType;
  bounds?: ChartProps["bounds"];
  color?: ChartProps["color"];
  dash?: ChartProps["dash"];
  onClick?: ChartProps["onClick"];
  onHover?: ChartProps["onHover"];
  overflow?: ChartProps["overflow"];
  round?: ChartProps["round"];
  thickness?: ChartProps["thickness"];
  type?: ChartProps["type"];
}

export interface DataChartProps {
  a11yTitle?: A11yTitleType;
  chart: ChartType | ChartType[];
  data: {}[];
  gap?: GridProps["gap"];
  gridArea?: GridAreaType,
  margin?: MarginType;
  pad?: GridProps["pad"];
  size?: ChartProps["size"];
  steps?: [number, number];
  thickness?: ChartProps["thickness"];
  xAxis?: boolean | { guide?: boolean, key?: string, render?: (index:number) => (void) };
  yAxis?: boolean | { guide?: boolean };
}

declare const DataChart: React.FC<DataChartProps>;

export { DataChart };
