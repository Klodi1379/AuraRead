"""
Text-to-Speech service module that provides multiple TTS engines.
"""
import os
import tempfile
import logging
import threading
import platform
from gtts import gTTS, gTTSError
import pyttsx3

# For direct Windows SAPI access
if platform.system() == 'Windows':
    try:
        import win32com.client
        WINDOWS_SAPI_AVAILABLE = True
    except ImportError:
        WINDOWS_SAPI_AVAILABLE = False
else:
    WINDOWS_SAPI_AVAILABLE = False

# Get an instance of a logger
logger = logging.getLogger(__name__)

class TTSService:
    """
    Service for text-to-speech conversion using multiple engines.
    Supports online (gTTS), offline (pyttsx3), and Windows SAPI engines.
    """

    def __init__(self):
        """Initialize the TTS service."""
        self._pyttsx3_engine = None
        self._pyttsx3_lock = threading.Lock()
        self._sapi_lock = threading.Lock()

        # Initialize Windows SAPI if available
        self._sapi_voice = None
        if WINDOWS_SAPI_AVAILABLE:
            try:
                logger.debug("Initializing Windows SAPI")
                self._sapi_voice = win32com.client.Dispatch("SAPI.SpVoice")
                logger.debug("Windows SAPI initialized successfully")
            except Exception as e:
                logger.error(f"Error initializing Windows SAPI: {str(e)}")
                self._sapi_voice = None

    def _get_pyttsx3_engine(self):
        """
        Get or initialize the pyttsx3 engine.
        Uses a lock to ensure thread safety.
        """
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
        """
        Convert text to speech using pyttsx3 (offline engine).

        Args:
            text (str): The text to convert to speech
            language (str, optional): Language code (limited support in pyttsx3)
            output_file (str, optional): Path to save the audio file
                                        If None, a temporary file will be created

        Returns:
            str: Path to the generated audio file

        Raises:
            Exception: If there's an error in the TTS conversion
        """
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
                # pyttsx3 has limited language support, so we try to find a matching voice
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
            logger.error(f"Error in pyttsx3 TTS conversion: {str(e)}", exc_info=True)
            if output_file and os.path.exists(output_file):
                try:
                    os.remove(output_file)
                except:
                    pass
            raise

    def text_to_speech_gtts(self, text, language='en', output_file=None, tld='com'):
        """
        Convert text to speech using gTTS (Google's online TTS).

        Args:
            text (str): The text to convert to speech
            language (str, optional): Language code. Defaults to 'en'.
            output_file (str, optional): Path to save the audio file
                                        If None, a temporary file will be created
            tld (str, optional): Top-level domain for the Google Translate host.
                                Defaults to 'com'.

        Returns:
            str: Path to the generated audio file

        Raises:
            Exception: If there's an error in the TTS conversion
        """
        try:
            # Create a temporary file if output_file is not provided
            if output_file is None:
                fd, output_file = tempfile.mkstemp(suffix='.mp3')
                os.close(fd)

            # Generate speech
            logger.debug(f"Generating speech with gTTS to {output_file}")
            tts = gTTS(text=text, lang=language, tld=tld)
            tts.save(output_file)

            # Verify the file was created
            if not os.path.exists(output_file) or os.path.getsize(output_file) == 0:
                raise Exception("Generated audio file is empty or does not exist")

            return output_file

        except Exception as e:
            logger.error(f"Error in gTTS conversion: {str(e)}", exc_info=True)
            if output_file and os.path.exists(output_file):
                try:
                    os.remove(output_file)
                except:
                    pass
            raise

    def text_to_speech_windows_sapi(self, text, language=None, voice_name=None, output_file=None):
        """
        Convert text to speech using Windows SAPI (Speech API).

        Args:
            text (str): The text to convert to speech
            language (str, optional): Language code (used to select appropriate voice)
            voice_name (str, optional): Specific voice name to use
            output_file (str, optional): Path to save the audio file
                                        If None, a temporary file will be created

        Returns:
            str: Path to the generated audio file

        Raises:
            Exception: If there's an error in the TTS conversion
        """
        if not WINDOWS_SAPI_AVAILABLE:
            raise Exception("Windows SAPI is not available")

        try:
            with self._sapi_lock:
                if self._sapi_voice is None:
                    raise Exception("Windows SAPI voice not initialized")

                # Create a temporary file if output_file is not provided
                if output_file is None:
                    fd, output_file = tempfile.mkstemp(suffix='.wav')
                    os.close(fd)

                logger.debug(f"Generating speech with Windows SAPI to {output_file}")

                # Get available voices
                voices = self._sapi_voice.GetVoices()
                current_voice = None

                # Try to find a matching voice based on language or name
                if voice_name or language:
                    for i in range(voices.Count):
                        voice = voices.Item(i)
                        voice_id = voice.Id

                        # Check if this voice matches our criteria
                        if voice_name and voice_name.lower() in voice_id.lower():
                            current_voice = voice
                            logger.debug(f"Selected voice by name: {voice_id}")
                            break
                        elif language:
                            # Voice IDs often contain language codes like "en-US"
                            lang_code = language.lower().replace('_', '-')
                            if lang_code in voice_id.lower():
                                current_voice = voice
                                logger.debug(f"Selected voice by language: {voice_id}")
                                break

                # Set the voice if we found a matching one
                if current_voice:
                    self._sapi_voice.Voice = current_voice

                # Create a SpFileStream object for saving to file
                stream = win32com.client.Dispatch("SAPI.SpFileStream")
                stream.Open(output_file, 3)  # 3 = SSFMCreateForWrite

                # Set the output to our file stream
                old_output = self._sapi_voice.AudioOutputStream
                self._sapi_voice.AudioOutputStream = stream

                # Speak the text
                self._sapi_voice.Speak(text)

                # Close the stream and restore the original output
                stream.Close()
                self._sapi_voice.AudioOutputStream = old_output

                # Verify the file was created
                if not os.path.exists(output_file) or os.path.getsize(output_file) == 0:
                    raise Exception("Generated audio file is empty or does not exist")

                return output_file

        except Exception as e:
            logger.error(f"Error in Windows SAPI TTS conversion: {str(e)}", exc_info=True)
            if output_file and os.path.exists(output_file):
                try:
                    os.remove(output_file)
                except:
                    pass
            raise

    def get_available_voices(self):
        """
        Get a list of available TTS voices from all engines.

        Returns:
            dict: Dictionary with engine names as keys and lists of voice info as values
        """
        voices = {
            'windows_sapi': [],
            'pyttsx3': [],
        }

        # Get Windows SAPI voices
        if WINDOWS_SAPI_AVAILABLE and self._sapi_voice:
            try:
                sapi_voices = self._sapi_voice.GetVoices()
                for i in range(sapi_voices.Count):
                    voice = sapi_voices.Item(i)
                    voice_id = voice.Id
                    # Extract language and name from voice ID
                    # Voice IDs are typically like "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Speech\\Voices\\Tokens\\TTS_MS_EN-US_DAVID_11.0"
                    parts = voice_id.split('\\')
                    name = parts[-1].replace('TTS_MS_', '').replace('_', ' ').title()

                    # Try to extract language code
                    lang_code = 'unknown'
                    for part in parts[-1].split('_'):
                        if '-' in part:
                            lang_code = part.lower()
                            break

                    voices['windows_sapi'].append({
                        'id': voice_id,
                        'name': name,
                        'language': lang_code
                    })
            except Exception as e:
                logger.error(f"Error getting Windows SAPI voices: {str(e)}")

        # Get pyttsx3 voices
        try:
            engine = self._get_pyttsx3_engine()
            if engine:
                for voice in engine.getProperty('voices'):
                    # Extract language from voice ID if possible
                    lang_code = 'unknown'
                    if 'language=' in voice.id:
                        lang_code = voice.id.split('language=')[1].split(';')[0]

                    voices['pyttsx3'].append({
                        'id': voice.id,
                        'name': voice.name,
                        'language': lang_code
                    })
        except Exception as e:
            logger.error(f"Error getting pyttsx3 voices: {str(e)}")

        return voices

    def text_to_speech(self, text, language='en', prefer_offline=True, voice_name=None):
        """
        Convert text to speech using the best available engine.
        Tries offline engine first if prefer_offline is True, then falls back to online.

        Args:
            text (str): The text to convert to speech
            language (str, optional): Language code. Defaults to 'en'.
            prefer_offline (bool, optional): Whether to prefer offline TTS engine.
                                            Defaults to True.
            voice_name (str, optional): Specific voice name to use (for Windows SAPI)

        Returns:
            str: Path to the generated audio file

        Raises:
            Exception: If all TTS engines fail
        """
        errors = []

        # Try engines in order based on preference
        if prefer_offline:
            # For offline, try Windows SAPI first, then pyttsx3
            engines = ['windows_sapi', 'pyttsx3', 'gtts']
        else:
            # For online, try gTTS first, then Windows SAPI, then pyttsx3
            engines = ['gtts', 'windows_sapi', 'pyttsx3']

        for engine in engines:
            try:
                if engine == 'windows_sapi' and WINDOWS_SAPI_AVAILABLE:
                    try:
                        return self.text_to_speech_windows_sapi(text, language, voice_name)
                    except Exception as e:
                        errors.append(f"Windows SAPI failed: {str(e)}")
                        continue
                elif engine == 'pyttsx3':
                    try:
                        return self.text_to_speech_pyttsx3(text, language)
                    except Exception as e:
                        errors.append(f"pyttsx3 failed: {str(e)}")
                        continue
                elif engine == 'gtts':
                    # Try different TLDs for gTTS to avoid rate limiting
                    tld_options = ['com', 'ca', 'co.uk', 'com.au', 'co.in', 'ie', 'co.za']

                    for tld in tld_options:
                        try:
                            return self.text_to_speech_gtts(text, language, tld=tld)
                        except Exception as e:
                            errors.append(f"gTTS with TLD {tld} failed: {str(e)}")
                            continue
            except Exception as e:
                errors.append(f"{engine} failed: {str(e)}")
                continue

        # If we get here, all engines failed
        error_msg = "All TTS engines failed: " + "; ".join(errors)
        logger.error(error_msg)
        raise Exception(error_msg)

# Create a singleton instance
tts_service = TTSService()
