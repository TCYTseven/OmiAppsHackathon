import { NextResponse } from "next/server";

/*interface TranscriptSegment {
  text: string;
  speaker: string;
  speaker_id: number;
  is_user: boolean;
  person_id: number | null;
  start: number;
  end: number;
}

function combineTranscriptSegments(
  transcriptSegments: TranscriptSegment[]
): string {
  return transcriptSegments.map((segment) => segment.text).join(" ");
}*/

export async function POST(req: Request) {
  const url = new URL(req.url);
  const uid = url.searchParams.get("uid");

  /*const request = await req.json();
  const transcript_segments = request.transcript_segments;

  const transcript = combineTranscriptSegments(transcript_segments);*/

  // call ai

  const cards = [
    {
      front: "What is the formula for glucose?",
      back: "C6H12O6",
    },
    {
      front: "What process creates food in a plant?",
      back: "Photosynthesis",
    },
    {
      front: "What process turns glucose into ATP?",
      back: "Cellular Respiration",
    },
    {
      front: "How many oxygen molecules are produced in photosynthesis?",
      back: "6",
    },
  ];

  const title = "Unnamed Set";
  const response = await fetch("/api/sets/new", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      cards,
      uid,
      title
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create set");
  }

  //const data = await response.json();

  return NextResponse.json({ message: `Created set ${1}` }, { status: 200 });
}
