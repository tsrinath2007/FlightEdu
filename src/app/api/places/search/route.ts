import { NextResponse } from "next/server";

export interface PlaceResult {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  type: "city" | "airport";
  iata?: string;
}

// Well-known airports with IATA codes for great UX
const AIRPORTS: PlaceResult[] = [
  { id: "DXB", name: "Dubai", country: "United Arab Emirates", countryCode: "AE", lat: 25.2532, lng: 55.3657, type: "airport", iata: "DXB" },
  { id: "HYD", name: "Hyderabad", country: "India", countryCode: "IN", lat: 17.2403, lng: 78.4294, type: "airport", iata: "HYD" },
  { id: "BOM", name: "Mumbai", country: "India", countryCode: "IN", lat: 19.0896, lng: 72.8656, type: "airport", iata: "BOM" },
  { id: "DEL", name: "New Delhi", country: "India", countryCode: "IN", lat: 28.5562, lng: 77.1000, type: "airport", iata: "DEL" },
  { id: "BLR", name: "Bengaluru", country: "India", countryCode: "IN", lat: 13.1986, lng: 77.7066, type: "airport", iata: "BLR" },
  { id: "MAA", name: "Chennai", country: "India", countryCode: "IN", lat: 12.9941, lng: 80.1709, type: "airport", iata: "MAA" },
  { id: "CCU", name: "Kolkata", country: "India", countryCode: "IN", lat: 22.6547, lng: 88.4467, type: "airport", iata: "CCU" },
  { id: "LHR", name: "London", country: "United Kingdom", countryCode: "GB", lat: 51.4775, lng: -0.4614, type: "airport", iata: "LHR" },
  { id: "JFK", name: "New York", country: "United States", countryCode: "US", lat: 40.6413, lng: -73.7781, type: "airport", iata: "JFK" },
  { id: "LAX", name: "Los Angeles", country: "United States", countryCode: "US", lat: 33.9425, lng: -118.4081, type: "airport", iata: "LAX" },
  { id: "SFO", name: "San Francisco", country: "United States", countryCode: "US", lat: 37.6213, lng: -122.379, type: "airport", iata: "SFO" },
  { id: "ORD", name: "Chicago", country: "United States", countryCode: "US", lat: 41.9742, lng: -87.9073, type: "airport", iata: "ORD" },
  { id: "NRT", name: "Tokyo", country: "Japan", countryCode: "JP", lat: 35.7720, lng: 140.3929, type: "airport", iata: "NRT" },
  { id: "ICN", name: "Seoul", country: "South Korea", countryCode: "KR", lat: 37.4602, lng: 126.4407, type: "airport", iata: "ICN" },
  { id: "PVG", name: "Shanghai", country: "China", countryCode: "CN", lat: 31.1443, lng: 121.8083, type: "airport", iata: "PVG" },
  { id: "SIN", name: "Singapore", country: "Singapore", countryCode: "SG", lat: 1.3644, lng: 103.9915, type: "airport", iata: "SIN" },
  { id: "SYD", name: "Sydney", country: "Australia", countryCode: "AU", lat: -33.9461, lng: 151.1772, type: "airport", iata: "SYD" },
  { id: "CDG", name: "Paris", country: "France", countryCode: "FR", lat: 49.0097, lng: 2.5479, type: "airport", iata: "CDG" },
  { id: "FRA", name: "Frankfurt", country: "Germany", countryCode: "DE", lat: 50.0379, lng: 8.5622, type: "airport", iata: "FRA" },
  { id: "AMS", name: "Amsterdam", country: "Netherlands", countryCode: "NL", lat: 52.3105, lng: 4.7683, type: "airport", iata: "AMS" },
  { id: "IST", name: "Istanbul", country: "Turkey", countryCode: "TR", lat: 41.2753, lng: 28.7519, type: "airport", iata: "IST" },
  { id: "DOH", name: "Doha", country: "Qatar", countryCode: "QA", lat: 25.2731, lng: 51.6081, type: "airport", iata: "DOH" },
  { id: "KUL", name: "Kuala Lumpur", country: "Malaysia", countryCode: "MY", lat: 2.7456, lng: 101.7099, type: "airport", iata: "KUL" },
  { id: "BKK", name: "Bangkok", country: "Thailand", countryCode: "TH", lat: 13.6900, lng: 100.7501, type: "airport", iata: "BKK" },
  { id: "GRU", name: "São Paulo", country: "Brazil", countryCode: "BR", lat: -23.4356, lng: -46.4731, type: "airport", iata: "GRU" },
  { id: "MEX", name: "Mexico City", country: "Mexico", countryCode: "MX", lat: 19.4363, lng: -99.0721, type: "airport", iata: "MEX" },
  { id: "YYZ", name: "Toronto", country: "Canada", countryCode: "CA", lat: 43.6777, lng: -79.6248, type: "airport", iata: "YYZ" },
  { id: "CPT", name: "Cape Town", country: "South Africa", countryCode: "ZA", lat: -33.9715, lng: 18.6021, type: "airport", iata: "CPT" },
  { id: "CAI", name: "Cairo", country: "Egypt", countryCode: "EG", lat: 30.1219, lng: 31.4056, type: "airport", iata: "CAI" },
  { id: "MNL", name: "Manila", country: "Philippines", countryCode: "PH", lat: 14.5086, lng: 121.0194, type: "airport", iata: "MNL" },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.toLowerCase().trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  // If Google Maps key is available, use Places API
  if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    // TODO: swap to Google Places Autocomplete
  }

  // Filter from known airports list
  const results = AIRPORTS.filter(
    (p) =>
      p.name.toLowerCase().includes(query) ||
      p.iata?.toLowerCase().includes(query) ||
      p.country.toLowerCase().includes(query) ||
      p.countryCode.toLowerCase().includes(query)
  ).slice(0, 6);

  // If we got < 3 matches from airports, supplement from Nominatim
  if (results.length < 3) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&featuretype=city`;
      const res = await fetch(url, {
        headers: { "User-Agent": "FlightEdu/1.0" },
      });
      const data = await res.json() as Array<{
        place_id: number; display_name: string; lat: string; lon: string; address?: { country?: string; country_code?: string };
      }>;

      const nominatimResults: PlaceResult[] = data
        .filter((d) => !results.some((r) => r.name === d.display_name.split(",")[0]))
        .slice(0, 4)
        .map((d) => ({
          id: `osm-${d.place_id}`,
          name: d.display_name.split(",")[0],
          country: d.display_name.split(",").slice(-1)[0].trim(),
          countryCode: d.address?.country_code?.toUpperCase() ?? "",
          lat: parseFloat(d.lat),
          lng: parseFloat(d.lon),
          type: "city" as const,
        }));

      results.push(...nominatimResults);
    } catch {
      // Nominatim unavailable, return airport results only
    }
  }

  return NextResponse.json({ results });
}
