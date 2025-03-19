- Key points
    
    using lazy loading 
    
    getStaticPaths returns an empty array which means no routes are pre-generated at build time
    
    using dynamic routing tables for the […location]page
    
    using the … catch all operator which means all segments after the /wetbulb-temperature/ path are recognized
    
    using isr so content is only generated and cached when a user visits the page. content can be stored on a cdn. re-validation period is 90 seconds so if 2 people visit the same page w/ in 90 seconds of each other they see the same data. if someone visits 95 seconds after the 1st person they see new data
    
    currently using the pages router for ease of creation. plan to upgrade to the app router if there is enough usage to justify it. 
    
    use array destructurring (which assigns values to variables based on position in the array) to assign variables to url path segments
    
    eg params.location[0]=params.location.countrySlug
    
    be sure to discuss SEO aspects
    
    things i relearned
    
    .json files are just text files formated the same way as an object. using JSON.parse() on a .json file converts it into an actual javascript object. 
    
    w/ array destructurring the order of variable names matters because the varaibles are assigned values based on position in the array
    
- blog post
    
    not sure what the best structure is for the blog post. not concerned about it being too long but also want to be as concise as possible
    
    I want to highlight the things i’ve learned but I’m not sure what the best structure is to highlight these learnings.
    
    eg do I make a section that highlights all learnings or do I mention the specific things I learned in the relevant section when describing the structure of the app
    
    ## [wetbulb35.com](http://wetbulb35.com) - because your life depends on it
    
    My approach to learning in the age of increasingly more capable AI tools
    
    prompt the ai tool to create the thing i want but be very deliberate in what I accept. Make an effort to fully understand what has been created. don’t blindly ask the tool to fix errors more than 2 times because it explodes the codebase w/ complexity and makes it much less maintainable (for now). once everything is created go through all the files and make sure I understand what is happening. right now I am working to develop the skill of understanding the code the tools produce to make sure it does what I need. My hypothesis is that I won’t need to know how to write code going forward, i just need to understand what it is doing so I can know whether or not it is efficiently doing the things I need it to do. This allows me to catch errors/inefficiencies in the code base and address them much more elegantly than blindly telling the tool to fix an error as many times as it takes for the error to go away because this rapidly makes the codebase more complex and less maintainable. it allows me to spot things that are obviously not great eg using require statements instead of es6 imports or using axios instead of fetch. I’m guessing this is a short term skill set and in the long term as these tools get better and better I will no longer need this skill, but for now it seems important.
    
    good example is what I learned about how I am currently addressing utf 8 character issues w/ string function etc when the proper fix is so much simpler by addressing it at the root level so the database has the correct characters instead of addressing the incorrect characters across multiple sections of the site after they are propogated from the db. 
    
    ### I built this app for many reasons
    
    1). I am always curious what the wetbulb temperature is when I’m somewhere hot but I haven’t found a reliable source for this info
    
    2). I wanted to learn how next.js works and wanted to improve my understanding of typescript
    
    3). I wanted to learn more about the SEO benefits of next.js and just learn about seo best practices in general. 
    
    ### I am writing this article for a few reasons:
    
    1). help solidify the things I have learned
    
    2). provide a resource I can come back to in the future when I iterate on the project or want to remember how it works
    
    3). It could possibly provide info that is helpful to someone else in the future
    
    4). create content for future automations (chop this up into tweets, linkedin posts and automatically post them etc) that enable me participate in the performative attention economy w/o being subjected to the toxic side effects of participating. I’m not going to check my notifications, or the content that is published for that matter 🙈 and will create an agent that can reply to others but I won’t be participating
    
    ### app structure
    
    Using the pages router for all pages except for the root route (which uses the app router)
    
    Honestly doing this because by the time i realized the difference betwixt the 2 I had already created the structure for the dynamic routes using the pages router and didn’t feel like taking the time to migrate because this is just an MVP right now
    
    using dynamic catch all routes `[…location].tsx`that capture multiple path segments in a single parameter
    
    I learned that next.js’s native params object contains the segments of the url path as an array w/ each segment represented by an index in the array. EG /wetbulb-temperature/vietnam/quang-nam-province/hoi-an would be represented by params.location=[vietnam,quang-nam-province,hoi-an]
    
    using join & dirname a lot from path module when working w/ the fs because it provides a system agnostic way of referencing files
    
    - SEO features
        
        url path hierarchy for location specific wetbulb temperatures
        
        I used the country>province>city hierarchy insted of city>province>country hierarchy. Initially I did the opposite but a friend helped me understand the benefits of using the country/province/city hierarchy. it provides better crawlability because Search engines can more easily understand the relationship between pages, as they follow a logical parent-child structure. This structure also creates natural landing pages for countries and states, allowing for better internal linking and content organization.
        
        Each level links to its parent (e.g., city pages link back to state pages).
        
        Pages at the same level (e.g., cities within a state) link to each other, creating a web of internal links.
        
        json-ld
        
        I used JSON-LD which stands for Javascript Object Notation for Linked Data. This formatting provides data in a structure that is machine-readable, making it easier for search engines and other systems to understand the context and meaning of information on a webpage. 
        
        I used JSON-LD to provide the structured breadcrumb data for each page. this helps search engines understand the hierarchical relationship between pages.
        
        I used JSON-LD to provide a custom **`WeatherReport`** schema that provides structured data about the weather conditions, including temperature, humidity, and wetbulb temperature. The wetbulb temperature is the only custom part about the schema, all other aspects are part of the standard weather schema
        
        tags
        
        used the following tags to help optimize SEO: 
        
        title - Each page has a unique, descriptive title that includes the location name and relevant context
        
        meta description - Custom descriptions for each page that summarize the content and include relevant keywords. 
        
        robots meta - Explicit **`index, follow`** directives to ensure search engines crawl and index the pages.
        
        viewport meta - Mobile optimization with proper viewport settings
        
        canonical url - Each page specifies a canonical URL to prevent duplicate content issues. This is particularly important since the site has multiple potential URL paths to the same content.
        
        open graph meta -  Complete set of Open Graph tags for better social media sharing
        
        twitter card meta - Twitter-specific meta tags for better appearance when shared on Twitter.
        
    - layout
        
        app router
        
        app.layout.tsx replaces _document.tsx & _app.tsx from the pages router
        
        layout.tsx can be created at any point in the app router structure and it always wraps its children / files nested under it
        
        pages router
        
        _document.tsx is the outermost container & it sets up the basic html structure
        
        includes the <Main /> component which is where the app content will be inserted
        
        it only runs on the server
        
        _app.tsx wraps every page in the /pages directory
        
        in this app it wraps each page w/ the SharedLayout.tsx component
        
    - used geonames places dataset to get info (country, state/province, city, lat & lon) for each location page
        - geonamestojson.js
            
            extracts country, state/province, city, lat & lon info for places that have a population of 1,000 or more
            
            it uses the subscribe method from csvtojson to read the data row by row instead of loading the whole dataset into memory because it is quite large (>1.5gb). the subscribe method also allows for easier filtering of rows and we are using that functionality to only include entries that are places (P) with populations over 1,000. 
            
            uses node.js fs method createWriteStream to incrementally write the data into the output file instead of holding all the info in memory
            
            the geonames dataset is a .txt file that has variables separated by tabs. I learned that the csvtojson module handles tab separated variables (TSV) in addition to handling csv data
            
            Looking back on the code I should have applied my string.ts utility function here to convert utf8 characters into ascii characters at this level so the resulting resolvedAdmin1Codes.json file contents could be directly used to create url paths and populate page contents instead of needing to apply that utility function at multiple other points in the code. 
            
        - resolveAdmin1Codes.js
            1. Reads and parses **admin1 codes** (administrative subdivisions) from a text file (`admin1CodesASCII.txt`) into a `Map` for lookup.
            2. Reads and parses **country codes** and their names from a CSV file (`countrycodes.csv`) into a `Map` for lookup.
            3. Processes **city data** from a JSON file (`geonames_cities.json`) using streams and maps codes to human-readable names by:
                - Normalizing country names.
                - Resolving administrative subdivision names (admin1 regions).
                - Skipping invalid or incomplete entries.
            4. Writes the processed and resolved data (`resolved_cities.json`) in JSON format.
            
            takes the .json output file from geonamestojson.js and normalizes the data because the geonames db uses admin1codes to represent states/provinces and country codes (ISO 3166) to represent country names. 
            
            we need to decode these into their common names in order to extract useful data for use in the app (url paths, human readable location names etc). 
            
            The iso country codes sometimes provide formal names for countries and we also included logic to convert formal country names to common names for a few coutnries. EG modify 'Macedonia, the Former Yugoslav Republic of' to 'North Macedonia’
            
            - we are using the Map object instead of a standard object
                
                main reason we are using it is because it provides optimized lookup performance, ensures strong key-management without risk of prototype interference, and allows for dynamic key formats (e.g., `countryCode.adminCode`)
                
                remembers insertion order
                
                have flexible key types (eg can be strings, objects, functions etc)
                
                has better performance than plain objects for frequent add/delete operations
                
                has built in methods such as `set()`, `get()`, `has()`, `delete()`, and methods to iterate over keys, values, or both.
                
            
            this resulted in ~137k locations which I thought was sufficient for the MVP. 
            
            I learned that many places are excluded even though they exist and may have populations greater than 1,000 because they don’t have any population info listed for their locaiton in the geonames dataset
            
            EG Ahangam SL doesn’t have any population info listed
            
    - Calculating the wetbulb temperature
        
        use the lat & lon of each place to get the air temperature & humidity for that location then use the stull formula in weather.ts utility function to calculate the wetbulb temperature. 
        
        This equation provides an accurate approximation for humidity levels of 5% to 99% (←need to verify this)
        
    - ISR vs SSR vs SSG
        
        ISR (Incremental Static Regeneration) - ISR allows you to use SSG with the ability to update static content **after the site has been built**. With ISR, pages are statically generated at build time and can be re-generated in the background at runtime, either on a schedule or upon a request. This provides the performance benefits of SSG while allowing content to stay reasonably up to date without needing a full rebuild.
        
        SSG (Static Site Generation)- SSG is a pre-rendering method in Next.js where pages are generated at build time. The HTML for each page is created once, during the build process, and reused for every request. This method is best for pages where the content does not change often, such as marketing pages or documentation. It offers excellent performance because the page is served from a CDN or web server without any server-side computation on each request.
        
        SSR (Server-Side Rendering) - SSR is a pre-rendering method where the HTML of a page is generated on the server **for each request**. This means that whenever a user visits the page, the server runs the page’s logic, fetches any needed data, and sends back the HTML. SSR is useful for pages that require up-to-date data or depend on user-specific content (e.g., dashboards, user profiles).
        
        The app uses Next.js's ISR with a revalidation period of 90 seconds, which provides:
        
        - **Fresh Content**: Regular updates to weather data without rebuilding the entire site.
        - **Performance Benefits**: Static generation for speed while maintaining data freshness.
        - **Reduced Server Load**: Pages are cached after first generation, improving performance.
        - **Serve pre-rendered pages** to search engines instantly, which means **fast load times** — a big ranking factor.
        
        used isr because seo was very important but need to have relatively fresh data available for the users
        
        I learned that ISR might not actually be the best for all the data in the ui. the major down fall of using isr in this app is that if someone visits a page after the 90sec revalidation period the page shows stale data from the previous visit. this means that if someone visits a location’s wetbulb-temperature page 2 days after the last visitor they will see data from 2 days ago. this is definitely not idael and I will change it so the weather data is fetched from the client side on each page visit so they have fresh data. this will mean slower page loading speeds but having fresh accurate data is worth the slightly slower loading speeds. Plus I still get the SEO benefits of using ISR because most of the content on the page is not reliant on api calls. I am not sure if SSG would work for this and I will look into it but my initial assumption is that it won’t work because I need to make api calls to fetch the weather data. 
        
        was visited
        
    - sitemap generation
        
        using static sitemaps generated at build time instead of dynamic accessible an api because the sitemap would only change at build time and it is much easier to do it this way than having dynamic sitemaps
        
        currently pretty messy script that has opportunities for improvement
        
    - Things I relearned
        
        .json() is to format the text response from a fetch() call to a javascript object that I can interact w/ in my code.  it is asynchronous & returns a promise
        
        JSON.stringify() converts a javascript object or array into a json formatted string. it’s not async. used when 
        
    
    ### future plans/things to fix
    
    use a combo of isr & client side fetching for the api calls that get the weather data
    
    addressing UTF8 characters: 
    
    need to import the string utility function into geonamestojson so that city names are converted from utf8 characters into ascii characters
    
    need to modify the resolveAdmin1Codes 
    
    so that it uses the data from the 3rd column for the admin code instead of data from the 2nd coloumn because the 3rd column conatins ascii characters but the 2nd column contains utf8 characters
    
    Should be an easy fix! change `const [code, name] = line.split('\t');` to `const [code, , name] = line.split('\t');`
    
    Need to use the string utility function in the countrycodes so that it changes utf8 country names into ascii country names
    
    convert all utf8 characters to ascii characters at the first & 2nd level of data extraction from the geonames dataset & country code & admin1code resolution. this will reduce a lot of the complexity of applying this utility function at other phases in the code like the sitemap generation and url paths etc.