import Head from 'next/head';
import { useRouter } from 'next/router';
import { GetStaticProps, GetStaticPaths } from 'next';
import fs from 'fs';
import path from 'path';
import { fetchWeatherData, WeatherData } from '../../lib/api/weather';
import { calculateWetBulb } from '../../lib/utils/wetbulb';
import { toSlug } from '../../lib/utils/string';
import WeatherDisplay from '../../components/WeatherDisplay';

interface LocationData {
  name: string;
  resolvedCountryName: string;
  resolvedAdmin1Code: string;
  latitude: number;
  longitude: number;
  // Weather data
  wetBulb: number;
  temperature: number;
  humidity: number;
  timestamp: number;
}

interface LocationPageProps {
  locationData: LocationData;
  weatherData: WeatherData;
}

export default function LocationPage({ locationData, weatherData }: LocationPageProps) {
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.wetbulb35.com';
  
  // Show loading state while page is being generated
  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  const {
    name,
    resolvedCountryName,
    resolvedAdmin1Code,
    wetBulb,
    temperature,
    humidity,
    timestamp
  } = locationData;

  // Create URL-safe versions of location parts using full names
  const citySlug = toSlug(name);
  const stateSlug = toSlug(resolvedAdmin1Code);
  const countrySlug = toSlug(resolvedCountryName);

  const pageTitle = `Wet Bulb Temperature in ${name}, ${resolvedAdmin1Code}, ${resolvedCountryName}`;
  const pageDescription = `Current wet bulb temperature and weather conditions for ${name}, ${resolvedAdmin1Code}, ${resolvedCountryName}. Updated ${new Date(timestamp).toLocaleString()}.`;

  // Create breadcrumb structure
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Wet Bulb Temperature",
        "item": `${baseUrl}/wetbulb-temperature`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": name,
        "item": `${baseUrl}/wetbulb-temperature/${citySlug}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": resolvedAdmin1Code,
        "item": `${baseUrl}/wetbulb-temperature/${citySlug}/${stateSlug}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": resolvedCountryName,
        "item": `${baseUrl}/wetbulb-temperature/${citySlug}/${stateSlug}/${countrySlug}`
      }
    ]
  };

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${baseUrl}/wetbulb-temperature/${citySlug}/${stateSlug}/${countrySlug}`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbData)
          }}
        />
      </Head>

      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">{pageTitle}</h1>
        <WeatherDisplay data={weatherData} />
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  try {
    if (!params?.location || !Array.isArray(params.location)) {
      return { notFound: true };
    }

    const [citySlug, stateSlug, countrySlug] = params.location;

    if (!citySlug || !stateSlug || !countrySlug) {
      return { notFound: true };
    }

    // Read and parse the cities data
    const citiesPath = path.join(process.cwd(), 'scripts', 'resolved_cities.json');
    
    if (!fs.existsSync(citiesPath)) {
      console.error('Cities data file not found:', citiesPath);
      return { notFound: true };
    }

    const citiesData = JSON.parse(fs.readFileSync(citiesPath, 'utf-8'));

    // Find the matching city
    const city = citiesData.find((city: LocationData) => {
      const matchCity = toSlug(city.name).toLowerCase() === citySlug.toLowerCase();
      const matchState = toSlug(city.resolvedAdmin1Code).toLowerCase() === stateSlug.toLowerCase();
      const matchCountry = toSlug(city.resolvedCountryName).toLowerCase() === countrySlug.toLowerCase();
      return matchCity && matchState && matchCountry;
    });

    if (!city) {
      console.log('No matching city found for:', { citySlug, stateSlug, countrySlug });
      return { notFound: true };
    }

    // Fetch weather data using our existing API
    const weatherData = await fetchWeatherData(city.latitude, city.longitude);

    // Calculate wet bulb temperature
    const wetBulb = calculateWetBulb(weatherData.weather.temperature, weatherData.weather.humidity);

    const locationData = {
      ...city,
      wetBulb,
      temperature: weatherData.weather.temperature,
      humidity: weatherData.weather.humidity,
      timestamp: weatherData.weather.timestamp
    };

    // Format the weather data to match the WeatherDisplay component's expected format
    const formattedWeatherData: WeatherData = {
      location: {
        name: `${city.name}, ${city.resolvedAdmin1Code}, ${city.resolvedCountryName}`,
        lat: city.latitude,
        lng: city.longitude
      },
      weather: {
        wetBulb: weatherData.weather.wetBulb,
        temperature: weatherData.weather.temperature,
        humidity: weatherData.weather.humidity,
        timestamp: weatherData.weather.timestamp
      }
    };

    return {
      props: {
        locationData,
        weatherData: formattedWeatherData
      },
      revalidate: 90 // Revalidate every 90 seconds
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return { notFound: true };
  }
};
