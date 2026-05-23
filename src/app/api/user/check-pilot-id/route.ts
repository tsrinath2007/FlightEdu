import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pilotId = searchParams.get("id")?.trim();

  if (!pilotId) {
    return NextResponse.json({ available: false, error: "No ID provided" });
  }

  if (pilotId.length < 6) {
    return NextResponse.json({ available: false, error: "Minimum 6 characters required" });
  }

  if (!/^[a-zA-Z0-9_.-]+$/.test(pilotId)) {
    return NextResponse.json({ available: false, error: "Only letters, numbers, _ . - allowed" });
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { pilotId },
      select: { id: true },
    });
    return NextResponse.json({ available: !existing });
  } catch {
    // If DB is unavailable, allow proceeding (optimistic)
    return NextResponse.json({ available: true });
  }
}
