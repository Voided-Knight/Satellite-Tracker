// src/satelliteData.js

// This is our local "database" of satellite information.
// The key for each entry is the satellite's NORAD ID.
// This allows for instant lookups.

export const satelliteInfo = {
  // Featured Satellites
  25544: {
    name: "International Space Station",
    type: 'iss',
    description: "A space station in low Earth orbit. It is a multinational collaborative project involving five participating space agencies: NASA (United States), Roscosmos (Russia), JAXA (Japan), ESA (Europe), and CSA (Canada).",
    imageUrl: '/Sat-Images/ISSimage.jpg',
  },
  20580: {
    name: "Hubble Space Telescope",
    type: 'hubble',
    description: "One of the largest and most versatile space telescopes. Launched in 1990, it has been crucial in providing a deep and clear view into space and time, leading to countless astronomical discoveries.",
    imageUrl: '/images/hubble-real.jpg',
  },
  48274: {
    name: "Tiangong Space Station",
    description: "China's new modular space station, the successor to the Tiangong-1 prototype. It supports long-duration astronaut crews and is a platform for scientific experiments in space.",
    imageUrl: '/images/tiangong-real.jpg',
  },
  
  // You can add any other satellite here!
  // Example for a GPS satellite
  41334: {
    name: "GPS BIIF-12 (USA 265)",
    description: "A satellite in the Global Positioning System (GPS) constellation. It provides precise timing and location data for military and civilian use worldwide.",
    imageUrl: '/images/gps-satellite.jpg', // You would need to find and add this image
  },
  // Example for a weather satellite
  33591: {
    name: "NOAA 19",
    description: "A weather satellite operated by the National Oceanic and Atmospheric Administration (NOAA). It collects data on Earth's atmosphere, oceans, and land surfaces for weather forecasting and climate monitoring.",
    imageUrl: '/images/weather-satellite.jpg', // And this one too
  },

  27868: {
    name: "COSMOS 2400",
    description: "Cosmos 2400 (also written Kosmos 2400) is a Russian military communications satellite, part of the Strela-3 store-and-forward messaging constellation. It was launched on 19 August 2003 from Plesetsk Cosmodrome aboard a Cosmos-3M rocket. Its mission: to act as a mailbox in orbit—receiving encrypted messages and images, storing them, and forwarding them later, either on a schedule or via ground command.",
    imageUrl: '/Sat-Images/COSMOS 2400.jpg'
  }
};