"""
Virtual Laboratory Experiment — Streamlit Application
Experiment Title : Multimodal Tokenization for Information Retrieval
Roll Number      : 2
Deadline         : 19 September 2026, 10:00 AM

Based on the generic Virtual Lab template (template.py).
All four sections are preserved: Theory, Simulation, Quiz, Report Generation.
No custom CSS — uses native Streamlit light/dark theme rendering.

Tokenization uses a pure regex/whitespace approach — no NLTK corpus download required.
Media inputs are represented with modality-aware metadata tokens; no media transcription or analysis is performed.
"""

import io
import os
import random
import re
import string
import tempfile
import zipfile
import wave
from datetime import datetime
from xml.etree import ElementTree as ET

import numpy as np
import pandas as pd
import plotly.graph_objects as go
import streamlit as st
from fpdf import FPDF
from nltk.stem.porter import PorterStemmer
from PIL import Image, ImageDraw
from pypdf import PdfReader
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS

try:
    cv2 = __import__("cv2")
except ImportError:
    cv2 = None

try:
    miniaudio = __import__("miniaudio")
except ImportError:
    miniaudio = None



# =============================================================================
# 1. EXPERIMENT CONFIGURATION & EDUCATIONAL CONTENT
# =============================================================================

EXPERIMENT_CONFIG = {
    "title": "Multimodal Tokenization for Information Retrieval",
    "aim": (
        "To design and implement a multimodal tokenization process that accepts text, image, "
        "audio, and video inputs and represents each input as tokens for Information Retrieval."
    ),
    "objectives": [
        "Understand Information Retrieval as a process for finding relevant information.",
        "Identify text, image, audio, and video as multimodal inputs.",
        "Understand tokenization as the only processing operation in this experiment.",
        "Observe lexical tokens from text and metadata tokens from non-text media.",
        "Compare token counts and unique tokens across different modalities.",
        "Understand how tokens provide a common representation for retrieval and indexing.",
    ],
}

THEORY_CONTENT = {
    "ir_intro": """
> *“The ability to find the right information at the right time is one of the fundamental challenges of the digital age.”*

Today, an enormous amount of information is stored in the form of digital documents, including research papers, reports, articles, web pages, and academic resources. As the volume of textual information continues to increase, manually searching through such documents becomes inefficient and time-consuming. This creates the need for systems that can efficiently organize, process, and retrieve relevant information from large collections of documents.

However, before a document can be effectively searched or indexed, its textual content needs to be prepared in a suitable form. A document may contain different capitalization, punctuation marks, numbers, unnecessary words, and multiple forms of the same word. These variations can introduce noise and unnecessary complexity during information retrieval.

Consider a simple example. A document may contain the words “Retrieve,” “retrieves,” “retrieving,” and “retrieval.” Although these words are related, a computer may initially treat them as different terms. Similarly, words such as *the*, *is*, *and*, and *of* occur frequently but may contribute little to the retrieval process in many applications.

Information Retrieval (IR) is the process of finding information that is relevant to a user's query from a collection of resources. Modern collections are not limited to written documents: they may contain text, images, audio, and video. A retrieval system therefore needs a common, searchable representation of different modalities.

In this experiment, that representation is created through **tokenization only**. Tokenization converts a text input into an ordered sequence of word tokens. For image, audio, and video inputs, the application creates modality-aware metadata tokens from the supplied file identity and media type. It does not apply cleaning, normalization, stop-word removal, stemming, OCR, speech recognition, or video analysis.

The resulting tokens can be counted, inspected, and used as a simple representation for later indexing and retrieval. Each input modality enters the same experimental workflow while retaining a label that identifies its modality.
""",
    "pipeline_stages": [
        {
            "name": "A. Input Acquisition",
            "definition": "Accepting one manual text input or one uploaded text, image, audio, or video file.",
            "purpose": "Provide a multimodal item for the tokenization experiment.",
            "example": "A sentence, PNG image, MP3 recording, or MP4 video.",
            "output": "Input content plus its modality label.",
        },
        {
            "name": "B. Modality Identification",
            "definition": "Identifying whether the input is text, image, audio, or video.",
            "purpose": "Select the appropriate token representation without applying another processing stage.",
            "example": "`.jpg` → image; `.wav` → audio; `.mp4` → video.",
            "output": "A modality label used with the token list.",
        },
        {
            "name": "C. Tokenization",
            "definition": "Representing the input as an ordered list of tokens.",
            "purpose": "Create a common representation that can be counted and inspected for retrieval experiments.",
            "example": '`"Information Retrieval" → ["Information", "Retrieval"]`',
            "output": "Tokens and their count; media also includes modality-aware metadata tokens.",
        },
    ],
    "key_terms": {
        "Multimodal Input": "An input that may contain text, image, audio, or video data.",
        "Token": "An individual unit produced from an input for representation and retrieval.",
        "Tokenization": "The process of representing an input as an ordered list of tokens.",
        "Modality": "The type of input, such as text, image, audio, or video.",
        "Metadata Token": "A token describing a media input, such as its file name or media type.",
        "Retrieval": "The process of finding documents relevant to a user query from an indexed corpus.",
        "Indexing": "Building data structures (e.g., inverted index) from preprocessed tokens for fast retrieval.",
        "Inverted Index": "A data structure mapping each token to the resources containing it.",
    },
    "procedure": [
        "Step 1 : Read the Purpose and Theory sections, then navigate to Simulation.",
        "Step 2 : Choose Text, Image, Audio, or Video and provide the corresponding input.",
        "Step 3 : Run the modality-specific tokenization, inspect the generated representation, and review its statistics.",
        "Step 4 : Record the trial if required, complete the Quiz, and download the Report / Observations PDF.",
    ],
}

# ---------------------------------------------------------------------------
# Quiz questions — IR / Document Processing specific (10 questions)
# ---------------------------------------------------------------------------
QUIZ_QUESTIONS = [
    {
        "id": 1,
        "question": "What is tokenization in the context of Information Retrieval?",
        "options": [
            "A) Encrypting a document to secure its contents",
            "B) Splitting text into smaller units such as words or tokens",
            "C) Removing images and binary data from a document",
            "D) Ranking documents by relevance to a query",
        ],
        "answer_index": 1,
        "explanation": (
            "Tokenization divides a text string into an ordered list of smaller units called tokens "
            "(typically words). These tokens become the atomic entries in the inverted index used by IR systems."
        ),
    },
    {
        "id": 2,
        "question": "Why are stop words removed during document preprocessing?",
        "options": [
            "A) They are grammatically incorrect and should be fixed",
            "B) They are too long and slow down tokenization",
            "C) They are highly frequent, carry little semantic weight, and increase index size without improving retrieval",
            "D) They are always misspelled in real documents",
        ],
        "answer_index": 2,
        "explanation": (
            "Stop words (e.g., 'the', 'is', 'at') appear in almost every document. Removing them reduces index "
            "size and noise without significant loss of semantic content, improving both efficiency and precision."
        ),
    },
    {
        "id": 3,
        "question": "What does the Porter Stemmer do to the word 'running'?",
        "options": [
            "A) Converts it to its dictionary form 'run' using a lexicon",
            "B) Strips the suffix '-ning' leaving 'runn'",
            "C) Strips the suffix '-ing' to produce the stem 'run'",
            "D) Removes it as a stop word",
        ],
        "answer_index": 2,
        "explanation": (
            "The Porter Stemmer applies rule-based suffix stripping. For 'running', it removes the suffix '-ing' "
            "to produce the stem 'run', so 'run', 'runs', and 'running' all map to the same index entry."
        ),
    },
    {
        "id": 4,
        "question": "What is the primary difference between stemming and lemmatization?",
        "options": [
            "A) Stemming is faster but may produce non-words; lemmatization uses a dictionary to return valid base forms",
            "B) Lemmatization removes punctuation; stemming does not",
            "C) Stemming requires internet access; lemmatization works offline",
            "D) They are identical processes with different names",
        ],
        "answer_index": 0,
        "explanation": (
            "Stemming uses heuristic suffix-stripping rules and may produce stems that are not real words "
            "(e.g., 'retriev'). Lemmatization uses morphological analysis and a vocabulary to return a valid "
            "dictionary form (lemma), e.g., 'retrieved' → 'retrieve'."
        ),
    },
    {
        "id": 5,
        "question": "Which of the following is the correct order of the document preprocessing pipeline used in this experiment?",
        "options": [
            "A) Cleaning → Lowercasing → Tokenization → Stop-word Removal → Stemming",
            "B) Lowercasing → Cleaning → Tokenization → Stop-word Removal → Stemming",
            "C) Tokenization → Stop-word Removal → Cleaning → Lowercasing → Stemming",
            "D) Stop-word Removal → Stemming → Tokenization → Cleaning → Lowercasing",
        ],
        "answer_index": 0,
        "explanation": (
            "In this experiment the pipeline runs: Cleaning (remove punctuation/numbers) first, then Lowercasing "
            "(normalize case), then Tokenization (split into tokens), then Stop-word Removal, and finally "
            "Stemming. Cleaning before lowercasing ensures punctuation removal works on the original casing."
        ),
    },
    {
        "id": 6,
        "question": "What is an inverted index in Information Retrieval?",
        "options": [
            "A) A list of all documents sorted in reverse alphabetical order",
            "B) A data structure mapping each token to the list of documents containing it",
            "C) A compressed image file used to store document thumbnails",
            "D) A lookup table that stores user queries",
        ],
        "answer_index": 1,
        "explanation": (
            "An inverted index maps each unique token (term) to a list of document identifiers (postings) "
            "that contain the token. It allows IR systems to quickly find all documents containing a query term."
        ),
    },
    {
        "id": 7,
        "question": "Why is lowercasing (normalization) applied before tokenization?",
        "options": [
            "A) To reduce the file size of the stored document",
            "B) To ensure terms like 'Information' and 'information' are indexed as the same token",
            "C) To comply with HTML standards for web documents",
            "D) To increase the total number of unique tokens in the index",
        ],
        "answer_index": 1,
        "explanation": (
            "Without lowercasing, 'Information' and 'information' would be treated as two distinct tokens. "
            "Normalization ensures consistent term representation so queries and documents match correctly."
        ),
    },
    {
        "id": 8,
        "question": "What is a corpus in Information Retrieval?",
        "options": [
            "A) A single document selected by the user for processing",
            "B) The query submitted by the user to the IR system",
            "C) A large, structured collection of documents used for search and indexing",
            "D) The graphical user interface of a search engine",
        ],
        "answer_index": 2,
        "explanation": (
            "A corpus (plural: corpora) is a large collection of documents that forms the dataset over which "
            "the IR system builds its index and performs retrieval. Examples include web crawls, news archives, "
            "and scientific paper datasets."
        ),
    },
    {
        "id": 9,
        "question": "After applying stop-word removal and then stemming, what happens to the total token count?",
        "options": [
            "A) It always doubles because stemming adds new words",
            "B) It decreases during stop-word removal, then remains unchanged during stemming",
            "C) It decreases during both stages because stemming removes token occurrences",
            "D) It increases because lowercasing creates duplicate tokens",
        ],
        "answer_index": 1,
        "explanation": (
            "Stop-word removal directly reduces the token count. Stemming transforms the remaining token forms "
            "(e.g., 'running', 'runs' → 'run') and may reduce vocabulary size, but it does not remove token occurrences."
        ),
    },
    {
        "id": 10,
        "question": "Which Python library provides a reliable built-in English stop-words list that requires no internet download at runtime?",
        "options": [
            "A) requests",
            "B) sklearn (scikit-learn) via sklearn.feature_extraction.text.ENGLISH_STOP_WORDS",
            "C) beautifulsoup4",
            "D) tensorflow",
        ],
        "answer_index": 1,
        "explanation": (
            "scikit-learn's `ENGLISH_STOP_WORDS` is a frozenset of ~318 common English stop words bundled with "
            "the library installation. It requires no internet connection or additional downloads, making it ideal "
            "for offline lab environments."
        ),
    },
    {
        "id": 11,
        "question": "Which factor most directly contributes to better retrieval precision after preprocessing?",
        "options": [
            "A) Adding more irrelevant words to the document",
            "B) Removing semantically weak terms such as stop words",
            "C) Randomizing the document order",
            "D) Converting the document into a binary image",
        ],
        "answer_index": 1,
        "explanation": "Removing common low-information words reduces noise and helps the system focus on more discriminative terms.",
    },
    {
        "id": 12,
        "question": "Why is normalization important before indexing?",
        "options": [
            "A) It creates new documents",
            "B) It ensures multiple representations of the same word map to one canonical form",
            "C) It removes all punctuation from the query string only",
            "D) It eliminates the need for tokenization",
        ],
        "answer_index": 1,
        "explanation": "Normalization makes case and formatting differences consistent so queries and documents match reliably.",
    },
    {
        "id": 13,
        "question": "Which of the following is a common effect of stemming?",
        "options": [
            "A) It removes every occurrence of repeated words",
            "B) It reduces the number of document pages",
            "C) It reduces the vocabulary size by merging variants of the same root",
            "D) It increases the exactness of every query",
        ],
        "answer_index": 2,
        "explanation": "Stemming groups related word forms under a common root, which can shrink the unique-term vocabulary.",
    },
    {
        "id": 14,
        "question": "What is the main purpose of an inverted index?",
        "options": [
            "A) To convert text to speech",
            "B) To map terms to the documents that contain them",
            "C) To transform all words into uppercase",
            "D) To hide duplicate files",
        ],
        "answer_index": 1,
        "explanation": "An inverted index efficiently supports retrieval by linking each term to the documents containing it.",
    },
    {
        "id": 15,
        "question": "Which preprocessing step is most directly responsible for splitting text into words?",
        "options": [
            "A) Stemming",
            "B) Lowercasing",
            "C) Tokenization",
            "D) PDF extraction",
        ],
        "answer_index": 2,
        "explanation": "Tokenization separates a string into individual word-like units that can be indexed and matched.",
    },
    {
        "id": 16,
        "question": "Which statement best describes the role of stop words?",
        "options": [
            "A) They are always essential for query matching",
            "B) They are often filtered because they carry little semantic value",
            "C) They are used only in stemming",
            "D) They are generated by the PDF parser",
        ],
        "answer_index": 1,
        "explanation": "Stop words are common and low-information; they are usually removed to reduce index noise and improve retrieval quality.",
    },
    {
        "id": 17,
        "question": "Why might two documents with the same meaning still produce different raw text strings?",
        "options": [
            "A) Because retrieval systems ignore semantics",
            "B) Because punctuation, case, and morphology may vary",
            "C) Because normalization always changes meaning",
            "D) Because retrieval cannot search text",
        ],
        "answer_index": 1,
        "explanation": "Real-world documents often vary in formatting and morphology, so preprocessing is needed to normalize them.",
    },
    {
        "id": 18,
        "question": "Which of the following is a valid reason to remove numbers in text cleaning?",
        "options": [
            "A) Numbers always improve retrieval precision",
            "B) Numbers can create noise and do not usually carry useful lexical meaning",
            "C) Numbers must always be retained in the final index",
            "D) Numbers are required for stemming",
        ],
        "answer_index": 1,
        "explanation": "Digits are often not useful semantic units in text-based retrieval and may add unwanted noise.",
    },
    {
        "id": 19,
        "question": "What is the likely effect of stemming on the vocabulary of a document collection?",
        "options": [
            "A) It increases the number of unique terms",
            "B) It has no effect on the vocabulary",
            "C) It usually reduces the number of unique terms by grouping variants together",
            "D) It converts all terms to their original file names",
        ],
        "answer_index": 2,
        "explanation": "By reducing related forms to a common stem, stemming often decreases the number of unique terms in the vocabulary.",
    },
    {
        "id": 20,
        "question": "Which of the following best captures the idea of document preprocessing in IR?",
        "options": [
            "A) Preparing the raw text so that it is cleaner and more consistent before retrieval",
            "B) Randomly deleting parts of the document for storage efficiency",
            "C) Writing the document into a database without indexing",
            "D) Replacing the query engine with a manual search",
        ],
        "answer_index": 0,
        "explanation": "Preprocessing transforms raw textual data into a normalized representation that is easier to index and retrieve efficiently.",
    },
]

_MULTIMODAL_QUIZ_ITEMS = [
    ("What is tokenization?", ["Splitting an input into tokens", "Encrypting a file", "Removing media", "Ranking queries"], 0, "Tokenization represents an input as smaller units called tokens."),
    ("Which operation is performed in this experiment?", ["Tokenization only", "Stemming only", "Stop-word removal", "OCR and translation"], 0, "The application intentionally performs tokenization only."),
    ("Which input is multimodal?", ["Only a TXT file", "Text, image, audio, or video", "Only a database row", "Only a query"], 1, "Multimodal input includes more than one data type."),
    ("What is the purpose of tokens in IR?", ["To create a searchable representation", "To increase file size", "To hide the query", "To play media"], 0, "Tokens can support indexing and retrieval."),
    ("What does modality identify?", ["The input type", "The quiz score", "The file password", "The screen size"], 0, "Modality identifies text, image, audio, or video."),
    ("What does a text tokenizer produce?", ["An ordered list of word-like units", "A video stream", "A PDF report", "A database connection"], 0, "Text is represented as an ordered token list."),
    ("How are image inputs represented here?", ["With metadata tokens", "With OCR text", "With translated captions", "With audio samples"], 0, "This experiment does not perform OCR; it creates metadata tokens."),
    ("How are audio inputs represented here?", ["With metadata tokens", "With speech transcription", "With stems", "With stop-word counts"], 0, "Audio is not transcribed in the tokenization-only workflow."),
    ("How are video inputs represented here?", ["With metadata tokens", "With scene descriptions", "With subtitles generated by AI", "With image embeddings"], 0, "Video analysis is outside the scope of this experiment."),
    ("Which stage follows input acquisition?", ["Modality identification", "Stemming", "Cleaning", "Ranking"], 0, "The active flow is acquisition, modality identification, then tokenization."),
    ("Does this experiment remove punctuation?", ["No", "Yes, always", "Only from video", "Only from images"], 0, "No cleaning step is applied."),
    ("Does this experiment convert text to lowercase?", ["No", "Yes, always", "Only for PDF files", "Only for audio"], 0, "Normalization is not part of the active experiment."),
    ("Does this experiment remove stop words?", ["No", "Yes, always", "Only from images", "Only from video"], 0, "Stop-word removal has been removed."),
    ("Does this experiment apply stemming?", ["No", "Yes, always", "Only to file names", "Only to audio"], 0, "Stemming is not performed."),
    ("What does token count measure?", ["The number of generated tokens", "The file size only", "The number of quiz options", "The number of pages in theory"], 0, "Token count reports how many tokens were produced."),
    ("What does unique token count measure?", ["Distinct generated tokens", "The number of modalities accepted", "The upload limit", "The number of reports"], 0, "It counts each distinct token once."),
    ("Why retain a modality label?", ["To preserve the input type", "To remove all content", "To grade the quiz", "To resize files"], 0, "The label gives context to the generated representation."),
    ("What is a metadata token?", ["A token describing an input", "A deleted word", "A quiz answer", "A report page"], 0, "Examples include modality and file-name tokens."),
    ("What can be built later from tokens?", ["An index for retrieval", "A media player", "A microphone", "A file compressor"], 0, "Tokens can later support indexing and search."),
    ("Which statement matches the experiment scope?", ["Represent inputs through tokenization without other processing", "Apply every traditional preprocessing step", "Analyze only text", "Reject all media"], 0, "The scope is multimodal input with tokenization only."),
]

QUIZ_QUESTIONS = [
    {
        "id": index,
        "question": question,
        "options": [f"{chr(65 + option_index)}) {option}" for option_index, option in enumerate(options)],
        "answer_index": answer_index,
        "explanation": explanation,
    }
    for index, (question, options, answer_index, explanation) in enumerate(_MULTIMODAL_QUIZ_ITEMS, start=1)
]

MAX_UPLOAD_SIZE_BYTES = 25 * 1024 * 1024


def get_shuffled_quiz_questions() -> list[dict]:
    """Return a random 5-question subset for the live quiz on each app load."""
    quiz_pool = [question.copy() for question in QUIZ_QUESTIONS]
    return random.sample(quiz_pool, 5)


