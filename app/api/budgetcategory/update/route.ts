import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/app/lib/sql"; // Importing your teammate's SQL utility

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { user, oldCategory, newCategory, newBudget } = body;

    // 1. Validation
    if (!newCategory && newBudget === undefined) {
      return NextResponse.json(
        { error: "Minimum 1 of newCategory or newBudget is required." },
        { status: 400 }
      );
    }

    // 2. Database Logic: Update the Category
    // We use oldCategory and user to find the right row, then set the new values.
    await sql`
      UPDATE config 
      SET 
        category = ${newCategory || oldCategory}, 
        budget = ${newBudget}
      WHERE 
        "user" = ${user} AND 
        category = ${oldCategory}
    `;

    // 3. Optional but Important: Synchronize Transaction Tags
    // If the user renamed "Food" to "Groceries", their historical spending 
    // needs to move too, otherwise their graphs will show $0 spent for "Groceries".
    if (newCategory && newCategory !== oldCategory) {
        // You might need a separate table update here depending on your schema
        console.log(`Renaming transactions from ${oldCategory} to ${newCategory}`);
    }

    return NextResponse.json({ message: "Update successful" }, { status: 200 });

  } catch (error) {
    console.error("PostgreSQL Update Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}