import generateReclassifications from "@/app/lib/db/generateReclassifications";
import getCategories from "@/app/lib/db/getCategories";
import updateTxCategories from "@/app/lib/db/updateTxCategories";
import { gemini } from "@/app/lib/gemini";
import { sql } from "@/app/lib/sql";
import { NextRequest } from "next/server";
import postgres from "postgres";

/**
 * DELETE request to api/budgetcategory/delete
 * JSON body with 2 parameters: user and category
 * Deletes the category from the SQL database (and reassign existing transactions to a new category)
 * Front-end: Make sure to have confirmation as this is a critical action!
 * Server responds with 200 OK if the operation was successful
 * Server responds with HTTP 500 and text "error deleting category" if category could not be deleted
 * Server respons with HTTP 500 and text "error reassigning transactions" if existing transactions of the category could not be reassigned to other existing categories
 */
export async function DELETE(req: NextRequest) {
    const { user, category } = await req.json();

    // "Other" category cannot be deleted
    if (category == "Other")
        return new Response("cannot delete Other", { status: 400 });
    
    try {
        // Attempt to delete category from config table
        // Attempt to delete category from config table
        await sql.begin(async (tx: any) => {
            // 1. Delete overrides first to avoid Foreign Key violations
            await tx`
                DELETE FROM budget_overrides
                WHERE "user"=${user} AND category=${category}
            `;

            // 2. Set transactions of current category to NULL
            await tx`
                UPDATE transactions
                SET category=NULL
                WHERE category=${category} AND "user"=${user}
            `;

            // 3. Delete category from config table
            await tx`
                DELETE FROM config
                WHERE "user"=${user} AND category=${category}
            `;
        });
    }
    catch (err) {
        console.error(err);
        return new Response("error deleting category", { status: 500 });
    }

    try {
        // Find transactions that were just orphaned
        const orphans = await sql`
            SELECT id, detail
            FROM transactions
            WHERE "user"=${user} AND category IS NULL
        ` as { id: number, detail: string }[];

        if (orphans.length > 0) {
            // ✨ 1. Fetch valid categories using the month parameter
            const currentMonth = new Date().toISOString().substring(0, 7) + "-01";
            const categoryList = await getCategories(user, currentMonth);
            const validCategoryNames = categoryList.map(c => c.category);

            // ✨ 2. AI Brainstorming: Gemini decides where these belong
            const reclassifications = await generateReclassifications(validCategoryNames, orphans);
            
            // ✨ 3. Batch Update: Use a single transaction for all reassignments
            if (reclassifications.length > 0) {
                await sql.begin(async (tx: any) => {
                    await updateTxCategories(tx as postgres.Sql<{}>, reclassifications, user);
                });
            }
        }
    }
    catch (err) {
        console.error("AI Reassignment Error:", err);
        // We still return 200 because the category IS deleted, 
        // even if the AI failed to move the transactions. 
        // This prevents the UI from getting stuck in an error state.
        return new Response("category deleted, but AI reassignment failed", { status: 200 });
    }

    return new Response(null, { status: 200 });
}