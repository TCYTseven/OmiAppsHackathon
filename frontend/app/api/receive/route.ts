import { NextResponse } from "next/server";

export async function POST() {
return NextResponse.json(
    { message: `Created set` },
    { status: 200 }
  );
}
