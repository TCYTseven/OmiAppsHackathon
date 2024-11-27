import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({ is_setup_completed: true }, { status: 200 });
}