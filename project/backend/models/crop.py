from pydantic import BaseModel
from typing import Optional

class Crop(BaseModel):
    id: str
    name: str
    kannada_name: str
    description: str
    kannada_description: str
    temperature_range: tuple[float, float]
    humidity_range: tuple[float, float]
    rainfall_range: tuple[float, float]
    soil_moisture_range: tuple[float, float]
    growing_season: str
    kannada_growing_season: str
    image_url: Optional[str] = None 