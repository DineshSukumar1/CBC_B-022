from pydantic import BaseModel

class WeatherData(BaseModel):
    """Model for weather data"""
    temperature: float
    humidity: float
    windSpeed: float
    description: str
    city: str
    country: str
    timestamp: str 