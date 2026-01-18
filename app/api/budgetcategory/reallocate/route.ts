import categorise from "@/app/lib/db/categorise";
import getCategories from "@/app/lib/db/getCategories";
import { sql } from "@/app/lib/sql";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const { user, month } = await req.json();

    try {
        // Fetch corresponding db entries
        const transactions = await sql`
            SELECT (id, detail)
            FROM transactions
            WHERE "user"=${user}
                AND date >= ${month}::date 
                AND date < (${month}::date + interval '1 month')
        ` as { id: number, detail: string }[];

        // Fetch valid categories
        const categories = (await getCategories(user)).map(c => c.category);

        // Reallocate categories
        const reclassifications = await categorise(categories, transactions);

        // Batch update SQL
        if (reclassifications.length > 0) {
            await sql.begin(async (tx: any) => {
                for (const { id, category } of reclassifications) {
                    // If Gemini couldn't find a match, it might return null/Other
                    const finalCategory = category || "Other"; 
                    await tx`
                        UPDATE transactions 
                        SET category = ${finalCategory}
                        WHERE id = ${id} AND "user"=${user}
                    `;
                }
            });
        }

        return new Response("ok", { status: 200 });
    }
    catch (err) {
        console.error(err);
        return new Response("err", { status: 500 });
    }
}