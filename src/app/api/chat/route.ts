import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

// 1. GET: Fetch chat message history between the current user and another user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const otherUserId = searchParams.get("otherUserId");

    if (!otherUserId) {
      return NextResponse.json({ error: "otherUserId is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify they are accepted co-pilots
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: user.id, receiverId: otherUserId, status: "ACCEPTED" },
          { senderId: otherUserId, receiverId: user.id, status: "ACCEPTED" },
        ],
      },
    });

    if (!friendship) {
      return NextResponse.json(
        { error: "Chat is only available if you are accepted co-pilots." },
        { status: 403 }
      );
    }

    // Fetch messages
    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: user.id, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: user.id },
        ],
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

// 2. POST: Send a direct message to a co-pilot
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { receiverId, content } = (await request.json()) as {
      receiverId: string;
      content: string;
    };

    if (!receiverId || !content || !content.trim()) {
      return NextResponse.json({ error: "Receiver and content are required" }, { status: 400 });
    }

    // Verify friendship status is ACCEPTED
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: user.id, receiverId, status: "ACCEPTED" },
          { senderId: receiverId, receiverId: user.id, status: "ACCEPTED" },
        ],
      },
    });

    if (!friendship) {
      return NextResponse.json(
        { error: "You can only chat with accepted co-pilots." },
        { status: 403 }
      );
    }

    // Save message
    const message = await prisma.chatMessage.create({
      data: {
        senderId: user.id,
        receiverId,
        content: content.trim(),
      },
    });

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
