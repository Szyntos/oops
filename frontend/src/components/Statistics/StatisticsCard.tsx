import { useState } from "react";
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
import { CustomText } from "../CustomText";
import { tokens } from "../../tokens";
import Slider from "@mui/material/Slider";

const SLIDER_WIDTH = 340;
interface Student {
  nick: string;
  totalPoints: number;
}

interface StatisticsCardProps {
  students: Student[];
  highlightedStudent?: Student | null;
  title: string;
  highlight: boolean;
}

export const StatisticsCard = ({
  students,
  highlightedStudent,
  title,
  highlight,
}: StatisticsCardProps) => {
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

    let pointsSum = 0;
    points.forEach((p) => (pointsSum += p));

    if (pointsSum) {
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
    }

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
  } = getHistogramData(students, binCount);
  const stats = calculateStatistics(students);
  const percentile = calculatePercentile(students, highlightedStudent);
  const fittedCurve = fitSkewedDistribution(students, [min, max]);

  const maxCount = Math.max(...histogramData.map((bin) => bin.count));
  const maxPDF = Math.max(...fittedCurve.map((curve) => curve.pdf));
  const scaledCurve = fittedCurve.map((curve) => ({
    midpoint: curve.midpoint,
    pdf: (curve.pdf / maxPDF) * maxCount,
  }));

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

  const marks = [
    { value: 5, label: "5" },
    { value: 10, label: "10" },
    { value: 15, label: "15" },
    { value: 20, label: "20" },
    { value: 25, label: "25" },
    { value: 30, label: "30" },
    { value: 35, label: "35" },
    { value: 40, label: "40" },
    { value: 45, label: "45" },
    { value: 50, label: "50" },
  ];

  return (
    <div style={styles.card}>
      <div style={styles.headerContainer}>
        <CustomText
          color={
            highlight ? tokens.color.accent.light : tokens.color.text.primary
          }
          bold={true}
          size={tokens.font.header}
        >
          {title}
        </CustomText>
        {highlightedStudent && (
          <CustomText
            color={
              highlight ? tokens.color.accent.light : tokens.color.text.primary
            }
          >
            Twój percentyl: {percentile}%
          </CustomText>
        )}
      </div>

      <div style={styles.sliderContainer}>
        <CustomText>Dostosuj liczbę kolumn: </CustomText>
        <Slider
          value={binCount}
          min={5}
          max={50}
          step={1}
          onChange={(_e, newValue) => setBinCount(newValue as number)}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `${value} kolumn`}
          marks={marks}
          style={{ width: SLIDER_WIDTH }}
        />
      </div>

      <ResponsiveContainer height={300} width={SLIDER_WIDTH + 150}>
        <ComposedChart data={combinedData} height={200}>
          {/* X-Axis with updated text color and adjustments for label and ticks */}
          <XAxis
            dataKey="midpoint"
            type="number"
            domain={[min, max]}
            stroke={tokens.color.text.secondary} // Axis line and tick color
            tick={{
              fill: tokens.color.text.secondary, // Tick label color
              dy: 10, // Adjust vertical positioning of tick labels if necessary
            }}
          />
          {/* Y-Axis with updated text color */}
          <YAxis
            stroke={tokens.color.text.secondary} // Axis line and tick color
            tick={{ fill: tokens.color.text.secondary }} // Tick label color
          />

          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const bin = payload[0].payload; // Access the bin data directly from payload
                return (
                  <div
                    style={{
                      background: "white",
                      padding: "8px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                  >
                    <p style={{ margin: 0, fontSize: 14 }}>
                      Liczba studentów: {bin.count}
                    </p>
                    <p style={{ margin: 0, fontSize: 14 }}>
                      Zakres: {bin.range}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="count">
            {combinedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.highlighted
                    ? tokens.color.accent.dark
                    : tokens.color.accent.light
                } // Highlight color for the specific bar
              />
            ))}
          </Bar>
          <Line
            type="monotone"
            dataKey="pdf"
            stroke={tokens.color.text.secondary}
            dot={false}
          />
          {levels.map((level, index) => (
            <ReferenceLine
              key={level.name}
              x={level.minimumPoints}
              label={{
                position: "insideTop",
                value: level.name,
                angle: 0,
                dy: index % 2 === 0 ? 20 : 0,
                fill: tokens.color.text.primary, // Reference line label color
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  fontFamily: '"Roboto", Helvetica, Arial, sans-serif',
                },
              }}
              stroke={tokens.color.text.secondary} // Reference line color
              strokeDasharray="3 3"
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>

      <div style={styles.resultsContainer}>
        <CustomText>Średnia: {stats.mean.toFixed(2)}</CustomText>
        <CustomText>Mediana: {stats.median.toFixed(2)} </CustomText>
        <CustomText>
          Odchylenie standardowe: {stats.stdDev.toFixed(2)}
        </CustomText>
      </div>
    </div>
  );
};

const styles: Styles = {
  card: {
    display: "flex",
    flexDirection: "column",
    background: tokens.color.card.light,
    padding: 16,
    borderRadius: 12,
    gap: 16,
    width: 540,
  },
  headerContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultsContainer: {
    display: "flex",
    justifyContent: "center",
    gap: 12,
  },
  sliderContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    paddingBottom: 10,
  },
};
