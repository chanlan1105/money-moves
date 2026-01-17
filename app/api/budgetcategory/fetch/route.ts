import { sql } from "@/app/lib/sql";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const { user } = await req.json();

    try {
        const result = await sql`
            SELECT category, budget
            FROM config
            WHERE "user"=${user}
        `;

        return Response.json(result, { status: 200 });
    }
    catch (err) {
        console.error(err);
        return new Response(null, { status: 500 });
    }
}