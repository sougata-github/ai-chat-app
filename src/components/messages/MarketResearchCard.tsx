"use client";

import React, { useMemo, useState } from "react";
import { ArrowUpRightIcon, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InferUITool } from "ai";
import { marketResearchTool } from "@/lib/tools/tool";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import { MemoizedMarkdown } from "./MemoizedMarkdown";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface MarketResearchCardProps {
  data: InferUITool<typeof marketResearchTool>["output"];
  input: InferUITool<typeof marketResearchTool>["input"];
}

const MarketResearchCard = ({ data, input }: MarketResearchCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get chart colors from CSS variables - convert HSL to hex if needed
  const getChartColor = (index: number) => {
    const colors = [
      "hsl(var(--chart-1))",
      "hsl(var(--chart-2))",
      "hsl(var(--chart-3))",
      "hsl(var(--chart-4))",
      "hsl(var(--chart-5))",
    ];
    return colors[index % colors.length];
  };

  // Memoize chart configurations
  const chartConfigs = useMemo(() => {
    if (!data.chartConfigurations || data.chartConfigurations.length === 0) {
      return [];
    }

    return data.chartConfigurations.map((config, index) => {
      const chartData = config.labels.map((label, i) => ({
        name: label,
        value: config.data[i] || 0,
      }));

      // Use provided color or fallback to CSS variable
      const chartColor =
        config.colors && config.colors.length > 0
          ? config.colors[0]
          : getChartColor(index);

      return {
        type: config.type,
        label: config.label,
        data: chartData,
        color: chartColor,
        index,
        chartConfig: {
          value: {
            label: config.label,
            color: chartColor,
          },
        },
      };
    });
  }, [data.chartConfigurations]);

  const renderChart = React.useCallback((config: (typeof chartConfigs)[0]) => {
    if (config.type === "bar") {
      return (
        <>
          <h3 className="text-sm font-medium mb-8">{config.label}</h3>
          <ChartContainer config={config.chartConfig}>
            <BarChart
              data={config.data}
              margin={{ left: 10, right: 10, top: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) =>
                  value.length > 10 ? `${value.slice(0, 10)}...` : value
                }
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={60}
                domain={["auto", "auto"]}
                allowDataOverflow={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" fill={config.color} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </>
      );
    } else {
      return (
        <>
          <h3 className="text-sm font-medium mb-8">{config.label}</h3>
          <ChartContainer config={config.chartConfig}>
            <LineChart
              data={config.data}
              margin={{ left: 0, right: 10, top: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) =>
                  value.length > 10 ? `${value.slice(0, 10)}...` : value
                }
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={60}
                domain={["auto", "auto"]}
                allowDataOverflow={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={config.color}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </>
      );
    }
  }, []);

  if (data.error) {
    return (
      <div className="mb-10">
        <div className="flex items-center text-base font-medium text-red-500">
          Market Research Error
        </div>
        <div className="text-sm mt-1">
          {data.message || "Unable to perform market research."}
        </div>
      </div>
    );
  }

  return (
    <motion.div className="pl-0 bg-transparent rounded-none transition min-h-[20px] mb-10">
      <div className="px-0">
        <div className="flex items-center text-sm font-medium">
          Market Research Results
        </div>
        <div className="text-sm flex items-start mt-1 gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-fit py-0.5 pl-0 h-auto text-sm text-muted-foreground hover:text-foreground rounded-sm hover:bg-transparent dark:hover:bg-transparent"
          >
            <ChevronRight
              className={cn(
                "size-4 transition-transform duration-200 ease-in-out max-sm:-mt-[1.8px]",
                isExpanded && "rotate-90"
              )}
            />
          </Button>
          <span className="text-xs sm:text-sm">Analysis for {input.query}</span>
        </div>
      </div>

      {/* 1. Sources Section */}
      {data.sources && data.sources.length > 0 && (
        <>
          {isExpanded && (
            <motion.div
              initial={{
                height: 0,
                opacity: 0,
                filter: "blur(4px)",
              }}
              animate={{
                height: "auto",
                opacity: 1,
                filter: "blur(0px)",
              }}
              transition={{
                height: {
                  duration: 0.2,
                  ease: [0.04, 0.62, 0.23, 0.98],
                },
                opacity: {
                  duration: 0.25,
                  ease: "easeInOut",
                },
                filter: {
                  duration: 0.2,
                  ease: "easeInOut",
                },
              }}
              style={{ overflow: "hidden" }}
            >
              <div className="flex flex-col gap-4 px-2 mt-4">
                {data.sources.slice(0, 4).map((source, index) => {
                  const isValidUrl =
                    source.url && /^https?:\/\//.test(source.url);

                  return (
                    <div key={index}>
                      {isValidUrl ? (
                        <Link href={source.url} target="_blank">
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-sm line-clamp-1 flex-1">
                              {source.title}
                            </h4>
                            <ArrowUpRightIcon className="size-4 text-muted-foreground" />
                          </div>

                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <span className="truncate">
                              {new URL(source.url).hostname}
                            </span>
                            {source.publishedDate && (
                              <>
                                <span className="mx-1">|</span>
                                <span>
                                  {new Date(
                                    source.publishedDate
                                  ).toLocaleDateString()}
                                </span>
                              </>
                            )}
                          </div>
                        </Link>
                      ) : (
                        <div>
                          <h4 className="font-medium text-sm">
                            {source.title || "Untitled"}
                          </h4>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <span>No valid link</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* 2. Charts Section - Always visible */}
      {chartConfigs.length > 0 && (
        <div className={cn("mt-8")}>
          {chartConfigs.map((config) => (
            <div
              key={config.index}
              className="mb-4 p-6 border shadow-xs rounded-2xl dark:shadow-none"
            >
              {renderChart(config)}
            </div>
          ))}
        </div>
      )}

      {/* 3. Market Trends Text - Always visible, shown last */}
      {data.marketTrends && (
        <div className="mt-4 px-2">
          <MemoizedMarkdown
            id={`market-research-${input.query}`}
            content={data.marketTrends}
          />
        </div>
      )}
    </motion.div>
  );
};

export default React.memo(MarketResearchCard);
