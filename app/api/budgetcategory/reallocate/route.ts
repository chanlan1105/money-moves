import generateReclassifications from "@/app/lib/db/generateReclassifications";
import getCategories from "@/app/lib/db/getCategories";
import updateTxCategories from "@/app/lib/db/updateTxCategories";
import { sql } from "@/app/lib/sql";
import { NextRequest } from "next/server";
import postgres from "postgres";

export async function POST(req: NextRequest) {
    const { user, month } = await req.json();

    try {
        // Fetch corresponding db entries
        const transactions = await sql`
            SELECT id, date, category, detail, amount 
            FROM transactions
            WHERE "user"=${user}
                AND date >= ${month}::date 
                AND date < (${month}::date + interval '1 month')
            ORDER BY date DESC
        ` as any[];

        // Fetch valid categories
        const categories = (await getCategories(user)).map(c => c.category);

        // Reallocate categories
        const reclassifications = await generateReclassifications(categories, transactions);

        // Batch update SQL
        if (reclassifications.length > 0) {
            await sql.begin(async (tx: any) => {
                await updateTxCategories(tx as postgres.Sql<{}>, reclassifications, user);
            });
        }

        return Response.json(transactions.map(t => {
            const category = reclassifications.find(rc => rc.id == t.id)?.category;
            return {
                ...t,
                category
            };
        }), { status: 200 });
    }
    catch (err) {
        console.error(err);
        return new Response("err", { status: 500 });
    }
}