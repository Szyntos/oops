import React, { useState } from "react";
import { Styles } from "../../utils/Styles";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Line,
  ReferenceLine,
} from "recharts";
import * as d3 from "d3";
import { useLevelsData } from "../../hooks/StudentProfile/useLevelsData";

interface Student {
  nick: string;
  totalPoints: number;
}

interface StatisticsBoxProps {
  students: Student[];
  highlightedStudent?: Student | null;
}

export const StatisticsBox: React.FC<StatisticsBoxProps> = ({
  students,
  highlightedStudent,
}) => {
  const [binCount, setBinCount] = useState(10); // State to control bin count
  const { levels } = useLevelsData(); // Fetch level data

  const getHistogramData = (data: Student[], binCount: number) => {
    const points = data.map((student) => student.totalPoints);
    const min = Math.min(...points);
    const max = Math.max(...points);
    const binSize = (max - min) / binCount;

    const bins = Array.from({ length: binCount }, (_, i) => ({
      range: `${(min + i * binSize).toFixed(2)} - ${(min + (i + 1) * binSize).toFixed(2)}`,
      midpoint: min + i * binSize + binSize / 2,
      count: 0,
      highlighted: false,
    }));

    points.forEach((point) => {
      const binIndex = Math.min(
        Math.floor((point - min) / binSize),
        binCount - 1,
      );
      bins[binIndex].count += 1;

      if (
        highlightedStudent &&
        point === highlightedStudent.totalPoints &&
        bins[binIndex].highlighted === false
      ) {
        bins[binIndex].highlighted = true;
      }
    });

    return { bins, min, max };
  };

  const calculateStatistics = (data: Student[]) => {
    const points = data
      .map((student) => student.totalPoints)
      .sort((a, b) => a - b);

    const mean =
      points.reduce((sum, value) => sum + value, 0) / points.length || 0;
    const median =
      points.length % 2 === 0
        ? (points[points.length / 2 - 1] + points[points.length / 2]) / 2
        : points[Math.floor(points.length / 2)];
    const variance =
      points.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
        points.length || 0;
    const stdDev = Math.sqrt(variance);

    return { mean, median, stdDev };
  };

  const calculatePercentile = (
    data: Student[],
    highlightedStudent?: Student | null,
  ) => {
    if (!highlightedStudent) return null;

    const points = data
      .map((student) => student.totalPoints)
      .sort((a, b) => a - b);
    const countBelow = points.filter(
      (point) => point <= highlightedStudent.totalPoints,
    ).length;

    return ((countBelow / points.length) * 100).toFixed(2);
  };

  const fitSkewedDistribution = (data: Student[], range: [number, number]) => {
    const points = data.map((student) => student.totalPoints);

    // Fit a log-normal distribution
    const logMean = d3.mean(points.map((p) => Math.log(p)))!;
    const logStdDev = d3.deviation(points.map((p) => Math.log(p)))!;

    const [min, max] = range;
    const binMidpoints = d3.range(min, max, (max - min) / 100); // 100 evenly spaced points

    const fitted = binMidpoints.map((midpoint) => ({
      midpoint,
      pdf:
        (1 / (midpoint * logStdDev * Math.sqrt(2 * Math.PI))) *
        Math.exp(
          -Math.pow(Math.log(midpoint) - logMean, 2) /
            (2 * logStdDev * logStdDev),
        ),
    }));

    return fitted;
  };

  const {
    bins: histogramData,
    min,
    max,
  } = getHistogramData(students, binCount); // Dynamically use binCount
  const stats = calculateStatistics(students);
  const percentile = calculatePercentile(students, highlightedStudent);
  const fittedCurve = fitSkewedDistribution(students, [min, max]);

  // Scale PDF values to match histogram count range
  const maxCount = Math.max(...histogramData.map((bin) => bin.count));
  const maxPDF = Math.max(...fittedCurve.map((curve) => curve.pdf));
  const scaledCurve = fittedCurve.map((curve) => ({
    midpoint: curve.midpoint,
    pdf: (curve.pdf / maxPDF) * maxCount, // Scale to match histogram height
  }));

  // Combine histogram and scaled curve data for plotting
  const combinedData = histogramData.map((bin) => {
    let lower = null;
    let upper = null;

    for (let i = 0; i < scaledCurve.length; i++) {
      if (scaledCurve[i].midpoint <= bin.midpoint) {
        lower = scaledCurve[i];
      }
      if (scaledCurve[i].midpoint > bin.midpoint) {
        upper = scaledCurve[i];
        break;
      }
    }

    let pdf = 0;
    if (lower && upper) {
      const t =
        (bin.midpoint - lower.midpoint) / (upper.midpoint - lower.midpoint);
      pdf = lower.pdf + t * (upper.pdf - lower.pdf);
    } else if (lower) {
      pdf = lower.pdf;
    }

    return {
      ...bin,
      pdf,
    };
  });

  return (
    <div style={styles.container}>
      <h3>Points Distribution</h3>
      <p>
        <strong>Mean:</strong> {stats.mean.toFixed(2)} |{" "}
        <strong>Median:</strong> {stats.median.toFixed(2)} |{" "}
        <strong>Std. Dev:</strong> {stats.stdDev.toFixed(2)}
      </p>
      {highlightedStudent && (
        <p>
          <strong>{highlightedStudent.nick}'s Percentile:</strong> {percentile}%
        </p>
      )}
      <div style={styles.sliderContainer}>
        <label>
          <strong>Bin Count: {binCount}</strong>
        </label>
        <input
          type="range"
          min="5"
          max="50"
          step="1"
          value={binCount}
          onChange={(e) => setBinCount(Number(e.target.value))}
        />
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={combinedData}>
          <XAxis
            dataKey="midpoint"
            type="number"
            domain={[min, max]}
            label={{ value: "Points", position: "insideBottom", offset: -5 }}
          />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count">
            {combinedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.highlighted ? "#FF5733" : "#82ca9d"} // Highlight color for the specific bar
              />
            ))}
          </Bar>
          <Line type="monotone" dataKey="pdf" stroke="#8884d8" dot={false} />
          {levels.map((level, index) => (
            <ReferenceLine
              key={level.name}
              x={level.minimumPoints}
              label={{
                position: "insideTop",
                value: level.name,
                angle: 0,
                dy: index % 2 === 0 ? 20 : 0, // Stagger labels vertically
                fill: "#000",
                style: { fontSize: "12px", fontWeight: "bold" }, // Optional: Style adjustments
              }}
              stroke="#000"
              strokeDasharray="3 3"
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

const styles: Styles = {
  container: {
    backgroundColor: "lightyellow",
    padding: "1rem",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  sliderContainer: {
    margin: "1rem 0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
};
