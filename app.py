#openai api integration
"""
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
import httpx
import openai

app = FastAPI()

openai.api_key = "your_openai_api_key"

class Flashcard(BaseModel):
    front: str
    back: str

@app.post("/webhook")
async def process_transcript(request: Request):
    try:
        payload = await request.json()
        transcript = payload.get("transcript")
        if not transcript:
            raise HTTPException(status_code=400, detail="Transcript is missing")

        flashcards = await generate_flashcards(transcript)
        response = await create_flashcard_set(flashcards)

        return {"status": "success", "set_code": response.get("code")}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def generate_flashcards(transcript: str) -> list[Flashcard]:
    prompt = f"Turn the following lecture transcript into flashcards:\n\n{transcript}\n\nOutput format: JSON array of objects with 'front' and 'back'."
    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=prompt,
        max_tokens=150,
        temperature=0.7
    )

    try:
        flashcards = response["choices"][0]["text"]
        return [Flashcard(**card) for card in eval(flashcards)]
    except Exception as e:
        raise ValueError(f"Failed to parse OpenAI response: {e}")

async def create_flashcard_set(flashcards: list[Flashcard]) -> dict:
    url = "https://omi-apps-hackathon.vercel.app/api/sets/new"
    data = {"cards": [card.dict() for card in flashcards]}

    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=data)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json()

@app.get("/")
async def root():
    return {"message": "Backend for Flashcard Generator is running!"}
"""