import getCategories from "@/app/lib/db/getCategories";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const { user, month } = await req.json();

    try {
        const result = await getCategories(user, month);

        return Response.json(result, { status: 200 });
    }
    catch (err) {
        console.error(err);
        return new Response(null, { status: 500 });
    }
}