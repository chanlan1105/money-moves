import { sql } from "../sql";

export default async function getCategories(user: string, month?: string) {
    // Add Other to the table if not exists
    await sql`
        INSERT INTO config ("user", category, budget)
        VALUES (${user}, 'Other', 0)
        ON CONFLICT ("user", category)
        DO NOTHING
    `;

    const categories = month ? 
        await sql`
            SELECT 
                c.category, 
                COALESCE(o.budget, c.budget) as budget,
                (o.category IS NOT NULL) as is_override
            FROM config c
            LEFT JOIN budget_overrides o ON 
                c.category = o.category AND 
                c."user" = o."user" AND 
                o.month = ${month}
            WHERE c."user" = ${user}
        ` :
        await sql`
            SELECT category, budget
            FROM config
            WHERE "user"=${user}
        `;

    return categories;
}