"use client"

import { TrendingUp } from "lucide-react"
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts"
import { getExpForLevel } from '@/lib/levels';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface LegionRaidChartsProps {
  legionLevel?: number | null;
  raidPower?: number | null;
  level?: number | null;
  exp?: number | null;
  expData?: Record<string, string | number | null>;
}

export function LegionRaidCharts({ legionLevel, raidPower, level, exp, expData }: LegionRaidChartsProps) {
  // Calculate percentages (assuming max values for visualization)
  const maxLegionLevel = 12000; // Adjust based on game max
  const maxRaidPower = 1500000000; // Adjust based on game max

  const legionPercentage = legionLevel ? Math.min((legionLevel / maxLegionLevel) * 100, 100) : 0;
  const raidPowerPercentage = raidPower ? Math.min((raidPower / maxRaidPower) * 100, 100) : 0;

  const legionChartData = [{ month: "legion", legion: 100 - legionPercentage, maxLegion: legionPercentage }]
  const raidChartData = [{ month: "raid", raid: 100 - raidPowerPercentage, maxRaid: raidPowerPercentage }]
  // Calculate exp data for level chart
  const expNeeded = level ? getExpForLevel(level) : null;
  const expLeft = (expNeeded && typeof expNeeded === 'number' && exp) ? Math.max(0, expNeeded - exp) : 0;

  // Parse exp string values (e.g., "2.123T" -> 2123000000000)
  const parseExpValue = (expStr: string | number | null): number | null => {
    if (!expStr) return null;
    const str = String(expStr);
    const match = str.match(/^(\d+(?:\.\d+)?)([TBMK]?)$/);
    if (!match) return null;

    const value = parseFloat(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'T': return value * 1e12; // Trillion
      case 'B': return value * 1e9;  // Billion
      case 'M': return value * 1e6;  // Million
      case 'K': return value * 1e3;  // Thousand
      default: return value;
    }
  };

  // Calculate ETA based on expData
  const calculateETA = () => {
    if (!expData || !expLeft || expLeft <= 0) return null;

    // Try to get daily exp from the expData structure
    let dailyExp: number | null = null;

    // Check for 7d average daily exp first
    if (expData['7d Average Daily Exp']) {
      dailyExp = parseExpValue(expData['7d Average Daily Exp']);
    }
    // Fallback to 14d average daily exp
    else if (expData['14d Average Daily Exp']) {
      dailyExp = parseExpValue(expData['14d Average Daily Exp']);
    }
    // Check for other possible daily exp keys
    else if (expData.daily_exp) {
      dailyExp = parseExpValue(expData.daily_exp);
    }

    // Calculate days needed using the daily exp rate
    if (dailyExp && dailyExp > 0) {
      const daysNeeded = expLeft / dailyExp;
      return `${daysNeeded.toFixed(1)} day${daysNeeded !== 1 ? 's' : ''}`;
    }

    // Fallback: estimate based on reasonable daily exp rates
    const estimatedDailyExp = Math.max(expLeft / 30, 100000); // At least 100k exp per day estimate
    const daysNeeded = expLeft / estimatedDailyExp;
    return `${daysNeeded.toFixed(1)} day${daysNeeded !== 1 ? 's' : ''}`;
  };

  const eta = calculateETA();
  const levelChartData = [{ month: "level", currentExp: exp || 0, expLeft }]
  
  const chartConfig = {
    maxLegion: {
      label: "Current Legion",
      color: "hsl(var(--chart-1))",
    },
    legion: {
      label: "Max Legion",
      color: "hsl(var(--primary))",
    },
    raid: {
      label: "Raid Power",
      color: "hsl(var(--chart-1))",
    },
    maxRaid: {
      label: "Raid Power",
      color: "hsl(var(--primary))",
    },
    currentExp: {
      label: "Current EXP",
      color: "hsl(var(--chart-1))",
    },
    expLeft: {
      label: "EXP Left",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig

  const formatNumber = (num: number): string => {
    if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-0 xl:h-2">
      {/* Legion Chart */}
      <Card className="flex flex-col border-0 xl:h-2">
        <CardContent className="flex flex-1 items-center pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square w-full max-w-[200px]"
          >
            <RadialBarChart
              data={legionChartData}
              endAngle={180}
              innerRadius={60}
              outerRadius={100}
            >
              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) - 12}
                            className="fill-foreground text-lg font-bold"
                          >
                            {legionLevel ? legionLevel : "N/A"}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 8}
                            className="fill-muted-foreground text-xs"
                          >
                            Legion
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </PolarRadiusAxis>
              <RadialBar
                dataKey="legion"
                stackId="a"
                cornerRadius={5}
                fill="var(--color-legion)"
                className="stroke-transparent stroke-2 opacity-20"
              />
              <RadialBar
                dataKey="maxLegion"
                stackId="a"
                cornerRadius={5}
                fill="var(--color-maxLegion)"
                className="stroke-transparent stroke-2"
              />
            </RadialBarChart>
          </ChartContainer>
        </CardContent>

      </Card>

      {/* Raid Power Chart */}
      <Card className="flex flex-col border-0 xl:h-2">

        <CardContent className="flex flex-1 items-center pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square w-full max-w-[200px]"
          >
            <RadialBarChart
              data={raidChartData}
              endAngle={180}
              innerRadius={60}
              outerRadius={100}
            >

              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) - 12}
                            className="fill-foreground text-lg font-bold"
                          >
                            {raidPower ? formatNumber(raidPower) : "N/A"}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 8}
                            className="fill-muted-foreground text-xs"
                          >
                            Raid Power
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </PolarRadiusAxis>
              <RadialBar
                dataKey="raid"
                stackId="a"
                cornerRadius={5}
                fill="var(--color-maxRaid)"
                className="stroke-transparent stroke-2 opacity-20"
              />
              <RadialBar
                dataKey="maxRaid"
                stackId="a"
                cornerRadius={5}
                fill="var(--color-raid)"
                className="stroke-transparent stroke-2"
              />
            </RadialBarChart>
          </ChartContainer>
        </CardContent>

      </Card>

      <Card className="flex flex-col border-0 xl:h-2">

        <CardContent className="flex flex-1 items-center pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square w-full max-w-[200px]"
          >
            <RadialBarChart
              data={levelChartData}
              endAngle={180}
              innerRadius={60}
              outerRadius={100}
            >
              <ChartTooltip
                cursor={false}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-popover text-popover-foreground text-sm px-2 py-1 rounded-md shadow-lg border border-border">
                        <div className="font-medium">Level Progress</div>
                        <div className="flex justify-between gap-4 text-xs">
                          <span className="text-muted-foreground">Exp Left:</span>
                          <span className="font-mono">
                            {formatNumber(expLeft)}
                          </span>
                        </div>
                        {eta && (
                          <div className="flex justify-between gap-4 text-xs mt-1">
                            <span className="text-muted-foreground">
                              ETA to Lv. {level ? level + 1 : 'next'}:
                            </span>
                            <span className="font-mono">
                              {eta}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) - 12}
                            className="fill-foreground text-lg font-bold"
                          >
                            {exp ? formatNumber(exp) : "N/A"}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 8}
                            className="fill-muted-foreground text-xs"
                          >
                            EXP
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </PolarRadiusAxis>
              <RadialBar
                dataKey="expLeft"
                stackId="a"
                cornerRadius={5}
                fill="var(--color-expLeft)"
                className="stroke-transparent stroke-2 opacity-20"
              />
              <RadialBar
                dataKey="currentExp"
                stackId="a"
                cornerRadius={5}
                fill="var(--color-currentExp)"
                className="stroke-transparent stroke-2"
              />
            </RadialBarChart>
          </ChartContainer>
        </CardContent>

      </Card>
    </div>
  )
}
