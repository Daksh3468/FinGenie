from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers.analysis import router as analysis_router
from routers.chat import router as chat_router


load_dotenv()

app = FastAPI(
    title="FinGenie API",
    description="AI-powered financial document analysis — upload PDFs, Excel, or CSV files to get KPIs, risk flags, trends, and plain-language summaries.",
    version="1.0.0",
)

# CORS — allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analysis_router)
app.include_router(chat_router)

@app.get("/")
async def root():
    return {"message": "Welcome to FinGenie API. Visit /docs for API documentation."}
