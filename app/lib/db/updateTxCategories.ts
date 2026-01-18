import postgres from "postgres";

export default function updateTxCategories(tx: postgres.Sql<{}>, reclassifications: {
    id: number;
    category: string;
}[], user: string) {
    const updatePromises = reclassifications.map(async ({ id, category }) => {
    const finalCategory = category || "Other"; 
        return await tx`
            UPDATE transactions 
            SET category = ${finalCategory}
            WHERE id = ${id} AND "user"=${user}
        `;
    });

    return Promise.all(updatePromises);
}