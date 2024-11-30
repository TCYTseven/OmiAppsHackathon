from fastapi import FastAPI, HTTPException, Request, Query
from pydantic import BaseModel
import httpx
import json
import spacy
from cerebras.cloud.sdk import Cerebras
from dotenv import load_dotenv
import os


nlp = spacy.load("en_core_web_sm")


load_dotenv(dotenv_path=".env.local")

API_KEY = os.getenv("CEREBRAS_API_KEY")

if API_KEY:
    cerebras_client = Cerebras(api_key=API_KEY)
    print("API key loaded")
else:
    print("Failed to load API key")

cerebras_client = Cerebras(api_key=API_KEY)

app = FastAPI()

class Flashcard(BaseModel):
    front: str
    back: str


def rewrite_content_with_cerebras(text: str, model="llama3.1-8b") -> str:
    """
    Refines a flashcard question or answer by ensuring concise and relevant content.
    """
    response = cerebras_client.chat.completions.create(
        messages=[{"role": "user", "content": f"Rewrite this as a concise, clear flashcard question or answer: {text}. Do not add unnecessary formatting, extra commentary, or explanations."}],
        model=model,
    )
    return response.choices[0].message.content.strip()


def rewrite_pair_with_cerebras(raw_text: str, model="llama3.1-8b") -> dict:
    """
    Refines a flashcard pair by generating a concise and relevant question-answer pair.
    """
    prompt = (
        f"Create a meaningful flashcard based on the following text:\n\n"
        f"Text: {raw_text}\n\n"
        f"Generate a clear and concise question with a short answer (1-3 sentences). "
        f"Ensure the content is relevant to the main topic, avoiding unnecessary details and specific references. "
        f"Avoid time-specific references or off-topic content. "
        f"Only output the question and answer, with no additional formatting or commentary."
    )
    
    response = cerebras_client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model=model,
    )
    
    raw_response = response.choices[0].message.content.strip()

    lines = raw_response.split("\n", 1)
    question = lines[0].strip() if len(lines) > 0 else None
    answer = lines[1].strip() if len(lines) > 1 else None
    
    question = question.replace("**Front:**", "").replace("Flashcard:", "").strip()
    answer = answer.replace("**Back:**", "").replace("Flashcard:", "").strip()

    return {"question": question, "answer": answer}


def is_relevant_flashcard(question: str, answer: str) -> bool:
    """
    Validates if the generated flashcard question and answer are relevant to the topic.
    """
    
    if not question or not answer:
        return False

    irrelevant_keywords = ["Question", "Answer", "Q:", "A:s"]
    if any(keyword.lower() in question.lower() or keyword.lower() in answer.lower() for keyword in irrelevant_keywords):
        return False
    
    return True


def create_flashcards(transcript: str, max_cards: int = 20) -> list[Flashcard]:
    """
    Generates a list of flashcards based on a transcript, ensuring concise and relevant content.
    """
    doc = nlp(transcript)
    flashcards = []

    for sent in doc.sents:
        if len(flashcards) >= max_cards:
            break

        raw_text = sent.text.strip()

        
        refined_pair = rewrite_pair_with_cerebras(raw_text)
        question, answer = refined_pair.get("question"), refined_pair.get("answer")

        
        if question and answer and len(question) > 5 and len(answer) > 3 and is_relevant_flashcard(question, answer):
            flashcards.append(Flashcard(front=question, back=answer))

    return flashcards


@app.post("/webhook")
async def process_transcript(request: Request):
    try:
        payload = await request.json()
        transcript_segments = payload.get("transcript_segments", [])
        if not transcript_segments:
            raise HTTPException(status_code=400, detail="Transcript segments are missing")

        transcript = " ".join(segment["text"] for segment in transcript_segments)

        flashcards = create_flashcards(transcript, max_cards=20)

        flashcards_list = [{"front": flashcard.front, "back": flashcard.back} for flashcard in flashcards]
        output_data = {"cards": flashcards_list}

        with open("5bio-outputCards.json", "w", encoding="utf-8") as f:
            json.dump(output_data, f, ensure_ascii=False, indent=4)

        return {
            "status": "success",
            "cards_created": len(flashcards),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/send-cards")
async def send_cards(uid: str = Query(...), request: Request):
    try:
        payload = await request.json()
        flashcards = payload.get("flashcards", [])
        if not flashcards:
            raise HTTPException(status_code=400, detail="No flashcards provided.")

        cards = [{"front": fc["front"], "back": fc["back"]} for fc in flashcards]

        # Send cards to the API
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://omi-apps-hackathon.vercel.app/api/sets/new",
                json={"cards": cards, "uid": uid, "title": "Unnamed Set"}
            )

        if response.status_code == 200:
            # Extract the set code from the response
            response_data = response.json()
            set_code = response_data.get("code", "Unknown")  # Ensure we handle if "code" is missing
            return {
                "status": "success",
                "message": "Flashcards sent successfully.",
                "set_code": set_code,
                "code": 200,
            }
        else:
            return {
                "status": "failure",
                "message": response.text,
                "code": response.status_code,
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.get("/")
async def root():
    return {"message": "Enhanced Quizlet-style Flashcard Generator is running!"}
