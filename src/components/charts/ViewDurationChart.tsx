"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { MonthlyReport } from "@/types/youtube";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ViewDurationChartProps {
  data: MonthlyReport[];
}

export default function ViewDurationChart({ data }: ViewDurationChartProps) {
  const sortedData = [...data].sort(
    (a, b) => new Date(a.report_date).getTime() - new Date(b.report_date).getTime()
  );

  const chartData = {
    labels: sortedData.map((report) =>
      format(new Date(report.report_date), "yyyy年M月", { locale: ja })
    ),
    datasets: [
      {
        label: "平均視聴時間（秒）",
        data: sortedData.map((report) => report.average_view_duration),
        borderColor: "rgb(168, 85, 247)",
        backgroundColor: "rgba(168, 85, 247, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "平均視聴率（%）",
        data: sortedData.map((report) => report.average_view_percentage),
        borderColor: "rgb(245, 158, 11)",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        fill: false,
        tension: 0.4,
        yAxisID: "y1",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "平均視聴時間と視聴率の推移",
        font: {
          size: 16,
          weight: "bold" as const,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            if (context.dataset.label === "平均視聴時間（秒）") {
              const minutes = Math.floor(context.parsed.y / 60);
              const seconds = context.parsed.y % 60;
              return `平均視聴時間: ${minutes}分${seconds}秒`;
            } else {
              return `平均視聴率: ${context.parsed.y.toFixed(1)}%`;
            }
          },
        },
      },
    },
    scales: {
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        title: {
          display: true,
          text: "視聴時間（秒）",
        },
        ticks: {
          callback: function (value: any) {
            const minutes = Math.floor(value / 60);
            const seconds = value % 60;
            return `${minutes}:${seconds.toString().padStart(2, "0")}`;
          },
        },
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        title: {
          display: true,
          text: "視聴率（%）",
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: function (value: any) {
            return value.toFixed(1) + "%";
          },
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <Line data={chartData} options={options} />
    </div>
  );
}
