import requests
import json
import sys
import os

print(f"Python version: {sys.version}")
print(f"Current directory: {os.getcwd()}")

# Test the TTS endpoint
url = "http://localhost:8000/api/documents/2/tts/"
data = {
    "text": "Hello world",
    "language": "en"
}

try:
    print(f"Sending request to {url}")
    response = requests.post(url, data=data)
    print(f"Status code: {response.status_code}")
    if response.status_code != 200:
        print(f"Error: {response.text}")
    else:
        print("Success! Audio data received.")
except Exception as e:
    print(f"Exception: {e}")

# Let's also try to import gTTS directly to test if it works
try:
    from gtts import gTTS
    print("Successfully imported gTTS")

    # Try to create a simple TTS file
    try:
        tts = gTTS(text="Hello world", lang="en")
        print("Successfully created gTTS instance")
    except Exception as e:
        print(f"Error creating gTTS instance: {e}")
except ImportError as e:
    print(f"Error importing gTTS: {e}")
