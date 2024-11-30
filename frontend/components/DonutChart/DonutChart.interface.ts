import { MutableRefObject } from "react";
import { Chart, ChartConfiguration } from "chart.js";

export interface Props {
  className?: string;
  data: ChartConfiguration["data"],
  options: ChartConfiguration["options"]
}

export declare type ChartRef = MutableRefObject<undefined | Chart>;
export declare type CanvasRef = MutableRefObject<undefined | HTMLCanvasElement>;