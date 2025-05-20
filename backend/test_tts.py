import logging
import sys

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

# Import the TTS service
try:
    from documents.tts_service import tts_service
    print("TTS service imported successfully")
except Exception as e:
    print(f"Error importing TTS service: {str(e)}")
    sys.exit(1)

# Test getting available voices
try:
    voices = tts_service.get_available_voices()
    print(f"Available voices: {len(voices['windows_sapi'])} Windows SAPI voices, {len(voices['pyttsx3'])} pyttsx3 voices")
except Exception as e:
    print(f"Error getting available voices: {str(e)}")

# Test text-to-speech conversion
try:
    print("Testing Windows SAPI TTS...")
    audio_file = tts_service.text_to_speech_windows_sapi(
        text="This is a test of the Windows SAPI text to speech system.",
        language="en-us"
    )
    print(f"Generated audio file with Windows SAPI: {audio_file}")
except Exception as e:
    print(f"Error with Windows SAPI TTS: {str(e)}")

try:
    print("Testing pyttsx3 TTS...")
    audio_file = tts_service.text_to_speech_pyttsx3(
        text="This is a test of the pyttsx3 text to speech system.",
        language="en"
    )
    print(f"Generated audio file with pyttsx3: {audio_file}")
except Exception as e:
    print(f"Error with pyttsx3 TTS: {str(e)}")

try:
    print("Testing gTTS (online) TTS...")
    audio_file = tts_service.text_to_speech_gtts(
        text="This is a test of the Google text to speech system.",
        language="en"
    )
    print(f"Generated audio file with gTTS: {audio_file}")
except Exception as e:
    print(f"Error with gTTS TTS: {str(e)}")

print("TTS testing complete")
