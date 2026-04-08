from pydantic import BaseModel
from typing import Optional


class KPI(BaseModel):
    name: str
    value: Optional[float] = None
    formatted_value: str
    trend: str  # "up", "down", "stable"
    status: str  # "good", "warning", "danger"
    description: str


class Risk(BaseModel):
    risk: str
    severity: str  # "low", "medium", "high", "critical"
    description: str
    mitigation: Optional[str] = None


class Trend(BaseModel):
    metric: str
    direction: str  # "up", "down", "stable"
    magnitude: Optional[float] = None
    period: str


class AnalysisResponse(BaseModel):
    statement_type: str
    raw_data: list[dict]
    column_headers: list[str]
    kpis: list[KPI]
    risks: list[Risk]
    trends: list[Trend]
    summary: str
    recommendations: list[str]
    parsing_mode: str  # "table" or "text"
    raw_text: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    message: str
