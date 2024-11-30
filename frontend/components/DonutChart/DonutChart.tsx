import React, {
  FunctionComponent,
  useRef,
  useEffect,
} from "react";
import { Props, CanvasRef, ChartRef } from "./DonutChart.interface";
import styles from "./DonutChart.module.css";
import clsx from "clsx";
import Chart from "chart.js/auto";

const DonutChart: FunctionComponent<Props> = (props: Props) => {
  const { className, data, options } = props;
  const chartRef: ChartRef = useRef();
  const canvasRef: CanvasRef = useRef();

  useEffect(() => {
    if (canvasRef.current) {
      chartRef.current = new Chart(canvasRef.current, {
        type: "doughnut",
        data: data,
        options: {
          ...options,
          datasets: {
            doughnut: {
              clip: 100,
            },
          },
          layout: {
            padding: 4
          },
          maintainAspectRatio: false,
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
          },
        },
        
      });
    }

    return () => {
      chartRef.current = undefined;
      canvasRef.current = undefined;
    };
  }, [canvasRef, data, options]);

  return (
    <canvas
      ref={canvasRef}
      className={clsx(styles.container, className)}
    ></canvas>
  );
};

export default DonutChart;
