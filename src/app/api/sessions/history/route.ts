import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import airportsData from "../../places/search/airports.json";

const HUB_COORDS: Record<string, { lat: number; lng: number }> = {
  dxb: { lat: 25.2532, lng: 55.3657 },
  blr: { lat: 13.1986, lng: 77.7066 },
  hyd: { lat: 17.2403, lng: 78.4294 },
  sin: { lat: 1.3644, lng: 103.9915 },
  lhr: { lat: 51.4700, lng: -0.4543 },
  jfk: { lat: 40.6413, lng: -73.7781 },
  hnd: { lat: 35.5494, lng: 139.7798 },
  syd: { lat: -33.9461, lng: 151.1772 },
  bom: { lat: 19.0896, lng: 72.8656 },
  del: { lat: 28.5562, lng: 77.1000 },
  lax: { lat: 33.9416, lng: -118.4085 },
  sfo: { lat: 37.6213, lng: -122.3790 },
  cdg: { lat: 49.0097, lng: 2.5479 },
  fra: { lat: 50.0379, lng: 8.5622 },
  icn: { lat: 37.4602, lng: 126.4407 },
  hkg: { lat: 22.3080, lng: 113.9185 },
  gru: { lat: -23.4356, lng: -46.4731 },
  cpt: { lat: -33.9715, lng: 18.6021 },
  cai: { lat: 30.1219, lng: 31.4056 },
  yyz: { lat: 43.6777, lng: -79.6248 },
  mex: { lat: 19.4361, lng: -99.0719 },
  bkk: { lat: 13.6900, lng: 100.7501 },
  doh: { lat: 25.2611, lng: 51.5650 },
  ams: { lat: 52.3105, lng: 4.7683 },
  kjb: { lat: 15.8016, lng: 78.0267 },
  vtz: { lat: 17.7212, lng: 83.2245 },
  maa: { lat: 12.9941, lng: 80.1709 },
  ccu: { lat: 22.6547, lng: 88.4467 },
};

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch completed session participant records
    const history = await prisma.sessionParticipant.findMany({
      where: {
        userId: user.id,
      },
      include: {
        session: true,
      },
      orderBy: {
        joinedAt: "desc",
      },
    });

    const historyWithCoords = history.map((item) => {
      const originCodeLower = item.session.originCode.toLowerCase();
      const destCodeLower = item.session.destinationCode.toLowerCase();

      let originLat = HUB_COORDS[originCodeLower]?.lat;
      let originLng = HUB_COORDS[originCodeLower]?.lng;
      let destinationLat = HUB_COORDS[destCodeLower]?.lat;
      let destinationLng = HUB_COORDS[destCodeLower]?.lng;

      // Fallback to airportsData JSON lookup
      if (originLat === undefined || originLng === undefined) {
        const found = (airportsData as any[]).find(
          (a) => a.iata?.toLowerCase() === originCodeLower || a.id?.toLowerCase() === originCodeLower
        );
        if (found) {
          originLat = found.lat;
          originLng = found.lng;
        }
      }

      if (destinationLat === undefined || destinationLng === undefined) {
        const found = (airportsData as any[]).find(
          (a) => a.iata?.toLowerCase() === destCodeLower || a.id?.toLowerCase() === destCodeLower
        );
        if (found) {
          destinationLat = found.lat;
          destinationLng = found.lng;
        }
      }

      return {
        ...item,
        originLat,
        originLng,
        destinationLat,
        destinationLng,
      };
    });

    return NextResponse.json({ history: historyWithCoords });
  } catch (error) {
    console.error("Get travel history error:", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}

