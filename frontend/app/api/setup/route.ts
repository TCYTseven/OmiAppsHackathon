import { NextResponse } from "next/server";
import { User } from "@/models/user";
import { connectMongoDB } from "@/lib/db";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const uid = url.searchParams.get("uid");

    try {
        await connectMongoDB();
        const user = await User.findOne({ omiUid: uid });
        
        return NextResponse.json({ 
            is_setup_completed: user !== null, user
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ 
            error: `Failed to check user setup status: ${error}` 
        }, { status: 500 });
    }
}