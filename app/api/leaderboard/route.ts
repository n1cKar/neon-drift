import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("neondrift");
    const leaderboard = await db
      .collection("leaderboard")
      .find({})
      .sort({ score: -1 })
      .limit(10)
      .toArray();

    return NextResponse.json(leaderboard);
  } catch (err) {
    console.error("GET error:", err);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { username, score } = await req.json();
    if (!username || typeof score !== "number") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("neondrift");

    // Upsert: only update score if new score is higher
    await db.collection("leaderboard").updateOne(
      { username },
      {
        $max: { score }, // update score only if higher
        $setOnInsert: { username, date: new Date() },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST error:", err);
    return NextResponse.json({ error: "Failed to save score" }, { status: 500 });
  }
}
