import Head from 'next/head';
import { useRouter } from 'next/router';
import { GetStaticProps, GetStaticPaths } from 'next';

interface LocationData {
  id: string;
  name: string;
  countryCode: string;
  resolvedCountryName: string;
  admin1Code: string;
  resolvedAdmin1Name: string;
  latitude: number;
  longitude: number;
  population: number;
  timezone: string;
  // Weather data
  wetBulbTemp?: number;
  temperature?: number;
  humidity?: number;
  timestamp?: string;
}

interface LocationPageProps {
  locationData: LocationData;
}

// Helper function to create URL-safe slugs
function toSlug(str: string): string {
  if (!str) return '';
  return str.toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/-+/g, '-')      // Replace multiple - with single -
    .trim();                  // Trim - from start and end
}

export default function LocationPage({ locationData }: LocationPageProps) {
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  // Show loading state while page is being generated
  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  const {
    name,
    resolvedCountryName,
    resolvedAdmin1Name,
    wetBulbTemp,
    temperature,
    humidity,
    timestamp
  } = locationData;

  // Create URL-safe versions of location parts using full names
  const citySlug = toSlug(name);
  const stateSlug = toSlug(resolvedAdmin1Name);
  const countrySlug = toSlug(resolvedCountryName);

  const pageTitle = `Wet Bulb Temperature in ${name}, ${resolvedAdmin1Name}, ${resolvedCountryName}`;
  const pageDescription = `Current wet bulb temperature and weather conditions for ${name}, ${resolvedAdmin1Name}, ${resolvedCountryName}. Updated ${timestamp ? new Date(timestamp).toLocaleString() : 'regularly'}.`;

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
        "name": resolvedCountryName,
        "item": `${baseUrl}/wetbulb-temperature/${countrySlug}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": resolvedAdmin1Name,
        "item": `${baseUrl}/wetbulb-temperature/${countrySlug}/${stateSlug}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": name,
        "item": `${baseUrl}/wetbulb-temperature/${countrySlug}/${stateSlug}/${citySlug}`
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
        <meta property="og:url" content={`${baseUrl}/wetbulb-temperature/${countrySlug}/${stateSlug}/${citySlug}`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbData)
          }}
        />
      </Head>

      <main>
        <h1>{pageTitle}</h1>
        <div>
          {wetBulbTemp !== undefined && (
            <p>Wet Bulb Temperature: {wetBulbTemp.toFixed(1)}°C</p>
          )}
          {temperature !== undefined && (
            <p>Temperature: {temperature.toFixed(1)}°C</p>
          )}
          {humidity !== undefined && (
            <p>Humidity: {humidity}%</p>
          )}
          {timestamp && (
            <p>Last updated: {new Date(timestamp).toLocaleString()}</p>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // For now, don't prerender any paths
  // They will be generated on demand
  return {
    paths: [],
    fallback: true
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  try {
    if (!params?.location || !Array.isArray(params.location) || params.location.length !== 3) {
      return { notFound: true };
    }

    const [citySlug, stateSlug, countrySlug] = params.location;

    // TODO: Implement actual data fetching from resolved_cities.json
    // For now using dummy data
    const locationData: LocationData = {
      id: "1234567",
      name: "Sample City",
      countryCode: "US",
      resolvedCountryName: "United States",
      admin1Code: "CA",
      resolvedAdmin1Name: "California",
      latitude: 37.7749,
      longitude: -122.4194,
      population: 884363,
      timezone: "America/Los_Angeles",
      wetBulbTemp: 25.5,
      temperature: 30,
      humidity: 65,
      timestamp: new Date().toISOString()
    };

    return {
      props: {
        locationData
      },
      revalidate: 90 // Revalidate every 90 seconds
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return { notFound: true };
  }
};
