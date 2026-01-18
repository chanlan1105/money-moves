import { NextRequest, NextResponse } from "next/server";
import { parse } from "csv-parse/sync"; // Sync is easier for hackathon logic
import { sql } from "@/app/lib/sql";
import getCategories from "@/app/lib/db/getCategories";
import generateReclassifications from "@/app/lib/db/generateReclassifications";

interface CsvRow {
    date: string;
    detail: string;
    transaction_amount: string;
    payment_amount: string;
}

export async function POST(req: NextRequest) {
    try {
        // 1. Get the multipart form data
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const user = formData.get("user") as string;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        if (!user) {
            return new Response("no username provided", { status: 400 });
        }

        // 2. Convert File to String
        // We turn the binary buffer into a readable UTF-8 string
        const bytes = await file.arrayBuffer();
        const content = Buffer.from(bytes).toString("utf-8");

        // 3. Parse CSV (knowing columns are [date, detail, spend, pay])
        const records = parse(content, {
            columns: ["date", "detail", "transaction_amount", "payment_amount"],
            skip_empty_lines: true,
            trim: true,
        });

        // 4. Filtering Logic
        // We only want rows where payment_amount is empty/zero 
        // and transaction_amount has a value.
        const filteredTransactions: CsvRow[] = (records as CsvRow[]).filter((row: CsvRow) => {
            const hasTransaction = row.transaction_amount && row.transaction_amount !== "0";
            const isNotPayment = !row.payment_amount || row.payment_amount === "0" || row.payment_amount === "";

            return hasTransaction && isNotPayment;
        });

        // 5. Cleanup for "Further Processing"
        // We map it to a clean object, converting strings to numbers where needed
        const finalData = filteredTransactions.map((row: CsvRow) => ({
            date: row.date,
            detail: row.detail,
            amount: parseFloat(row.transaction_amount),
            user
        }));

        // Get list of valid categories
        const categories = (await getCategories(user)).map(c => c.category);

        // Select categories for each line item
        const reclassifications = await generateReclassifications(categories, finalData.map((row, index) => ({
            detail: row.detail,
            id: index
        })));

        // Map classifications back to original data
        const classifiedData = finalData.map((row, index) => {
            const assignment = reclassifications.find(r => r.id == index);

            return {
                ...row,
                category: assignment ? assignment.category : "Other"
            };
        });

        // Push incoming transactions to database
        await sql`
            INSERT INTO transactions
            ${
                sql(classifiedData, "date", "user", "category", "detail", "amount")
            }
        `;


        // Return the JS object as JSON
        return new Response("ok", { status: 200 });

    } catch (error) {
        console.error("CSV Processing Error:", error);
        return NextResponse.json({ error: "Failed to parse CSV" }, { status: 500 });
    }
}