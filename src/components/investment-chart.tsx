"use client";

import { useMemo } from "react";
import { SimulationResult } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  CartesianGrid,
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/helpers";

interface InvestmentChartProps {
  results: SimulationResult[];
}

export default function InvestmentChart({ results }: InvestmentChartProps) {
  // Create chart config for visualization
  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};
    results.forEach((result) => {
      config[result.vaultId] = {
        label: result.vaultName,
        color: result.color,
      };
    });
    return config;
  }, [results]);

  // Process chart data
  const chartData = useMemo(() => {
    if (!results.length) return [];

    // Use the first result's data points as the base
    const basePoints = results[0].dataPoints;

    return basePoints.map((point) => {
      const dataPoint: { [key: string]: string | number } = {
        time: point.time,
      };

      // Add each result's value for this time point
      results.forEach((result) => {
        const matchingPoint = result.dataPoints.find(
          (p) => p.time === point.time,
        );
        if (matchingPoint) {
          dataPoint[result.vaultId] = matchingPoint.value;
        }
      });

      return dataPoint;
    });
  }, [results]);

  if (!results.length) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center items-center h-64">
          <p className="text-muted-foreground">
            Enter your investment details and calculate projection to see
            results
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Investment Growth Projection</CardTitle>
        <CardDescription>
          {results[0].timeFrameValue === 1
            ? "1 month"
            : `${results[0].timeFrameValue} ${results[0].timeFrameUnit}`}{" "}
          projection
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="h-[300px] md:h-[400px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
              accessibilityLayer
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval="preserveStartEnd" // Only show some ticks to avoid clutter
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) =>
                  `${formatCurrency(value, results[0].asset)}`
                }
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <defs>
                {results.map((result) => (
                  <linearGradient
                    key={`gradient-${result.vaultId}`}
                    id={`fill-${result.vaultId}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={result.color}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={result.color}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                ))}
              </defs>
              {results.map((result) => (
                <Area
                  key={result.vaultId}
                  type="natural"
                  dataKey={result.vaultId}
                  stroke={result.color}
                  fill={`url(#fill-${result.vaultId})`}
                  fillOpacity={0.4}
                  strokeWidth={2}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="grid w-full gap-4">
          {results.map((result) => (
            <div key={result.vaultId} className="grid gap-2">
              <div className="flex items-center gap-2 font-medium">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ background: result.color }}
                />
                <span>
                  {result.vaultName} ({result.networkName}) -{" "}
                  {(result.apy * 100).toFixed(2)}% APY
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">
                  {result.returns.percentageReturn > 0 ? "+" : ""}
                  {result.returns.percentageReturn.toFixed(2)}% return
                </span>
                ({formatCurrency(result.returns.finalValue, results[0].asset)}{" "}
                final from{" "}
                {formatCurrency(result.returns.totalInvested, results[0].asset)}{" "}
                invested)
              </div>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}
