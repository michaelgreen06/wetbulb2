'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchBox from '../components/SearchBox';
import WeatherDisplay from '../components/WeatherDisplay';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import Header from '../components/Header';
import CurrentLocationButton from '../components/CurrentLocationButton';
import Disclaimer from '../components/Disclaimer';
import { WeatherData, fetchWeatherData, getCurrentPosition } from '../lib/utils/weather';

// Create a client component that uses useSearchParams
function HomeContent() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const fetchWeather = async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherData(lat, lng);
      setWeatherData(data);
    } catch (err) {
      console.error('Weather fetch error:', err);
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
      console.error('Geolocation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to get current location');
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if lat and lng are provided in URL
    if (searchParams) {
      const lat = searchParams.get('lat');
      const lng = searchParams.get('lng');
      
      if (lat && lng) {
        fetchWeather(parseFloat(lat), parseFloat(lng));
      } else {
        getCurrentLocationWeather();
      }
    } else {
      getCurrentLocationWeather();
    }
  }, [searchParams]);

  return (
    <div className="space-y-6">
      <SearchBox onLocationSelect={handleLocationSelect} />
      
      <CurrentLocationButton onClick={getCurrentLocationWeather} />

      {loading && <LoadingSpinner />}
      {error && <ErrorDisplay error={error} onRetry={getCurrentLocationWeather} />}
      {weatherData && <WeatherDisplay data={weatherData} />}

      <Disclaimer />
    </div>
  );
}

// Main page component with Suspense boundary
export default function Home() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Header />
      
      <Suspense fallback={<LoadingSpinner />}>
        <HomeContent />
      </Suspense>
    </div>
  );
}
