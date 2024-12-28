from flask import Flask, request, jsonify
import cv2
import math
import numpy as np
import os
import gc  # Import garbage collector
import easyocr
reader = easyocr.Reader(['en'])
app = Flask(__name__)
def inpaint_text(img_path, reader):
    """
    Inpaints text regions in an image using OCR-detected text locations, preserving the original colors.

    Args:
        img_path (str): Path to the input image.
        reader (easyocr.Reader): EasyOCR reader object for text recognition.

    Returns:
        np.ndarray: The inpainted image.
    """
    # Read the original image
    img = cv2.imread(img_path)
    # Recognize text and corresponding bounding boxes using EasyOCR
    try:
        results = reader.readtext(img)
    except Exception as e:
        return
    if not results:
      return
    # Define the mask for inpainting
    mask = np.zeros(img.shape[:2], dtype="uint8")
    # Iterate through recognized words and their bounding boxes
    for (bbox, text, _) in results:
        # Extract points from the bounding box
        points = np.array(bbox, dtype=np.int32)
        cv2.fillPoly(mask, [points], 255)

    # Apply Gaussian blur to smooth the mask edges without affecting surrounding pixels

    # Inpaint the image using the precise mask
    inpainted_img = cv2.inpaint(img, mask, 3, cv2.INPAINT_TELEA)
    # Giải phóng tài nguyên hình ảnh
    del img, results, mask
    gc.collect()  # Thu gom bộ nhớ sau khi xóa các biến

    return inpainted_img

@app.route('/remove-text', methods=['POST'])
def remove_text_from_image():
    # Get the image path from the request
    if request.json.get('img_path') == "close":
        exit()
    img_path = request.json.get('img_path')

    if not img_path or not os.path.exists(img_path):
        return jsonify({"error": f"Invalid image path: {img_path}"}), 400
    # Process the image
    img_text_removed = inpaint_text(img_path, reader)
    if img_text_removed is None:
        return "không có chữ cần xóa trong ảnh"
    # Save the processed image
    output_path = img_path
    cv2.imwrite(output_path,img_text_removed)
    # Giải phóng tài nguyên hình ảnh đầu ra
    del img_text_removed,img_path ,output_path
    gc.collect()
    # Return the processed image
    return "đã xóa text"
@app.teardown_request
def teardown_request(exception):
    gc.collect()  # Thu gom bộ nhớ khi kết thúc request
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5006)
