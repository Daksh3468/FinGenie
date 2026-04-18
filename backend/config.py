"""
config.py
---------
Configuration and setup for the FinGenie FastAPI application.
"""

import logging
import sys
from dotenv import load_dotenv
import os

load_dotenv()


def setup_logging():
    """Configure structured logging for FastAPI app."""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout),
        ]
    )
    return logging.getLogger(__name__)


logger = setup_logging()

# Groq API Configuration (used across services)
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    logger.warning("GROQ_API_KEY not set in environment variables")

# CORS Configuration
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173"
).split(",")
