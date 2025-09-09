import json
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import google.generativeai as genai
from google.cloud import texttospeech
from fastapi.responses import StreamingResponse
import config

import logging

logging.basicConfig(level=logging.INFO)

app = FastAPI()

genai.configure(api_key=config.GOOGLE_API_KEY)

class Person(BaseModel):
    name: str

class TextToSpeak(BaseModel):
    text: str
    language_code: str
    voice_name: str

@app.post("/api/quotes")
async def get_quotes(person: Person):
    try:
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        prompt = f"Return a JSON array of 10 famous quotes from {person.name}. Each object in the array should have two attributes: 'quote' and 'context'."
        logging.info(f"Prompt sent to Gemini: {prompt}")
        response = model.generate_content(prompt)
        logging.info(f"Response from Gemini: {response.text}")
        # Clean the response to extract only the JSON part.
        cleaned_response = response.text.strip().lstrip('```json').rstrip('```')
        logging.info(f"Cleaned response: {cleaned_response}")
        return json.loads(cleaned_response)
    except Exception as e:
        logging.error(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred while fetching quotes: {e}")

@app.get("/api/voices")
async def get_voices():
    try:
        client = texttospeech.TextToSpeechClient()
        voices = client.list_voices().voices
        
        languages = {}
        for voice in voices:
            if "-" in voice.name and "-Chirp3-" not in voice.name:
                lang_code = voice.language_codes[0]
                if lang_code not in languages:
                    languages[lang_code] = []
                languages[lang_code].append({"name": voice.name, "gender": voice.ssml_gender.name.lower()})
        return languages
    except Exception as e:
        logging.error(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred while fetching voices: {e}")

@app.post("/api/speak")
async def speak(text_to_speak: TextToSpeak):
    logging.info(f"Received voice name: {text_to_speak.voice_name}")
    try:
        client = texttospeech.TextToSpeechClient()

        synthesis_input = texttospeech.SynthesisInput(text=text_to_speak.text)

        voice = texttospeech.VoiceSelectionParams(
            language_code=text_to_speak.language_code, name=text_to_speak.voice_name
        )

        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3
        )

        response = client.synthesize_speech(
            input=synthesis_input, voice=voice, audio_config=audio_config
        )

        return StreamingResponse(iter([response.audio_content]), media_type="audio/mpeg")
    except Exception as e:
        logging.error(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred while generating speech: {e}")

app.mount("/", StaticFiles(directory="static", html=True), name="static")
