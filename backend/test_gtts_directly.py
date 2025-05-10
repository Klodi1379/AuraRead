from gtts import gTTS
import os
import tempfile
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def test_gtts():
    try:
        logger.debug("Starting gTTS test")
        
        # Create a temporary file for the audio
        temp_filename = None
        try:
            # Create a temp file that won't be deleted immediately
            fd, temp_filename = tempfile.mkstemp(suffix='.mp3')
            os.close(fd)  # Close the file descriptor
            
            logger.debug(f"Created temporary file: {temp_filename}")
            
            # Generate the audio file
            text = "Hello, this is a test of the text to speech functionality."
            language = "en"
            
            logger.debug(f"Generating audio with text: {text} and language: {language}")
            tts = gTTS(text=text, lang=language)
            
            logger.debug("Saving audio file")
            tts.save(temp_filename)
            
            # Check that the file exists and has content
            if not os.path.exists(temp_filename):
                logger.error("Generated audio file does not exist")
                return False
                
            file_size = os.path.getsize(temp_filename)
            logger.debug(f"Generated audio file size: {file_size} bytes")
            
            if file_size == 0:
                logger.error("Generated audio file is empty")
                return False
                
            logger.debug("gTTS test successful")
            return True
            
        except Exception as e:
            logger.error(f"Error in gTTS test: {str(e)}", exc_info=True)
            return False
        finally:
            # Clean up the temporary file
            if temp_filename and os.path.exists(temp_filename):
                try:
                    os.remove(temp_filename)
                    logger.debug(f"Removed temporary file: {temp_filename}")
                except Exception as e:
                    logger.error(f"Error removing temporary file: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error in test_gtts: {str(e)}", exc_info=True)
        return False

if __name__ == "__main__":
    result = test_gtts()
    print(f"Test result: {'Success' if result else 'Failure'}")
