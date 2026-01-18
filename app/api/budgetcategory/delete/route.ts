import categorise from "@/app/lib/db/categorise";
import getCategories from "@/app/lib/db/getCategories";
import { gemini } from "@/app/lib/gemini";
import { sql } from "@/app/lib/sql";
import { NextRequest } from "next/server";

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
        await sql.begin(async (tx: any) => {
            // Set transactions of current category to NULL
            await tx`
                UPDATE transactions
                SET category=NULL
                WHERE category=${category} AND "user"=${user}
            `;

            // Delete category from config table
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
        // Attempt to reassign existing transactions to another category using
        // the Gemini API

        const orphans = await sql`
            SELECT id, detail
            FROM transactions
            WHERE "user"=${user} AND category IS NULL
        ` as { id: number, detail: string }[];

        if (orphans.length) {
            // Get list of valid categories
            const categories = (await getCategories(user)).map(c => c.category);

            // Reclassify orphan entries
            const reclassifications = await categorise(categories, orphans);
            
            // Update database
            await sql.begin(async (tx: any) => {
                for (const { id, category } of reclassifications) {
                    await tx`
                        UPDATE transactions 
                        SET category = ${category}
                        WHERE id = ${id} AND "user"=${user}
                    `;
                }
            });
        }
    }
    catch (err) {
        console.error(err);

        return new Response("error reassigning transactions", { status: 500 });
    }

    return new Response(null, { status: 200 });
}