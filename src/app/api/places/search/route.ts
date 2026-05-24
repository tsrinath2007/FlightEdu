import { NextResponse } from "next/server";
import airportsData from "./airports.json";

export interface PlaceResult {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  type: "city" | "airport";
  iata?: string;
  city?: string;
}

const AIRPORTS = airportsData as PlaceResult[];

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
