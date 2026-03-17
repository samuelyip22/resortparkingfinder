// lib/resorts.js
// Master data file for all SkiSpot resorts.
// Edit this file to update resort info, links, or add new resorts.

export const resorts = [
  {
    id: "snowbird",
    name: "Snowbird",
    shortName: "Snowbird",
    location: "Little Cottonwood Canyon, UT",
    pass: "ikon",           // which pass grants access
    slug: "snowbird",       // used in the URL: /resort/snowbird

    // Parking info
    parking: {
      type: "live-status",  // we scrape a status page for this resort
      requiresReservation: false,
      reservationUrl: null,
      statusUrl: "https://www.snowbird.com/the-mountain/mountain-report/parking-status/",
      notes: "Status updated each morning by 7AM. Lots: Lower Gad Valley, Pond, Upper Gad Valley, Superior, Bypass.",
      lots: ["Lower Gad Valley", "Pond", "Upper Gad Valley", "Superior", "Bypass"],
      pricing: "Free parking available. Paid preferred parking also available.",
    },

    // Links
    links: {
      website: "https://www.snowbird.com",
      conditions: "https://www.snowbird.com/the-mountain/mountain-report/",
      trailMap: "https://www.snowbird.com/the-mountain/mountain-report/trail-map/",
      reservations: null,
    },

    // Snow data lookup keys for SnoCountry API
    snoCountryId: "snowbird",

    // Webcams — url = direct link, embedUrl = iframe-safe URL (null if resort blocks embedding)
    webcams: [
      { name: "Hidden Peak", url: "https://www.snowbird.com/the-mountain/webcams/", embedUrl: null },
      { name: "Peruvian Gulch", url: "https://www.snowbird.com/the-mountain/webcams/", embedUrl: null },
      { name: "Tram Base", url: "https://www.snowbird.com/the-mountain/webcams/", embedUrl: null },
    ],

    // Trail map — local image downloaded to /public/maps/
    trailMapImage: "/maps/snowbird-trail-map.jpg",
    trailMapEmbed: "/maps/snowbird-trail-map.jpg", // local JPG

    // Resort details shown in the "About" section of the detail page
    details: {
      lodges: 4,
      lodgeNames: ["Cliff Lodge", "The Lodge at Snowbird", "The Inn", "Iron Blosam Lodge"],
      dining: ["Aerie Restaurant", "Pier 49 Pizza", "Rendezvous Bar & Grill", "The Atrium"],
      bestTimeToVisit: "January–March for deepest powder. Weekdays for shorter lift lines.",
      terrain: { beginner: "27%", intermediate: "38%", advanced: "35%" },
      verticalDrop: "3,240 ft",
      skiableAcres: 2500,
      avgAnnualSnowfall: "500 inches",
      googleRating: 4.7,
    },

    // GPS coordinates (used for distance-from-user calculation)
    coordinates: { lat: 40.5832, lng: -111.6556 },

    // What this resort is known for (shown as tags on the detail page)
    knownFor: ["World-class powder", "Expert terrain", "500\" avg snowfall", "Tram access"],

    // Plain-English description of what to expect
    whatToExpect: "Snowbird is Utah's most intense resort — steep chutes, deep powder, and a vertical drop that rivals anything in the Rockies. Best for intermediate to expert skiers. The iconic tram takes you to 11,000 ft. Expect crowds on powder days; weekdays are much calmer.",

    // Steepest terrain info
    steepestRun: { name: "Great Scott", grade: "45°", difficulty: "Double Black" },

    // Hero image for the resort card and detail page
    heroImage: "/snowbird.png",
    heroColor: "#1a3a5c", // fallback color if image is missing
  },

  {
    id: "alta",
    name: "Alta Ski Area",
    shortName: "Alta",
    location: "Little Cottonwood Canyon, UT",
    pass: "ikon",
    slug: "alta",

    parking: {
      type: "reservation",  // requires a reservation
      requiresReservation: true,
      reservationUrl: "https://www.alta.com/plan-your-visit/parking",
      statusUrl: "https://www.alta.com/plan-your-visit/parking",
      notes: "Parking reservations required. Book in advance — spots fill weeks ahead.",
      lots: ["Albion", "Wildcat", "Overflow"],
      pricing: "Paid parking. Prices vary by lot and day.",
    },

    links: {
      website: "https://www.alta.com",
      conditions: "https://www.alta.com/conditions",
      trailMap: "https://www.alta.com/the-mountain/trail-map",
      reservations: "https://www.alta.com/plan-your-visit/parking",
    },

    snoCountryId: "alta",

    webcams: [
      { name: "Albion Base", url: "https://www.alta.com/webcams", embedUrl: null },
      { name: "Wildcat Base", url: "https://www.alta.com/webcams", embedUrl: null },
    ],

    trailMapImage: "/maps/alta-trail-map.jpg",
    trailMapEmbed: "https://res.cloudinary.com/altaskiarea/image/upload/v1759862670/resources/Maps/Alta_Trailmap_2025_26.pdf",

    details: {
      lodges: 3,
      lodgeNames: ["Albion Day Lodge", "Wildcat Day Lodge", "Alf's Restaurant"],
      dining: ["Alf's Restaurant", "Mid-Mountain Restaurant", "Watson Shelter"],
      bestTimeToVisit: "December–February for best snow. Alta averages 500+ inches annually.",
      terrain: { beginner: "25%", intermediate: "40%", advanced: "35%" },
      verticalDrop: "2,538 ft",
      skiableAcres: 2614,
      avgAnnualSnowfall: "500+ inches",
      googleRating: 4.8,
    },

    coordinates: { lat: 40.5882, lng: -111.6378 },
    knownFor: ["Ski-only (no snowboards)", "Deep Cottonwood powder", "500\"+ snowfall", "Intimate atmosphere"],
    whatToExpect: "Alta is ski-only and proud of it. The snow quality in Little Cottonwood Canyon is legendary — light, dry, and deep. More relaxed vibe than Snowbird next door. Great for all levels but has some serious expert terrain. Reserve parking well in advance.",
    steepestRun: { name: "High Rustler", grade: "40°", difficulty: "Double Black" },
    heroImage: "/alta.png",
    heroColor: "#2d4a1e",
  },

  {
    id: "brighton",
    name: "Brighton Resort",
    shortName: "Brighton",
    location: "Big Cottonwood Canyon, UT",
    pass: "ikon",
    slug: "brighton",

    parking: {
      type: "honk",         // uses HONK reservation platform
      requiresReservation: true,
      reservationUrl: "https://brightonskiresort.com/plan/parking/",
      statusUrl: "https://brightonskiresort.com/plan/parking/",
      honkPortalUrl: "https://reserve.parkatbrighton.com", // HONK portal to monitor
      notes: "Parking reservations via HONK platform. Book early — fills weeks in advance.",
      lots: ["Main Lot", "Village Lot", "Millicent Lot"],
      pricing: "Paid parking. Prices vary by lot and date.",
    },

    links: {
      website: "https://www.brightonresort.com",
      conditions: "https://www.brightonresort.com/mountain/conditions/",
      trailMap: "https://www.brightonresort.com/mountain/trail-map/",
      reservations: "https://brightonskiresort.com/plan/parking/",
    },

    snoCountryId: "brighton",

    // Brighton uses CamStreamer — actual embeddable live streams
    webcams: [
      { name: "Great Western", url: "https://www.brightonresort.com/conditions", embedUrl: "https://camstreamer.com/embed/607343315" },
      { name: "Majestic", url: "https://www.brightonresort.com/conditions", embedUrl: "https://camstreamer.com/embed/256611006" },
      { name: "Molly Green's View", url: "https://www.brightonresort.com/conditions", embedUrl: "https://camstreamer.com/embed/429495918" },
      { name: "Parking Lot", url: "https://www.brightonresort.com/conditions", embedUrl: "https://camstreamer.com/embed/8371" },
    ],

    trailMapImage: "/maps/brighton-trail-map.jpg",
    trailMapEmbed: "https://cdn.sanity.io/files/8ts88bij/brighton/d2199866d159f801294fdc1e61660d7249896c12.pdf",

    details: {
      lodges: 2,
      lodgeNames: ["Brighton Lodge", "Millicent Lodge"],
      dining: ["Molly Green's", "The Millicent Grill", "Alpine Rose"],
      bestTimeToVisit: "January–March. Night skiing available until 9PM.",
      terrain: { beginner: "21%", intermediate: "40%", advanced: "39%" },
      verticalDrop: "1,873 ft",
      skiableAcres: 1050,
      avgAnnualSnowfall: "500 inches",
      googleRating: 4.6,
    },

    coordinates: { lat: 40.5985, lng: -111.5833 },
    knownFor: ["Night skiing until 9PM", "Family-friendly", "Snowboard terrain parks", "Big Cottonwood Canyon"],
    whatToExpect: "Brighton is the most beginner- and family-friendly of the Wasatch resorts. Great terrain parks for snowboarders. Night skiing is a unique perk — perfect for after-work sessions. Parking fills fast on weekends; HONK reservations are essential.",
    steepestRun: { name: "Scree Slope", grade: "38°", difficulty: "Black Diamond" },
    heroImage: "/brighton.png",
    heroColor: "#1e3a4a",
  },

  {
    id: "solitude",
    name: "Solitude Mountain",
    shortName: "Solitude",
    location: "Big Cottonwood Canyon, UT",
    pass: "ikon",
    slug: "solitude",

    parking: {
      type: "honk",
      requiresReservation: true,
      reservationUrl: "https://reservenski.parksolitude.com",
      statusUrl: "https://reservenski.parksolitude.com",
      honkPortalUrl: "https://reservenski.parksolitude.com",
      notes: "Reservations required on weekends and holidays (Dec–Apr) until 11AM.",
      lots: ["Main Village Lot", "Moonbeam Lot"],
      pricing: "Paid parking. Free with some packages.",
    },

    links: {
      website: "https://www.solitudemountain.com",
      conditions: "https://www.solitudemountain.com/the-mountain/conditions/",
      trailMap: "https://www.solitudemountain.com/the-mountain/trail-map/",
      reservations: "https://reservenski.parksolitude.com",
    },

    snoCountryId: "solitude",

    webcams: [
      { name: "Village", url: "https://www.solitudemountain.com/mountain-and-village/webcams", embedUrl: null },
      { name: "Summit", url: "https://www.solitudemountain.com/mountain-and-village/webcams", embedUrl: null },
    ],

    trailMapImage: "/maps/solitude-trail-map.jpg",
    trailMapEmbed: "https://www.solitudemountain.com/-/media/Solitude/Trail-Map-PDFs/solitude_winter_trail_map_2526.pdf",

    details: {
      lodges: 3,
      lodgeNames: ["Inn at Solitude", "The Creekside", "Moonbeam Lodge"],
      dining: ["St. Bernard's", "The Thirsty Squirrel", "Last Chance Mining Camp"],
      bestTimeToVisit: "January–March. Less crowded than neighboring resorts.",
      terrain: { beginner: "20%", intermediate: "50%", advanced: "30%" },
      verticalDrop: "2,047 ft",
      skiableAcres: 1200,
      avgAnnualSnowfall: "500 inches",
      googleRating: 4.7,
    },

    coordinates: { lat: 40.6201, lng: -111.5916 },
    knownFor: ["Uncrowded runs", "European village feel", "Intermediate paradise", "Quiet atmosphere"],
    whatToExpect: "Solitude lives up to its name — it's the least crowded resort in the Wasatch. Wide open intermediate groomed runs, a charming village base, and no resort-day chaos. Great value compared to its neighbors. Parking reservations required on weekends.",
    steepestRun: { name: "Headwall", grade: "38°", difficulty: "Black Diamond" },
    heroImage: "/solitude.png",
    heroColor: "#2a3a5c",
  },

  {
    id: "deer-valley",
    name: "Deer Valley",
    shortName: "Deer Valley",
    location: "Park City, UT",
    pass: "ikon",
    slug: "deer-valley",

    parking: {
      type: "free",         // no reservation required for most lots
      requiresReservation: false,
      reservationUrl: null,
      statusUrl: "https://www.deervalley.com/plan-your-visit/parking-transportation",
      notes: "No reservation required. Snow Park and Jordanelle lots are first-come, first-served. Season permit portal available for passholders.",
      lots: ["Snow Park Lower", "Snow Park Upper", "Jordanelle", "East Village"],
      pricing: "Free general parking. Paid premium spots available at Jordanelle via QR.",
    },

    links: {
      website: "https://www.deervalley.com",
      conditions: "https://www.deervalley.com/the-mountain/mountain-report",
      trailMap: "https://www.deervalley.com/the-mountain/trail-map",
      reservations: null,
    },

    snoCountryId: "deer-valley",

    webcams: [
      { name: "Snow Park Lodge", url: "https://www.deervalley.com/explore-the-mountain/webcams", embedUrl: null },
      { name: "Silver Lake Lodge", url: "https://www.deervalley.com/explore-the-mountain/webcams", embedUrl: null },
      { name: "Empire Canyon", url: "https://www.deervalley.com/explore-the-mountain/webcams", embedUrl: null },
    ],

    trailMapImage: "/maps/deer-valley-trail-map.jpg",
    trailMapEmbed: "https://www.deervalley.com/-/media/deer-valley/skier-services/maps/DeerValleyWinterTrailMap2025-26.pdf",

    details: {
      lodges: 5,
      lodgeNames: ["Snow Park Lodge", "Silver Lake Lodge", "Empire Canyon Lodge", "Jordanelle Gondola Base", "The Residences"],
      dining: ["The Brass Tag", "Royal Street Cafe", "Empire Canyon Grill", "McHenry's Bar & Grill", "Fireside Dining"],
      bestTimeToVisit: "Mid-January through March. Deer Valley is ski-only (no snowboards).",
      terrain: { beginner: "27%", intermediate: "41%", advanced: "32%" },
      verticalDrop: "3,000 ft",
      skiableAcres: 2026,
      avgAnnualSnowfall: "300 inches",
      googleRating: 4.8,
      specialNotes: "Ski-only resort — snowboards not permitted.",
    },

    coordinates: { lat: 40.6391, lng: -111.4784 },
    knownFor: ["Ski-only (no snowboards)", "World-class grooming", "Fine dining on mountain", "Luxury experience"],
    whatToExpect: "Deer Valley is Utah's most upscale resort — immaculate grooming, gourmet food, and impeccable service. Ski-only. The mountain is beautifully designed with wide, well-marked runs. Less intimidating than Snowbird but still has challenging terrain. Parking is free and plentiful.",
    steepestRun: { name: "Daly Chutes", grade: "38°", difficulty: "Double Black" },
    heroImage: "/deer-valley.png",
    heroColor: "#3a2a1e",
  },

  {
    id: "snowbasin",
    name: "Snowbasin",
    shortName: "Snowbasin",
    location: "Ogden Valley, UT",
    pass: "ikon",
    slug: "snowbasin",

    parking: {
      type: "live-meter",   // has a live % fill meter on their site
      requiresReservation: false,
      reservationUrl: null,
      statusUrl: "https://www.snowbasin.com/the-mountain/mountain-report/",
      notes: "Free parking, first-come first-served. Live fill meter available weekends and holidays. Carpool-priority lanes on busy days.",
      lots: ["Earl's Lodge", "Maples", "Canyon Rim", "Wildcat", "Green Pond"],
      pricing: "Free parking for all guests.",
    },

    links: {
      website: "https://www.snowbasin.com",
      conditions: "https://www.snowbasin.com/the-mountain/mountain-report/",
      trailMap: "https://www.snowbasin.com/the-mountain/trail-map/",
      reservations: null,
    },

    snoCountryId: "snowbasin",

    webcams: [
      { name: "Earl's Lodge Base", url: "https://www.snowbasin.com/the-mountain/web-cams/", embedUrl: null },
      { name: "Summit", url: "https://www.snowbasin.com/the-mountain/web-cams/", embedUrl: null },
      { name: "Strawberry Express", url: "https://www.snowbasin.com/the-mountain/web-cams/", embedUrl: null },
    ],

    trailMapImage: "/maps/snowbasin-trail-map.jpg",
    trailMapEmbed: "https://www.snowbasin.com/getmedia/969afd05-b39b-4ecd-b123-6c0669d41d77/Winter-Trail-Map-2025-26-(22-5in-x-12in)-for-Ikon-reduced.pdf",

    details: {
      lodges: 3,
      lodgeNames: ["Earl's Lodge", "Needles Lodge", "John Paul Lodge"],
      dining: ["Needles Grill", "Earl's Lodge Restaurant", "Bruin's Den", "John Paul Express Bistro"],
      bestTimeToVisit: "January–March. Less crowded than Wasatch Front resorts. Great for Ogden-area visitors.",
      terrain: { beginner: "35%", intermediate: "35%", advanced: "30%" },
      verticalDrop: "2,959 ft",
      skiableAcres: 3000,
      avgAnnualSnowfall: "300 inches",
      googleRating: 4.6,
    },

    coordinates: { lat: 41.2161, lng: -111.8567 },
    knownFor: ["Free parking", "Olympic downhill venue", "Wide open runs", "Less crowded than Wasatch"],
    whatToExpect: "Snowbasin hosted the 2002 Olympic downhill — the mountain is big, fast, and wide open. Free parking is a huge perk. Being in Ogden Valley means it's less crowded than Salt Lake resorts and worth the extra drive. Good for all levels, especially intermediates who like space to carve.",
    steepestRun: { name: "Grizzly", grade: "42°", difficulty: "Double Black" },
    heroImage: "/snowbasin.png",
    heroColor: "#1a3a2a",
  },

  {
    id: "park-city",
    name: "Park City Mountain",
    shortName: "Park City",
    location: "Park City, UT",
    pass: "epic",           // NOTE: Epic Pass, not Ikon
    slug: "park-city",

    parking: {
      type: "honk",
      requiresReservation: true,
      reservationUrl: "https://reserve.parkatparkcitymountain.com",
      statusUrl: "https://reserve.parkatparkcitymountain.com",
      honkPortalUrl: "https://reserve.parkatparkcitymountain.com",
      notes: "Reservations required before noon. Surface lots $29/day, garage $50/day.",
      lots: ["Mountain Village Surface", "Mountain Village Garage", "Canyons Village"],
      pricing: "$29/day surface parking, $50/day garage. Reserve in advance.",
    },

    links: {
      website: "https://www.parkcitymountain.com",
      conditions: "https://www.parkcitymountain.com/the-mountain/mountain-report/",
      trailMap: "https://www.parkcitymountain.com/the-mountain/trail-map/",
      reservations: "https://reserve.parkatparkcitymountain.com",
    },

    snoCountryId: "park-city-mountain",

    webcams: [
      { name: "Mountain Village", url: "https://www.parkcitymountain.com/the-mountain/mountain-conditions/mountain-cams.aspx", embedUrl: null },
      { name: "Canyons Village", url: "https://www.parkcitymountain.com/the-mountain/mountain-conditions/mountain-cams.aspx", embedUrl: null },
    ],

    trailMapImage: "/maps/park-city-trail-map.jpg",
    trailMapEmbed: "https://www.parkcitymountain.com/-/aemasset/sitecore/park-city/maps/20251114_PC_winter-trail_map_001.pdf",

    details: {
      lodges: 6,
      lodgeNames: ["Miners Camp", "Legacy Lodge", "Tombstone", "Iron Mountain", "Flatiron Lodge", "Canyons Village"],
      dining: ["Legends Bar & Grill", "Miner's Camp Restaurant", "Tombstone BBQ", "Iron Mountain Grill", "Viking Yurt (fine dining)"],
      bestTimeToVisit: "January–March. Largest ski resort in the US by acreage.",
      terrain: { beginner: "17%", intermediate: "52%", advanced: "31%" },
      verticalDrop: "3,226 ft",
      skiableAcres: 7300,
      avgAnnualSnowfall: "355 inches",
      googleRating: 4.5,
      specialNotes: "Epic Pass resort (not Ikon). Largest ski resort in the US.",
    },

    coordinates: { lat: 40.6514, lng: -111.5079 },
    knownFor: ["Largest US ski resort", "Epic Pass", "Two mountains connected", "Park City town access"],
    whatToExpect: "Park City Mountain is the largest ski resort in the US — 7,300 acres connecting the old Park City side with Canyons Village. Something for everyone, but it can feel overwhelming. The town of Park City is walkable from the base, which is a big plus. Note: this is an Epic Pass resort, not Ikon.",
    steepestRun: { name: "Indicator", grade: "40°", difficulty: "Double Black" },
    heroImage: "/park-city.png",
    heroColor: "#3a1a1a",
  },
]

// Helper: get a single resort by its slug (e.g. "snowbird")
export function getResort(slug) {
  return resorts.find((r) => r.slug === slug) || null
}

// Helper: get only resorts that have a HONK reservation system to monitor
export function getHonkResorts() {
  return resorts.filter((r) => r.parking.type === "honk")
}

// Helper: get only resorts with live parking data to scrape
export function getLiveParkingResorts() {
  return resorts.filter((r) => ["live-status", "live-meter", "honk"].includes(r.parking.type))
}
