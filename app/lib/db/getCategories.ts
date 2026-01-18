import { sql } from "../sql";

export default async function getCategories(user: string) {
    // Add Other to the table if not exists
    await sql`
        INSERT INTO config ("user", category, budget)
        VALUES (${user}, 'Other', 0)
        ON CONFLICT ("user", category)
        DO NOTHING
    `;

    const categories = await sql`
        SELECT category, budget
        FROM config
        WHERE "user"=${user}
    `;

    return categories;
}