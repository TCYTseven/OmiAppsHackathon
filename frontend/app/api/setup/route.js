import { NextResponse } from "next/server";
import { User } from "@/models/user";
import { connectMongoDB } from "@/lib/db";

export async function GET(req) {
    const stateSymbol = Object.getOwnPropertySymbols(req).find(
      (sym) => sym.toString() === "Symbol(state)"
    );
    const state = req[stateSymbol];
    const searchParams = state.url.searchParams;
    const uri = searchParams.get("uri");

    try {
        await connectMongoDB();
        const user = await User.findOne({ omiUid: uri });
        
        return NextResponse.json({ 
            is_setup_completed: user !== null 
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ 
            error: `Failed to check user setup status: ${error}` 
        }, { status: 500 });
    }
}