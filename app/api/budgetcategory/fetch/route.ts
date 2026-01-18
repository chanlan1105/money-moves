import getCategories from "@/app/lib/db/getCategories";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const { user } = await req.json();

    try {
        const result = await getCategories(user);

        return Response.json(result, { status: 200 });
    }
    catch (err) {
        console.error(err);
        return new Response(null, { status: 500 });
    }
}