"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  CloudSnow,
  CloudFog,
  CloudHail,
  Zap,
} from "lucide-react";
import React, { JSX } from "react";

interface WeatherData {
  location: string;
  country: string;
  current: {
    temp: number;
    condition: string;
    description: string;
    humidity: number;
    windSpeed: number;
  };
  forecast: Array<{
    name: string;
    temp: number;
    condition: string;
    dayIndex: number;
  }>;
  error: boolean;
  message?: string;
}

interface Props {
  data: WeatherData;
}

const weatherIcons: { [key: string]: JSX.Element } = {
  Clear: <Sun className="text-yellow-500 size-6 sm:size-12" />,
  Clouds: <Cloud className="text-gray-500 size-6 sm:size-12" />,
  Rain: <CloudRain className="text-blue-500 size-6 sm:size-12" />,
  Drizzle: <CloudDrizzle className="text-blue-400 size-6 sm:size-12" />,
  Thunderstorm: (
    <CloudLightning className="text-purple-500 size68 sm:size-12" />
  ),
  Snow: <CloudSnow className="text-blue-200 size-6 sm:size-12" />,
  Mist: <CloudFog className="text-gray-400 size-6 sm:size-12" />,
  Smoke: <CloudFog className="text-gray-400 size-6 sm:size-12" />,
  Haze: <CloudFog className="text-gray-400 size-6 sm:size-12" />,
  Dust: <CloudFog className="text-gray-400 size-6 sm:size-12" />,
  Fog: <CloudFog className="text-gray-400 size-6 sm:size-12" />,
  Sand: <CloudFog className="text-gray-400 size-6 sm:size-12" />,
  Ash: <CloudFog className="text-gray-400 size-6 sm:size-12" />,
  Squall: <CloudHail className="text-gray-600 size-6 sm:size-12" />,
  Tornado: <Zap className="text-yellow-500 size-6 sm:size-12" />,
};

const WeatherCard = ({ data }: Props) => {
  if (data.error) {
    return (
      <Card className="w-full bg-transparent dark:shadow-none border border-muted-foreground/15 rounded-lg px-4 shadow">
        <CardHeader className="px-0 border-b outline-muted-foreground/15">
          <CardTitle className="flex items-center text-base font-medium text-red-500">
            Weather Error
          </CardTitle>
          <CardDescription className="text-sm">{data.message}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-transparent dark:shadow-none border border-muted-foreground/15 rounded-lg px-4 shadow">
      <CardHeader className="px-0 border-b outline-muted-foreground/15">
        <CardTitle className="flex items-center text-base font-medium">
          Weather for {data.location}
        </CardTitle>
        <CardDescription className="text-sm ">
          {data.country} •{" "}
          <span className="text-sm capitalize">{data.current.description}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-0">
        <div className="dark:bg-muted-foreground/15 dark:outline-none dark:shadow-none shadow outline outline-muted-foreground/15 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {weatherIcons[data.current.condition] || weatherIcons.Clear}
              <div>
                <div className="text-lg sm:text-2xl font-bold">
                  {data.current.temp}°C
                </div>
                <div className="text-sm sm:block hidden text-muted-foreground capitalize">
                  {data.current.description}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-end gap-1 text-xs sm:text-sm text-muted-foreground">
                <span>Wind</span>
                <span>{data.current.windSpeed} m/s</span>
              </div>
              <div className="flex items-center justify-end gap-1 text-xs sm:text-sm text-muted-foreground">
                <span>Humidity</span>
                <span>{data.current.humidity}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="dark:bg-muted-foreground/15 dark:outline-none dark:shadow-none shadow outline outline-muted-foreground/15 rounded-lg p-4">
          <div className="grid grid-cols-5 gap-2 sm:gap-4">
            {data.forecast.map((day, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="text-xs font-medium text-muted-foreground">
                  {day.name}
                </div>
                <div className="flex justify-center">
                  {weatherIcons[day.condition] || weatherIcons.Clear}
                </div>
                <div className="text-sm font-medium">{day.temp}°</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherCard;
