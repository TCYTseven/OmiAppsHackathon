import json
import httpx
import time
from main import create_flashcards
import asyncio

async def main():
    # Read the example payload
    with open("bio-examplepayload.json", "r", encoding="utf-8") as f:
        payload = json.load(f)

    transcript_segments = payload.get("transcript_segments", [])
    transcript = " ".join(segment["text"] for segment in transcript_segments)

    # Generate flashcards
    flashcards = create_flashcards(transcript, max_cards=20)
    flashcards_list = [{"front": flashcard.front, "back": flashcard.back} for flashcard in flashcards]

    # Send flashcards to the API to get the access code
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://omi-apps-hackathon.vercel.app/api/sets/new",
            json={"cards": flashcards_list, "uid": "your-uid", "title": "Unnamed Set"}
        )

    if response.status_code == 200:
        response_data = response.json()
        set_code = response_data.get("code", "Unknown")
        print(f"Set code: {set_code}")
    else:
        print(f"The code is: {response.text}")

if __name__ == "__main__":
    asyncio.run(main())
