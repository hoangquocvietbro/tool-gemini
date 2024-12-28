from flask import Flask, request, jsonify
from transformers import pipeline
app = Flask(__name__)
transcriber = pipeline("automatic-speech-recognition", model="vinai/PhoWhisper-tiny")

@app.route('/transcribe', methods=['POST'])
def transcribe():
    data = request.json
    if 'file_path' not in data:
        return jsonify({"error": "No file path provided"}), 400

    file_path = data['file_path']

    try:
        result = transcriber(file_path)
        text = result["text"]
        return text
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)