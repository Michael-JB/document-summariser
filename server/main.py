import os
import openai
import uvicorn
import nltk

from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException

from typing import List
from pydantic import BaseModel

SERVER_PORT = 3001

TOKEN_CHARACTER_COUNT = 4
MAX_PROMPT_TOKENS = 1500
MAX_SUMMARY_TOKENS = 250

SUMMARY_MODEL = "text-davinci-003"  # "text-curie-001"
EMBEDDING_MODEL = "text-embedding-ada-002"


class Sentence(BaseModel):
    text: str
    embedding: List[float]


class Paragraph(BaseModel):
    text: str
    embedding: List[float]


class SummariserData(BaseModel):
    summary: List[Sentence]
    document: List[Paragraph]


class RequestBody(BaseModel):
    document: str


# Download pre-trained tokeniser data (English)
nltk.download("punkt")

# Load OpenAI API key from .env file
load_dotenv()
openai.api_key = os.environ.get("OPENAI_API_KEY")

# Create FastAPI handle
fast_api_app = FastAPI()

# Approximates the number of tokens in a string
def approximate_tokens_count(text: str):
    return len(text) / TOKEN_CHARACTER_COUNT


# Generates a prompt for OpenAI's completion API
def generate_prompt(text: str) -> str:
    return f"Summarise the following text in 6 sentences:\n\nText: ###\n{text}\n###"


# Uses OpenAI's API to summarise a text
def summarise_text(text: str) -> str:
    summary_response = openai.Completion.create(
        model=SUMMARY_MODEL,
        prompt=generate_prompt(text),
        temperature=0.7,
        max_tokens=MAX_SUMMARY_TOKENS,
        top_p=1.0,
        frequency_penalty=0.0,
        presence_penalty=1,
    )

    if not summary_response.choices or not summary_response.choices[0].text:
        raise Exception("Request to OpenAI API returned no summary.")

    return summary_response.choices[0].text.strip()


# Uses OpenAI's API to generate embeddings for a list of strings
def generate_embeddings(input: List[str]) -> List[float]:
    return [
        data.embedding
        for data in openai.Embedding.create(input=input, model=EMBEDDING_MODEL).data
    ]


# Splits a string into non-empty sentences
def generate_sentences(text: str) -> List[str]:
    sentences = [sentence for sentence in nltk.tokenize.sent_tokenize(text) if sentence]
    if not sentences:
        raise Exception("Insufficient sentence count.")
    # If possible, remove last sentence which is likely to be incomplete
    return sentences[:-1] if (len(sentences) > 1) else sentences


# Splits a string into non-empty paragraphs
def generate_paragraphs(text: str) -> List[str]:
    return [paragraph for paragraph in text.splitlines() if paragraph]


@fast_api_app.post("/get-summarisation-data")
async def get_summarisation_data(request_body: RequestBody):
    try:
        document = request_body.document

        if approximate_tokens_count(document) > MAX_PROMPT_TOKENS:
            raise ValueError("Document is too long.")

        summary = summarise_text(document)
        summary_sentences = generate_sentences(summary)
        document_paragraphs = generate_paragraphs(document)

        summary_embeddings = generate_embeddings(summary_sentences)
        document_embeddings = generate_embeddings(document_paragraphs)

        summariser_data = SummariserData(
            summary=[
                Sentence(text=summary_sentences[i], embedding=summary_embeddings[i])
                for i in range(len(summary_sentences))
            ],
            document=[
                Paragraph(text=document_paragraphs[i], embedding=document_embeddings[i])
                for i in range(len(document_paragraphs))
            ],
        )

        return summariser_data
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("main:fast_api_app", port=SERVER_PORT, reload=True, log_level="info")
