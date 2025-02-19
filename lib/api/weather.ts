import { kelvinToCelsius } from '../utils/wetbulb';

export interface WeatherData {
  location: {
    name: string;
    lat: number;
    lng: number;
  };
  weather: {
    wetBulb: number;
    temperature: number;
    humidity: number;
    timestamp: number;
  };
}

export async function fetchWeatherData(lat: number, lon: number): Promise<WeatherData> {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  if (!apiKey) {
    throw new Error('OpenWeather API key is not configured');
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const data = await response.json();
    
    return {
      location: {
        name: data.name,
        lat: data.coord.lat,
        lng: data.coord.lon,
      },
      weather: {
        temperature: kelvinToCelsius(data.main.temp),
        humidity: data.main.humidity,
        wetBulb: 0, // This will be calculated in the component
        timestamp: data.dt * 1000, // Convert to milliseconds
      },
    };
  } catch (error) {
    throw new Error(`Weather API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    });
  });
}