from pydantic import BaseModel
from typing import List

class ConsumptionRecord(BaseModel):
    partId: int
    quantity: int
    createdAt: str

class PartStock(BaseModel):
    id: int
    name: str
    stock: int
    minThreshold: int
    consumptions: List[ConsumptionRecord]

class PredictionRequest(BaseModel):
    parts: List[PartStock]
