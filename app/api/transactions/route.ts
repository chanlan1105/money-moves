import { sql } from "@/app/lib/sql";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const { user, year, month } = await req.json();

    const yearMonth = `${year}-${month}`;

    try {
        // Fetch user transactions from database
        const startOfMonth = `${yearMonth}-01`;

        const transactions = await sql`
            SELECT id, date, category, detail, amount 
            FROM transactions
            WHERE "user" = ${user}
            AND date >= ${startOfMonth}::date 
            AND date < (${startOfMonth}::date + interval '1 month')
            ORDER BY date DESC
        `;

        return Response.json(transactions, { status: 200 });
    }
    catch (err) {
        console.error(err);
        return new Response(null, { status: 500 });
    }
}