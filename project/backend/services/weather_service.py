import os
import requests
from datetime import datetime
from models.weather import WeatherData

# Weather API configuration
OPENWEATHER_API_KEY = "2c25d6744043a533b6ae37dfdec96eb4"  # Using the provided API key
BASE_URL = "https://api.openweathermap.org/data/2.5/weather"

async def get_weather(lat: float, lon: float) -> WeatherData:
    """Get weather data from OpenWeather API"""
    if not lat or not lon:
        raise ValueError("Latitude and longitude are required")
        
    try:
        # Make API request
        params = {
            "lat": lat,
            "lon": lon,
            "appid": OPENWEATHER_API_KEY,
            "units": "metric"  # Use metric units
        }
        
        response = requests.get(BASE_URL, params=params)
        response.raise_for_status()  # Raise exception for bad status codes
        
        data = response.json()
        
        # Extract weather data
        weather_data = WeatherData(
            temperature=float(data["main"]["temp"]),
            humidity=float(data["main"]["humidity"]),
            windSpeed=float(data["wind"]["speed"]),
            description=str(data["weather"][0]["description"]),
            city=str(data["name"]),
            country=str(data["sys"]["country"]),
            timestamp=datetime.fromtimestamp(data["dt"]).isoformat()
        )
        
        return weather_data
        
    except requests.exceptions.RequestException as e:
        print(f"Error fetching weather data: {str(e)}")
        raise Exception(f"Failed to fetch weather data: {str(e)}")
    except (KeyError, ValueError) as e:
        print(f"Error parsing weather data: {str(e)}")
        raise Exception(f"Failed to parse weather data: {str(e)}")
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        raise Exception(f"Failed to get weather data: {str(e)}") 