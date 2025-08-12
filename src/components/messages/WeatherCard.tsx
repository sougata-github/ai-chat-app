"use client";

import { getWeatherTool } from "@/lib/tools/tool";
import { InferUITool } from "ai";
import {
  WiDaySunny,
  WiCloud,
  WiRain,
  WiShowers,
  WiThunderstorm,
  WiSnow,
  WiFog,
  WiDust,
  WiSandstorm,
  WiVolcano,
  WiStrongWind,
  WiTornado,
} from "react-icons/wi";
import React, { JSX } from "react";

interface Props {
  data: InferUITool<typeof getWeatherTool>["output"];
}

const weatherIcons: { [key: string]: JSX.Element } = {
  Clear: (
    <WiDaySunny className="size-10 text-yellow-400 drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]" />
  ),
  Clouds: (
    <WiCloud className="size-10 text-gray-400 drop-shadow-[0_0_6px_rgba(160,160,160,0.6)]" />
  ),
  Rain: (
    <WiRain className="size-10 text-blue-500 drop-shadow-[0_0_6px_rgba(0,0,255,0.5)]" />
  ),
  Drizzle: (
    <WiShowers className="size-10 text-blue-400 drop-shadow-[0_0_5px_rgba(0,191,255,0.5)]" />
  ),
  Thunderstorm: (
    <WiThunderstorm className="size-10 text-purple-500 drop-shadow-[0_0_6px_rgba(128,0,128,0.6)]" />
  ),
  Snow: (
    <WiSnow className="size-10 text-white drop-shadow-[0_0_6px_rgba(200,200,255,0.8)]" />
  ),
  Mist: (
    <WiFog className="size-10 text-gray-300 drop-shadow-[0_0_5px_rgba(180,180,180,0.5)]" />
  ),
  Smoke: (
    <WiFog className="size-10 text-gray-400 drop-shadow-[0_0_4px_rgba(160,160,160,0.4)]" />
  ),
  Haze: (
    <WiFog className="size-10 text-gray-300 drop-shadow-[0_0_4px_rgba(180,180,180,0.4)]" />
  ),
  Dust: (
    <WiDust className="size-10 text-yellow-500 drop-shadow-[0_0_4px_rgba(218,165,32,0.5)]" />
  ),
  Fog: (
    <WiFog className="size-10 text-gray-300 drop-shadow-[0_0_5px_rgba(200,200,200,0.5)]" />
  ),
  Sand: (
    <WiSandstorm className="size-10 text-yellow-400 drop-shadow-[0_0_4px_rgba(218,165,32,0.5)]" />
  ),
  Ash: (
    <WiVolcano className="size-10 text-gray-500 drop-shadow-[0_0_4px_rgba(128,128,128,0.5)]" />
  ),
  Squall: (
    <WiStrongWind className="size-10 text-sky-400 drop-shadow-[0_0_4px_rgba(135,206,250,0.5)]" />
  ),
  Tornado: (
    <WiTornado className="size-10 text-gray-600 drop-shadow-[0_0_4px_rgba(100,100,100,0.5)]" />
  ),
};

const WeatherCard = ({ data }: Props) => {
  if (data.error) {
    return (
      <div className="p-2 w-full bg-transparent dark:shadow-none border border-muted-foreground/15 rounded-xl px-4 shadow-xs">
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
