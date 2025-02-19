'use client';

import { format } from 'date-fns';
import { WeatherData } from '../lib/api/weather';
import { calculateWetBulb } from '../lib/utils/wetbulb';

interface WeatherDisplayProps {
  data: WeatherData;
}

export default function WeatherDisplay({ data }: WeatherDisplayProps) {
  // Calculate wet-bulb temperature
  const wetBulb = calculateWetBulb(data.weather.temperature, data.weather.humidity);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{data.location.name}</h2>
        <p className="text-sm text-gray-600">
          {data.location.lat.toFixed(4)}°N, {data.location.lng.toFixed(4)}°E
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Wet-Bulb Temperature</h3>
          <p className="text-3xl font-bold text-blue-600">{wetBulb.toFixed(2)}°C</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Air Temperature</h3>
          <p className="text-3xl font-bold text-gray-600">{data.weather.temperature.toFixed(2)}°C</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Relative Humidity</h3>
          <p className="text-3xl font-bold text-gray-600">{data.weather.humidity.toFixed(2)}%</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Last Updated</h3>
          <p className="text-lg text-gray-600">
            {format(data.weather.timestamp, 'MMM d, yyyy HH:mm:ss')}
          </p>
        </div>
      </div>
    </div>
  );
}