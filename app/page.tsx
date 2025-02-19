'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import SearchBox from '../components/SearchBox';
import WeatherDisplay from '../components/WeatherDisplay';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import { WeatherData, fetchWeatherData, getCurrentPosition } from '../lib/api/weather';

export default function Home() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherData(lat, lng);
      setWeatherData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    fetchWeather(lat, lng);
  };

  const getCurrentLocationWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      const position = await getCurrentPosition();
      await fetchWeather(position.coords.latitude, position.coords.longitude);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get current location');
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentLocationWeather();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Image
            src="/logo.svg"
            alt="Wetbulb Temperature Calculator Logo"
            width={80}
            height={80}
            priority
          />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Wetbulb Temperature Calculator</h1>
        <p className="text-gray-600">Get real-time wetbulb temperature for any location</p>
      </div>

      <div className="space-y-6">
        <SearchBox onLocationSelect={handleLocationSelect} />
        
        <button
          onClick={getCurrentLocationWeather}
          className="mx-auto block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Use Current Location
        </button>

        {loading && <LoadingSpinner />}
        {error && <ErrorDisplay error={error} onRetry={getCurrentLocationWeather} />}
        {weatherData && <WeatherDisplay data={weatherData} />}

        <div className="mt-8 text-center text-sm text-gray-500 px-4">
          <p className="mb-2">
            Disclaimer: The wet-bulb temperatures shown are estimates calculated using the Stull formula.
            For more information about wet-bulb temperature calculations, visit{' '}
            <a
              href="https://www.omnicalculator.com/physics/wet-bulb"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 underline"
            >
              Omni Calculator&apos;s Wet-Bulb Temperature Calculator
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
