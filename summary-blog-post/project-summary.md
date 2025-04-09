---
title: "WetBulb35"
description: "Climate safety app providing real-time wet-bulb temperature data for any location on Earth."
technologies: ["Next.js", "TypeScript", "Weather API", "GeoNames Dataset"]
imageUrl: "https://res.cloudinary.com/dajtc0uhx/image/upload/f_auto,q_auto/v1743925889/wetbulb35-homepage_zfrjqu.png"
githubUrl: "https://github.com/michaelgreen06/wetbulb2"
liveUrl: "https://wetbulb35.com"
featured: true
date: "2025-03-01"
type: "software"
---

# WetBulb35: Climate Safety App

## Project Overview

WetBulb35 is a web application that calculates and displays wet-bulb temperatures for any location on Earth. Wet-bulb temperature is a critical measure combining heat and humidity that determines human survivability in extreme weather conditions. As climate change accelerates, this information becomes increasingly vital for personal safety and public health planning.

## The Problem

Despite the growing importance of wet-bulb temperature data in a warming world, there was no reliable, user-friendly source for this critical information. Traditional weather forecasts focus on standard metrics like temperature and humidity separately, failing to communicate the true danger when these factors combine. With climate change increasing the frequency of extreme heat events, having access to wet-bulb temperature data can be literally life-saving.

## The Solution

WetBulb35 addresses this gap by:

1. **Providing accurate wet-bulb calculations** for any location on Earth
2. **Organizing data in an intuitive location hierarchy** (country > province > city)
3. **Implementing SEO-optimized pages** to make this critical information easily discoverable
4. **Delivering real-time weather data** with a focus on user experience and performance

## Technical Implementation

### Frontend Development

The application is built with Next.js and TypeScript, leveraging dynamic routing and Incremental Static Regeneration (ISR) for optimal performance and SEO. The hierarchical URL structure (`/wetbulb-temperature/[country]/[province]/[city]`) was implemented using Next.js's catch-all route pattern `[...location].tsx` to capture multiple path segments in a single parameter.

### Data Processing

The app uses the GeoNames dataset for location information, processing over 1.5GB of global location data through memory-efficient streaming techniques. Only populated places above a certain threshold are included to maintain relevance while keeping the application performant.

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

### Rendering Strategy

The application implements Incremental Static Regeneration (ISR) with a 90-second revalidation period, providing:
- **Performance**: Pages are statically generated for speed
- **Freshness**: Content updates without a full rebuild
- **SEO Benefits**: Pre-rendered content for search engines

## Challenges and Solutions

### Character Encoding Issues

**Challenge:** Handling UTF-8 characters in location names created inconsistencies across the application.

**Solution:** Rather than applying string utility functions throughout the codebase, I identified a more efficient approach by modifying the data extraction process to use ASCII character names from the GeoNames dataset, addressing the encoding issue at its source.

### ISR Limitations for Real-time Data

**Challenge:** While ISR offers excellent SEO benefits, it can serve stale weather data between regenerations.

**Solution:** Implementing a hybrid approach that uses ISR for stable content (location data, page structure) while employing client-side fetching specifically for weather data to ensure users always see the most current information.

## Outcomes and Impact

WetBulb35 has successfully filled a critical information gap by providing:

- **Accessible safety information** during a time of increasing climate danger
- **SEO-optimized content** that makes wet-bulb data discoverable through search engines
- **Structured data with JSON-LD** that extends standard weather schemas to include wet-bulb temperature information

The implementation of comprehensive SEO techniques, including hierarchical URL structures, structured data, and comprehensive meta tags, has improved the discoverability of this potentially life-saving information.

## Future Development

Planned enhancements include:

1. **Hybrid rendering approach** to combine ISR benefits with real-time data freshness
2. **Sitemap generation improvements** for better performance and memory efficiency
3. **Daily highest wet-bulb temperature feature** to function as an early warning system for dangerous heat conditions worldwide

## Technologies Used

- **Frontend:** Next.js, TypeScript
- **Data Sources:** GeoNames dataset, Weather APIs
- **Rendering Strategy:** Incremental Static Regeneration (ISR)
- **SEO Optimizations:** Structured Data (JSON-LD), Comprehensive meta tags, Sitemaps

This project represents my commitment to using technology to address pressing climate challenges while creating intuitive, user-friendly experiences and deepening my understanding of modern web development practices.