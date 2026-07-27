// Leaflet review map — always imported dynamically (no SSR).
"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface GuessInfo {
  animal: string;
  username: string;
  guess: string;
  correct: boolean;
  time: number;
}

interface ReviewMapProps {
  lat: number;
  lng: number;
  city: string;
  country: string;
  guesses?: GuessInfo[];
}

// Fix Leaflet default icon issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const answerIcon = new L.DivIcon({
  className: "",
  html: `<div style="width:24px;height:24px;border-radius:50%;background:#10b981;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const wrongIcon = new L.DivIcon({
  className: "",
  html: `<div style="width:18px;height:18px;border-radius:50%;background:#ef4444;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const correctIcon = new L.DivIcon({
  className: "",
  html: `<div style="width:18px;height:18px;border-radius:50%;background:#10b981;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const COUNTRY_COORDS: Record<string, [number, number]> = {
  Japan: [36.2, 138.25],
  France: [46.6, 2.2],
  "United Kingdom": [55.38, -3.44],
  Italy: [41.9, 12.5],
  "United States": [39.83, -98.58],
  Australia: [-25.27, 133.78],
  "United Arab Emirates": [23.42, 53.85],
  China: [35.86, 104.2],
  Brazil: [-14.24, -51.93],
  Egypt: [26.82, 30.8],
  Netherlands: [52.13, 5.29],
  Greece: [39.07, 21.82],
  Peru: [-9.19, -75.02],
  Russia: [61.52, 105.32],
  India: [20.59, 78.96],
  Spain: [40.46, -3.75],
  "South Korea": [35.91, 127.77],
  Turkey: [38.96, 35.24],
  Thailand: [15.87, 100.99],
  Germany: [51.17, 10.45],
  Canada: [56.13, -106.35],
  "South Africa": [-30.56, 22.94],
  Mexico: [23.63, -102.55],
  Argentina: [-38.42, -63.62],
  "New Zealand": [-40.9, 174.89],
  Hong: [22.32, 114.17],
  Singapore: [1.35, 103.82],
  Malaysia: [4.21, 101.98],
  Indonesia: [-0.79, 113.92],
  Philippines: [12.88, 121.77],
  Vietnam: [16.0, 108.0],
  "Sri Lanka": [7.87, 80.77],
  Nepal: [28.39, 84.12],
  Cambodia: [12.57, 104.99],
  Myanmar: [21.91, 95.96],
  Mongolia: [46.86, 103.85],
  Israel: [31.05, 34.85],
  "Saudi Arabia": [23.89, 45.08],
  Jordan: [30.59, 36.24],
  Morocco: [31.79, -7.09],
  Kenya: [-0.02, 37.91],
  Nigeria: [9.08, 8.68],
  Ghana: [7.95, -1.02],
  Ethiopia: [9.15, 40.49],
  Tanzania: [-6.37, 34.89],
  "DR Congo": [-4.04, 21.76],
  Angola: [-11.2, 17.87],
  Mozambique: [-18.67, 35.53],
  Zambia: [-13.13, 27.85],
  Zimbabwe: [-19.02, 29.15],
  Botswana: [-22.33, 24.68],
  Namibia: [-22.96, 18.49],
  Madagascar: [-18.77, 46.85],
  Colombia: [4.57, -74.3],
  Chile: [-35.68, -71.54],
  Ecuador: [-1.83, -78.18],
  Bolivia: [-16.29, -63.59],
  Paraguay: [-23.44, -58.44],
  Uruguay: [-32.52, -55.77],
  Venezuela: [6.42, -66.59],
  "Costa Rica": [9.75, -83.75],
  Panama: [8.54, -80.78],
  Guatemala: [15.78, -90.23],
  Cuba: [21.52, -77.78],
  Jamaica: [18.11, -77.3],
  "Dominican Republic": [18.74, -70.16],
  "Puerto Rico": [18.22, -66.59],
  Honduras: [15.2, -86.24],
  Portugal: [39.4, -8.22],
  Ireland: [53.14, -7.69],
  Scotland: [56.49, -4.2],
  Switzerland: [46.82, 8.23],
  Austria: [47.52, 14.55],
  "Czech Republic": [49.82, 15.47],
  Poland: [51.92, 19.15],
  Hungary: [47.16, 19.5],
  Croatia: [44.45, 16.51],
  Sweden: [60.13, 18.64],
  Norway: [60.47, 8.47],
  Denmark: [56.26, 9.5],
  Finland: [61.92, 25.75],
  Belgium: [50.5, 4.47],
  Ukraine: [48.38, 31.17],
  Romania: [45.94, 24.97],
  Bulgaria: [42.73, 25.49],
  Serbia: [44.02, 20.46],
  Iceland: [64.96, -19.02],
};

function getCountryCoord(country: string): [number, number] {
  const exact = COUNTRY_COORDS[country];
  if (exact) return exact;
  const lower = country.toLowerCase();
  for (const [key, coord] of Object.entries(COUNTRY_COORDS)) {
    if (key.toLowerCase() === lower) return coord;
  }
  return [0, 0];
}

export function ReviewMap({ lat, lng, city, country, guesses }: ReviewMapProps) {
  const guessMarkers = (guesses ?? []).map((g) => ({
    ...g,
    coord: getCountryCoord(g.guess),
  }));

  const lines = guessMarkers
    .filter((g) => !g.correct && g.coord[0] !== 0)
    .map((g) => [
      [lat, lng] as [number, number],
      g.coord,
    ] as [number, number][]);

  return (
    <div className="h-48 w-full overflow-hidden rounded-xl border border-white/10 sm:h-56">
      <MapContainer
        center={[lat, lng]}
        zoom={3}
        scrollWheelZoom={false}
        dragging={false}
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[lat, lng]} icon={answerIcon}>
          <Popup>
            <span className="text-xs font-medium">{city}, {country}</span>
          </Popup>
        </Marker>

        {guessMarkers.map((g, i) => {
          if (g.coord[0] === 0 && g.coord[1] === 0) return null;
          return (
            <Marker key={i} position={g.coord} icon={g.correct ? correctIcon : wrongIcon}>
              <Popup>
                <span className="text-xs">
                  {g.animal} guessed <strong>{g.guess}</strong>
                  {g.correct ? " ✓" : " ✗"}
                </span>
              </Popup>
            </Marker>
          );
        })}

        {lines.map((positions, i) => (
          <Polyline
            key={i}
            positions={positions}
            color="#ef4444"
            weight={1.5}
            opacity={0.35}
            dashArray="4 4"
          />
        ))}
      </MapContainer>
    </div>
  );
}
