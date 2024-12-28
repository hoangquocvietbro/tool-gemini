import sys
from pydub import AudioSegment
from transformers import pipeline
transcriber = pipeline("automatic-speech-recognition", model="vinai/PhoWhisper-large")
def tts_pho(file_path):
    result = transcriber(file_path)
    return result["text"]
if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 transcriber_script.py <file_path>")
        sys.exit(1)
    file_path = sys.argv[1]
    print(tts_pho(file_path))
