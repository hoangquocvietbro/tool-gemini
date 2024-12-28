from flask import Flask, request, jsonify
import keras_ocr
import cv2
import math
import numpy as np
import os

app = Flask(__name__)

# Function to calculate midpoint
def midpoint(x1, y1, x2, y2):
    x_mid = int((x1 + x2) / 2)
    y_mid = int((y1 + y2) / 2)
    return (x_mid, y_mid)

# Main function that detects text and inpaints
def inpaint_text(img_path, pipeline):
    # Read the image
    specified_words = ["eview","revie"]
    img = keras_ocr.tools.read(img_path)

    # Recognize text (and corresponding regions)
    prediction_groups = pipeline.recognize([img])

    # Return the original image if no text is found
    if not prediction_groups[0]:
      return
    found = False  # Flag to track if any of the specified words are found
    specified_words = [word.lower() for word in specified_words]  # Convert specified words to lowercase

    for box in prediction_groups[0]:
        text = box[0].lower()  # Detected text converted to lowercase
        if not any(word in text for word in specified_words):
            continue  # Skip if none of the specified words are in the detected text

        found = True  # Mark that at least one specified word is found
        break
    if found is False:
        return
    # Define the mask for inpainting
    mask = np.zeros(img.shape[:2], dtype="uint8")
    for box in prediction_groups[0]:
        x0, y0 = box[1][0]
        x1, y1 = box[1][1]
        x2, y2 = box[1][2]
        x3, y3 = box[1][3]

        x_mid0, y_mid0 = midpoint(x1, y1, x2, y2)
        x_mid1, y_mid1 = midpoint(x0, y0, x3, y3)

        # Calculate line thickness
        thickness = int(math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2))

        # Define the line and inpaint
        cv2.line(mask, (x_mid0, y_mid0), (x_mid1, y_mid1), 255, thickness)
    inpainted_img = cv2.inpaint(img, mask, 7, cv2.INPAINT_TELEA)

    return inpainted_img

# Initialize keras-ocr pipeline
pipeline = keras_ocr.pipeline.Pipeline()

@app.route('/remove-text', methods=['POST'])
def remove_text_from_image():
    # Get the image path from the request
    img_path = request.json.get('img_path')
    
    if not img_path or not os.path.exists(img_path):
        return jsonify({"error": f"Invalid image path: {img_path}"}), 400

    # Process the image
    img_text_removed = inpaint_text(img_path, pipeline)
   
    if img_text_removed is None:
        return "không có chữ cần xóa trong ảnh"
    # Save the processed image
    output_path = img_path
    cv2.imwrite(output_path, cv2.cvtColor(img_text_removed, cv2.COLOR_BGR2RGB))

    # Return the processed image
    return "đã xóa text"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5006)
