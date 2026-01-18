# 🛰️ Satellite Tracker

Satellite Tracker is a real-time web application that visualizes active satellites orbiting the Earth on an interactive world map. The project focuses on accuracy, performance, and smooth user interaction while presenting complex orbital data in a clear and intuitive way.

This project was built to explore how real satellite tracking works using real orbital elements (TLE data) and orbital propagation, rather than static or approximate positions. It combines live data sources with client-side calculations to show where satellites actually are in orbit at any given moment.

---

## Overview

The application displays a world map with live satellite positions updated at regular intervals. Users can pan infinitely around the globe, zoom smoothly without visual glitches, and click on individual satellites to view detailed information such as their NORAD ID, current latitude and longitude, and orbital speed.

Featured satellites such as the ISS are handled separately to ensure higher reliability and richer information, while a large number of additional active satellites are loaded dynamically to provide realistic coverage.

---

## How It Works

Satellite Tracker uses real Two-Line Element (TLE) data to calculate satellite positions on the client side. The application fetches TLEs from trusted public sources and converts them into satellite records using orbital mechanics formulas. These records are then propagated in real time to compute the satellite’s current position and velocity.

Positions are recalculated at a fixed interval, ensuring that satellites appear to move smoothly along their orbits instead of jumping between locations. This approach avoids unnecessary API calls while keeping the visualization accurate and responsive.

---

## Features

The map is built using Leaflet with custom configuration to allow infinite horizontal scrolling while enforcing strict vertical boundaries, preventing visual artifacts such as white bars. Satellite markers are rendered efficiently and update in place as new positions are computed.

Users can search for satellites using their NORAD ID, highlight searched satellites directly on the map, and click any marker to open a side panel containing mission-related details. If local information for a satellite is unavailable, the interface clearly indicates this and provides an option to learn more using AI-assisted explanations.

The project is designed to remain performant even when tracking hundreds of satellites simultaneously, with careful handling of asynchronous data fetching and state updates.

---

## Tech Stack

The frontend is built with React and styled using Tailwind CSS. Leaflet is used for map rendering and interaction, while the `satellite.js` library is responsible for orbital propagation and coordinate conversions.

Satellite data is sourced from public TLE providers such as CelesTrak and the N2YO API, ensuring realistic and up-to-date orbital information.

---

## Getting Started

To run the project locally, clone the repository and install the dependencies:

```bash
git clone https://github.com/Voided-Knight/Satellite-Tracker.git
cd Satellite-Tracker
npm install
Start the development server:

npm run dev
```
Once running, open your browser and explore the live satellite map.

## Project Goals
The main goal of this project is to understand and implement real-time satellite tracking using actual orbital data, while also building a smooth and visually polished web interface. It serves as both a learning project and a foundation that can be extended with features such as user-based location tracking, satellite pass predictions, or advanced filtering.