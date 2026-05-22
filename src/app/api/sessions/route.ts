import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { nanoid } from "@/lib/nanoid";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json() as {
    origin: string;
    originCode: string;
    destination: string;
    destinationCode: string;
    transportMode: string;
    duration: number;
    mode: "CHILL" | "HARDCORE";
  };

  const session = await prisma.session.create({
    data: {
      hostId: user.id,
      origin: body.origin,
      originCode: body.originCode,
      destination: body.destination,
      destinationCode: body.destinationCode,
      transportMode: body.transportMode as "FLIGHT" | "BUS" | "TRAIN" | "CAR",
      duration: body.duration,
      mode: body.mode,
      inviteCode: nanoid(8),
      participants: {
        create: { userId: user.id },
      },
    },
    include: { participants: true },
  });

  return NextResponse.json({ session });
}
