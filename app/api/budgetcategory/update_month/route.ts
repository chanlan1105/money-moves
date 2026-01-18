import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/app/lib/sql";

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { user, category, newBudget, month } = body;

        if (!category || newBudget === undefined || !month) {
            return NextResponse.json(
                { error: "Category, newBudget, and month are required." },
                { status: 400 }
            );
        }

        const normalizedMonth = `${month.substring(0, 7)}-01`;

        await sql`
            INSERT INTO budget_overrides ${ sql({ user, category, month: normalizedMonth, budget: newBudget }) }
            ON CONFLICT ("user", category, month) 
            DO UPDATE SET budget = EXCLUDED.budget
        `;

        return new Response("ok", { status: 200 });

    } catch (error) {
        console.error(error);
        return new Response(null, { status: 500 });
    }
}