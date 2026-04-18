from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import os
import logging
from routers.analysis import router as analysis_router
from routers.chat import router as chat_router
from routers.report import router as report_router

load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="FinGenie API",
    description="AI-powered financial document analysis — upload PDFs, Excel, or CSV files to get KPIs, risk flags, trends, and plain-language summaries.",
    version="1.0.0",
)

# CORS — read from environment
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Catch all unhandled exceptions and return structured error."""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error. Please try again later.",
            "error_id": id(exc)  # For logging correlation
        }
    )

app.include_router(analysis_router)
app.include_router(chat_router)
app.include_router(report_router) 


@app.get("/")
async def root():
    return {"message": "Welcome to FinGenie API. Visit /docs for API documentation."}
