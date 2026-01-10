"use client";

import { Project } from "@/types/project";
import { motion } from "framer-motion";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import dynamic from "next/dynamic";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LazyLine = dynamic(() => import("react-chartjs-2").then(mod => mod.Line), { ssr: false });

interface ResultsHighlightsProps {
  project: Project;
}

export default function ResultsHighlights({ project }: ResultsHighlightsProps) {
  const chartData = {
    labels: project.results.visualizationData.labels,
    datasets: [
      {
        label: project.results.visualizationData.datasets[0].label,
        data: project.results.visualizationData.datasets[0].data,
        borderColor: "#2EE6D6",
        backgroundColor: "rgba(46, 230, 214, 0.15)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(46, 230, 214, 0.15)",
        },
        ticks: {
          color: "#E0F7FA",
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#E0F7FA",
        },
      },
    },
  };

  return (
    <section className="pt-8 md:pt-12 pb-16 md:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
            Results & Impact
          </h2>
          {project.resultsSummary && (
            <p className="text-lg text-teal-100 max-w-2xl mx-auto mb-2">{project.resultsSummary}</p>
          )}
          <p className="text-lg text-teal-100 max-w-2xl mx-auto">
            Key metrics and outcomes that demonstrate the project&apos;s success
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {project.results.metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-gray-900 rounded-2xl p-8 shadow-lg text-center"
            >
              <h3 className="text-4xl font-bold text-teal-400 mb-2">
                {metric.value}
              </h3>
              <p className="text-lg font-medium text-white mb-2">
                {metric.label}
              </p>
              <p className="text-sm text-teal-200 font-semibold">{metric.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-gray-900 rounded-2xl p-8 shadow-lg"
        >
          <h3 className="text-xl font-heading font-bold text-white mb-6">
            Growth Trajectory
          </h3>
          <div className="w-full h-[220px] md:w-[calc(100%+4rem)] md:-m-8 md:h-[300px]">
            <LazyLine data={chartData} options={chartOptions} />
          </div>
          <p className="text-sm text-teal-200 font-semibold mt-2 text-center">Monthly anomaly detection rate</p>
        </motion.div>
      </div>
    </section>
  );
} 