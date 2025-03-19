# wetbulb35.com – Because Your Life Depends on It

*A concise technical journey in AI-assisted development of a life-saving weather tool*

## Introduction

As climate change accelerates, wet-bulb temperatures (a measure combining heat and humidity that determines survivability) are becoming increasingly important. When I couldn't find a reliable source for this critical data, I decided to build [wetbulb35.com](https://wetbulb35.com) – a tool that calculates and displays wet-bulb temperatures for any location on Earth. Beyond solving a practical problem, this project became an exploration of AI-assisted development, Next.js architecture, typescript, and SEO optimization.

This post documents my journey, focusing on the technical implementation, challenges faced, and lessons learned along the way. I'm sharing this both to solidify my own understanding and to provide insights for others walking a similar path.

## Project Motivation & Objectives

My reasons for building wetbulb35.com were multi-faceted:

1. **Personal Need**: I wanted a reliable way to check wet-bulb temperatures when traveling to hot, humid locations – information that could literally be life-saving in extreme conditions. After searching high and low, I was not able to find a reliable source for this critical information.

2. **Technical Learning**: I aimed to deepen my understanding of Next.js, TypeScript, and modern web development practices.

3. **SEO Experimentation**: I wanted to apply and test SEO best practices, particularly by leveraging content that is pre-rendered using ISR (a combination of SSG & SSR) for optimal search engine performance.

## App Structure & Implementation

### Routing & URL Structure

I implemented a hierarchical URL structure (`/wetbulb-temperature/[country]/[province]/[city]`) using Next.js's dynamic routing capabilities. Specifically, I used the catch-all route pattern `[...location].tsx` to capture multiple path segments in a single parameter.

```typescript
// From /pages/wetbulb-temperature/[...location].tsx
export async function getStaticPaths() {
  return {
    paths: [],  // No paths pre-rendered at build time
    fallback: 'blocking'  // Server renders pages on-demand
  }
}
```

I learned that Next.js's native `params` object stores URL segments as an array, which I could destructure to access individual components:

```typescript
// Destructuring array assigns values based on position
const [countrySlug, provinceSlug, citySlug] = params.location;
```

Currently, I'm using the Pages Router for simplicity, though I may migrate to the App Router if usage grows. It's interesting to note the structural differences:

- **Pages Router**: Uses `_document.tsx` as the outermost container and `_app.tsx` to wrap every page
- **App Router**: Uses `app/layout.tsx` to replace both, with nested layouts possible at any directory level

### Data Sources & Processing

The app uses the GeoNames dataset for location information (country, province/state, city, latitude & longitude). Processing this massive dataset (>1.5GB) taught me valuable lessons about memory-efficient data handling:

```javascript
// Using streaming to avoid memory overload
.pipe(csv())
.subscribe((row) => {
  // Process each row individually instead of loading all at once
  if (row.feature_class === 'P' && parseInt(row.population) >= 1000) {
    // Only keep populated places above threshold
  }
})
```

### Rendering Strategy: ISR in Action

The app uses Incremental Static Regeneration (ISR) with a 90-second revalidation period, which provides:

- **Performance**: Pages are statically generated for speed
- **Freshness**: Content updates without a full rebuild
- **SEO Benefits**: Pre-rendered content for search engines

```typescript
export async function getStaticProps({ params }) {
  // Fetch data and build the page
  return {
    props: { /* page data */ },
    revalidate: 90  // Seconds before considering regeneration
  }
}
```

I've since realized a limitation: if someone visits a page after the revalidation period, they'll initially see stale weather data. In the next update I plan to implement client-side fetching specifically for the real-time weather data while maintaining ISR for the rest of the page content, offering the best of both worlds.

### SEO Optimization

I implemented several SEO techniques to maximize discoverability:

1. **Hierarchical URL Structure**: Using country > province > city hierarchy improves crawlability and creates natural landing pages. Initially, I had implemented the reverse structure (city > province > country), but my friend Ezra, who is experienced in SEO, recommended switching to the country-first approach. This provides better crawlability because search engines can more easily understand the relationship between pages as they follow a logical parent-child structure. It also creates natural landing pages for countries and states, allowing for better internal linking and content organization.

2. **Structured Data with JSON-LD**: Providing machine-readable context for search engines:

