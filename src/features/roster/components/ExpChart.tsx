import React from 'react';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { formatNumber, formatDateLabel } from '../utils/formatUtils';

// Bar chart component for experience data using Recharts
const ExpChart = ({
  data,
  labels,
  timePeriod
}: {
  data: number[];
  labels: string[];
  timePeriod: '7D' | '14D' | '30D'
}) => {
  if (!data || data.length === 0) return null;

  // Filter data based on time period
  const daysToShow = timePeriod === '7D' ? 7 : timePeriod === '14D' ? 14 : 30;
  const filteredData = data.slice(-daysToShow);
  const filteredLabels = labels.slice(-daysToShow);

  // Prepare chart data
  const chartData = filteredData.map((value, index) => ({
    date: formatDateLabel(filteredLabels[index] || `Day ${index + 1}`),
    experience: value,
    fullDate: filteredLabels[index] || `Day ${index + 1}`
  }));

  // Chart configuration
  const chartConfig = {
    experience: {
      label: "Experience",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="w-full h-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <BarChart
          accessibilityLayer
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 6)} // Show first 6 chars to avoid crowding
          />
          <ChartTooltip
            cursor={false}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-popover text-popover-foreground text-sm px-2 py-1 rounded-md shadow-lg border border-border">
                    <div className="font-medium">{data.fullDate}</div>
                    <div className="text-primary">
                      {formatNumber(data.experience)} exp
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="experience"
            fill="var(--color-experience)"
            radius={4}
            label={timePeriod !== '30D' ? {
              position: 'top',
              formatter: (value: number) => formatNumber(value),
              style: {
                fontSize: '10px',
                fill: 'hsl(var(--foreground))',
                fontWeight: '500'
              }
            } : false}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
};

export default ExpChart;