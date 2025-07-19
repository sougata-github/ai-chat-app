"use client";

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
  Clear: <Sun className="size-6 sm:size-10 text-muted-foreground" />,
  Clouds: <Cloud className="size-6 sm:size-10 text-muted-foreground" />,
  Rain: <CloudRain className="size-6 sm:size-10 text-muted-foreground" />,
  Drizzle: <CloudDrizzle className="size-6 sm:size-10 text-muted-foreground" />,
  Thunderstorm: (
    <CloudLightning className="size68 sm:size-10 text-muted-foreground" />
  ),
  Snow: <CloudSnow className="size-6 sm:size-10 text-muted-foreground" />,
  Mist: <CloudFog className="size-6 sm:size-10 text-muted-foreground" />,
  Smoke: <CloudFog className="size-6 sm:size-10 text-muted-foreground" />,
  Haze: <CloudFog className="size-6 sm:size-10 text-muted-foreground" />,
  Dust: <CloudFog className="size-6 sm:size-10 text-muted-foreground" />,
  Fog: <CloudFog className="size-6 sm:size- text-muted-foreground" />,
  Sand: <CloudFog className="size-6 sm:size-10 text-muted-foreground" />,
  Ash: <CloudFog className="size-6 sm:size-10 text-muted-foreground" />,
  Squall: <CloudHail className="size-6 sm:size-10 text-muted-foreground" />,
  Tornado: <Zap className="size-6 sm:size-10 text-muted-foreground" />,
};

const WeatherCard = ({ data }: Props) => {
  if (data.error) {
    return (
      <div className="w-full bg-transparent dark:shadow-none border border-muted-foreground/15 rounded-xl px-4 shadow-xs">
        <div>
          <div className="flex items-center text-base font-medium text-red-500">
            Weather Error
          </div>
          <div className="text-sm">{data.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10">
      <div>
        <div className="flex items-center text-base font-medium">
          {data.location} • {data.country}
        </div>
      </div>
      <div className="py-2 px-0 mt-4 outline outline-muted-foreground/15 rounded-xl dark:shadow-none shadow-xs">
        <div className="p-4">
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

        <div className="p-4">
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
      </div>
    </div>
  );
};

export default WeatherCard;
