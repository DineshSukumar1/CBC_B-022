from pydantic import BaseModel, Field, validator
import re

class VoiceRequest(BaseModel):
    """Model for voice input request"""
    audio: str = Field(..., description="Base64 encoded audio data")

    @validator('audio')
    def validate_audio(cls, v):
        if not v:
            raise ValueError("Audio data is required")
        
        # Clean the base64 string
        v = v.strip()
        if ',' in v:
            # Remove data URL prefix if present
            v = v.split(',')[1]
            
        # Check if it's valid base64
        try:
            # Add padding if needed
            padding = len(v) % 4
            if padding:
                v += '=' * (4 - padding)
                
            # Try to decode
            import base64
            base64.b64decode(v)
        except Exception as e:
            raise ValueError(f"Invalid base64 audio data: {str(e)}")
            
        return v 