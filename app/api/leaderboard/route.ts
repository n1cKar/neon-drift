import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db("neondrift"); // change to your db name
        const scores = await db
            .collection("leaderboard")
            .find({})
            .sort({ score: -1 })
            .limit(10)
            .toArray();

        return NextResponse.json(scores);
    } catch (err) {
        console.error("GET error:", err);
        return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { username, score } = await req.json();
        const client = await clientPromise;
        const db = client.db("neondrift");

        // Upsert (insert if not exists, update if exists and score is higher)
        await db.collection("leaderboard").updateOne(
            { username },
            {
                $max: { score }, // updates score only if new score > old score
                $setOnInsert: { username, date: new Date() }, // set username + date if new user
            },
            { upsert: true }
        );

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("POST error:", err);
        return NextResponse.json({ error: "Failed to save score" }, { status: 500 });
    }
}

