import { setTimeout } from "timers/promises";
import { gemini } from "../gemini";

export default async function categorise(
    categories: string[],
    entries: { id: number, detail: string }[],
    maxEntries: number = 10
): Promise<{ id: number, category: string }[]> {
    const reclassifications: { id: number, category: string }[] = [];

    let i = 0;
    while (i < entries.length) {
        // Slice 50 orphans to parse at once
        const entriesToParse = entries.slice(i, i + maxEntries);

        const prompt = `
            Assign each transaction to one of these categories: ${categories.join(", ")}. If a transaction does not adequately fit into a category, assign it "Other".
            Transactions: ${JSON.stringify(entriesToParse)}
            Return ONLY a JSON array: [{"id": 1, "category": "Food"}]
        `;

        // Prompt model to reclassify transactions
        const response = await gemini(prompt);
        if (!response) throw new Error();

        reclassifications.push(...JSON.parse(response));

        i += maxEntries;

        await setTimeout(1500);
    }

    return reclassifications;
}