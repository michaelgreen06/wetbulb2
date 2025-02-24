import Head from 'next/head';
import { useRouter } from 'next/router';

// This will be replaced with actual data fetching
const getLocationData = async (locationSlug) => {
  // TODO: Implement data fetching from resolved_cities.json
  return {
    name: "Sample City",
    countryCode: "US",
    resolvedCountryName: "United States",
    resolvedAdmin1Code: "California",
    // These will come from your weather API
    wetBulbTemp: 25.5,
    temperature: 30,
    humidity: 65,
    timestamp: new Date().toISOString()
  };
};

export default function LocationPage({ locationData }) {
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://wetbulb2.vercel.app';
  
  // Show loading state while page is being generated
  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  const {
    name,
    resolvedCountryName,
    resolvedAdmin1Code,
    wetBulbTemp,
    temperature,
    humidity,
    timestamp
  } = locationData;

  // Create URL-safe versions of location parts
  const citySlug = name.toLowerCase().replace(/\s+/g, '-');
  const stateSlug = resolvedAdmin1Code.toLowerCase().replace(/\s+/g, '-');
  const countrySlug = resolvedCountryName.toLowerCase().replace(/\s+/g, '-');

  // Create breadcrumb structure
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Wetbulb Temperature",
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
        "item": router.asPath
      }
    ]
  };

  // Create simplified place data structure
  const placeData = {
    "@context": "https://schema.org",
    "@type": "Place",
    "name": name,
    "address": {
      "@type": "PostalAddress",
      "addressRegion": resolvedAdmin1Code,
      "addressCountry": resolvedCountryName
    },
    "containedInPlace": {
      "@type": "AdministrativeArea",
      "name": resolvedAdmin1Code,
      "containedInPlace": {
        "@type": "Country",
        "name": resolvedCountryName
      }
    }
  };

  // Create weather observation data structure
  const weatherData = {
    "@context": "https://schema.org",
    "@type": "WeatherObservation",
    "temperature": {
      "@type": "QuantitativeValue",
      "value": temperature,
      "unitCode": "CEL"
    },
    "humidity": {
      "@type": "QuantitativeValue",
      "value": humidity,
      "unitCode": "P1"
    },
    "observationDate": timestamp
  };

  const pageTitle = `Wetbulb Temperature in ${name}, ${resolvedAdmin1Code}, ${resolvedCountryName}`;
  const pageDescription = `Current wetbulb temperature in ${name}, ${resolvedAdmin1Code} is ${wetBulbTemp}°C. Real-time temperature is ${temperature}°C with ${humidity}% humidity.`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        
        {/* Open Graph tags */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${baseUrl}${router.asPath}`} />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        
        {/* Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbData)
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(placeData)
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(weatherData)
          }}
        />
      </Head>

      <main>
        <h1>{pageTitle}</h1>
        {/* Import and use the same component as the root page */}
        <div>
          {/* TODO: Import and render the root page component */}
        </div>
      </main>
    </>
  );
}

export async function getStaticPaths() {
  // TODO: Generate paths from resolved_cities.json in format:
  // /wetbulb-temperature/[city]/[state]/[country]
  return {
    paths: [],
    fallback: true
  };
}

export async function getStaticProps({ params }) {
  try {
    const [city, state, country] = params.location;
    const locationData = await getLocationData({ city, state, country });

    return {
      props: {
        locationData
      },
      revalidate: 90 // Revalidate every 90 seconds as per requirements
    };
  } catch (error) {
    return {
      notFound: true
    };
  }
}
