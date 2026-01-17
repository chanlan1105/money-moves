import { sql } from "@/app/lib/sql";
import { NextRequest } from "next/server";
import postgres from "postgres";

const { PostgresError } = postgres;

export async function POST(req: NextRequest) {
    const user = "hackathon";

    const { category, budget } = await req.json();

    try {
        await sql`
            INSERT INTO config ${
                sql({ user, category, budget })
            }
        `;

        return new Response("ok", { status: 200 });
    }
    catch (err) {
        if (err instanceof PostgresError && err.code === '23505') {
            return new Response("duplicate", { status: 400 });
        }

        return new Response("error", { status: 500 });
    }
}