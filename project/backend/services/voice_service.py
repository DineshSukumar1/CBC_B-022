import io
import base64
import speech_recognition as sr
from gtts import gTTS

async def process_voice_input(audio_data: str) -> str:
    """Process voice input and return response"""
    try:
        # Validate input
        if not audio_data:
            raise ValueError("Audio data is required")
            
        # Clean the base64 string
        audio_data = audio_data.strip()
        if ',' in audio_data:
            # Remove data URL prefix if present
            audio_data = audio_data.split(',')[1]
            
        # Add padding if needed
        padding = len(audio_data) % 4
        if padding:
            audio_data += '=' * (4 - padding)
            
        try:
            # Decode audio data
            audio_bytes = base64.b64decode(audio_data)
        except Exception as e:
            raise ValueError(f"Invalid base64 audio data: {str(e)}")
        
        # Convert to speech
        recognizer = sr.Recognizer()
        try:
            with sr.AudioFile(io.BytesIO(audio_bytes)) as source:
                audio = recognizer.record(source)
                text = recognizer.recognize_google(audio)
        except Exception as e:
            raise ValueError(f"Failed to recognize speech: {str(e)}")
        
        # Process the text and generate response
        response_text = f"I understood: {text}"
        
        # Convert response to speech
        try:
            tts = gTTS(text=response_text, lang='en')
            audio_buffer = io.BytesIO()
            tts.write_to_fp(audio_buffer)
            audio_buffer.seek(0)
            
            # Encode audio response
            audio_response = base64.b64encode(audio_buffer.read()).decode()
            return audio_response
        except Exception as e:
            raise ValueError(f"Failed to generate speech response: {str(e)}")
            
    except ValueError as e:
        print(f"Validation error: {str(e)}")
        raise
    except Exception as e:
        print(f"Error processing voice input: {str(e)}")
        raise Exception(f"Failed to process voice input: {str(e)}") 