```typescript
// JSON-LD for hierarchical breadcrumbs and custom WeatherReport schema
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://wetbulb35.com"
    },
    // Additional breadcrumb items...
  ]
}
```

I also implemented a custom `WeatherReport` schema that extends the standard weather schema to include wet-bulb temperature data. While wet-bulb temperature isn't part of the standard schema, adding it this way helps search engines understand the unique value proposition of the site. Hopefuly someday in the near future the wet-bulb-temperature is a standard part of the weather schema.

3. **Comprehensive Meta Tags**: Each page includes:
   - Unique, descriptive title
   - Custom meta description with relevant keywords
   - Explicit robots directives
   - Mobile optimization settings
   - Canonical URL to prevent duplicate content issues
   - Open Graph and Twitter Card tags for social sharing

4. **Sitemap Generation**: Static sitemaps built at compile time to help search engines discover all dynamically generated pages. I initially explored using dynamic API-based sitemaps but quickly realized this approach was unnecessarily complex for my use case. Since any changes to the site structure would be reflected in the sitemaps after deployment anyway, static generation made much more sense and simplified the implementation.

## Challenges & Future Improvements

### Character Encoding Issues

A significant challenge I'm still working on is handling UTF-8 characters in location names. My current approach involves applying string utility functions across multiple parts of the codebase, creating unnecessary complexity. I've realized it would be far more efficient to resolve these issues at the data source level with a very simple fix:

```javascript
// Current approach: Multiple string utility functions across the codebase
// Future approach: Fix at data extraction
const [code, , name] = line.split('\t');  // Using the ASCII column instead of UTF-8
```

This modified script uses ASCII character names from the geonames dataset instead of UTF-8 character names. This addresses the encoding issue at its source rather than applying fixes throughout the application.

### ISR Limitations

While ISR offers great SEO benefits, it presents a limitation for real-time data: stale content can be served between regenerations. My solution will be a hybrid approach:

- Use ISR for stable content (location data, page structure)
- Implement client-side fetching for weather data to ensure freshness

This approach maintains SEO benefits while improving user experience with up-to-date information.

### Sitemap Generation Improvements

The current sitemap generation script is functional but has a few issues I plan to address:

1. **Data Structure Improvements**:
   - Replace objects with Maps for better lookup performance
   - Build indices once and reuse them instead of reloading data multiple times

2. **Consistent Streaming Approach**:
   - Currently using a mix of batching and streaming which is inconsistent
   - Implement streaming consistently throughout for better memory efficiency

3. **Performance Optimizations**:
   - Load data once and pass it between functions instead of reloading

Here's an example of a planned improvement:

```javascript
// Current approach: Reload data for each function
async function generateCountrySitemap() {
  const citiesData = await loadCitiesData(); // Loading all data again
  // Process data...
}

// Better approach: Load once, use everywhere
async function main() {
  const citiesData = await loadCitiesData(); // Load once
  await generateCategorySitemap(citiesData);
  await generateCountrySitemaps(citiesData);
}
```
### Daily Highest Wet-Bulb Temperature Feature

Another exciting feature I plan to add is a page that finds and displays the highest predicted wet-bulb temperatures for all locations on Earth every day. This would serve as an early warning system for potentially dangerous heat conditions and provide valuable data for researchers and climate-conscious travelers.

## Conclusion

Building wetbulb35.com has been both a technical challenge and a learning opportunity. Beyond creating a useful tool, I've gained valuable insights into Next.js architecture, SEO practices, and efficient data processing.

Perhaps most importantly, this project has reinforced my approach to AI-assisted development: using available cutting edge tools to rapidly create functional solutions while taking the time to understand what's happening under the hood. This allows me to catch inefficiencies, fix bugs elegantly, maintain a codebase I fully understand and learn things that enable me to build more efficiently and effectively moving forward.

The ability to comprehend generated code (rather than merely writing it from scratch) is increasingly valuable as AI tools advance. This skill lets me leverage AI assistance while ensuring the output meets my standards for performance, maintainability, and best practices.

I'll continue improving wetbulb35.com, implementing the fixes mentioned above and expanding its capabilities. If you'd like to see the site in action, visit [wetbulb35.com](https://wetbulb35.com) – your feedback is always welcome!

---

*This project was built using Next.js, TypeScript, and the GeoNames dataset, with AI assistance through Windsurf IDE.*
