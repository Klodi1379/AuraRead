"""
Enhanced Text-to-Speech service with multiple fallback options
"""
import os
import tempfile
import logging
import threading
import platform
import requests
import json
import base64
from urllib.parse import urlencode
import time

# For direct Windows SAPI access
if platform.system() == 'Windows':
    try:
        import win32com.client
        import pyttsx3
        WINDOWS_TTS_AVAILABLE = True
    except ImportError:
        WINDOWS_TTS_AVAILABLE = False
else:
    WINDOWS_TTS_AVAILABLE = False
    try:
        import pyttsx3
        PYTTSX3_AVAILABLE = True
    except ImportError:
        PYTTSX3_AVAILABLE = False

# Get an instance of a logger
logger = logging.getLogger(__name__)

class EnhancedTTSService:
    """
    Enhanced Text-to-Speech service with multiple fallback options
    """

    def __init__(self):
        """Initialize the TTS service with multiple engines"""
        self._pyttsx3_engine = None
        self._pyttsx3_lock = threading.Lock()
        self._sapi_lock = threading.Lock()

        # Initialize Windows SAPI if available
        self._sapi_voice = None
        if WINDOWS_TTS_AVAILABLE:
            try:
                logger.debug("Initializing Windows SAPI")
                self._sapi_voice = win32com.client.Dispatch("SAPI.SpVoice")
                logger.debug("Windows SAPI initialized successfully")
            except Exception as e:
                logger.error(f"Error initializing Windows SAPI: {str(e)}")
                self._sapi_voice = None

    def _get_pyttsx3_engine(self):
        """Get or initialize the pyttsx3 engine"""
        if not WINDOWS_TTS_AVAILABLE and not PYTTSX3_AVAILABLE:
            return None

        with self._pyttsx3_lock:
            if self._pyttsx3_engine is None:
                try:
                    logger.debug("Initializing pyttsx3 engine")
                    self._pyttsx3_engine = pyttsx3.init()
                except Exception as e:
                    logger.error(f"Error initializing pyttsx3 engine: {str(e)}")
                    return None
            return self._pyttsx3_engine

    def text_to_speech_pyttsx3(self, text, language=None, output_file=None):
        """Convert text to speech using pyttsx3"""
        try:
            engine = self._get_pyttsx3_engine()
            if engine is None:
                raise Exception("Failed to initialize pyttsx3 engine")

            # Create a temporary file if output_file is not provided
            if output_file is None:
                fd, output_file = tempfile.mkstemp(suffix='.mp3')
                os.close(fd)

            # Set voice properties if language is provided
            if language:
                voices = engine.getProperty('voices')
                for voice in voices:
                    # Try to match language code or name
                    if language.lower() in voice.id.lower() or language.lower() in voice.name.lower():
                        engine.setProperty('voice', voice.id)
                        logger.debug(f"Set voice to {voice.name} for language {language}")
                        break

            # Set speech rate (default is 200)
            engine.setProperty('rate', 150)

            # Generate speech
            logger.debug(f"Generating speech with pyttsx3 to {output_file}")
            engine.save_to_file(text, output_file)
            engine.runAndWait()

            # Verify the file was created
            if not os.path.exists(output_file) or os.path.getsize(output_file) == 0:
                raise Exception("Generated audio file is empty or does not exist")

            return output_file

        except Exception as e:
            logger.error(f"Error in pyttsx3 TTS conversion: {str(e)}")
            if output_file and os.path.exists(output_file):
                try:
                    os.remove(output_file)
                except:
                    pass
            raise

    def text_to_speech_windows_sapi(self, text, language=None, voice_name=None, output_file=None):
        """Convert text to speech using Windows SAPI"""
        if not WINDOWS_TTS_AVAILABLE:
            raise Exception("Windows SAPI is not available on this system")

        try:
            with self._sapi_lock:
                # Check if SAPI voice is initialized
                if self._sapi_voice is None:
                    # Try to initialize it again
                    try:
                        logger.info("Attempting to initialize Windows SAPI")
                        self._sapi_voice = win32com.client.Dispatch("SAPI.SpVoice")
                        logger.info("Windows SAPI initialized successfully on retry")
                    except Exception as e:
                        logger.error(f"Failed to initialize Windows SAPI on retry: {str(e)}")
                        raise Exception("Windows SAPI voice could not be initialized")

                # Create a temporary file if output_file is not provided
                if output_file is None:
                    fd, output_file = tempfile.mkstemp(suffix='.wav')
                    os.close(fd)

                logger.debug(f"Generating speech with Windows SAPI to {output_file}")

                # Get available voices
                try:
                    voices = self._sapi_voice.GetVoices()
                    logger.debug(f"Found {voices.Count} Windows SAPI voices")

                    # Log available voices for debugging
                    voice_list = []
                    for i in range(voices.Count):
                        voice = voices.Item(i)
                        voice_list.append(voice.Id)
                    logger.debug(f"Available voices: {', '.join(voice_list)}")

                    # Try to find a matching voice based on voice_name (exact match) or language
                    voice_found = False

                    # Log the requested voice name for debugging
                    logger.info(f"Requested voice name: '{voice_name}'")

                    if voice_name or language:
                        # First, try to find an exact match for the voice_name
                        if voice_name:
                            logger.debug(f"Searching for exact voice match: '{voice_name}'")
                            for i in range(voices.Count):
                                voice = voices.Item(i)
                                voice_id = voice.Id

                                # Check for exact match
                                if voice_id == voice_name:
                                    self._sapi_voice.Voice = voice
                                    logger.info(f"Found exact voice match: '{voice_id}'")
                                    voice_found = True
                                    break

                            # If exact match not found, log it
                            if not voice_found:
                                logger.warning(f"Exact voice match not found for '{voice_name}'")

                        # If no exact match found and we have a language, try to match by language
                        if not voice_found and language:
                            logger.debug(f"Searching for voice by language: '{language}'")
                            lang_code = language.lower().replace('_', '-')

                            for i in range(voices.Count):
                                voice = voices.Item(i)
                                voice_id = voice.Id

                                if lang_code in voice_id.lower():
                                    self._sapi_voice.Voice = voice
                                    logger.info(f"Selected voice by language: '{voice_id}'")
                                    voice_found = True
                                    break

                        # If still no match found, try a partial match on the voice name as a last resort
                        if not voice_found and voice_name:
                            logger.debug(f"Trying partial match for voice: '{voice_name}'")
                            for i in range(voices.Count):
                                voice = voices.Item(i)
                                voice_id = voice.Id

                                # Check if voice_name is a substring of voice_id (case insensitive)
                                if voice_name.lower() in voice_id.lower():
                                    self._sapi_voice.Voice = voice
                                    logger.info(f"Found partial voice match: '{voice_id}'")
                                    voice_found = True
                                    break

                        if not voice_found:
                            logger.warning(f"No matching voice found for language '{language}' or voice name '{voice_name}'. Using default voice.")
                except Exception as e:
                    logger.error(f"Error getting or setting Windows SAPI voices: {str(e)}")
                    logger.warning("Continuing with default voice")

                try:
                    # Create a SpFileStream object for saving to file
                    stream = win32com.client.Dispatch("SAPI.SpFileStream")
                    stream.Open(output_file, 3)  # 3 = SSFMCreateForWrite

                    # Set the output to our file stream
                    old_output = self._sapi_voice.AudioOutputStream
                    self._sapi_voice.AudioOutputStream = stream

                    # Set speech rate (slightly slower than default)
                    self._sapi_voice.Rate = 0  # Range is -10 to 10, with 0 being the default

                    # Set volume to maximum
                    self._sapi_voice.Volume = 100  # Range is 0 to 100

                    # Speak the text
                    logger.debug(f"Speaking text with length {len(text)} characters")
                    self._sapi_voice.Speak(text)

                    # Close the stream and restore the original output
                    stream.Close()
                    self._sapi_voice.AudioOutputStream = old_output

                    # Verify the file was created
                    if not os.path.exists(output_file):
                        raise Exception("Generated audio file does not exist")

                    if os.path.getsize(output_file) == 0:
                        raise Exception("Generated audio file is empty")

                    logger.info(f"Successfully generated Windows SAPI audio file: {output_file} ({os.path.getsize(output_file)} bytes)")
                    return output_file

                except Exception as e:
                    logger.error(f"Error during Windows SAPI speech generation: {str(e)}")
                    raise Exception(f"Windows SAPI speech generation failed: {str(e)}")

        except Exception as e:
            logger.error(f"Error in Windows SAPI TTS conversion: {str(e)}")
            if output_file and os.path.exists(output_file):
                try:
                    os.remove(output_file)
                    logger.debug(f"Removed empty or incomplete audio file: {output_file}")
                except Exception as cleanup_error:
                    logger.warning(f"Failed to remove audio file: {str(cleanup_error)}")
            raise Exception(f"Windows SAPI TTS failed: {str(e)}")

    def text_to_speech_voicerss(self, text, language='en-us', output_file=None):
        """
        Convert text to speech using VoiceRSS API (free tier)
        API key is not required for demo/testing purposes
        """
        try:
            # Create a temporary file if output_file is not provided
            if output_file is None:
                fd, output_file = tempfile.mkstemp(suffix='.mp3')
                os.close(fd)

            logger.debug(f"Generating speech with VoiceRSS to {output_file}")

            # VoiceRSS API parameters
            params = {
                'src': text,
                'hl': language,
                'r': '0',
                'c': 'mp3',
                'f': '44khz_16bit_stereo',
                'ssml': 'false',
                'b64': 'false'
            }

            # Make the API request
            response = requests.get(
                'https://api.voicerss.org/?' + urlencode(params),
                headers={'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
            )

            # Check if the request was successful
            if response.status_code != 200:
                raise Exception(f"VoiceRSS API returned status code {response.status_code}: {response.text}")

            # Save the audio file
            with open(output_file, 'wb') as f:
                f.write(response.content)

            # Verify the file was created
            if not os.path.exists(output_file) or os.path.getsize(output_file) == 0:
                raise Exception("Generated audio file is empty or does not exist")

            return output_file

        except Exception as e:
            logger.error(f"Error in VoiceRSS TTS conversion: {str(e)}")
            if output_file and os.path.exists(output_file):
                try:
                    os.remove(output_file)
                except:
                    pass
            raise

    def get_available_voices(self):
        """Get a list of available TTS voices from all engines"""
        voices = {
            'windows_sapi': [],
            'pyttsx3': [],
        }

        # Get Windows SAPI voices
        if WINDOWS_TTS_AVAILABLE:
            try:
                # If SAPI voice is not initialized, try to initialize it
                if self._sapi_voice is None:
                    try:
                        logger.info("Attempting to initialize Windows SAPI for voice listing")
                        self._sapi_voice = win32com.client.Dispatch("SAPI.SpVoice")
                        logger.info("Windows SAPI initialized successfully for voice listing")
                    except Exception as e:
                        logger.error(f"Failed to initialize Windows SAPI for voice listing: {str(e)}")

                if self._sapi_voice:
                    sapi_voices = self._sapi_voice.GetVoices()
                    logger.info(f"Found {sapi_voices.Count} Windows SAPI voices")

                    for i in range(sapi_voices.Count):
                        voice = sapi_voices.Item(i)
                        voice_id = voice.Id

                        # Extract language and name from voice ID
                        parts = voice_id.split('\\')

                        # Try to get a more user-friendly name
                        try:
                            # Get the voice description if available
                            description = voice.GetDescription()
                            if description:
                                name = description
                            else:
                                name = parts[-1].replace('TTS_MS_', '').replace('_', ' ').title()
                        except:
                            # Fall back to parsing the ID
                            name = parts[-1].replace('TTS_MS_', '').replace('_', ' ').title()

                        # Try to extract language code
                        lang_code = 'unknown'
                        for part in parts[-1].split('_'):
                            if '-' in part:
                                lang_code = part.lower()
                                break

                        # Add additional language name for better user experience
                        language_name = self._get_language_name(lang_code)
                        display_name = f"{name} ({language_name})"

                        voices['windows_sapi'].append({
                            'id': voice_id,
                            'name': display_name,
                            'language': lang_code
                        })

                    logger.debug(f"Windows SAPI voices: {[v['name'] for v in voices['windows_sapi']]}")
            except Exception as e:
                logger.error(f"Error getting Windows SAPI voices: {str(e)}")

        # Get pyttsx3 voices
        try:
            engine = self._get_pyttsx3_engine()
            if engine:
                pyttsx3_voices = engine.getProperty('voices')
                logger.info(f"Found {len(pyttsx3_voices)} pyttsx3 voices")

                for voice in pyttsx3_voices:
                    # Extract language from voice ID if possible
                    lang_code = 'unknown'
                    if 'language=' in voice.id:
                        lang_code = voice.id.split('language=')[1].split(';')[0]

                    # Add additional language name for better user experience
                    language_name = self._get_language_name(lang_code)
                    display_name = f"{voice.name} ({language_name})"

                    voices['pyttsx3'].append({
                        'id': voice.id,
                        'name': display_name,
                        'language': lang_code
                    })

                logger.debug(f"pyttsx3 voices: {[v['name'] for v in voices['pyttsx3']]}")
        except Exception as e:
            logger.error(f"Error getting pyttsx3 voices: {str(e)}")

        return voices

    def _get_language_name(self, lang_code):
        """Get a human-readable language name from a language code"""
        language_map = {
            'en-us': 'English (US)',
            'en-gb': 'English (UK)',
            'en-au': 'English (Australia)',
            'en-ca': 'English (Canada)',
            'en-in': 'English (India)',
            'en-ie': 'English (Ireland)',
            'fr-fr': 'French',
            'fr-ca': 'French (Canada)',
            'de-de': 'German',
            'it-it': 'Italian',
            'es-es': 'Spanish (Spain)',
            'es-mx': 'Spanish (Mexico)',
            'pt-pt': 'Portuguese',
            'pt-br': 'Portuguese (Brazil)',
            'ru-ru': 'Russian',
            'zh-cn': 'Chinese (Simplified)',
            'zh-tw': 'Chinese (Traditional)',
            'ja-jp': 'Japanese',
            'ko-kr': 'Korean',
            'ar-sa': 'Arabic',
            'sq': 'Albanian',
            'sq-al': 'Albanian',
            'el': 'Greek',
            'el-gr': 'Greek',
        }

        # Try to match the exact code
        if lang_code.lower() in language_map:
            return language_map[lang_code.lower()]

        # Try to match just the first part (e.g., 'en' from 'en-us')
        if '-' in lang_code:
            base_lang = lang_code.split('-')[0].lower()
            for code, name in language_map.items():
                if code.startswith(base_lang + '-'):
                    return name

        # Return the code itself if no match is found
        return lang_code

    def text_to_speech(self, text, language='en', prefer_offline=True, voice_name=None):
        """
        Convert text to speech using the best available engine

        Args:
            text (str): The text to convert to speech
            language (str): Language code (e.g., 'en', 'fr', 'de')
            prefer_offline (bool): Whether to prefer offline TTS engines
            voice_name (str): Specific voice ID to use (optional)

        Returns:
            str: Path to the generated audio file

        Raises:
            Exception: If all TTS engines fail
        """
        if not text:
            raise Exception("No text provided for TTS conversion")

        errors = []
        logger.info(f"TTS request: {len(text)} chars, language: {language}, prefer_offline: {prefer_offline}, voice: {voice_name or 'default'}")

        # Normalize language code
        if language:
            language = language.lower()
        else:
            language = 'en'

        # Try engines in order based on preference
        if prefer_offline:
            # For offline, try Windows SAPI first, then pyttsx3, then online as fallback
            engines = ['windows_sapi', 'pyttsx3', 'voicerss']
            logger.info("Using offline TTS engines first (Windows SAPI, pyttsx3)")
        else:
            # For online, try VoiceRSS first, then Windows SAPI, then pyttsx3
            engines = ['voicerss', 'windows_sapi', 'pyttsx3']
            logger.info("Using online TTS engine first (VoiceRSS)")

        for engine in engines:
            try:
                if engine == 'windows_sapi':
                    if WINDOWS_TTS_AVAILABLE:
                        logger.info("Attempting Windows SAPI TTS")
                        try:
                            result = self.text_to_speech_windows_sapi(text, language, voice_name)
                            logger.info(f"Windows SAPI TTS successful: {result}")
                            return result
                        except Exception as e:
                            error_msg = str(e)
                            logger.warning(f"Windows SAPI TTS failed: {error_msg}")
                            errors.append(f"Windows SAPI failed: {error_msg}")
                    else:
                        logger.info("Windows SAPI not available on this system")
                        errors.append("Windows SAPI not available on this system")

                elif engine == 'pyttsx3':
                    logger.info("Attempting pyttsx3 TTS")
                    try:
                        result = self.text_to_speech_pyttsx3(text, language)
                        logger.info(f"pyttsx3 TTS successful: {result}")
                        return result
                    except Exception as e:
                        error_msg = str(e)
                        logger.warning(f"pyttsx3 TTS failed: {error_msg}")
                        errors.append(f"pyttsx3 failed: {error_msg}")

                elif engine == 'voicerss':
                    logger.info("Attempting VoiceRSS TTS")
                    try:
                        # Convert language code format if needed (e.g., 'en' to 'en-us')
                        if len(language) == 2:
                            lang_code = self._get_voicerss_language_code(language)
                        else:
                            lang_code = language

                        logger.info(f"Using VoiceRSS with language code: {lang_code}")
                        result = self.text_to_speech_voicerss(text, lang_code)
                        logger.info(f"VoiceRSS TTS successful: {result}")
                        return result
                    except Exception as e:
                        error_msg = str(e)
                        logger.warning(f"VoiceRSS TTS failed: {error_msg}")
                        errors.append(f"VoiceRSS failed: {error_msg}")

            except Exception as e:
                error_msg = str(e)
                logger.error(f"Unexpected error with {engine} TTS: {error_msg}")
                errors.append(f"{engine} failed with unexpected error: {error_msg}")

        # If we get here, all engines failed
        error_msg = "All TTS engines failed: " + "; ".join(errors)
        logger.error(error_msg)
        raise Exception(error_msg)

    def _get_voicerss_language_code(self, language):
        """Convert a 2-letter language code to VoiceRSS format"""
        language_map = {
            'en': 'en-us',
            'fr': 'fr-fr',
            'de': 'de-de',
            'es': 'es-es',
            'it': 'it-it',
            'pt': 'pt-pt',
            'ru': 'ru-ru',
            'ja': 'ja-jp',
            'zh': 'zh-cn',
            'ko': 'ko-kr',
            'ar': 'ar-sa',
            'sq': 'sq-al',
            'el': 'el-gr',
        }

        return language_map.get(language.lower(), f"{language}-{language}")

# Create a singleton instance
enhanced_tts_service = EnhancedTTSService()