# =============================================================================
# SYNTHETIC MULTIMODAL GENERATORS FOR THEORY & VISUAL DEMONSTRATIONS
# =============================================================================

def generate_synthetic_theory_image(size: int = 128, patch_size: int = 16):
    """Generates a vibrant synthetic image with geometric patterns and its visual patch tokens."""
    img = Image.new("RGB", (size, size), color=(15, 23, 42))
    draw = ImageDraw.Draw(img)
    
    # Background gradient / color blocks
    draw.rectangle([0, 0, size, size // 2], fill=(20, 80, 120))
    draw.rectangle([0, size // 2, size, size], fill=(30, 41, 59))
    
    # Sun / Circle
    draw.ellipse([size // 2 - 24, 16, size // 2 + 24, 64], fill=(245, 158, 11), outline=(251, 191, 36), width=2)
    # Triangle / Mountain
    draw.polygon([(0, size), (size // 2, 40), (size, size)], fill=(16, 185, 129), outline=(52, 211, 153))
    draw.polygon([(size // 3, size), (size * 3 // 4, 60), (size, size)], fill=(5, 150, 105))
    # Foreground Accent Circle
    draw.ellipse([14, size - 36, 46, size - 4], fill=(236, 72, 153), outline=(244, 114, 182), width=2)
    # Additional geometric accent
    draw.rectangle([size - 38, size - 34, size - 10, size - 6], fill=(59, 130, 246), outline=(96, 165, 250), width=2)
    
    # Create grid overlay image
    grid_img = img.copy()
    grid_draw = ImageDraw.Draw(grid_img)
    for x in range(0, size, patch_size):
        grid_draw.line([(x, 0), (x, size)], fill=(85, 199, 182), width=1)
    for y in range(0, size, patch_size):
        grid_draw.line([(0, y), (size, y)], fill=(85, 199, 182), width=1)

    # Extract patches
    patches = []
    for y in range(0, size, patch_size):
        for x in range(0, size, patch_size):
            patch = img.crop((x, y, x + patch_size, y + patch_size))
            patches.append(patch)
            
    rows = size // patch_size
    cols = size // patch_size
    return img, grid_img, patches, rows, cols


def generate_synthetic_theory_audio(duration: float = 1.0, frame_duration_ms: int = 20):
    """Generates a synthetic multi-frequency harmonic acoustic signal and its frame tokens."""
    sample_rate = 16000
    t = np.linspace(0, duration, int(sample_rate * duration), endpoint=False)
    
    # Harmonic audio wave with amplitude modulation (chirp + chord)
    signal = (
        0.45 * np.sin(2 * np.pi * 440 * t) +
        0.30 * np.sin(2 * np.pi * 880 * t * (1 + 0.5 * t)) +
        0.20 * np.sin(2 * np.pi * 1320 * t)
    ) * np.exp(-1.2 * t)
    
    # Normalize to 16-bit PCM
    signal_int16 = np.int16(signal / np.max(np.abs(signal)) * 32767)
    
    # Build WAV in-memory
    wav_io = io.BytesIO()
    with wave.open(wav_io, "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(signal_int16.tobytes())
    wav_bytes = wav_io.getvalue()
    
    frame_len_sec = frame_duration_ms / 1000.0
    total_frames = int(duration / frame_len_sec)
    tokens = [
        {"Token": i + 1, "Start": f"{i * frame_len_sec:.3f} s", "End": f"{(i + 1) * frame_len_sec:.3f} s", "Duration": f"{frame_duration_ms} ms"}
        for i in range(total_frames)
    ]
    
    return wav_bytes, t, signal, sample_rate, total_frames, tokens


def generate_synthetic_theory_video(num_frames: int = 12, sample_interval: int = 3):
    """Generates synthetic video animation frames and sampled visual keyframe tokens."""
    frames = []
    width, height = 96, 96
    
    colors = [
        (239, 68, 68), (245, 158, 11), (16, 185, 129), 
        (6, 182, 212), (59, 130, 246), (168, 85, 247)
    ]
    
    for i in range(num_frames):
        img = Image.new("RGB", (width, height), color=(10, 15, 26))
        draw = ImageDraw.Draw(img)
        
        # Grid lines in background
        for gx in range(0, width, 16):
            draw.line([(gx, 0), (gx, height)], fill=(25, 36, 52), width=1)
        for gy in range(0, height, 16):
            draw.line([(0, gy), (width, gy)], fill=(25, 36, 52), width=1)
            
        # Moving orb along trajectory
        progress = i / max(1, num_frames - 1)
        cx = int(16 + progress * (width - 32))
        cy = int(48 + 24 * np.sin(progress * 2 * np.pi))
        r = int(10 + 4 * np.sin(progress * np.pi))
        
        col = colors[i % len(colors)]
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=col, outline=(255, 255, 255), width=2)
        
        # Frame watermark
        draw.rectangle([4, 4, 38, 18], fill=(0, 0, 0, 180))
        draw.text((6, 5), f"F#{i+1:02d}", fill=(85, 199, 182))
        
        frames.append(img)
        
    sampled_indices = [idx for idx in range(num_frames) if (idx + 1) % sample_interval == 0]
    sampled_frames = [frames[idx] for idx in sampled_indices]
    
    return frames, sampled_indices, sampled_frames


def build_theory_visuals():
    """Build report-ready visual examples matching the live Theory demonstrations."""
    sample_text = "Multimodal Information Retrieval indexes Text, Visual Patches, Audio Frames, and Video Clips."
    text_tokens = tokenize_text(sample_text)
    text_canvas = Image.new("RGB", (900, 210), color=(15, 23, 42))
    text_draw = ImageDraw.Draw(text_canvas)
    text_draw.text((20, 16), "Text Tokenization - Linguistic Token Stream", fill=(226, 232, 240))
    x, y = 20, 65
    for index, token in enumerate(text_tokens):
        width = max(58, len(token) * 9 + 20)
        if x + width > 870:
            x, y = 20, y + 48
        text_draw.rounded_rectangle((x, y, x + width, y + 30), radius=5, fill=(30, 64, 175), outline=(96, 165, 250))
        text_draw.text((x + 8, y + 8), f"T{index + 1}: {token[:14]}", fill=(219, 234, 254))
        x += width + 8

    image, grid_image, patches, rows, cols = generate_synthetic_theory_image(size=128, patch_size=32)
    image_canvas = Image.new("RGB", (900, 250), color=(15, 23, 42))
    image_canvas.paste(image.resize((180, 180)), (35, 48))
    image_canvas.paste(grid_image.resize((180, 180)), (270, 48))
    image_draw = ImageDraw.Draw(image_canvas)
    image_draw.text((35, 20), "Image Patch Tokenization - Lowest Granularity", fill=(226, 232, 240))
    image_draw.text((35, 232), "Raw Image", fill=(148, 163, 184))
    image_draw.text((270, 232), f"Patch Grid ({rows} x {cols})", fill=(148, 163, 184))
    for index, patch in enumerate(patches[:10]):
        px = 510 + (index % 5) * 70
        py = 55 + (index // 5) * 90
        image_canvas.paste(patch.resize((58, 58)), (px, py))
        image_draw.text((px + 20, py + 62), f"T{index + 1}", fill=(148, 163, 184))

    _, time_axis, signal, _, audio_frames, _ = generate_synthetic_theory_audio(duration=1.0, frame_duration_ms=40)
    audio_canvas = Image.new("RGB", (900, 230), color=(15, 23, 42))
    audio_draw = ImageDraw.Draw(audio_canvas)
    audio_draw.text((20, 16), f"Audio Frame Tokenization - Lowest Granularity ({audio_frames} Temporal Tokens)", fill=(226, 232, 240))
    baseline = 130
    previous = None
    for idx in range(0, len(signal), max(1, len(signal) // 820)):
        px = 20 + int((idx / len(signal)) * 840)
        py = baseline - int(float(signal[idx]) * 70)
        if previous is not None:
            audio_draw.line((previous[0], previous[1], px, py), fill=(45, 212, 191), width=1)
        previous = (px, py)
    for frame in range(1, audio_frames):
        px = 20 + int((frame / audio_frames) * 840)
        audio_draw.line((px, 55, px, 195), fill=(245, 158, 11), width=1)
    audio_draw.line((20, baseline, 860, baseline), fill=(71, 85, 105), width=1)
    audio_draw.text((20, 202), "1.0 second waveform divided into 40 ms frame tokens", fill=(148, 163, 184))

    video_frames, sampled_indices, sampled_frames = generate_synthetic_theory_video(num_frames=12, sample_interval=4)
    video_canvas = Image.new("RGB", (900, 190), color=(15, 23, 42))
    video_draw = ImageDraw.Draw(video_canvas)
    video_draw.text((20, 16), "Video Keyframe Tokenization - Lowest Granularity (Every 4th Frame)", fill=(226, 232, 240))
    for index, frame in enumerate(video_frames):
        frame = frame.resize((58, 58))
        px = 20 + index * 70
        video_canvas.paste(frame, (px, 55))
        video_draw.text((px + 18, 120), f"F{index + 1}", fill=(148, 163, 184))
        if index in sampled_indices:
            video_draw.rectangle((px - 2, 53, px + 60, 115), outline=(245, 158, 11), width=2)
    video_draw.text((20, 150), f"Sampled keyframe tokens: {len(sampled_frames)}", fill=(245, 190, 80))

    return {
        "text": text_canvas,
        "image": image_canvas,
        "audio": audio_canvas,
        "video": video_canvas,
    }


def extract_docx_text(file_bytes: bytes) -> str:
    """Extract plain text from a .docx file without requiring external dependencies."""
    try:
        with zipfile.ZipFile(io.BytesIO(file_bytes)) as zf:
            xml_data = zf.read("word/document.xml")
    except Exception:
        return ""

    root = ET.fromstring(xml_data)
    ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
    paragraphs = []
    for para in root.findall(".//w:p", ns):
        texts = [node.text for node in para.findall(".//w:t", ns) if node.text]
        if texts:
            paragraphs.append("".join(texts))
    return "\n".join(paragraphs).strip()


def acquire_document(uploaded_file, manual_text: str) -> tuple[str, str, str]:
    """Acquire one input and return its content, source label, and modality."""
    if uploaded_file is not None:
        try:
            file_name = (uploaded_file.name or "").lower()
            file_bytes = uploaded_file.read()
            file_size = len(file_bytes)

            if file_size > MAX_UPLOAD_SIZE_BYTES:
                return "", f"File too large ({file_size / (1024 * 1024):.1f} MB). Maximum allowed size is {MAX_UPLOAD_SIZE_BYTES / (1024 * 1024):.0f} MB.", "unknown"

            if file_name.endswith(".pdf"):
                pdf_reader = PdfReader(io.BytesIO(file_bytes))
                pages = [page.extract_text() or "" for page in pdf_reader.pages]
                raw = "\n".join(pages).strip()
                modality = "text"
            elif file_name.endswith(".docx"):
                raw = extract_docx_text(file_bytes)
                modality = "text"
            elif file_name.endswith(".doc"):
                raw = file_bytes.decode("latin-1", errors="replace").strip()
                modality = "text"
            elif file_name.endswith((".txt", ".rtf")):
                raw = file_bytes.decode("utf-8", errors="replace").strip()
                modality = "text"
            elif file_name.endswith((".mp3", ".wav", ".mp4", ".mov", ".avi", ".mkv", ".webm")):
                raw = ""
                modality = "audio" if file_name.endswith((".mp3", ".wav")) else "video"
            elif file_name.endswith((".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp")):
                raw = ""
                modality = "image"
            else:
                raw = file_bytes.decode("utf-8", errors="replace").strip()
                modality = "text"

            if modality == "text" and not raw:
                return "", "Uploaded file is empty or no readable text could be extracted.", "unknown"
            return raw, f"Uploaded file: {uploaded_file.name}", modality
        except Exception as exc:
            return "", f"Error reading file: {exc}", "unknown"
    if manual_text.strip():
        return manual_text.strip(), "Manual text input", "text"
    return "", "No input provided.", "unknown"


def tokenize_text(text: str) -> list[str]:
    """Tokenize text without cleaning, normalization, filtering, or stemming."""
    return re.findall(r"\S+", text)


def clean_text(text: str, remove_punct: bool = True, remove_numbers: bool = True) -> str:
    """Apply the original text-cleaning stage."""
    if remove_numbers:
        text = re.sub(r"\d+", " ", text)
    if remove_punct:
        text = re.sub(r"[^\w\s]", " ", text)
        text = text.translate(str.maketrans("", "", string.punctuation))
    return re.sub(r"\s+", " ", text).strip()


def normalize_text(text: str) -> str:
    """Apply the original lowercasing stage."""
    return text.lower()


def remove_stopwords(tokens: list[str]) -> list[str]:
    """Remove common English stop words without an external corpus download."""
    return [token for token in tokens if token.lower() not in ENGLISH_STOP_WORDS]


def stem_tokens(tokens: list[str]) -> list[str]:
    """Apply the original NLTK Porter Stemmer stage."""
    return [PorterStemmer().stem(token) for token in tokens]


def process_document(
    raw_text: str,
    do_lowercase: bool = True,
    do_remove_punct: bool = True,
    do_remove_numbers: bool = True,
    do_tokenize: bool = True,
    do_remove_stopwords: bool = True,
    do_stem: bool = True,
) -> dict:
    """Run the original text pipeline and retain every intermediate result."""
    cleaned = clean_text(raw_text, do_remove_punct, do_remove_numbers)
    normalized = normalize_text(cleaned) if do_lowercase else cleaned
    tokens = tokenize_text(normalized) if do_tokenize else normalized.split()
    tokens_no_sw = remove_stopwords(tokens) if do_remove_stopwords and do_tokenize else tokens
    stemmed = stem_tokens(tokens_no_sw) if do_stem and do_tokenize else tokens_no_sw
    return {
        "raw": raw_text,
        "cleaned": cleaned,
        "normalized": normalized,
        "tokens": tokens,
        "tokens_no_sw": tokens_no_sw,
        "stemmed": stemmed,
        "final_text": " ".join(stemmed),
    }


def tokenize_input(raw_text: str, source_label: str, modality: str) -> dict:
    """Create tokens for text or modality-aware metadata for media inputs."""
    if modality == "text":
        tokens = tokenize_text(raw_text)
        representation = "Text tokens generated from the supplied text content."
    else:
        file_name = source_label.rsplit(": ", 1)[-1]
        stem = re.sub(r"\.[^.]+$", "", file_name)
        tokens = [f"modality:{modality}"] + [f"name:{token}" for token in tokenize_text(stem)]
        representation = f"Metadata tokens generated for the {modality} input; media content is not transcribed or analyzed."
    return {
        "source": source_label,
        "modality": modality,
        "tokens": tokens,
        "representation": representation,
    }


def calculate_statistics(results: dict) -> dict:
    """Calculate text-pipeline or multimodal token-only metrics."""
    if "raw" in results:
        raw_words = len(results["raw"].split())
        token_count = len(results["tokens"])
        after_stopwords = len(results["tokens_no_sw"])
        unique_before = len(set(results["tokens_no_sw"]))
        unique_after = len(set(results["stemmed"]))
        reduction = round((1 - after_stopwords / raw_words) * 100, 2) if raw_words else 0.0
        return {
            "Original Character Count": len(results["raw"]),
            "Original Word Count": raw_words,
            "Token Count (after tokenization)": token_count,
            "Tokens After Stop-word Removal": after_stopwords,
            "Final Token Count": len(results["stemmed"]),
            "Stop Words Removed": token_count - after_stopwords,
            "Tokens Reduced (vs original)": raw_words - after_stopwords,
            "Percentage Reduction (%)": reduction,
            "Unique Tokens Before Stemming": unique_before,
            "Unique Stems After Stemming": unique_after,
            "Vocabulary Reduction by Stemming": unique_before - unique_after,
        }
    tokens = results["tokens"]
    return {
        "Modality": results["modality"].title(),
        "Token Count": len(tokens),
        "Unique Token Count": len(set(tokens)),
    }


# =============================================================================
# 3. LAB REPORT PDF EXPORTER
# =============================================================================

class LabReportPDF(FPDF):
    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(128, 128, 128)
        footer_text = (
            f"Page {self.page_no()}/{{nb}} | Virtual Laboratory - Multimodal Tokenization for IR"
        )
        self.cell(0, 10, _safe(footer_text), align="C")


def _safe(text: str) -> str:
    """Replace unsupported Unicode characters with safe ASCII equivalents."""
    replacements = {
        "—": "-",
        "–": "-",
        "“": '"',
        "”": '"',
        "‘": "'",
        "’": "'",
        "•": "-",
        "→": "->",
        "✓": "[OK]",
        "₹": "Rs.",
    }

    for src, dst in replacements.items():
        text = text.replace(src, dst)

    return text.encode("latin-1", errors="replace").decode("latin-1")


def _thumbnail(image, max_side: int = 360):
    """Return a small RGB copy of a PIL image, suitable for embedding in the PDF."""
    thumb = image.convert("RGB").copy()
    thumb.thumbnail((max_side, max_side))
    return thumb


def _render_waveform_strip(waveform: list[float], frame_count: int, duration_s: float, frame_duration_s: float):
    """Draw a compact waveform image with frame-token boundaries for the PDF."""
    width, height = 1560, 190
    canvas = Image.new("RGB", (width, height), color=(15, 23, 42))
    draw = ImageDraw.Draw(canvas)
    samples = np.asarray(waveform, dtype=float)
    if samples.size:
        peak = float(np.max(np.abs(samples))) or 1.0
        samples = samples / peak
        mid = height // 2
        xs = np.linspace(10, width - 10, samples.size)
        points = [(float(x), mid - float(y) * (mid - 14)) for x, y in zip(xs, samples)]
        draw.line((10, mid, width - 10, mid), fill=(71, 85, 105), width=1)
        draw.line(points, fill=(45, 212, 191), width=2)
    # Mark frame boundaries (at most ~60 so the strip stays readable)
    if duration_s > 0 and frame_count > 0:
        step = max(1, frame_count // 60)
        for frame in range(step, frame_count + 1, step):
            px = 10 + int((frame * frame_duration_s / duration_s) * (width - 20))
            draw.line((px, 12, px, height - 12), fill=(245, 158, 11), width=1)
    return canvas


def generate_pdf_report(
    student_name: str,
    student_id: str,
    date_str: str,
    trials_df: pd.DataFrame,
    quiz_score: int,
    quiz_total: int,
    student_notes: str,
    token_samples: dict | None = None,
) -> bytes:
    """Compiles experiment records into a formatted PDF lab report."""
    pdf = LabReportPDF()
    pdf.alias_nb_pages()
    pdf.set_margins(15, 15, 15)
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()
    left = pdf.l_margin
    content_width = pdf.w - pdf.l_margin - pdf.r_margin

    heading_color = (30, 58, 138)
    body_color = (51, 65, 85)
    muted_color = (100, 116, 139)
    border_color = (203, 213, 225)

    def ensure_space(height: float):
        if pdf.get_y() + height > pdf.page_break_trigger:
            pdf.add_page()

    def heading(text: str):
        ensure_space(20)
        pdf.ln(2)
        pdf.set_font("Helvetica", "B", 12)
        pdf.set_text_color(*heading_color)
        pdf.cell(content_width, 7, _safe(text), new_x="LMARGIN", new_y="NEXT")
        pdf.set_draw_color(*border_color)
        pdf.line(left, pdf.get_y(), left + content_width, pdf.get_y())
        pdf.ln(2)

    def subheading(text: str):
        ensure_space(14)
        pdf.set_font("Helvetica", "B", 10)
        pdf.set_text_color(*heading_color)
        pdf.cell(content_width, 6, _safe(text), new_x="LMARGIN", new_y="NEXT")

    def paragraph(text: str, size: int = 9, style: str = "", color=body_color, height: float = 5):
        pdf.set_font("Helvetica", style, size)
        pdf.set_text_color(*color)
        pdf.multi_cell(content_width, height, _safe(text), new_x="LMARGIN", new_y="NEXT")

    def key_value_table(rows: list[tuple[str, str]], label_width: float = 42):
        pdf.set_draw_color(*border_color)
        for label, value in rows:
            ensure_space(6)
            pdf.set_font("Helvetica", "B", 8)
            pdf.set_text_color(71, 85, 105)
            pdf.set_fill_color(241, 245, 249)
            pdf.cell(label_width, 5.5, _safe(label), border=1, fill=True)
            pdf.set_font("Helvetica", "", 8)
            pdf.set_text_color(15, 23, 42)
            value_text = _safe(str(value))
            max_width = content_width - label_width - 2
            while value_text and pdf.get_string_width(value_text) > max_width:
                value_text = value_text[:-4] + "..."
            pdf.cell(content_width - label_width, 5.5, value_text, border=1, new_x="LMARGIN", new_y="NEXT")
        pdf.ln(2)

    def thumbnail_row(images: list, captions: list[str], cell_width: float, image_height: float, gap: float = 3):
        """Place small framed thumbnails side by side, wrapping to new rows as needed."""
        per_row = max(1, int((content_width + gap) // (cell_width + gap)))
        for start in range(0, len(images), per_row):
            ensure_space(image_height + 8)
            y = pdf.get_y()
            for offset, (img, caption) in enumerate(zip(images[start:start + per_row], captions[start:start + per_row])):
                x = left + offset * (cell_width + gap)
                img_w, img_h = img.size
                scale = min(cell_width / img_w, image_height / img_h)
                draw_w, draw_h = img_w * scale, img_h * scale
                pdf.set_draw_color(*border_color)
                pdf.set_fill_color(248, 250, 252)
                pdf.rect(x, y, cell_width, image_height, "FD")
                pdf.image(img, x=x + (cell_width - draw_w) / 2, y=y + (image_height - draw_h) / 2, w=draw_w, h=draw_h)
                pdf.set_xy(x, y + image_height + 0.5)
                pdf.set_font("Helvetica", "", 7)
                pdf.set_text_color(*muted_color)
                pdf.cell(cell_width, 4, _safe(caption), align="C")
            pdf.set_xy(left, y + image_height + 6)

    # ---- Title ----
    pdf.set_text_color(15, 23, 42)
    pdf.set_font("Helvetica", "B", 16)
    pdf.multi_cell(0, 8, _safe(EXPERIMENT_CONFIG["title"]), new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(*muted_color)
    pdf.cell(0, 5, "Virtual Laboratory Report ",
             new_x="LMARGIN", new_y="NEXT")
    pdf.ln(3)

    # ---- Student Info Box ----
    box_y = pdf.get_y()
    pdf.set_fill_color(241, 245, 249)
    pdf.set_draw_color(*border_color)
    pdf.rect(left, box_y, 0, 18, "FD")
    score_pct = int((quiz_score / quiz_total) * 100) if quiz_total else 0
    info_rows = [
        [("Student Name:", student_name or "N/A", None), ("Roll Number:", student_id or "N/A", None)],
        [("Experiment Date:", date_str or datetime.now().strftime("%Y-%m-%d"), None),
         ("Quiz Score:", f"{quiz_score} / {quiz_total}  ({score_pct}%)",
          (16, 185, 129) if quiz_score >= max(1, quiz_total // 2) else (239, 68, 68))],
    ]
    half = content_width / 2
    for row_index, row in enumerate(info_rows):
        for col_index, (label, value, value_color) in enumerate(row):
            pdf.set_xy(left + 4 + col_index * half, box_y + 3 + row_index * 7)
            pdf.set_font("Helvetica", "B", 9)
            pdf.set_text_color(71, 85, 105)
            pdf.cell(30, 5, label)
            pdf.set_font("Helvetica", "B" if value_color else "", 9)
            pdf.set_text_color(*(value_color or (15, 23, 42)))
            pdf.cell(half - 38, 5, _safe(str(value))[:40])
    pdf.set_xy(left, box_y + 22)

    # ---- Aim ----
    heading("Aim")
    paragraph(EXPERIMENT_CONFIG["aim"])

    # ---- Theory Visual Examples (2 x 2 grid of compact frames) ----
    heading("1. Theory Visual Examples")
    paragraph(
        "Visual outputs from the Theory section at the lowest granularity: word/subword text tokens, "
        "32 x 32 px image patches, 40 ms audio frames, and every 4th video frame.",
        size=8,
    )
    pdf.ln(1)
    visuals = build_theory_visuals()
    captions = {
        "text": "Fig 1a. Text tokens",
        "image": "Fig 1b. Image patch tokens",
        "audio": "Fig 1c. Audio frame tokens",
        "video": "Fig 1d. Video keyframe tokens",
    }
    gap = 4
    cell_w = (content_width - gap) / 2
    cell_h = cell_w * 250 / 900
    names = list(visuals.keys())
    for start in range(0, len(names), 2):
        ensure_space(cell_h + 8)
        y = pdf.get_y()
        for offset, name in enumerate(names[start:start + 2]):
            x = left + offset * (cell_w + gap)
            img = visuals[name]
            scale = min(cell_w / img.width, cell_h / img.height)
            draw_w, draw_h = img.width * scale, img.height * scale
            pdf.set_fill_color(15, 23, 42)
            pdf.rect(x, y, cell_w, cell_h, "F")
            pdf.image(img, x=x + (cell_w - draw_w) / 2, y=y + (cell_h - draw_h) / 2, w=draw_w, h=draw_h)
            pdf.set_xy(x, y + cell_h + 0.5)
            pdf.set_font("Helvetica", "I", 7)
            pdf.set_text_color(*muted_color)
            pdf.cell(cell_w, 4, captions.get(name, name), align="C")
        pdf.set_xy(left, y + cell_h + 6)

    # ---- Learning Objectives ----
    heading("2. Learning Objectives")
    for index, obj in enumerate(EXPERIMENT_CONFIG["objectives"], 1):
        pdf.set_font("Helvetica", "B", 9)
        pdf.set_text_color(*heading_color)
        pdf.cell(7, 5, f"{index}.")
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(*body_color)
        pdf.multi_cell(content_width - 7, 5, _safe(obj), new_x="LMARGIN", new_y="NEXT")

    # ---- Recorded Trials ----
    heading("3. Recorded Experimental Trials")
    if trials_df.empty:
        paragraph("No simulation trials recorded during this session.", style="I", color=muted_color)
    else:
        cols = list(trials_df.columns)
        col_w = content_width / max(1, len(cols))
        max_chars = max(6, int(col_w / 1.6))

        def trial_header():
            pdf.set_fill_color(37, 99, 235)
            pdf.set_text_color(255, 255, 255)
            pdf.set_font("Helvetica", "B", 7)
            for c in cols:
                pdf.cell(col_w, 6, _safe(str(c))[:max_chars], 1, 0, "C", True)
            pdf.ln()

        trial_header()
        fill = False
        for _, row in trials_df.iterrows():
            if pdf.get_y() + 5 > pdf.page_break_trigger:
                pdf.add_page()
                trial_header()
            pdf.set_fill_color(248, 250, 252)
            pdf.set_text_color(30, 41, 59)
            pdf.set_font("Helvetica", "", 7)
            for c in cols:
                val = row[c]
                val_str = f"{val:.2f}" if isinstance(val, float) else str(val)
                pdf.cell(col_w, 5, _safe(val_str)[:max_chars], 1, 0, "C", fill)
            pdf.ln()
            fill = not fill

    # ---- Token Samples Section ----
    section_num = 4
    if token_samples:
        heading(f"{section_num}. Simulation Token Samples")
        section_num += 1

        # Text tokens
        text_data = token_samples.get("text")
        if text_data:
            subheading("4.1 Text Tokenization")
            key_value_table([
                ("Source", text_data.get("source", "N/A")),
                ("Total Tokens", text_data.get("total_tokens", 0)),
                ("Unique Tokens", text_data.get("unique_tokens", 0)),
            ])
            first_10 = text_data.get("first_10", [])
            if first_10:
                pdf.set_font("Helvetica", "", 8)
                ensure_space(8)
                x = left
                pdf.set_draw_color(96, 165, 250)
                pdf.set_fill_color(219, 234, 254)
                pdf.set_text_color(30, 58, 138)
                for index, token in enumerate(first_10, 1):
                    label = _safe(f"T{index}: {str(token)[:20]}")
                    chip_w = pdf.get_string_width(label) + 5
                    if x + chip_w > left + content_width:
                        x = left
                        pdf.ln(7)
                        ensure_space(7)
                    pdf.set_x(x)
                    pdf.cell(chip_w, 5.5, label, border=1, fill=True, align="C")
                    x += chip_w + 2
                pdf.ln(9)

        # Image tokens
        image_data = token_samples.get("image")
        if image_data:
            subheading("4.2 Image Tokenization")
            key_value_table([
                ("File", image_data.get("filename", "N/A")),
                ("Dimensions", image_data.get("dimensions", "N/A")),
                ("Patch Size", f"{image_data.get('patch_size', 0)} x {image_data.get('patch_size', 0)} px"),
                ("Patch Grid", f"{image_data.get('rows', 0)} rows x {image_data.get('columns', 0)} cols"),
                ("Total Patches (Tokens)", image_data.get("total_patches", 0)),
            ])
            preview = image_data.get("preview")
            patch_previews = image_data.get("patch_previews") or []
            if preview is not None:
                thumbnail_row([_thumbnail(preview)], ["Uploaded image"], 50, 34)
            if patch_previews:
                thumbnail_row(
                    [p.resize((64, 64), Image.NEAREST) for p in patch_previews],
                    [f"Patch T{i}" for i in range(1, len(patch_previews) + 1)],
                    15, 15, gap=3,
                )
            pdf.ln(1)

        # Audio tokens
        audio_data = token_samples.get("audio")
        if audio_data:
            subheading("4.3 Audio Tokenization")
            key_value_table([
                ("File", audio_data.get("filename", "N/A")),
                ("Duration", audio_data.get("duration", "N/A")),
                ("Sampling Rate", audio_data.get("sample_rate", "N/A")),
                ("Frame Duration", f"{audio_data.get('frame_duration_ms', 0)} ms"),
                ("Total Frame Tokens", audio_data.get("total_tokens", 0)),
            ])
            waveform = audio_data.get("waveform")
            if waveform:
                strip = _render_waveform_strip(
                    waveform,
                    int(audio_data.get("total_tokens", 0)),
                    float(audio_data.get("duration_s", 0) or 0),
                    float(audio_data.get("frame_duration_s", 0) or 0),
                )
                thumbnail_row([strip], ["Waveform with frame-token boundaries (orange lines)"], content_width, 22)
            first_10 = audio_data.get("first_10", [])
            if first_10:
                # Two side-by-side compact tables of 5 rows each
                headers = ["Token", "Start", "End", "Duration"]
                table_gap = 6
                table_w = (content_width - table_gap) / 2
                col_w_tok = table_w / len(headers)
                halves = [first_10[:5], first_10[5:10]]
                ensure_space(6 + 5 * 5 + 4)
                top_y = pdf.get_y()
                for half_index, rows in enumerate(halves):
                    if not rows:
                        continue
                    x0 = left + half_index * (table_w + table_gap)
                    pdf.set_xy(x0, top_y)
                    pdf.set_fill_color(37, 99, 235)
                    pdf.set_text_color(255, 255, 255)
                    pdf.set_font("Helvetica", "B", 7)
                    pdf.set_draw_color(*border_color)
                    for h in headers:
                        pdf.cell(col_w_tok, 5.5, h, 1, 0, "C", True)
                    pdf.set_font("Helvetica", "", 7)
                    pdf.set_text_color(30, 41, 59)
                    for row_index, row in enumerate(rows):
                        pdf.set_xy(x0, top_y + 5.5 + row_index * 5)
                        pdf.set_fill_color(248, 250, 252)
                        fill = row_index % 2 == 1
                        for key in headers:
                            pdf.cell(col_w_tok, 5, _safe(str(row.get(key, ""))), 1, 0, "C", fill)
                pdf.set_xy(left, top_y + 5.5 + 5 * 5 + 4)

        # Video tokens
        video_data = token_samples.get("video")
        if video_data:
            subheading("4.4 Video Tokenization")
            key_value_table([
                ("File", video_data.get("filename", "N/A")),
                ("Resolution", video_data.get("resolution", "N/A")),
                ("FPS", video_data.get("fps", "N/A")),
                ("Duration", video_data.get("duration", "N/A")),
                ("Sampling Interval", f"Every {video_data.get('interval', 0)}th frame"),
                ("Total Keyframe Tokens", video_data.get("total_tokens", 0)),
            ])
            keyframes = video_data.get("keyframes") or []
            keyframe_numbers = video_data.get("keyframe_numbers") or []
            if keyframes:
                frame_captions = [
                    f"F#{keyframe_numbers[i]}" if i < len(keyframe_numbers) else f"Frame {i + 1}"
                    for i in range(len(keyframes))
                ]
                thumbnail_row([_thumbnail(f) for f in keyframes], frame_captions, 26, 26, gap=4.8)
            pdf.ln(1)

    # ---- Quiz Result ----
    heading(f"{section_num}. Quiz Result")
    paragraph(f"Quiz marks: {quiz_score} / {quiz_total} ({score_pct}%).")
    section_num += 1

    # ---- Observations ----
    heading(f"{section_num}. Observations & Analysis")
    notes_text = student_notes.strip() if student_notes.strip() else (
        "The multimodal tokenization experiment demonstrated how text, image, audio, and video "
        "inputs can be represented as tokens for subsequent Information Retrieval operations."
    )
    paragraph(notes_text)
    section_num += 1

    # ---- Conclusion ----
    heading(f"{section_num}. Conclusion")
    paragraph(
        "The experiment demonstrated tokenization-only processing for text, image, audio, and video "
        "inputs. Each input was assigned a modality and represented as tokens that can support later "
        "Information Retrieval indexing and search."
    )

    # ---- Signature line ----
    ensure_space(22)
    pdf.set_draw_color(180, 180, 180)
    sig_y = pdf.get_y() + 14
    sig_x = left + content_width - 60
    pdf.line(sig_x, sig_y, sig_x + 60, sig_y)
    pdf.set_xy(sig_x, sig_y + 1.5)
    pdf.set_font("Helvetica", "I", 8)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(60, 4, "Student Signature", align="C")

    return bytes(pdf.output())


# =============================================================================
# 4. SECTION RENDERERS
# =============================================================================

def apply_ui_styles():
    """Applies lightweight presentation styles to the native Streamlit layout."""
    st.markdown(
        """
        <style>
        :root {
            --ink: #f1f5f9;
            --muted: #94a3b8;
            --line: #334155;
            --paper: #1e293b;
            --wash: #0b111e;
            --accent: #2dd4bf;
            --accent-soft: #134e4a;
            --accent-purple: #a855f7;
            --accent-amber: #f59e0b;
            --accent-blue: #3b82f6;
            --accent-pink: #ec4899;
            --input: #0f172a;
        }
        html, body, [data-testid="stAppViewContainer"] { background: var(--wash); color: var(--ink); color-scheme: dark; font-size: 17px; }
        .stApp { background: var(--wash); color: var(--ink); }
        [data-testid="stHeader"] { background: rgba(11, 17, 30, 0.95); }
        [data-testid="stSidebar"] { border-right: 1px solid var(--line); background: #0f172a; }
        [data-testid="stSidebar"] [data-testid="stMarkdownContainer"] p { color: var(--muted); font-size: 1rem; }
        [data-testid="stSidebar"] [data-testid="stRadio"] label { font-size: 1.12rem; padding: .35rem .25rem; }
        [data-testid="stSidebar"] [data-testid="stRadio"] label p { font-size: 1.12rem; }
        [data-testid="stSidebar"] [data-testid="stRadio"] > div { gap: .25rem; }
        
        /* Full-screen utilization with balanced gutters */
        .block-container { max-width: 1400px; padding-top: 1.6rem; padding-bottom: 3rem; padding-left: 2rem; padding-right: 2rem; }
        
        h1, h2, h3 { color: var(--ink); letter-spacing: -0.01em; font-weight: 800; }
        h1 { font-size: clamp(2.2rem, 3.8vw, 3.2rem); line-height: 1.06; max-width: 1100px; }
        h2 { margin-top: 1.4rem; margin-bottom: 0.6rem; font-size: clamp(1.4rem, 2.6vw, 1.85rem); }
        h3 { margin-top: 1.2rem; margin-bottom: 0.4rem; font-size: 1.25rem; }
        p, li, label { font-size: 1.05rem; line-height: 1.7; }
        [data-testid="stMarkdownContainer"] p { font-size: 1.05rem; line-height: 1.7; margin-bottom: 0.6rem; }
        
        .hero { border-bottom: 1px solid var(--line); padding: 0 0 1.2rem; margin-bottom: 1.4rem; }
        .hero-kicker, .section-kicker { color: var(--accent); font-size: .78rem; font-weight: 800; letter-spacing: .15em; text-transform: uppercase; }
        .hero-meta { color: var(--muted); font-size: .95rem; margin-top: .5rem; }
        .section-kicker { margin-top: .2rem; }
        
        .callout { background: var(--paper); border: 1px solid var(--line); border-left: 4px solid var(--accent); border-radius: 8px; padding: 0.9rem 1.1rem; color: #e2e8f0; line-height: 1.6; }
        .objective { min-height: 3rem; display: flex; align-items: flex-start; gap: .75rem; padding: .6rem 0; border-bottom: 1px solid var(--line); color: #cbd5e1; line-height: 1.45; }
        .objective span { color: var(--accent); font-weight: 800; font-size: .8rem; padding-top: .15rem; }
        
        .modality-pill { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 9999px; font-weight: 700; font-size: 0.85rem; }
        .pill-text { background: rgba(59, 130, 246, 0.2); border: 1px solid #3b82f6; color: #93c5fd; }
        .pill-image { background: rgba(168, 85, 247, 0.2); border: 1px solid #a855f7; color: #d8b4fe; }
        .pill-audio { background: rgba(45, 212, 191, 0.2); border: 1px solid #2dd4bf; color: #99f6e4; }
        .pill-video { background: rgba(245, 158, 11, 0.2); border: 1px solid #f59e0b; color: #fde68a; }
        
        .conf-card { background: linear-gradient(145deg, #1e293b, #0f172a); border: 1px solid #334155; border-radius: 10px; padding: 1.2rem; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); }
        .conf-card:hover { border-color: var(--accent); }
        
        .pipeline { max-width: 880px; margin: 1rem auto; }
        .pipeline-step { display: flex; align-items: center; gap: 1rem; background: var(--paper); border: 1px solid var(--line); border-radius: 8px; padding: .75rem 1.1rem; box-shadow: 0 4px 16px rgba(0, 0, 0, .2); }
        .pipeline-step span { color: var(--accent); font-size: .8rem; font-weight: 800; min-width: 1.5rem; }
        .pipeline-step strong { color: var(--ink); }
        .pipeline-arrow { color: var(--accent); text-align: center; font-size: 1.3rem; line-height: 1.4; }
        
        .workflow { display: flex; align-items: center; justify-content: space-between; gap: .35rem; margin: 1rem 0 1.4rem; padding: .75rem; border: 1px solid var(--line); border-radius: 8px; background: rgba(30, 41, 59, .8); }
        .workflow-step { flex: 1; text-align: center; color: var(--muted); font-size: .72rem; font-weight: 800; letter-spacing: .08em; }
        .workflow-step strong { display: block; color: var(--accent); font-size: .76rem; margin-bottom: .2rem; }
        .workflow-arrow { color: #64748b; font-weight: 800; }
        
        .theory-quote { font-size: 1.25rem; font-weight: 700; color: #f1f5f9; margin: 0.5rem 0 1rem; padding: 0.9rem 1.2rem; border-left: 4px solid var(--accent); background: var(--paper); border-radius: 0 8px 8px 0; line-height: 1.5; }
        .success-banner { display: flex; justify-content: space-between; gap: 1rem; align-items: center; background: var(--accent-soft); border: 1px solid #14b8a6; border-radius: 8px; color: #ccfbf1; padding: .8rem 1.1rem; margin: .8rem 0; }
        .success-banner span { color: #99f6e4; font-size: .9rem; overflow-wrap: anywhere; text-align: right; }
        
        .metric-label { color: var(--ink); font-size: .75rem; font-weight: 800; letter-spacing: .1em; margin: 1rem 0 .3rem; }
        .metric-label span { color: var(--muted); font-weight: 500; letter-spacing: 0; margin-left: .5rem; }
        
        [data-testid="stMetric"] { background: var(--paper); border: 1px solid var(--line); border-radius: 8px; padding: .75rem 1rem; box-shadow: 0 4px 12px rgba(0, 0, 0, .15); }
        [data-testid="stMetricLabel"] { color: var(--muted); }
        [data-testid="stMetricValue"] { color: var(--ink); font-weight: 800; }
        
        [data-testid="stMarkdownContainer"], [data-testid="stCaptionContainer"] { color: #cbd5e1; }
        [data-testid="stTextInput"] input, [data-testid="stTextArea"] textarea, [data-testid="stFileUploaderDropzone"] { background: var(--input); color: var(--ink); border-color: var(--line); border-radius: 6px; }
        [data-testid="stFileUploaderDropzone"] { border: 1px dashed #475569; }
        
        [data-testid="stTabs"] button { color: var(--muted); font-weight: 700; font-size: 1.05rem; padding: 0.5rem 1.2rem; }
        [data-testid="stTabs"] button[aria-selected="true"] { color: var(--accent); border-bottom-color: var(--accent); }
        [data-testid="stRadio"] label, [data-testid="stCheckbox"] label { color: #cbd5e1; font-size: 1.05rem; }
        
        div[data-testid="stButton"] > button, div[data-testid="stDownloadButton"] > button { border-radius: 6px; font-weight: 700; border-color: var(--line); font-size: 1rem; padding: 0.45rem 1rem; }
        div[data-testid="stButton"] > button[kind="primary"], div[data-testid="stDownloadButton"] > button[kind="primary"] { background: linear-gradient(135deg, #0d9488, #0f766e); color: #ffffff; border-color: #14b8a6; }
        div[data-testid="stButton"] > button:hover, div[data-testid="stDownloadButton"] > button:hover { border-color: var(--accent); color: var(--accent); }
        div[data-testid="stButton"] > button[kind="primary"]:hover, div[data-testid="stDownloadButton"] > button[kind="primary"]:hover { background: linear-gradient(135deg, #14b8a6, #0d9488); color: #ffffff; }
        
        div[data-testid="stExpander"] { border-color: var(--line); border-radius: 8px; background: rgba(30, 41, 59, .75); margin-bottom: 0.6rem; }
        [data-testid="stDataFrame"] { border: 1px solid var(--line); border-radius: 6px; }
        [data-testid="stAlert"] { background: var(--paper); border-color: var(--line); color: #cbd5e1; border-radius: 8px; }
        hr { border-color: var(--line); margin: 1.2rem 0; }
        
        @media (max-width: 768px) {
            .block-container { padding-left: 1rem; padding-right: 1rem; padding-top: 1rem; }
            .success-banner { align-items: flex-start; flex-direction: column; gap: .25rem; }
            .success-banner span { text-align: left; }
            .metric-label span { display: block; margin: .2rem 0 0; }
        }
        </style>
        """,
        unsafe_allow_html=True,
    )



def render_aim_section_legacy():
    """Renders an engaging,  Purpose page explaining the 'Why', 'What', and 'What we miss'."""
    st.markdown('<div class="section-kicker">01 / WHY THIS EXPERIMENT MATTERS</div>', unsafe_allow_html=True)
    st.header("Why Multimodal Tokenization?")
    st.caption("Understanding the fundamental bridge between raw sensory media and modern Search Engines & AI.")

    # ---- 1. THE CLASSROOM HOOK (THE BIG QUESTION) ----
    st.markdown(
        """
        <div class="theory-quote" style="border-left: 5px solid #2dd4bf; background: linear-gradient(135deg, #1e293b, #0f172a);">
            <div style="font-size:1.1rem; color:#94a3b8; font-weight:600; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:0.3rem;">
             Question:
            </div>
            <div style="font-size:1rem; color:#f8fafc; font-weight:700; line-height:1.4;">
                “Computers cannot ‘see’ a picture or ‘hear’ a soundwave — they only compute discrete numbers. 
                So how can a search engine instantly find a 3-second audio snippet or a specific video scene from a text query?”
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    st.markdown(
        """
        To search, index, or compare any media, computers **must first chop continuous raw signals into discrete, atomic building blocks**. 
        This fundamental operation is called **Tokenization**. In this experiment, you will discover how text, images, audio, and video are all transformed into structured token sequences.
        """
    )

    st.divider()

    # ---- 2. WHAT WE MISS WITHOUT IT (THE VISUAL CONTRAST) ----
    st.subheader("1. The Core Problem: What Happens Without Tokenization?")
    st.markdown("Why can't we simply search raw files directly? See what breaks without a shared token abstraction:")
    
    st.markdown(
        """
        <div class="conf-card" style="border-top: 4px solid #10b981; background: rgba(16, 185, 129, 0.05); min-height: 240px;">
            <h4 style="color:#34d399; margin-top:0; display:flex; align-items:center; gap:8px;">
                <span></span> With Multimodal Tokenization
            </h4>
            <ul style="color:#cbd5e1; font-size:0.95rem; line-height:1.6; padding-left:1.2rem;">
                <li><b>Universal Atomic Currency:</b> Every modality is translated into discrete, manageable <b>Tokens</b>.</li>
                <li><b>Unified Index Architecture:</b> Words, visual patches, and audio frames live in the same high-speed inverted index.</li>
                <li><b>Granularity Control:</b> You decide the trade-off between index size and retrieval precision (e.g. patch size or frame duration).</li>
                <li><b>Enables Modern AI & RAG:</b> Forms the exact foundation used by Vision Transformers (ViT), Whisper, and Multimodal LLMs.</li>
            </ul>
        </div>
        """,
        unsafe_allow_html=True,
    )

    st.divider()

    # ---- 3. WHAT YOU WILL DO & OBSERVE IN THIS LAB ----
    st.subheader("2. What You Will Explore in This Virtual Lab")
    st.markdown("Through hands-on interactive simulation, you will observe the 4 distinct modalities in action:")

    c1, c2, c3, c4 = st.columns(4)
    with c1:
        st.markdown(
            """
            <div class="conf-card" style="border-top: 4px solid #3b82f6; text-align:center;">
                <div style="font-size:2.4rem; margin-bottom:0.2rem;">📝</div>
                <h4 style="color:#93c5fd; margin:0.3rem 0;">Text Modality</h4>
                <p style="font-size:0.88rem; color:#cbd5e1; line-height:1.45;">
                    Extract <b>Linguistic Tokens</b> from raw sentences to observe word-level posting keys.
                </p>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with c2:
        st.markdown(
            """
            <div class="conf-card" style="border-top: 4px solid #a855f7; text-align:center;">
                <div style="font-size:2.4rem; margin-bottom:0.2rem;">🖼️</div>
                <h4 style="color:#d8b4fe; margin:0.3rem 0;">Image Modality</h4>
                <p style="font-size:0.88rem; color:#cbd5e1; line-height:1.45;">
                    Partition 2D pixels into <b>Visual Patch Tokens</b> (ViT approach) and observe grid geometry.
                </p>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with c3:
        st.markdown(
            """
            <div class="conf-card" style="border-top: 4px solid #2dd4bf; text-align:center;">
                <div style="font-size:2.4rem; margin-bottom:0.2rem;">🎵</div>
                <h4 style="color:#99f6e4; margin:0.3rem 0;">Audio Modality</h4>
                <p style="font-size:0.88rem; color:#cbd5e1; line-height:1.45;">
                    Slice continuous waveforms into <b>Temporal Frame Tokens</b> (10ms–40ms windows).
                </p>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with c4:
        st.markdown(
            """
            <div class="conf-card" style="border-top: 4px solid #f59e0b; text-align:center;">
                <div style="font-size:2.4rem; margin-bottom:0.2rem;">🎬</div>
                <h4 style="color:#fde68a; margin:0.3rem 0;">Video Modality</h4>
                <p style="font-size:0.88rem; color:#cbd5e1; line-height:1.45;">
                    Sample spatiotemporal <b>Keyframe Tokens</b> to eliminate temporal redundancy.
                </p>
            </div>
            """,
            unsafe_allow_html=True,
        )

    # st.divider()

    # ---- 4. INSIGHTS (FAQ / TEACHER EXPLANATIONS) ----
    st.subheader("3.Insights & Key Takeaways")
    
    col_q1, col_q2 = st.columns(2, gap="medium")
    with col_q1:
        with st.markdown(" Why not just match raw RGB pixels directly?", expanded=True):
            st.markdown(
                """
                A tiny change in lighting, compression, or camera angle completely alters all raw RGB values. 
                By tokenizing an image into **local visual patches**, an IR system can index individual objects, textures, and patterns independently of global image changes.
                """
            )
        with col_q2:
            with st.markdown(" How does changing token parameters affect retrieval?", expanded=True):
                st.markdown(
                    """
                    - **Smaller Units** (e.g. 8px patches or 10ms audio frames): High detail and fine-grained matching, but creates massive token lists.
                    - **Larger Units** (e.g. 32px patches or 40ms audio frames): Faster search and compact index, but loses subtle visual or acoustic nuances.
                    """
                )

    st.markdown(
        """
        <div class="callout" style="margin-top:1rem; border-left-color: #2dd4bf;">
             <b>Next Step:</b> Navigate to <b>Theory</b> to explore the live interactive synthetic demos, or jump directly into <b>Simulation</b> to tokenize your own custom multimodal files!
        </div>
        """,
        unsafe_allow_html=True,
    )



def render_aim_section():
    """Render the purpose illustration followed by a short, justified purpose statement."""

    st.header("Purpose")
    purpose_image = os.path.join(os.path.dirname(os.path.abspath(__file__)), "PurposeImage.jpeg")
    if os.path.exists(purpose_image):
        st.image(purpose_image, use_container_width=True)
    st.divider()
    st.markdown(
        '<p style="text-align: justify; text-justify: inter-word;">'
        "Search systems need one common way to handle different kinds of data. Multimodal tokenization "
        "converts text into word tokens, images into patch tokens, audio into time-frame tokens, and video "
        "into keyframe tokens. This shared token representation makes indexing and retrieval possible "
        "across all four modalities."
        "</br>"
        "Multimodal tokenization is important because search systems and AI models need one structured way to process different kinds of information. It converts text into word tokens, images into visual patch tokens, audio into short time-frame tokens, and video into keyframe tokens. For example, the words in a product description, the visual patch containing a shoe, the audio frame containing speech, and the video frame showing the product can all become searchable units instead of remaining as unstructured files."
        "</p>",
        unsafe_allow_html=True,
    )
    st.divider()
    
    st.markdown("Contributors: Moneet Bhiwandkar and Sanjay Aski by VESIT Computer Engineering")


def render_procedure_section():
    """Renders the concise experimental procedure from the existing lab content."""
    st.markdown('<div class="section-kicker">04 / PROCEDURE</div>', unsafe_allow_html=True)
    st.header("Experimental Procedure")
    st.caption("Follow these steps to complete one documented experiment trial.")
    procedure_html = '<div class="pipeline">'
    for index, step in enumerate(THEORY_CONTENT["procedure"], start=1):
        step_text = re.sub(r"^Step\s+\d+\s*:\s*", "", step)
        procedure_html += f'<div class="pipeline-step"><span>{index:02d}</span><strong>{step_text}</strong></div>'
        if index < len(THEORY_CONTENT["procedure"]):
            procedure_html += '<div class="pipeline-arrow">↓</div>'
    procedure_html += '</div>'
    st.markdown(procedure_html, unsafe_allow_html=True)


def render_references_section():
    """Renders concise references relevant to the experiment."""
    st.markdown('<div class="section-kicker">08 / REFERENCES</div>', unsafe_allow_html=True)
    st.header("References")
    st.caption("Core sources supporting the concepts and tools used in this experiment.")
    references = [
        ("Information Retrieval: Recent Advances and Beyond", "https://arxiv.org/pdf/2301.08801"),
        ("A Comprehensive Survey on Multimodal Retrieval-Augmented Generation", "A Comprehensive Survey on Multimodal Retrieval-Augmented Generation"),
        ("A Comprehensive Survey on Cross-modal Retrieval", "https://arxiv.org/pdf/1607.06215"),
        ("Image-text Retrieval: A Survey on Recent Research and Development", "https://arxiv.org/pdf/2203.14713"),
        ("Multimodal video retrieval with CLIP: a user study", "https://link.springer.com/article/10.1007/s10791-023-09425-2"),
    ]
    for index, (title, url) in enumerate(references, start=1):
        st.markdown(
            f'<div class="objective"><span>{index:02d}</span><a href="{url}" target="_blank">{title}</a></div>',
            unsafe_allow_html=True,
        )


def render_cross_modal_comparison_matrix():
    """Render the cross-modal comparison matrix at the top of Theory."""
    st.subheader("1. Cross-Modality Tokenization Comparison Matrix")
    comparison_data = [
        {
            "Modality": "Text",
            "Raw Signal Type": "Discrete Characters / Words",
            "Atomic Token Unit": "Lexical Word / Subword Token",
            "Spatial/Temporal Dim": "1D Linear Sequence",
            "Control Parameter": "Whitespace / Subword Vocabulary",
            "Index Representation": "Inverted Index (Term → Postings)",
        },
        {
            "Modality": "Image",
            "Raw Signal Type": "2D Continuous Pixel Array (H × W × 3)",
            "Atomic Token Unit": "Visual Patch (P × P px)",
            "Spatial/Temporal Dim": "2D Spatial Grid (Row × Column)",
            "Control Parameter": "Patch Size",
            "Index Representation": "Visual Bag-of-Words / Patch Embeddings",
        },
        {
            "Modality": "Audio",
            "Raw Signal Type": "1D Continuous Pressure Waveform",
            "Atomic Token Unit": "Temporal Frame Window",
            "Spatial/Temporal Dim": "1D Time Continuum",
            "Control Parameter": "Frame Duration",
            "Index Representation": "Acoustic Frame / Spectrogram Tokens",
        },
        {
            "Modality": "Video",
            "Raw Signal Type": "3D Spatiotemporal Stream (T × H × W × 3)",
            "Atomic Token Unit": "Sampled Keyframe / 3D Tubelet",
            "Spatial/Temporal Dim": "3D Time + Space Grid",
            "Control Parameter": "Sampling Interval",
            "Index Representation": "Temporal Keyframe Sequence Index",
        },
    ]
    st.dataframe(pd.DataFrame(comparison_data), use_container_width=True, hide_index=True)
    


def render_theory_section_legacy():
    """Renders the comprehensive visual & interactive Multimodal Tokenization Theory."""
    st.markdown('<div class="section-kicker">02 / THEORY & FOUNDATIONS</div>', unsafe_allow_html=True)
    st.header("Multimodal Tokenization for Information Retrieval")
    st.caption("Theoretical framework, cross-modality token representations, and live synthetic demonstrations.")

    render_cross_modal_comparison_matrix()
    st.markdown(
        "Multimodal tokenization gives text, images, audio, and video a common indexed representation. "
        "Each modality is divided into meaningful units—words, visual patches, time frames, or keyframes—"
        "so Information Retrieval systems can compare and locate content efficiently across formats."
    )

    # ---- Executive Overview Quote / Banner ----
    st.markdown(
        """
        <div class="theory-quote">
            <span style="color:var(--accent);">“Tokenization is the universal bridge converting heterogeneous continuous data into discrete, indexed units for Information Retrieval.”</span>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # ---- 4 Modality Architecture Pillars ----
    # st.subheader("2. The Four Multimodal Tokenization Paradigms")
    # col1, col2, col3, col4 = st.columns(4)
    # with col1:
    #     st.markdown(
    #         """
    #         <div class="conf-card" style="border-top: 4px solid #3b82f6;">
    #             <div class="modality-pill pill-text">📝 TEXT</div>
    #             <h4 style="margin:0.6rem 0 0.2rem; color:#93c5fd;">Linguistic Tokens</h4>
    #             <p style="font-size:0.92rem; color:#cbd5e1; margin-bottom:0.4rem;"><b>Unit:</b> Words / Subwords / Characters</p>
    #             <p style="font-size:0.88rem; color:#94a3b8; line-height:1.4;">Discrete 1D sequences separated by whitespace, morphology, or BPE subwords.</p>
    #         </div>
    #         """,
    #         unsafe_allow_html=True,
    #     )
    # with col2:
    #     st.markdown(
    #         """
    #         <div class="conf-card" style="border-top: 4px solid #a855f7;">
    #             <div class="modality-pill pill-image">🖼️ IMAGE</div>
    #             <h4 style="margin:0.6rem 0 0.2rem; color:#d8b4fe;">Visual Patch Tokens</h4>
    #             <p style="font-size:0.92rem; color:#cbd5e1; margin-bottom:0.4rem;"><b>Unit:</b> Fixed-size 2D Patches (P × P)</p>
    #             <p style="font-size:0.88rem; color:#94a3b8; line-height:1.4;">2D spatial grid partitioning (ViT paradigm), mapping spatial regions to sequence tokens.</p>
    #         </div>
    #         """,
    #         unsafe_allow_html=True,
    #     )
    # with col3:
    #     st.markdown(
    #         """
    #         <div class="conf-card" style="border-top: 4px solid #2dd4bf;">
    #             <div class="modality-pill pill-audio">🎵 AUDIO</div>
    #             <h4 style="margin:0.6rem 0 0.2rem; color:#99f6e4;">Temporal Frame Tokens</h4>
    #             <p style="font-size:0.92rem; color:#cbd5e1; margin-bottom:0.4rem;"><b>Unit:</b> Time Windows (Δt ms)</p>
    #             <p style="font-size:0.88rem; color:#94a3b8; line-height:1.4;">1D continuous acoustic signals sliced into uniform discrete temporal windows.</p>
    #         </div>
    #         """,
    #         unsafe_allow_html=True,
    #     )
    # with col4:
    #     st.markdown(
    #         """
    #         <div class="conf-card" style="border-top: 4px solid #f59e0b;">
    #             <div class="modality-pill pill-video">🎬 VIDEO</div>
    #             <h4 style="margin:0.6rem 0 0.2rem; color:#fde68a;">Spatiotemporal Tokens</h4>
    #             <p style="font-size:0.92rem; color:#cbd5e1; margin-bottom:0.4rem;"><b>Unit:</b> Sampled Keyframes (Every Nth)</p>
    #             <p style="font-size:0.88rem; color:#94a3b8; line-height:1.4;">3D spatiotemporal signals sampled along the time axis to retain chronological events.</p>
    #         </div>
    #         """,
    #         unsafe_allow_html=True,
    #     )

    # st.divider()

    # ---- Interactive Multimodal Playground (Synthetic Live Demos) ----
    st.subheader(" Interactive Step-by-Step Modality Tokenizer")
    st.markdown("Explore how raw inputs from each modality are transformed into token sequences in real time:")

    tab_text, tab_img, tab_aud, tab_vid = st.tabs([
        " Text Tokenization",
        " Image Patch Tokenization",
        " Audio Frame Tokenization",
        " Video Frame Tokenization",
    ])

    # === TAB 1: TEXT ===
    with tab_text:
        st.markdown("#### Linguistic Tokenization in Information Retrieval")
        col_t_in, col_t_out = st.columns([1.1, 1.3], gap="large")
        with col_t_in:
            st.markdown("**1. Raw Text Sequence Input**")
            sample_theory_text = st.text_area(
                "Sample Sentence / Query:",
                value="Multimodal Information Retrieval indexes Text, Visual Patches, Audio Frames, and Video Clips.",
                height=100,
                key="theory_text_sample_input",
            )
            raw_tokens = tokenize_text(sample_theory_text)
            st.metric("Total Tokens Extracted", len(raw_tokens))
            st.metric("Unique Vocabulary Size", len(set(raw_tokens)))

        with col_t_out:
            st.markdown("**2. Discrete Token Stream & Inverted Postings Representation**")
            st.markdown(
                '<div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:1rem;">' +
                "".join([
                    f'<span style="background:#1e3a8a; color:#bfdbfe; border:1px solid #3b82f6; border-radius:6px; padding:4px 10px; font-family:monospace; font-size:0.95rem;">'
                    f'<span style="color:#93c5fd; font-size:0.75rem; margin-right:4px;">#{i+1}</span>{t}</span>'
                    for i, t in enumerate(raw_tokens)
                ]) +
                '</div>',
                unsafe_allow_html=True,
            )
            st.info(
                "Each lexical token maps to an atomic posting list entry in the inverted index: "
                f"`Term → [DocID, TermFrequency, Position]`."
            )

    # === TAB 2: IMAGE ===
    with tab_img:
        st.markdown("#### Vision Transformer (ViT) Style Visual Patch Tokenization")
        col_i_ctrl1, col_i_ctrl2 = st.columns([1, 3])
        with col_i_ctrl1:
            theory_patch_size = st.selectbox("Patch Granularity (P × P px)", [8, 16, 32], index=1, key="theory_img_patch_sz")
        
        synth_img, grid_img, patches, p_rows, p_cols = generate_synthetic_theory_image(size=128, patch_size=theory_patch_size)
        
        with col_i_ctrl2:
            st.caption(
                f"Synthetic Image: 128 × 128 px | Grid: {p_rows} rows × {p_cols} cols = **{len(patches)} Total Visual Tokens**."
            )

        col_i1, col_i2, col_i3 = st.columns([1.2, 1.2, 2], gap="large")
        with col_i1:
            st.markdown("**1. Raw Image (2D Continuum)**")
            st.image(synth_img, caption="128 × 128 px Synthetic Scene", use_container_width=True)
        with col_i2:
            st.markdown(f"**2. Patch Grid ({theory_patch_size}×{theory_patch_size} px)**")
            st.image(grid_img, caption=f"{p_rows}×{p_cols} Grid Partitions", use_container_width=True)
        with col_i3:
            st.markdown(f"**3. Flattened Visual Patch Token Stream (First 10 of {len(patches)})**")
            sample_patches = patches[:10]
            p_cols_view = st.columns(len(sample_patches))
            for idx, (col_p, p_img) in enumerate(zip(p_cols_view, sample_patches)):
                with col_p:
                    st.image(p_img, caption=f"T{idx+1}", width=theory_patch_size * 2 + 10)
            
            st.markdown("**Mathematical Formulation:**")
            st.latex(
                rf"\mathbf{{x}} \in \mathbb{{R}}^{{H \times W \times C}}"
                rf"\;\longrightarrow\;"
                rf"\mathbf{{x}}_p \in \mathbb{{R}}^{{N \times (P^2 \cdot C)}}"
                rf",\quad N = \frac{{HW}}{{P^2}} = {len(patches)}"
            )

    # === TAB 3: AUDIO ===
    with tab_aud:
        st.markdown("#### Continuous Acoustic Signal Temporal Segmentation")
        col_a_ctrl1, col_a_ctrl2 = st.columns([1, 3])
        with col_a_ctrl1:
            theory_frame_ms = st.selectbox("Frame Duration (ms)", [10, 20, 40], index=1, key="theory_aud_frame_ms")
        
        wav_bytes, t_axis, sig_data, sr, n_frames, aud_toks = generate_synthetic_theory_audio(duration=1.0, frame_duration_ms=theory_frame_ms)
        
        with col_a_ctrl2:
            st.audio(wav_bytes, format="audio/wav")
            st.caption(f"Synthesized Harmonic Acoustic Signal (1.0s, 16 kHz) → **{n_frames} Temporal Frame Tokens**.")

        col_a_plot, col_a_table = st.columns([1.5, 1], gap="large")
        with col_a_plot:
            fig_synth_wave = go.Figure()
            fig_synth_wave.add_trace(go.Scatter(
                x=t_axis[::8],
                y=sig_data[::8],
                mode="lines",
                line=dict(color="#2dd4bf", width=1.2),
                name="Acoustic Waveform",
            ))
            step_sec = theory_frame_ms / 1000.0
            for b in range(1, min(n_frames, 25)):
                fig_synth_wave.add_vline(x=b * step_sec, line_width=1, line_dash="dash", line_color="#f59e0b")
                
            fig_synth_wave.update_layout(
                title=f"Waveform with {theory_frame_ms}ms Frame Boundaries (First 25 Frames)",
                xaxis_title="Time (seconds)",
                yaxis_title="Amplitude",
                template="plotly_dark",
                paper_bgcolor="#1e293b",
                plot_bgcolor="#1e293b",
                font=dict(color="#e2e8f0"),
                height=260,
                margin=dict(l=10, r=10, t=40, b=30),
                showlegend=False,
            )
            st.plotly_chart(fig_synth_wave, use_container_width=True)

        with col_a_table:
            st.markdown("**Sample Temporal Tokens**")
            st.dataframe(pd.DataFrame(aud_toks[:8]), use_container_width=True, hide_index=True)
            st.info(f"Each {theory_frame_ms}ms frame produces a discrete token vector indexed by timestamp.")

    # === TAB 4: VIDEO ===
    with tab_vid:
        st.markdown("#### Spatiotemporal Video Keyframe Extraction")
        col_v_ctrl1, col_v_ctrl2 = st.columns([1, 3])
        with col_v_ctrl1:
            theory_vid_interval = st.selectbox("Keyframe Sampling Interval", [2, 3, 4], index=1, key="theory_vid_interval")
        
        all_frames, sampled_idxs, sampled_frms = generate_synthetic_theory_video(num_frames=12, sample_interval=theory_vid_interval)
        
        with col_v_ctrl2:
            st.caption(f"12 Consecutive Video Frames → Sampled every {theory_vid_interval} frames → **{len(sampled_frms)} Visual Keyframe Tokens**.")

        st.markdown("**1. Raw Continuous Video Stream (12 Frames)**")
        v_cols_raw = st.columns(12)
        for idx, (col_v, frm) in enumerate(zip(v_cols_raw, all_frames)):
            with col_v:
                is_sampled = (idx + 1) % theory_vid_interval == 0
                border_style = "border: 2px solid #f59e0b;" if is_sampled else "border: 1px solid #334155; opacity: 0.6;"
                st.markdown(f'<div style="{border_style} border-radius:4px; padding:1px;">', unsafe_allow_html=True)
                st.image(frm, use_container_width=True)
                st.markdown(f'<div style="text-align:center; font-size:0.65rem; color:{"#f59e0b" if is_sampled else "#94a3b8"};">F#{idx+1}</div></div>', unsafe_allow_html=True)

        st.markdown(f"**2. Extracted Video Tokens (Every {theory_vid_interval}th Frame)**")
        v_cols_tokens = st.columns(max(1, len(sampled_frms)))
        for idx, (col_vt, frm) in enumerate(zip(v_cols_tokens, sampled_frms)):
            with col_vt:
                st.image(frm, caption=f"Token T{idx+1} · F#{sampled_idxs[idx]+1}", width=80)
        
        st.info("Video tokenization removes temporal redundancy by sampling keyframes while preserving sequential action dynamics.")

    return

    st.divider()

    # ---- Cross-Modality Comparison Table ----
    st.subheader("3. Cross-Modality Tokenization Comparison Matrix")
    comparison_data = [
        {
            "Modality": "📝 Text",
            "Raw Signal Type": "Discrete Characters / Words",
            "Atomic Token Unit": "Lexical Word / Subword Token",
            "Spatial/Temporal Dim": "1D Linear Sequence",
            "Control Parameter": "Whitespace / Subword Vocab",
            "Index Representation": "Inverted Index (Term → Postings)",
        },
        {
            "Modality": "🖼️ Image",
            "Raw Signal Type": "2D Continuous Pixel Array (H × W × 3)",
            "Atomic Token Unit": "Visual Patch (P × P px)",
            "Spatial/Temporal Dim": "2D Spatial Grid (Row × Col)",
            "Control Parameter": "Patch Size (e.g., 16×16)",
            "Index Representation": "Visual Bag-of-Words / Patch Embeddings",
        },
        {
            "Modality": "🎵 Audio",
            "Raw Signal Type": "1D Continuous Pressure Waveform",
            "Atomic Token Unit": "Temporal Frame Window",
            "Spatial/Temporal Dim": "1D Time Continuum",
            "Control Parameter": "Frame Duration (e.g., 20ms)",
            "Index Representation": "Acoustic Frame Tokens / Spectrogram Tokens",
        },
        {
            "Modality": "🎬 Video",
            "Raw Signal Type": "3D Spatiotemporal Stream (T × H × W × 3)",
            "Atomic Token Unit": "Sampled Keyframe / 3D Tubelet",
            "Spatial/Temporal Dim": "3D Time + Space Grid",
            "Control Parameter": "Sampling Interval (Every Nth frame)",
            "Index Representation": "Temporal Keyframe Sequence Index",
        },
    ]
    st.dataframe(pd.DataFrame(comparison_data), use_container_width=True, hide_index=True)

    st.divider()

    # ---- Pipeline Architecture ----
    st.subheader("4. Multimodal Tokenization Pipeline Architecture")
    stages = [
        "1. Input Acquisition (Text string, Image bitmap, Audio PCM, Video stream)",
        "2. Modality Identification (Extract MIME type & structural dimensions)",
        "3. Unit Partitioning (Split text words, image patches, audio frames, video keyframes)",
        "4. Token Vectorization (Assign Token IDs and positional metadata)",
        "5. Multimodal Index Integration (Unified inverted index & dense retrieval store)",
    ]
    pipeline_html = '<div class="pipeline">'
    for index, stage in enumerate(stages, start=1):
        pipeline_html += f'<div class="pipeline-step"><span>{index:02d}</span><strong>{stage}</strong></div>'
        if index < len(stages):
            pipeline_html += '<div class="pipeline-arrow">↓</div>'
    pipeline_html += '</div>'
    st.markdown(pipeline_html, unsafe_allow_html=True)

    st.divider()

    # ---- Key Terminology Glossary ----
    st.subheader("5. Key Terminology & Glossary")
    terms = [
        ("Token", "The fundamental atomic unit produced by partitioning raw data (words, patches, or frames) for indexing.", "Core Concept"),
        ("Multimodal IR", "Information Retrieval across diverse data formats (text, image, audio, video) in a shared index.", "IR Paradigm"),
        ("Visual Patch Token", "A square sub-region of an image (e.g., 16×16 px) treated as a single token in ViT architectures.", "Computer Vision"),
        ("Temporal Frame", "A short uniform time slice (e.g., 20ms) of an audio signal representing instantaneous frequency.", "Audio Processing"),
        ("Keyframe Sampling", "Extracting periodic or salient video frames to represent spatiotemporal dynamics without redundancy.", "Video Analysis"),
        ("Inverted Index", "A core IR data structure mapping each token to its occurrences across multimodal documents.", "Data Structure"),
    ]
    g_cols = st.columns(3)
    for i, (term, defn, tag) in enumerate(terms):
        with g_cols[i % 3]:
            st.markdown(
                f"""
                <div class="conf-card" style="margin-bottom:0.8rem; min-height:140px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <strong style="color:#2dd4bf; font-size:1.05rem;">{term}</strong>
                        <span style="font-size:0.75rem; background:rgba(45,212,191,0.15); border:1px solid #2dd4bf; border-radius:4px; padding:2px 6px; color:#99f6e4;">{tag}</span>
                    </div>
                    <p style="font-size:0.9rem; color:#cbd5e1; margin-top:0.4rem; line-height:1.45;">{defn}</p>
                </div>
                """,
                unsafe_allow_html=True,
            )



def render_theory_section():
    """Render the live visual theory demonstrations."""
    render_theory_section_legacy()


def render_simulation_section():
    """Renders Section 2 — Interactive Document Processing Pipeline."""
    st.markdown('<div class="section-kicker">05 / SIMULATION</div>', unsafe_allow_html=True)
    st.header("Interactive Document Processing Simulation")
    st.caption("Run a document through the pipeline and record the evidence from each trial.")
    st.markdown(
        '<div class="callout"><strong>Experiment flow</strong>&nbsp;&nbsp; Input document &nbsp;→&nbsp; '
        'Configure stages &nbsp;→&nbsp; Process &nbsp;→&nbsp; Inspect results &nbsp;→&nbsp; Record trial</div>',
        unsafe_allow_html=True,
    )
    workflow = ["INPUT", "CONFIGURE", "PROCESS", "INSPECT", "RECORD"]
    workflow_html = '<div class="workflow">'
    for index, label in enumerate(workflow, start=1):
        workflow_html += f'<div class="workflow-step"><strong>{index:02d}</strong>{label}</div>'
        if index < len(workflow):
            workflow_html += '<div class="workflow-arrow">→</div>'
    workflow_html += '</div>'
    st.markdown(workflow_html, unsafe_allow_html=True)
    st.info(
        "Enter or upload a text document, select preprocessing options, and click "
        "**Process Document** to observe the step-by-step transformation."
    )

    # ---- Input Panel ----
    st.subheader("1. Document Input")
    input_tab1, input_tab2 = st.tabs(["Manual Text Entry", "Upload Text / Document"])

    with input_tab1:
        manual_text = st.text_area(
            "Enter your document text below:",
            value=(
                "Information Retrieval is the process of finding relevant information "
                "from a large collection of documents. Search engines, digital libraries, "
                "and enterprise knowledge bases are common applications of IR systems. "
                "Preprocessing is essential before documents can be indexed and retrieved efficiently."
            ),
            height=160,
            key="manual_text_input",
            help="Type or paste any English text you want to process.",
        )
        uploaded_file = None

    with input_tab2:
        uploaded_file = st.file_uploader(
            "Upload your document file:",
            type=["txt", "pdf", "doc", "docx"],
            key="file_uploader",
            help=(
                "Accepted: PDF, DOC/DOCX, and TXT files. "
                "Files larger than 25 MB are rejected. Only text documents are processed for the IR pipeline."
            ),
        )
        manual_text_upload = ""
        if uploaded_file:
            if getattr(uploaded_file, "size", 0) > MAX_UPLOAD_SIZE_BYTES:
                st.error(
                    f"Uploaded file exceeds the {MAX_UPLOAD_SIZE_BYTES / (1024 * 1024):.0f} MB limit. "
                    "Please choose a smaller file."
                )
            else:
                st.success(f"File loaded: **{uploaded_file.name}**")
        else:
            st.caption("No file uploaded yet. Switch to Manual Text Entry to type your document.")
        manual_text = manual_text_upload  # blank — file takes priority

    # Resolve actual input source
    if uploaded_file is not None:
        raw_text, source_label, _ = acquire_document(uploaded_file, "")
    else:
        raw_text, source_label, _ = acquire_document(None, st.session_state.get("manual_text_input", ""))

    st.divider()

    # ---- Preprocessing Controls ----
    st.subheader("2. Pipeline Configuration")
    col_opt1, col_opt2, col_opt3 = st.columns(3)
    with col_opt1:
        st.caption("NORMALIZATION")
        do_lowercase = st.checkbox("Convert to Lowercase", value=True)
        do_remove_punct = st.checkbox("Remove Punctuation", value=True)
    with col_opt2:
        st.caption("CLEANING")
        do_remove_numbers = st.checkbox("Remove Numbers", value=True)
        do_tokenize = st.checkbox("Tokenize Text", value=True)
    with col_opt3:
        st.caption("TOKEN PROCESSING")
        do_remove_sw = st.checkbox("Remove Stop Words", value=True)
        do_stem = st.checkbox("Apply Stemming (Porter Stemmer)", value=True)

    # ---- Process Button ----
    st.divider()
    process_clicked = st.button("▶  Process Document", type="primary", use_container_width=True)

    if process_clicked:
        if not raw_text:
            st.warning(
                "No document text found. Please type text in the Manual Text Entry tab "
                "or upload a valid PDF file."
            )
            return

        results = process_document(
            raw_text,
            do_lowercase=do_lowercase,
            do_remove_punct=do_remove_punct,
            do_remove_numbers=do_remove_numbers,
            do_tokenize=do_tokenize,
            do_remove_stopwords=do_remove_sw,
            do_stem=do_stem,
        )
        stats = calculate_statistics(results)

        # Persist to session_state for trial logger
        st.session_state["last_results"] = results
        st.session_state["last_stats"] = stats
        st.session_state["last_source"] = source_label
        st.session_state["last_options"] = {
            "Lowercase": do_lowercase,
            "Remove Punct": do_remove_punct,
            "Remove Numbers": do_remove_numbers,
            "Tokenize": do_tokenize,
            "Stop-word Removal": do_remove_sw,
            "Stemming": do_stem,
        }

    # ---- Display Results (persist across reruns) ----
    if "last_results" in st.session_state:
        results = st.session_state["last_results"]
        stats = st.session_state["last_stats"]
        source_label = st.session_state.get("last_source", "—")

        st.markdown(
            f'<div class="success-banner"><strong>Pipeline complete</strong><span>{source_label}</span></div>',
            unsafe_allow_html=True,
        )

        # --- Step-by-step output ---
        st.subheader("3. Pipeline Output")

        with st.expander("1. Original / Raw Document", expanded=True):
            st.text_area("Raw Text", value=results["raw"], height=220, disabled=True, key="out_raw")

        with st.expander("2. After Cleaning (Punctuation / Number Removal)"):
            st.text_area("Cleaned Text", value=results["cleaned"], height=180, disabled=True, key="out_cleaned")

        with st.expander("3. After Lowercasing (Normalization)"):
            st.text_area("Normalized Text", value=results["normalized"], height=180, disabled=True, key="out_norm")

        with st.expander("4. After Tokenization"):
            if results["tokens"]:
                st.write(results["tokens"])
            else:
                st.write("*(Tokenization disabled or no tokens produced.)*")

        with st.expander("5. After Stop-word Removal"):
            if results["tokens_no_sw"]:
                st.write(results["tokens_no_sw"])
            else:
                st.write("*(Stop-word removal disabled or all tokens were stop words.)*")

        with st.expander("6. After Stemming"):
            if results["stemmed"]:
                st.write(results["stemmed"])
            else:
                st.write("*(Stemming disabled.)*")

        with st.expander("7. Final Processed Document (joined stems)"):
            st.text_area(
                "Final Text",
                value=results["final_text"],
                height=160,
                disabled=True,
                key="out_final",
            )

        st.divider()

        # --- Statistics Metrics ---
        st.subheader("4. Results & Statistics")

        st.markdown('<div class="metric-label">TOKEN COUNTS <span>How many tokens exist at each stage</span></div>', unsafe_allow_html=True)
        c1, c2, c3, c4 = st.columns(4)
        c1.metric("Original Word Count", stats["Original Word Count"])
        c2.metric("Token Count (after tokenization)", stats["Token Count (after tokenization)"])
        c3.metric("Stop Words Removed", stats["Stop Words Removed"])
        c4.metric("Final Token Count", stats["Final Token Count"],
                  help="Same as 'Tokens After Stop-word Removal' — stemming does not change token count.")

        st.markdown('<div class="metric-label">VOCABULARY SIZE <span>Unique terms before and after stemming</span></div>', unsafe_allow_html=True)
        c5, c6, c7, c8 = st.columns(4)
        c5.metric("Original Characters", stats["Original Character Count"])
        c6.metric("Unique Tokens (before stemming)", stats["Unique Tokens Before Stemming"])
        c7.metric("Unique Stems (after stemming)", stats["Unique Stems After Stemming"])
        c8.metric("Vocabulary Reduced by Stemming", stats["Vocabulary Reduction by Stemming"],
                  help="Number of unique types merged by the stemmer.")

        st.markdown('<div class="metric-label">OVERALL REDUCTION <span>Stop-word removal is the primary token-count reducer</span></div>', unsafe_allow_html=True)
        c9, c10 = st.columns(2)
        c9.metric("Tokens Reduced vs. Original", stats["Tokens Reduced (vs original)"])
        c10.metric("Token Count Reduction (%)", f"{stats['Percentage Reduction (%)']}%")

        st.divider()

        # --- Visualization ---
        # Two-panel chart:
        #   Left  — Token count at each stage (shows stop-word removal effect)
        #   Right — Vocabulary (unique terms) before vs. after stemming
        st.subheader("5. Visual Evidence")
        st.caption(
            "Left chart: token count (number of tokens) at each stage — reduced primarily by stop-word removal. "
            "Right chart: vocabulary size (unique terms) before and after stemming."
        )

        fig_col1, fig_col2 = st.columns(2)

        with fig_col1:
            token_stages  = ["Original Words", "After Tokenization", "After Stop-word Removal"]
            token_counts  = [
                stats["Original Word Count"],
                stats["Token Count (after tokenization)"],
                stats["Tokens After Stop-word Removal"],
            ]
            fig_tok = go.Figure(
                go.Bar(
                    x=token_stages,
                    y=token_counts,
                    text=token_counts,
                    textposition="outside",
                    marker_color=["#3b82f6", "#8b5cf6", "#f59e0b"],
                    name="Token Count",
                )
            )
            fig_tok.update_layout(
                title="Token Count per Stage",
                xaxis_title="Pipeline Stage",
                yaxis_title="Number of Tokens",
                template="plotly_dark",
                paper_bgcolor="#192330",
                plot_bgcolor="#192330",
                font=dict(color="#dce6f2"),
                height=360,
                margin=dict(l=10, r=10, t=45, b=20),
                showlegend=False,
            )
            st.plotly_chart(fig_tok, use_container_width=True)

        with fig_col2:
            vocab_labels = ["Unique Tokens\n(before stemming)", "Unique Stems\n(after stemming)"]
            vocab_values = [
                stats["Unique Tokens Before Stemming"],
                stats["Unique Stems After Stemming"],
            ]
            fig_voc = go.Figure(
                go.Bar(
                    x=vocab_labels,
                    y=vocab_values,
                    text=vocab_values,
                    textposition="outside",
                    marker_color=["#f59e0b", "#10b981"],
                    name="Vocabulary Size",
                )
            )
            fig_voc.update_layout(
                title="Vocabulary Size: Before vs. After Stemming",
                xaxis_title="Stage",
                yaxis_title="Number of Unique Terms",
                template="plotly_dark",
                paper_bgcolor="#192330",
                plot_bgcolor="#192330",
                font=dict(color="#dce6f2"),
                height=360,
                margin=dict(l=10, r=10, t=45, b=20),
                showlegend=False,
            )
            st.plotly_chart(fig_voc, use_container_width=True)

    st.divider()

    # ---- Experimental Data Logger ----
    st.subheader("6. Experimental Data Log Book")
    st.caption("Each recorded trial stores processing statistics and processed text evidence at key pipeline stages.")
    col_log1, col_log2 = st.columns([1.6, 3.4])

    with col_log1:
        st.caption("Capture the current pipeline run into your session trial table:")

        if st.button("Record Current Trial", type="primary", use_container_width=True):
            if "last_stats" not in st.session_state:
                st.warning("Please process a document first before recording a trial.")
            else:
                opts = st.session_state.get("last_options", {})
                enabled_steps = ", ".join([k for k, v in opts.items() if v]) or "None"
                recorded_at = datetime.now()
                last_stats = st.session_state["last_stats"]
                last_results = st.session_state["last_results"]
                trial_record = {
                    "Trial #": len(st.session_state["trials"]) + 1,
                    "Date": recorded_at.strftime("%d-%m-%Y"),
                    "Time": recorded_at.strftime("%H:%M:%S"),
                    "Input Source": st.session_state.get("last_source", "—"),
                    "Original Word Count": last_stats["Original Word Count"],
                    "Original Character Count": last_stats["Original Character Count"],
                    "Token Count": last_stats["Token Count (after tokenization)"],
                    "Stop Words Removed": last_stats["Stop Words Removed"],
                    "Tokens After Stop-word Removal": last_stats["Tokens After Stop-word Removal"],
                    "Final Token Count": last_stats["Final Token Count"],
                    "Unique Tokens": last_stats["Unique Tokens Before Stemming"],
                    "Unique Stems": last_stats["Unique Stems After Stemming"],
                    "Vocabulary Reduction by Stemming": last_stats["Vocabulary Reduction by Stemming"],
                    "Tokens Reduced vs Original": last_stats["Tokens Reduced (vs original)"],
                    "Token Count Reduction (%)": last_stats["Percentage Reduction (%)"],
                    "Steps Enabled": enabled_steps,
                    "Tokenized Text": "\n".join(last_results["tokens"]),
                    "After Stop-word Removal": "\n".join(last_results["tokens_no_sw"]),
                    "Final Stemmed Text": "\n".join(last_results["stemmed"]),
                }
                st.session_state["trials"].append(trial_record)
                st.toast(f"Trial #{trial_record['Trial #']} saved successfully!")

        if st.button("Clear Logged Trials", use_container_width=True):
            st.session_state["trials"] = []
            st.toast("Trial log cleared.")

    with col_log2:
        if st.session_state["trials"]:
            df_trials = pd.DataFrame(st.session_state["trials"])
            csv_columns = [
                "Trial #",
                "Date",
                "Time",
                "Input Source",
                "Original Word Count",
                "Original Character Count",
                "Token Count",
                "Stop Words Removed",
                "Tokens After Stop-word Removal",
                "Final Token Count",
                "Unique Tokens",
                "Unique Stems",
                "Vocabulary Reduction by Stemming",
                "Tokens Reduced vs Original",
                "Token Count Reduction (%)",
                "Steps Enabled",
                "Tokenized Text",
                "After Stop-word Removal",
                "Final Stemmed Text",
            ]
            export_df = df_trials.reindex(columns=csv_columns)
            st.dataframe(export_df, use_container_width=True, hide_index=True)
            csv_data = export_df.to_csv(index=False).encode("utf-8")
            st.caption("Download the recorded experimental observations and processed outputs for further analysis or submission.")
            st.download_button(
                "Download Experimental Data (CSV)",
                data=csv_data,
                file_name="ir_pipeline_experimental_data.csv",
                mime="text/csv",
                use_container_width=True,
            )
        else:
            st.info(
                "No trials recorded yet. Process a document and click "
                "'Record Current Trial' to begin collecting experimental data."
            )


def render_multimodal_simulation_section():
    """Render the tokenization-only simulation for text, image, audio, and video."""
    st.markdown('<div class="section-kicker">04 / SIMULATION</div>', unsafe_allow_html=True)
    st.header("Multimodal Tokenization Simulation")
    st.caption("Choose one input modality and generate tokens without any additional preprocessing.")
    st.markdown(
        '<div class="callout"><strong>Active operation</strong>&nbsp;&nbsp; '
        'Input acquisition &nbsp;→&nbsp; Modality identification &nbsp;→&nbsp; Tokenization</div>',
        unsafe_allow_html=True,
    )

    input_tab1, input_tab2 = st.tabs(["Manual Text", "Upload Multimodal File"])
    with input_tab1:
        manual_text = st.text_area(
            "Enter text to tokenize:",
            value="Information Retrieval connects multimodal inputs with searchable representations.",
            height=150,
            key="multimodal_manual_text",
        )
        uploaded_file = None
    with input_tab2:
        uploaded_file = st.file_uploader(
            "Upload a text, image, audio, or video file:",
            type=[
                "txt", "pdf", "doc", "docx", "rtf",
                "png", "jpg", "jpeg", "gif", "bmp", "webp",
                "mp3", "wav", "mp4", "mov", "avi", "mkv", "webm",
            ],
            key="multimodal_file_uploader",
            help="Maximum file size: 25 MB. Media files are represented with metadata tokens only.",
        )
        if uploaded_file is not None:
            st.success(f"File loaded: **{uploaded_file.name}**")

    if uploaded_file is not None:
        raw_input, source_label, modality = acquire_document(uploaded_file, "")
    else:
        raw_input, source_label, modality = acquire_document(None, manual_text)

    if st.button("Tokenize Input", type="primary", use_container_width=True):
        if not raw_input and modality == "text":
            st.warning(source_label)
        else:
            results = tokenize_input(raw_input, source_label, modality)
            stats = calculate_statistics(results)
            st.session_state["last_results"] = results
            st.session_state["last_stats"] = stats
            st.session_state["last_source"] = source_label
            st.session_state["last_options"] = {"Tokenization": True}

    if "last_results" not in st.session_state:
        return

    results = st.session_state["last_results"]
    stats = st.session_state["last_stats"]
    st.markdown(
        f'<div class="success-banner"><strong>Tokenization complete</strong>'
        f'<span>{results["source"]}</span></div>',
        unsafe_allow_html=True,
    )
    st.subheader("Tokenization Output")
    st.write(f"**Detected modality:** {stats['Modality']}")
    st.info(results["representation"])
    if results["modality"] == "text":
        st.text_area("Input text", value=raw_input, height=140, disabled=True, key="token_input_preview")
    st.write(results["tokens"] or "No tokens were generated.")

    metric_col1, metric_col2 = st.columns(2)
    metric_col1.metric("Token Count", stats["Token Count"])
    metric_col2.metric("Unique Token Count", stats["Unique Token Count"])

    if st.button("Record Current Trial", type="primary", use_container_width=True):
        trial_record = {
            "Trial #": len(st.session_state["trials"]) + 1,
            "Date": datetime.now().strftime("%d-%m-%Y"),
            "Time": datetime.now().strftime("%H:%M:%S"),
            "Input Source": results["source"],
            "Modality": stats["Modality"],
            "Token Count": stats["Token Count"],
            "Unique Token Count": stats["Unique Token Count"],
            "Tokens": "\n".join(results["tokens"]),
            "Operation": "Tokenization only",
        }
        st.session_state["trials"].append(trial_record)
        st.toast(f"Trial #{trial_record['Trial #']} saved successfully!")

    if st.session_state["trials"]:
        st.subheader("Recorded Trials")
        st.dataframe(pd.DataFrame(st.session_state["trials"]), use_container_width=True, hide_index=True)


def render_image_tokenization():
    """Demonstrate image tokenization as fixed-size visual patches."""
    st.subheader("Image — Patch-Based Representation")
    st.markdown(
        "Image tokenization divides the image into fixed-size patches. Each patch is treated "
        "as one visual token representing a localized region of the image."
    )
    image_file = st.file_uploader("Upload a PNG, JPG, or JPEG image:", type=["png", "jpg", "jpeg"], key="image_tokenizer")
    patch_size = st.selectbox("Patch size (pixels)", [8, 16, 32], index=1, key="image_patch_size")
    if image_file is None:
        st.info("Upload an image to create visual patch tokens.")
        return

    try:
        from PIL import Image
        image = Image.open(image_file).convert("RGB")
        original_width, original_height = image.size
        width = (original_width // patch_size) * patch_size
        height = (original_height // patch_size) * patch_size
        if width < patch_size or height < patch_size:
            st.warning("The image is smaller than one patch. Choose a smaller patch size or upload a larger image.")
            return
        resized = image.resize((width, height)) if (width, height) != image.size else image
        patches = [
            resized.crop((x, y, x + patch_size, y + patch_size))
            for y in range(0, height, patch_size)
            for x in range(0, width, patch_size)
        ]
        rows = height // patch_size
        columns = width // patch_size

# ── All remaining tokens in expander ──
        if len(patches) > 10:
            with st.expander(f"View all {len(patches)} visual tokens"):
                st.image(
                    patches,
                    caption=[f"Token {i + 1}" for i in range(len(patches))],
                    width=max(patch_size * 3, 48),
                )

        # ── NEW: Conversion Visualization ──
        st.divider()
        render_image_conversion_viz(resized, patches, rows, columns, patch_size)

        st.divider()
        # ── Two-column layout: image left | features right ──
        col_img, col_info = st.columns([1, 1], gap="large")

        with col_img:
            st.markdown("**Original Image**")
            st.image(image, caption=f"{original_width} × {original_height} px", use_container_width=True)

        with col_info:
            st.markdown("**Image Features & Tokenization Info**")
            st.markdown(
                f"""
| Property | Value |
|---|---|
| Width | {original_width} px |
| Height | {original_height} px |
| Patch Size | {patch_size} × {patch_size} px |
| Patch Grid | {rows} rows × {columns} cols |
| **Total Patches** | **{len(patches)}** |
| **Visual Tokens** | **{len(patches)}** |
| Resized Width | {width} px |
| Resized Height | {height} px |
                """
            )
            st.info(
                f"Each of the **{len(patches)} patches** is treated as one visual token. "
                f"Patch size controls granularity — smaller patches → more tokens."
            )

        st.divider()

        

        # Store for PDF
        st.session_state["image_token_sample"] = {
            "patch_size": patch_size,
            "rows": rows,
            "columns": columns,
            "total_patches": len(patches),
            "filename": image_file.name,
            "dimensions": f"{original_width} × {original_height} px",
            "preview": _thumbnail(image, 600),
            "patch_previews": [patch.copy() for patch in patches[:8]],
        }

    except Exception as exc:
        st.error(f"The image could not be tokenized safely: {exc}")




def render_audio_tokenization():
    """Demonstrate audio tokenization as visible fixed-duration temporal frames."""
    st.subheader("Audio — Temporal Frame Representation")
    st.markdown(
        "Audio is a continuous signal. For this simulation, the signal is divided into "
        "fixed-duration temporal frames. Each frame is treated as a basic token-like unit "
        "representing a short segment of the audio. These are not learned semantic audio tokens."
    )
    audio_file = st.file_uploader(
        "Upload a WAV or MP3 audio file:",
        type=["wav", "mp3"],
        key="audio_tokenizer",
        help="WAV is decoded with Python's standard library. MP3 is decoded with the lightweight miniaudio dependency.",
    )
    frame_duration_ms = st.selectbox(
        "Frame duration (milliseconds)",
        [10, 20, 40],
        index=1,
        key="audio_frame_duration",
    )
    if audio_file is None:
        st.info("Upload a WAV or MP3 file to create temporal frame tokens.")
        return

    try:
        audio_bytes = audio_file.getvalue()
        is_mp3 = audio_file.name.lower().endswith(".mp3")
        if is_mp3:
            if miniaudio is None:
                st.error("MP3 decoding is unavailable because miniaudio is not installed. Install the project requirements and restart Streamlit.")
                return
            decoded = miniaudio.decode(
                audio_bytes,
                output_format=miniaudio.SampleFormat.SIGNED16,
                nchannels=2,
                sample_rate=44100,
            )
            sample_rate = decoded.sample_rate
            channels = decoded.nchannels
            sample_count = decoded.num_frames
            sample_width = 2
            pcm_bytes = decoded.samples
            playback_format = "audio/mpeg"
        else:
            with wave.open(io.BytesIO(audio_bytes), "rb") as audio:
                sample_rate = audio.getframerate()
                channels = audio.getnchannels()
                sample_count = audio.getnframes()
                sample_width = audio.getsampwidth()
                pcm_bytes = audio.readframes(sample_count)
            playback_format = "audio/wav"

        if not sample_rate or not sample_count:
            st.warning("The WAV file contains no audio samples.")
            return

        import numpy as np

        dtype_by_width = {1: np.uint8, 2: np.int16, 4: np.int32}
        if sample_width not in dtype_by_width:
            st.error(f"Unsupported WAV sample width: {sample_width} bytes.")
            return
        signal = np.frombuffer(pcm_bytes, dtype=dtype_by_width[sample_width]).astype(np.float32)
        if channels > 1:
            signal = signal[: len(signal) - (len(signal) % channels)].reshape(-1, channels).mean(axis=1)
        if sample_width == 1:
            signal = (signal - 128) / 128
        else:
            signal = signal / float(2 ** (sample_width * 8 - 1))

        duration = sample_count / sample_rate
        frame_duration_seconds = frame_duration_ms / 1000
        frame_samples = max(1, round(sample_rate * frame_duration_seconds))
        complete_frame_count = int(np.floor(duration * 1000 / frame_duration_ms))
        complete_frame_count = min(complete_frame_count, len(signal) // frame_samples)
        covered_duration = complete_frame_count * frame_duration_seconds
        remaining_duration = max(0.0, duration - covered_duration)
        token_rows = [
            {
                "Token": index + 1,
                "Start": f"{index * frame_duration_seconds:.3f} s",
                "End": f"{(index + 1) * frame_duration_seconds:.3f} s",
                "Duration": f"{frame_duration_ms} ms",
            }
            for index in range(complete_frame_count)
        ]

        
        # ── NEW: Conversion Visualization ──
        st.divider()
        render_audio_conversion_viz(signal, sample_rate, frame_duration_ms, complete_frame_count)
        st.divider()

        # ── Charts ──
        st.markdown("**Audio Signal → Temporal Frames → Token-like Units**")
        token_figure = go.Figure(
            go.Bar(
                x=[(row["Token"] - 0.5) * frame_duration_seconds for row in token_rows],
                y=[1] * len(token_rows),
                width=frame_duration_seconds * 0.92,
                marker_color="#55c7b6",
                hovertemplate="Token %{customdata}<extra></extra>",
                customdata=[row["Token"] for row in token_rows],
            )
        )
        token_figure.update_layout(
            title=f"Temporal Token Timeline ({complete_frame_count} tokens)",
            xaxis_title="Time (seconds)",
            yaxis_visible=False,
            yaxis_range=[0, 1.2],
            template="plotly_dark",
            paper_bgcolor="#192330",
            plot_bgcolor="#192330",
            font=dict(color="#dce6f2"),
            height=220,
            margin=dict(l=10, r=10, t=45, b=40),
            showlegend=False,
        )
        st.plotly_chart(token_figure, use_container_width=True)

        waveform_step = max(1, len(signal) // 4000)
        waveform = signal[::waveform_step]
        waveform_times = np.linspace(0, duration, len(waveform), endpoint=False)
        waveform_figure = go.Figure(
            go.Scattergl(x=waveform_times, y=waveform, mode="lines", line=dict(color="#f59e0b", width=1), name="Waveform")
        )
        for boundary in range(1, complete_frame_count):
            waveform_figure.add_vline(x=boundary * frame_duration_seconds, line_width=1, line_dash="dot", line_color="#55c7b6")
        waveform_figure.update_layout(
            title="Waveform with Frame Boundaries",
            xaxis_title="Time (seconds)",
            yaxis_title="Amplitude",
            template="plotly_dark",
            paper_bgcolor="#192330",
            plot_bgcolor="#192330",
            font=dict(color="#dce6f2"),
            height=300,
            margin=dict(l=10, r=10, t=45, b=40),
            showlegend=False,
        )
        
        
        

        # ── Two-column token table: first 10 left | next 10 right ──
        st.markdown("Audio Tokens")
        tok_col_left, tok_col_right = st.columns(2, gap="medium")
        first_10 = token_rows[:8]
        with tok_col_left:
            st.dataframe(pd.DataFrame(first_10), use_container_width=True, hide_index=True)
        with tok_col_right:
            st.plotly_chart(waveform_figure, use_container_width=True)


        if len(token_rows) > 20:
            with st.expander(f"View all {len(token_rows)} audio tokens"):
                st.dataframe(pd.DataFrame(token_rows), use_container_width=True, hide_index=True)
# ── Audio player ──
        st.audio(audio_bytes, format=playback_format)

        # ── Two-column layout: file info left | token stats right ──
        col_info, col_stats = st.columns([1, 1], gap="large")

        with col_info:
            st.markdown("**File Information**")
            # Truncate long filenames gracefully
            fname = audio_file.name
            fname_display = fname if len(fname) <= 40 else fname[:37] + "..."
            st.markdown(
                f"""
| Property | Value |
|---|---|
| File Name | `{fname_display}` |
| Duration | {duration:.3f} s |
| Sampling Rate | {sample_rate} Hz |
| Channels | {channels} |
                """,
                help=f"Full filename: {fname}" if len(fname) > 40 else None,
            )

        with col_stats:
            st.markdown("**Token Statistics**")
            st.markdown(
                f"""
| Property | Value |
|---|---|
| Total Duration | {duration:.3f} s |
| Complete Frames | **{complete_frame_count}** |
| Frame Duration | {frame_duration_ms} ms |
| Remaining Duration | {remaining_duration * 1000:.2f} ms |
                """
            )
            st.info(
                f"Smaller frame durations → more tokens. "
                f"The final partial frame ({remaining_duration * 1000:.2f} ms) is discarded."
            )

        # Store for PDF
        st.session_state["audio_token_sample"] = {
            "filename": fname,
            "duration": f"{duration:.3f} s",
            "sample_rate": f"{sample_rate} Hz",
            "channels": channels,
            "frame_duration_ms": frame_duration_ms,
            "total_tokens": complete_frame_count,
            "first_10": token_rows[:10],
            "waveform": signal[:: max(1, len(signal) // 2000)].astype(float).tolist(),
            "duration_s": float(duration),
            "frame_duration_s": float(frame_duration_seconds),
        }

    except Exception as exc:
        st.error(f"The audio could not be decoded safely: {exc}")




def render_video_tokenization():
    """Demonstrate video tokenization by sampling temporal visual frames."""
    st.subheader("Video — Temporal Visual Representation")
    st.markdown(
        "Video tokenization represents a video using selected frames while preserving temporal information. "
        "Each sampled frame is treated as a basic visual token for this simulation."
    )
    video_file = st.file_uploader("Upload an MP4, AVI, or MOV file:", type=["mp4", "avi", "mov"], key="video_tokenizer")
    interval = st.number_input("Sampling interval (every Nth frame)", min_value=1, max_value=300, value=10, step=1, key="video_interval")
    if video_file is None:
        st.info("Upload a video to extract selected frame tokens.")
        return
    st.caption("Smaller sampling intervals produce more video tokens, while larger intervals produce fewer tokens.")
    if interval < 1:
        st.error("Sampling interval must be at least 1 frame.")
        return
    if cv2 is None:
        st.error("OpenCV is unavailable in the active Python environment. Install opencv-python from requirements.txt and restart Streamlit.")
        return

    temp_path = None
    try:
        suffix = os.path.splitext(video_file.name)[1].lower()
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as video_handle:
            temp_path = video_handle.name
            video_handle.write(video_file.getvalue())
        # st.video(video_file.getvalue())
        capture = cv2.VideoCapture(temp_path)
        if not capture.isOpened():
            st.error("The video could not be opened. Try another MP4, AVI, or MOV file.")
            return
        fps = capture.get(cv2.CAP_PROP_FPS) or 0
        total_frames = int(capture.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
        width = int(capture.get(cv2.CAP_PROP_FRAME_WIDTH) or 0)
        height = int(capture.get(cv2.CAP_PROP_FRAME_HEIGHT) or 0)
        selected_frames = []
        selected_frame_numbers = []
        frame_index = 0
        while True:
            success, frame = capture.read()
            if not success:
                break
            frame_number = frame_index + 1
            if frame_number % int(interval) == 0:
                selected_frames.append(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
                selected_frame_numbers.append(frame_number)
            frame_index += 1
        capture.release()
        duration = total_frames / fps if fps else 0
        selected_token_count = len(selected_frames)

        
            # ── NEW: Conversion Visualization ──
        st.divider()
        render_video_conversion_viz(selected_frames, selected_frame_numbers, fps, int(interval), total_frames)
        st.divider()
        # ── Two-column info ──
        col_vid_info, col_vid_stats = st.columns([1, 1], gap="large")
        with col_vid_info:
            st.markdown("**Video Properties**")
            vname = video_file.name
            vname_display = vname if len(vname) <= 35 else vname[:32] + "..."
            st.markdown(
                f"""
| Property | Value |
|---|---|
| File | `{vname_display}` |
| Resolution | {width} × {height} px |
| FPS | {fps:.2f} |
| Total Frames | {total_frames} |
| Duration | {duration:.2f} s |
                """
            )
        with col_vid_stats:
            st.markdown("**Tokenization Result**")
            st.markdown(
                f"""
| Property | Value |
|---|---|
| Sampling Interval | Every {int(interval)}th frame |
| **Video Tokens** | **{selected_token_count}** |
                """
            )
            st.info(
                f"Video → Frame Extraction → Every {interval}th Frame → Video Tokens. "
                f"**{selected_token_count}** frames selected."
            )

        st.divider()

        if selected_frames:
            

            # ── Remaining tokens in expander ──
            if selected_token_count > 10:
                with st.expander(f"View all {selected_token_count} video token thumbnails"):
                    st.image(
                        selected_frames,
                        caption=[f"Token {i+1} · F#{fn}" for i, fn in enumerate(selected_frame_numbers)],
                        
                    )

            # Store for PDF
            st.session_state["video_token_sample"] = {
                "filename": video_file.name,
                "resolution": f"{width} × {height}",
                "fps": f"{fps:.2f}",
                "total_frames": total_frames,
                "duration": f"{duration:.2f} s",
                "interval": int(interval),
                "total_tokens": selected_token_count,
                "keyframes": [
                    _thumbnail(Image.fromarray(frame))
                    for frame in selected_frames[:: max(1, selected_token_count // 6)][:6]
                ],
                "keyframe_numbers": selected_frame_numbers[:: max(1, selected_token_count // 6)][:6],
            }
        else:
            st.warning("No frames were selected from this video.")
    except Exception as exc:
        st.error(f"The video could not be processed safely: {exc}")
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)




def render_text_tokenization_section():
    """Render text input with tokenization only."""
    st.subheader("Text")
    st.caption("Enter or upload text, then split it into tokens without any additional processing steps.")
    st.markdown("**Text → Words / Subwords → Text Tokens**")

    input_mode = st.radio("Text input method", ["Manual Text", "Upload Text Document"], horizontal=True, key="text_tokenization_mode")
    uploaded_file = None
    if input_mode == "Manual Text":
        raw_text = st.text_area(
            "Enter document text:",
            value="Information Retrieval is important.",
            height=50,
            key="text_tokenization_input",
        )
        source_label = "Manual text input"
    else:
        uploaded_file = st.file_uploader(
            "Upload a TXT, PDF, DOC, or DOCX file:",
            type=["txt", "pdf", "doc", "docx", "rtf"],
            key="text_tokenization_file",
            help="The readable text is tokenized directly. No cleaning, lowercasing, stop-word removal, or stemming is applied.",
        )
        if uploaded_file is None:
            st.info("Upload a text document to generate tokens.")
            return
        raw_text, source_label, modality = acquire_document(uploaded_file, "")
        if modality != "text" or not raw_text:
            st.error(source_label)
            return

    if st.button("Tokenize Text", type="primary", use_container_width=True):
        if not raw_text.strip():
            st.warning("Enter or upload text before tokenizing.")
            return
        tokens = tokenize_text(raw_text)
        results = {
            "raw": raw_text,
            "source": source_label,
            "modality": "text",
            "tokens": tokens,
        }
        st.session_state["text_tokenization_results"] = results

    results = st.session_state.get("text_tokenization_results")
    if results is None:
        return
    tokens = results["tokens"]

    st.divider()
    render_text_conversion_viz(tokens, results["raw"])

    st.divider()
    st.success(f"Tokenization complete: {results['source']}")
    st.text_area("Original Text", value=results["raw"], height=160, disabled=True, key="text_tokenization_output")

    # Metrics in two columns
    metric_cols = st.columns(2)
    metric_cols[0].metric("Token Count", len(tokens))
    metric_cols[1].metric("Unique Token Count", len(set(tokens)))

    # ── Two-column token display ──
    st.markdown("**Generated Text Tokens **")
    tok_left_col, tok_right_col = st.columns(2, gap="medium")
    first_10 = tokens[:10]
    second_10 = tokens[10:20]
    with tok_left_col:
        for i, tok in enumerate(first_10, 1):
            st.markdown(
                f'<div style="background:#192330;border:1px solid #2c3949;border-radius:4px;padding:4px 10px;margin-bottom:4px;font-family:monospace;font-size:.95rem;overflow-wrap:anywhere;">'
                f'<span style="color:#55c7b6;font-size:.75rem;margin-right:.5rem;">{i}</span>{tok}'
                f'</div>',
                unsafe_allow_html=True,
            )
    with tok_right_col:
        for i, tok in enumerate(second_10, 11):
            st.markdown(
                f'<div style="background:#192330;border:1px solid #2c3949;border-radius:4px;padding:4px 10px;margin-bottom:4px;font-family:monospace;font-size:.95rem;overflow-wrap:anywhere;">'
                f'<span style="color:#55c7b6;font-size:.75rem;margin-right:.5rem;">{i}</span>{tok}'
                f'</div>',
                unsafe_allow_html=True,
            )

    if len(tokens) > 20:
        with st.expander(f"View all {len(tokens)} tokens"):
            st.write(tokens)

    # ── NEW: Conversion Visualization ──

    # Store for PDF
    st.session_state["text_token_sample"] = {
        "source": results["source"],
        "total_tokens": len(tokens),
        "unique_tokens": len(set(tokens)),
        "first_10": tokens[:10],
    }



# =============================================================================
# SIMULATION CONVERSION VISUALIZATIONS
# =============================================================================


def render_text_conversion_viz(tokens: list[str], raw_text: str):
    """Interactive procedural engine showing how raw text string is scanned and converted into token structures."""
    st.markdown(
        '<div class="section-kicker" style="margin-bottom:0.4rem;">PROCEDURAL TOKEN CREATION ENGINE</div>',
        unsafe_allow_html=True,
    )
    st.markdown("###  Step-by-Step Procedural Token Creation: Text → Tokens")

    if not tokens:
        st.warning("No text tokens available.")
        return

    # Clean raw text string to single continuous line without enters/newlines
    clean_raw_text = raw_text.replace("\n", " ").replace("\r", " ")
    clean_raw_text = " ".join(clean_raw_text.split())  # collapse multiple spaces

    max_steps = min(len(tokens), 25)

    # 🎛️ SPEED KNOB & PLAYBACK CONTROLS
    ctrl_col1, ctrl_col2,  = st.columns([1, 1.5], gap="small")
    with ctrl_col1:
        auto_play = st.checkbox("▶ Auto-Play Scanner", key="text_auto_play")
    with ctrl_col2:
        speed_knob = st.select_slider(
            "Speed Knob",
            options=["0.2x", "0.5x", "1.0x", "2.0x", "5.0x"],
            value="1.0x",
            key="text_speed_knob",
        )
   
    speed_delays = {"0.2x": 0.8, "0.5x": 0.4, "1.0x": 0.2, "2.0x": 0.08, "5.0x": 0.02}
    delay = speed_delays.get(speed_knob, 0.2)

    def draw_text_step(step_idx: int):
        current_token = tokens[step_idx]
        char_start = 0
        for idx in range(step_idx):
            found_pos = clean_raw_text.find(tokens[idx], char_start)
            if found_pos != -1:
                char_start = found_pos + len(tokens[idx])
        
        current_found = clean_raw_text.find(current_token, char_start)
        if current_found != -1:
            char_start = current_found
            char_end = char_start + len(current_token)
        else:
            char_start = 0
            char_end = len(current_token)

        c1, c_mid, c2 = st.columns([1.2, 0.4, 1.2], gap="small")
        with c1:
            st.markdown("**1. Continuous Text Buffer (No Line Breaks)**")
            prefix = clean_raw_text[:char_start]
            highlighted = clean_raw_text[char_start:char_end]
            suffix = clean_raw_text[char_end:char_end + 120]

            html_buf = (
                f'<div style="background:#090d16;border:1px solid #3b82f6;border-radius:8px;padding:1rem;font-family:monospace;font-size:0.92rem;color:#94a3b8;line-height:1.6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'
                f'<span>...{prefix[-50:]}</span>'
                f'<mark style="background:#3b82f6;color:#ffffff;border-radius:4px;padding:2px 8px;font-weight:bold;box-shadow:0 0 12px #3b82f6;">{highlighted}</mark>'
                f'<span>{suffix}...</span>'
                f'</div>'
            )
            st.markdown(html_buf, unsafe_allow_html=True)
            st.caption(f"Char Range: `[{char_start}:{char_end}]` | Active Span: `'{highlighted}'`")

        with c_mid:
            st.markdown("<div style='height:28px;'></div>", unsafe_allow_html=True)
            st.markdown(
                '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;color:#60a5fa;font-family:monospace;font-size:0.75rem;padding-top:10px;">\n'
                '<div><b>SCANNED FROM</b></div>\n'
                '<div style="font-size:1.4rem;">━━━━►</div>\n'
                f'<div style="font-size:0.65rem;color:#94a3b8;">Token #{step_idx+1}</div>\n'
                '</div>',
                unsafe_allow_html=True,
            )

        with c2:
            st.markdown("**2. Generated Token Object & Vector Hash**")
            vocab_id = (hash(current_token) % 50000) + 100
            mock_embed = [round(float(np.sin(vocab_id + i * 0.5)), 3) for i in range(4)]

            st.markdown(
                f'<div style="background:#1e293b;border:2px solid #60a5fa;border-radius:8px;padding:12px;font-family:monospace;font-size:0.85rem;box-shadow:0 0 10px rgba(96,165,250,0.2);">\n'
                f'<div style="color:#60a5fa;margin-bottom:4px;font-size:0.95rem;"><b>EXTRACTED TOKEN #{step_idx+1}:</b> <span style="color:#fff;background:#3b82f6;padding:2px 6px;border-radius:4px;">"{current_token}"</span></div>\n'
                f'<div style="color:#e2e8f0;margin-top:6px;">• Generated From: <code>Raw String Pos [{char_start}:{char_end}]</code></div>\n'
                f'<div style="color:#e2e8f0;">• Vocab Table Index: <code>ID #{vocab_id}</code></div>\n'
                f'<div style="color:#94a3b8;">• Dense Vector: <code>{mock_embed}...</code></div>\n'
                f'</div>',
                unsafe_allow_html=True,
            )

        st.markdown("**3. Accumulated Token Sequence Buffer**")
        stream_html = '<div style="display:flex;flex-wrap:wrap;gap:4px;padding:8px;background:#0f172a;border-radius:6px;">'
        for i, tok in enumerate(tokens[:max_steps]):
            active_style = "background:#3b82f6;color:#fff;border:1px solid #60a5fa;transform:scale(1.05);" if i == step_idx else "background:#1e293b;color:#94a3b8;border:1px solid #334155;"
            stream_html += f'<span style="{active_style}padding:3px 8px;border-radius:12px;font-family:monospace;font-size:0.78rem;">#{i+1} {tok}</span>'
        stream_html += '</div>'
        st.markdown(stream_html, unsafe_allow_html=True)

    if auto_play:
        container = st.empty()
        import time
        for s in range(max_steps):
            with container.container():
                draw_text_step(s)
            time.sleep(delay)
    


def render_image_conversion_viz(image, patches: list, rows: int, cols: int, patch_size: int):
    """Interactive procedural engine showing how raw 2D pixels are cropped into patches and unrolled into vectors."""
    st.markdown(
        '<div class="section-kicker" style="margin-bottom:0.4rem;">PROCEDURAL TOKEN CREATION ENGINE</div>',
        unsafe_allow_html=True,
    )
    st.markdown("###  Step-by-Step Procedural Token Creation: Image → Visual Patch Tokens")

    total_patches = len(patches)
    if total_patches == 0:
        st.warning("No image patches available.")
        return

    # 🎛️ SPEED KNOB & PLAYBACK CONTROLS
    ctrl_col1, ctrl_col2 = st.columns([1.2,  1.5], gap="small")
    with ctrl_col1:
        auto_play = st.checkbox("Auto-Play Scanner", key="img_auto_play")
    with ctrl_col2:
        speed_knob = st.select_slider(
            "Speed Knob",
            options=["0.2x", "0.5x", "1.0x", "2.0x", "5.0x"],
            value="1.0x",
            key="img_speed_knob",
        )
   
    speed_delays = {"0.2x": 0.8, "0.5x": 0.4, "1.0x": 0.2, "2.0x": 0.08, "5.0x": 0.02}
    delay = speed_delays.get(speed_knob, 0.2)

    def draw_img_step(step_idx: int):
        r_idx = step_idx // cols
        c_idx = step_idx % cols
        current_patch = patches[step_idx]

        x1, y1 = c_idx * patch_size, r_idx * patch_size
        x2, y2 = x1 + patch_size, y1 + patch_size

        c1, c_mid, c2, c3 = st.columns([1, 0.3, 1, 1.2], gap="small")
        with c1:
            st.markdown(f"**1. Raw Canvas & Crop Box `({r_idx},{c_idx})`**")
            crop_overlay = image.copy()
            from PIL import ImageDraw
            draw = ImageDraw.Draw(crop_overlay)
            draw.rectangle([x1, y1, x2, y2], outline=(168, 85, 247), width=3)
            st.image(crop_overlay, use_container_width=True)
            st.caption(f"Box Coords: `[{x1}:{x2}, {y1}:{y2}]` px")

        with c_mid:
            st.markdown("<div style='height:25px;'></div>", unsafe_allow_html=True)
            st.markdown(
                '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;color:#a855f7;font-family:monospace;font-size:0.75rem;padding-top:20px;">\n'
                '<div><b>CROPPED TO</b></div>\n'
                '<div style="font-size:1.4rem;">━━━━►</div>\n'
                f'<div style="font-size:0.65rem;color:#c084fc;">Token #{step_idx+1}</div>\n'
                '</div>',
                unsafe_allow_html=True,
            )

        with c2:
            st.markdown(f"**2. Extracted Token Patch #{step_idx+1}**")
            st.image(current_patch, use_container_width=True)
            arr = np.array(current_patch, dtype=np.uint8)
            st.caption(f"Patch: `{patch_size}×{patch_size}` px")

        with c3:
            st.markdown("**3. Matrix Flattening & Linear Projection**")
            flat_vector = arr.flatten()[:8]
            vec_str = ", ".join(map(str, flat_vector))
            st.markdown(
                f'<div style="background:#1e1b4b;border:2px solid #a855f7;border-radius:6px;padding:10px;font-family:monospace;font-size:0.8rem;color:#e9d5ff;box-shadow:0 0 10px rgba(168,85,247,0.2);">\n'
                f'<div style="color:#c084fc;"><b>FLATTENED 1D VECTOR:</b></div>\n'
                f'<div style="color:#e9d5ff;margin:4px 0;">[{vec_str}, ...]</div>\n'
                f'<div style="color:#cbd5e1;font-size:0.75rem;">Dimension: <code>{patch_size*patch_size*3}</code> values</div>\n'
                f'<div style="margin-top:6px;color:#a855f7;font-size:0.75rem;"><b>Projection:</b> E = W·x + E_pos</div>\n'
                f'</div>',
                unsafe_allow_html=True,
            )

        st.markdown("**4. Emitted Visual Token Sequence**")
        p_html = '<div style="display:flex;flex-wrap:wrap;gap:4px;padding:6px;background:#0f172a;border-radius:6px;">'
        for i in range(min(total_patches, 36)):
            border = "2px solid #a855f7" if i == step_idx else "1px solid #334155"
            p_html += f'<div style="width:24px;height:24px;border:{border};border-radius:3px;background:#1e293b;display:flex;align-items:center;justify-content:center;font-size:0.6rem;color:#e2e8f0;">{i+1}</div>'
        p_html += '</div>'
        st.markdown(p_html, unsafe_allow_html=True)

    if auto_play:
        container = st.empty()
        import time
        for s in range(total_patches):
            with container.container():
                draw_img_step(s)
            time.sleep(delay)
 


def render_audio_conversion_viz(signal: np.ndarray, sample_rate: int, frame_duration_ms: int, frame_count: int):
    """Interactive procedural engine showing raw audio waveform slicing into temporal frames."""
    st.markdown(
        '<div class="section-kicker" style="margin-bottom:0.4rem;">PROCEDURAL TOKEN CREATION ENGINE</div>',
        unsafe_allow_html=True,
    )
    st.markdown("###  Step-by-Step Procedural Token Creation: Audio → Temporal Frame Tokens")

    if frame_count == 0:
        st.warning("No audio frames available.")
        return

    frame_samples = max(1, round(sample_rate * frame_duration_ms / 1000))
    display_frames = min(frame_count, 50)

    # 🎛️ SPEED KNOB & PLAYBACK CONTROLS
    ctrl_col1, ctrl_col2 = st.columns([1.2,1.5], gap="small")
    with ctrl_col1:
        auto_play = st.checkbox(" Auto-Play Scanner", key="aud_auto_play")
    with ctrl_col2:
        speed_knob = st.select_slider(
            "Speed Knob",
            options=["0.2x", "0.5x", "1.0x", "2.0x", "5.0x"],
            value="1.0x",
            key="aud_speed_knob",
        )
    
    speed_delays = {"0.2x": 0.8, "0.5x": 0.4, "1.0x": 0.2, "2.0x": 0.08, "5.0x": 0.02}
    delay = speed_delays.get(speed_knob, 0.2)

    def draw_audio_step(step_idx: int):
        start_sample = step_idx * frame_samples
        end_sample = min(start_sample + frame_samples, len(signal))
        chunk = signal[start_sample:end_sample]

        t_start = start_sample / sample_rate
        t_end = end_sample / sample_rate

        c1, c_mid, c2 = st.columns([1.2, 0.4, 1.2], gap="small")
        with c1:
            st.markdown(f"**1. Sliding Waveform Window `[{t_start:.3f}s : {t_end:.3f}s]`**")
            wstep = max(1, len(signal) // 2000)
            waveform = signal[::wstep]
            wt = np.linspace(0, len(signal) / sample_rate, len(waveform), endpoint=False)

            fig_win = go.Figure()
            fig_win.add_vrect(x0=t_start, x1=t_end, fillcolor="rgba(45,212,191,0.35)", line=dict(color="#2dd4bf", width=2))
            fig_win.add_trace(go.Scatter(x=wt, y=waveform, mode="lines", line=dict(color="#64748b", width=1)))
            fig_win.update_layout(
                margin=dict(l=10, r=10, t=10, b=25), height=140,
                xaxis_title="Time (s)", yaxis_visible=False,
                template="plotly_dark", paper_bgcolor="#0f172a", plot_bgcolor="#0f172a",
            )
            st.plotly_chart(fig_win, use_container_width=True)

        with c_mid:
            st.markdown("<div style='height:28px;'></div>", unsafe_allow_html=True)
            st.markdown(
                '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;color:#2dd4bf;font-family:monospace;font-size:0.75rem;padding-top:20px;">\n'
                '<div><b>WINDOW SLICED</b></div>\n'
                '<div style="font-size:1.4rem;">━━━━►</div>\n'
                f'<div style="font-size:0.65rem;color:#99f6e4;">Token #{step_idx+1}</div>\n'
                '</div>',
                unsafe_allow_html=True,
            )

        with c2:
            st.markdown(f"**2. Generated Audio Token #{step_idx+1} & FFT Vector**")
            rms = float(np.sqrt(np.mean(chunk ** 2))) if len(chunk) > 0 else 0.0
            sample_preview = [round(float(s), 3) for s in chunk[:5]]

            st.markdown(
                f'<div style="background:#042f2e;border:2px solid #2dd4bf;border-radius:8px;padding:12px;font-family:monospace;font-size:0.82rem;color:#ccfbf1;box-shadow:0 0 10px rgba(45,212,191,0.2);">\n'
                f'<div style="color:#5eead4;margin-bottom:4px;"><b>PCM CHUNK SAMPLE BUFFER:</b></div>\n'
                f'<div style="color:#5eead4;margin:4px 0;">{sample_preview}... ({len(chunk)} samples)</div>\n'
                f'<div>• Window Duration: <code>{frame_duration_ms} ms</code></div>\n'
                f'<div>• Frame RMS Energy: <code>{rms:.4f}</code></div>\n'
                f'<div style="color:#99f6e4;margin-top:4px;"><b>Feature Vector:</b> FFT Magnitude Bins</div>\n'
                f'</div>',
                unsafe_allow_html=True,
            )

        st.markdown("**3. Emitted Audio Frame Tokens**")
        a_html = '<div style="display:flex;flex-wrap:wrap;gap:4px;padding:6px;background:#0f172a;border-radius:6px;">'
        for i in range(display_frames):
            bg = "#2dd4bf;color:#042f2e;font-weight:bold;" if i == step_idx else "#1e293b;color:#94a3b8;"
            a_html += f'<span style="background:{bg}padding:2px 6px;border-radius:4px;font-family:monospace;font-size:0.75rem;">🎵 F{i+1}</span>'
        a_html += '</div>'
        st.markdown(a_html, unsafe_allow_html=True)

    if auto_play:
        container = st.empty()
        import time
        for s in range(display_frames):
            with container.container():
                draw_audio_step(s)
            time.sleep(delay)
    


def render_video_conversion_viz(selected_frames: list, selected_frame_numbers: list[int], fps: float, interval: int, total_frames: int):
    """Interactive procedural engine showing video stream temporal sampling and keyframe extraction."""
    st.markdown(
        '<div class="section-kicker" style="margin-bottom:0.4rem;">PROCEDURAL TOKEN CREATION ENGINE</div>',
        unsafe_allow_html=True,
    )
    st.markdown("###  Step-by-Step Procedural Token Creation: Video Stream → Keyframe Tokens")

    token_count = len(selected_frames)
    if token_count == 0:
        st.warning("No video frames available.")
        return

    # 🎛️ SPEED KNOB & PLAYBACK CONTROLS
    ctrl_col1, ctrl_col2 = st.columns([1.2, 1.5], gap="small")
    with ctrl_col1:
        auto_play = st.checkbox(" Auto-Play Scanner", key="vid_auto_play")
    with ctrl_col2:
        speed_knob = st.select_slider(
            " Speed Knob",
            options=["0.2x", "0.5x", "1.0x", "2.0x", "5.0x"],
            value="1.0x",
            key="vid_speed_knob",
        )
 
    speed_delays = {"0.2x": 0.8, "0.5x": 0.4, "1.0x": 0.2, "2.0x": 0.08, "5.0x": 0.02}
    delay = speed_delays.get(speed_knob, 0.2)

    def draw_video_step(step_idx: int):
        current_frame = selected_frames[step_idx]
        current_fnum = selected_frame_numbers[step_idx]
        time_offset = (current_fnum / fps) if fps else 0

        # Top Section: Horizontal Scrolling Filmstrip Timeline
        st.markdown("**1. Continuous Video Frame Stream Filmstrip & Active Shutter**")
        strip_html = '<div style="display:flex;overflow-x:auto;gap:6px;padding:8px;background:#090d16;border:1px solid #f59e0b;border-radius:8px;align-items:center;">'
        for idx, fn in enumerate(selected_frame_numbers[:20]):
            is_active = (idx == step_idx)
            border_style = "border:3px solid #f59e0b;transform:scale(1.1);box-shadow:0 0 10px #f59e0b;" if is_active else "border:1px solid #334155;opacity:0.6;"
            bg_badge = "background:#f59e0b;color:#000;" if is_active else "background:#1e293b;color:#94a3b8;"
            strip_html += (
                f'<div style="flex:0 0 auto;text-align:center;padding:4px;border-radius:6px;{border_style}">\n'
                f'<div style="font-size:0.65rem;font-family:monospace;{bg_badge}padding:1px 4px;border-radius:2px;margin-bottom:2px;">F#{fn}</div>\n'
                f'<div style="font-size:0.6rem;color:#fde68a;">🎬 T{idx+1}</div>\n'
                f'</div>'
            )
        strip_html += '</div>'
        st.markdown(strip_html, unsafe_allow_html=True)

        st.markdown("<div style='height:10px;'></div>", unsafe_allow_html=True)

        c1, c_mid, c2 = st.columns([1.5, 0.3, 1.2], gap="small")
        with c1:
            st.markdown(f"**2. Active Keyframe (Frame #{current_fnum})**")
            from PIL import Image as PILImage
            pil_img = PILImage.fromarray(current_frame)
            st.image(pil_img, use_container_width=True)
            st.caption(f"Timestamp: `{time_offset:.2f}s` | Interval: `Frame % {interval} == 0`")

        with c_mid:
            st.markdown("<div style='height:25px;'></div>", unsafe_allow_html=True)
            st.markdown(
                '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;color:#f59e0b;font-family:monospace;font-size:0.75rem;padding-top:20px;">\n'
                '<div><b>SAMPLED</b></div>\n'
                '<div style="font-size:1.4rem;">━━━━►</div>\n'
                f'<div style="font-size:0.65rem;color:#fde68a;">Token #{step_idx+1}</div>\n'
                '</div>',
                unsafe_allow_html=True,
            )

        with c2:
            st.markdown("**3. Space-Time Token Matrix Metadata**")
            arr = np.array(current_frame, dtype=np.uint8)
            mean_rgb = [round(float(arr[:, :, i].mean()), 1) for i in range(3)]

            st.markdown(
                f'<div style="background:#451a03;border:2px solid #f59e0b;border-radius:8px;padding:12px;font-family:monospace;font-size:0.83rem;color:#fef3c7;box-shadow:0 0 10px rgba(245,158,11,0.2);">\n'
                f'<div style="color:#fde68a;font-size:0.95rem;"><b>KEYFRAME TOKEN #{step_idx+1}:</b></div>\n'
                f'<div style="margin-top:4px;">• Frame Index: <code>Frame {current_fnum} / {total_frames}</code></div>\n'
                f'<div>• Resolution: <code>{arr.shape[1]}×{arr.shape[0]} px</code></div>\n'
                f'<div>• RGB Channel Means: <code>{mean_rgb}</code></div>\n'
                f'<div style="color:#f59e0b;margin-top:6px;"><b>Space-Time Embedding:</b> Tubelet Slicing → 1D Vector</div>\n'
                f'</div>',
                unsafe_allow_html=True,
            )

        

    if auto_play:
        container = st.empty()
        import time
        for s in range(token_count):
            with container.container():
                draw_video_step(s)
            time.sleep(delay)
    


def render_unified_simulation_section():
    """Present the preserved text pipeline alongside the three multimodal demonstrations."""
    st.markdown('<div class="section-kicker">04 / SIMULATION</div>', unsafe_allow_html=True)
    st.header("Multimodal Tokenization Overview")
    st.caption("Different input types use different tokenization strategies for machine-processable representations.")
    overview = st.columns(4)
    overview[0].markdown("**TEXT**\n\nInput → Words/Subwords → Text Tokens")
    overview[1].markdown("**IMAGE**\n\nInput → Image Patches → Visual Tokens")
    overview[2].markdown("**AUDIO**\n\nInput → Time Frames → Audio Frames/Tokens")
    overview[3].markdown("**VIDEO**\n\nInput → Frames → Temporal/Visual Tokens")
    text_tab, image_tab, audio_tab, video_tab = st.tabs(["Text", "Image", "Audio", "Video"])
    with text_tab:
        render_text_tokenization_section()
    with image_tab:
        render_image_tokenization()
    with audio_tab:
        render_audio_tokenization()
    with video_tab:
        render_video_tokenization()


def render_quiz_section():
    """Renders Section 3 — Self-Grading IR Concept Assessment Quiz."""
    st.markdown('<div class="section-kicker">06 / QUIZ</div>', unsafe_allow_html=True)
    st.header("Quiz")
    st.caption("Use this checkpoint to test your understanding of the transformations you just observed.")
    st.markdown(
        f'<div class="callout"><strong>Question bank: {len(QUIZ_QUESTIONS)} · Fetched for this attempt: 5</strong>'
        '&nbsp;&nbsp; Select one answer for each question, then submit once for grading.</div>',
        unsafe_allow_html=True,
    )
    st.write(
        "Answer the following 5 questions about Information Retrieval and document preprocessing. "
        "Submit to receive instant grading and explanations."
    )

    quiz_questions = st.session_state.get("quiz_questions", get_shuffled_quiz_questions())
    st.session_state["quiz_questions"] = quiz_questions

    with st.form("ir_lab_quiz_form"):
        user_responses = {}
        for display_number, q in enumerate(quiz_questions, start=1):
            st.subheader(f"Question {display_number}")
            st.write(q["question"])
            selected = st.radio(
                label=f"Options for Question {display_number}:",
                options=q["options"],
                index=None,
                key=f"quiz_radio_{q['id']}",
                label_visibility="collapsed",
            )
            user_responses[q["id"]] = None if selected is None else q["options"].index(selected)
            st.divider()

        submitted = st.form_submit_button("Submit Quiz for Grading", type="primary")

    if submitted:
        unanswered = [
            display_number
            for display_number, q in enumerate(quiz_questions, start=1)
            if user_responses.get(q["id"]) is None
        ]
        if unanswered:
            st.warning(
                f"Please select an answer for Question(s): {', '.join(map(str, unanswered))} before submitting."
            )
            st.session_state["quiz_submitted"] = False
            return

        score = 0
        st.session_state["quiz_answers"] = user_responses
        st.session_state["quiz_submitted"] = True

        st.subheader("Evaluation Results")
        for display_number, q in enumerate(quiz_questions, start=1):
            user_ans = user_responses.get(q["id"])
            correct_ans = q["answer_index"]
            if user_ans == correct_ans:
                score += 1
                st.success(f"**Question {display_number}: Correct! ✓**")
            else:
                st.error(
                    f"**Question {display_number}: Incorrect.** *(Your answer: {q['options'][user_ans]})*\n\n"
                    f"**Correct Answer:** {q['options'][correct_ans]}"
                )

        st.session_state["quiz_score"] = score
        perc = (score / len(quiz_questions)) * 100
        st.markdown(
            f'<div class="success-banner"><strong>Quiz Score: {score} / {len(quiz_questions)}</strong><span>{perc:.0f}% complete</span></div>',
            unsafe_allow_html=True,
        )

    elif st.session_state.get("quiz_submitted", False):
        st.success(
            f"Quiz already submitted. Current score: "
            f"**{st.session_state.get('quiz_score', 0)} / {len(st.session_state.get('quiz_questions', []))}**"
        )


def render_report_section():
    """Renders Section 4 — Lab Report Generator with PDF Export."""
    st.markdown('<div class="section-kicker">07 / REPORT & OBSERVATIONS</div>', unsafe_allow_html=True)
    st.header("Report / Observations")
    st.caption("Assemble your trial evidence, observations, and assessment result into the official lab report.")
    st.markdown(
        '<div class="callout"><strong>Report contents</strong>&nbsp;&nbsp; Student details · Trials · Observations · Quiz result · PDF export</div>',
        unsafe_allow_html=True,
    )
    st.write(
        "Enter your student details, add your observations, then download your official PDF lab report."
    )

    col1, col2, col3 = st.columns(3)
    with col1:
        student_name = st.text_input(
            "Student Name",
            value=st.session_state["student_info"].get("name", ""),
        )
    with col2:
        student_id = st.text_input(
            "Roll Number",
            value=st.session_state["student_info"].get("id", "2"),
        )
    with col3:
        lab_date = st.date_input("Experiment Date", value=datetime.now())

    st.session_state["student_info"]["name"] = student_name
    st.session_state["student_info"]["id"] = student_id
    st.session_state["student_info"]["date"] = str(lab_date)

    st.subheader("1. Observations & Discussion")
    default_notes = (
        "The multimodal tokenization experiment represented text, image, audio, and video inputs "
        "as tokens. No cleaning, normalization, stop-word removal, stemming, OCR, transcription, "
        "or video analysis was applied."
    )
    student_notes = st.text_area(
        "Enter your interpretation of the experimental results, observations, and conclusions:",
        value=st.session_state.get("student_notes", default_notes),
        height=140,
    )
    st.session_state["student_notes"] = student_notes

    trials_df = (
        pd.DataFrame(st.session_state["trials"])
        if st.session_state["trials"]
        else pd.DataFrame()
    )

    st.divider()
    st.subheader("2. Report Preview")
    st.write(f"**Experiment:** {EXPERIMENT_CONFIG['title']}")
    st.write("**Contributors:** Moneet Bhiwandkar and Sanjay Aski")
    st.write(
        f"**Student:** {student_name or '—'} | **Roll No.:** {student_id or '—'} | **Date:** {lab_date}"
    )
    st.markdown(
        f'<div class="callout"><strong>Quiz score</strong><br>'
        f'{st.session_state.get("quiz_score", 0)} / {len(st.session_state.get("quiz_questions", []))} &nbsp;·&nbsp; '
        f'<strong>Recorded trials</strong><br>{len(trials_df)}</div>',
        unsafe_allow_html=True,
    )

    if not trials_df.empty:
        st.dataframe(trials_df, hide_index=True, use_container_width=True)
    else:
        st.markdown(
            '<div class="callout"><strong>No simulation trials recorded yet</strong><br>'
            'Run the simulation and record your first trial to add experimental evidence to this report.</div>',
            unsafe_allow_html=True,
        )

    # Collect token samples from recorded / executed simulations
    token_samples = {}
    if "text_token_sample" in st.session_state:
        token_samples["text"] = st.session_state["text_token_sample"]
    if "audio_token_sample" in st.session_state:
        token_samples["audio"] = st.session_state["audio_token_sample"]
    if "image_token_sample" in st.session_state:
        token_samples["image"] = st.session_state["image_token_sample"]
    if "video_token_sample" in st.session_state:
        token_samples["video"] = st.session_state["video_token_sample"]

    st.subheader("3. Theory Visual Examples")
    st.caption(
        "The same visual outputs shown in Theory are included in the report. "
        "Lowest granularity sample: 32 x 32 px image patches, 40 ms audio frames, and every 4th video frame."
    )
    report_visuals = build_theory_visuals()
    visual_columns = st.columns(2)
    for visual_column, (visual_name, visual_image) in zip(visual_columns * 2, report_visuals.items()):
        with visual_column:
            st.image(visual_image, caption=f"Theory output: {visual_name.title()}", use_container_width=True)

    # Generate PDF
    quiz_total = len(st.session_state.get("quiz_questions", get_shuffled_quiz_questions()))
    pdf_bytes = generate_pdf_report(
        student_name=student_name,
        student_id=student_id,
        date_str=str(lab_date),
        trials_df=trials_df,
        quiz_score=st.session_state.get("quiz_score", 0),
        quiz_total=quiz_total,
        student_notes=student_notes,
        token_samples=token_samples if token_samples else None,
    )

    # Write to disk for static link access
    os.makedirs("static", exist_ok=True)
    with open("static/lab_report.pdf", "wb") as f:
        f.write(pdf_bytes)
    with open("lab_report.pdf", "wb") as f:
        f.write(pdf_bytes)


    st.divider()
    st.subheader("4. Download Official Lab Report (.pdf)")
    col_btn1, col_btn2 = st.columns(2)
    with col_btn1:
        st.link_button(
            "Open / Download PDF Document",
            url="/app/static/lab_report.pdf",
            type="primary",
            use_container_width=True,
        )
    with col_btn2:
        st.download_button(
            label="Download lab_report.pdf",
            data=pdf_bytes,
            file_name="lab_report.pdf",
            mime="application/pdf",
            key="stream_pdf_btn",
            use_container_width=True,
        )


# =============================================================================
# 5. SESSION STATE INITIALISATION
# =============================================================================

def init_session_state():
    """Initializes all required Streamlit session state variables."""
    defaults = {
        "trials": [],
        "quiz_answers": {},
        "quiz_submitted": False,
        "quiz_score": 0,
        "quiz_questions": get_shuffled_quiz_questions(),
        "student_info": {"name": "", "id": "2", "date": str(datetime.now().date())},
        "student_notes": "",
    }
    for key, val in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = val


# =============================================================================
# 6. MAIN ENTRYPOINT
# =============================================================================

def main():
    st.set_page_config(
        page_title="Virtual Lab — Multimodal Tokenization for IR",
        page_icon="🔬",
        layout="wide",
    )

    init_session_state()
    apply_ui_styles()

    # ---- Experiment Header ----
    

    # ---- Sidebar Navigation ----
    section = st.sidebar.radio(
        "Navigate",
        options=[
            "Purpose",
            "Theory",
            "Simulation",
            "Quiz",
            "Report / Observations",
            "References",
        ],
    )

    st.sidebar.divider()
    st.sidebar.subheader("Session progress")
    st.sidebar.write(f"**Trials recorded**  {len(st.session_state['trials'])}")
    quiz_status = "Done ✓" if st.session_state.get("quiz_submitted", False) else "Pending"
    st.sidebar.write(f"**Quiz status**  {quiz_status}")
    if st.session_state.get("quiz_submitted", False):
        st.sidebar.write(f"**Quiz score**  {st.session_state.get('quiz_score', 0)} / {len(st.session_state.get('quiz_questions', []))}")

    # ---- Section Dispatcher ----
    if section == "Purpose":
        render_aim_section()
    elif section == "Theory":
        render_theory_section()
    elif section == "Simulation":
        render_unified_simulation_section()
    elif section == "Quiz":
        render_quiz_section()
    elif section == "Report / Observations":
        render_report_section()
    elif section == "References":
        render_references_section()

if __name__ == "__main__":
    main()
