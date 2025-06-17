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

interface SubscribersChartProps {
  data: MonthlyReport[];
}

export default function SubscribersChart({ data }: SubscribersChartProps) {
  const sortedData = [...data].sort(
    (a, b) => new Date(a.report_date).getTime() - new Date(b.report_date).getTime()
  );

  const chartData = {
    labels: sortedData.map((report) =>
      format(new Date(report.report_date), "yyyy年M月", { locale: ja })
    ),
    datasets: [
      {
        label: "総登録者数",
        data: sortedData.map((report) => report.total_subscribers),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "登録者増加数",
        data: sortedData.map((report) => report.subscriber_growth),
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        fill: false,
        tension: 0.4,
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
        text: "登録者数の推移",
        font: {
          size: 16,
          weight: "bold" as const,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            if (context.dataset.label === "総登録者数") {
              return `総登録者数: ${context.parsed.y.toLocaleString()}人`;
            } else {
              return `登録者増加数: ${
                context.parsed.y > 0 ? "+" : ""
              }${context.parsed.y.toLocaleString()}人`;
            }
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return value.toLocaleString() + "人";
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
