/*
 * Install the Generative AI SDK
 *
 * $ npm install @google/generative-ai
 *
 * See the getting started guide for more information
 * https://ai.google.dev/gemini-api/docs/get-started/node
 */

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/files");
const { error } = require("console");
require("dotenv").config();
const fs = require("fs");

let apiKey = (process.env.API_KEY).split("|")[0];

let genAI = new GoogleGenerativeAI(apiKey);
let fileManager = new GoogleAIFileManager(apiKey);

/**
 * Uploads the given file to Gemini.
 *
 * See https://ai.google.dev/gemini-api/docs/prompting_with_media
 */
async function uploadToGemini(path, mimeType) {
  const uploadResult = await fileManager.uploadFile(path, {
    mimeType,
    displayName: path,
  });
  const file = uploadResult.file;
  console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
  return file;
}

/**
 * Waits for the given files to be active.
 *
 * Some files uploaded to the Gemini API need to be processed before they can
 * be used as prompt inputs. The status can be seen by querying the file's
 * "state" field.
 *
 * This implementation uses a simple blocking polling loop. Production code
 * should probably employ a more sophisticated approach.
 */
async function waitForFilesActive(files) {
  console.log("Waiting for file processing...");
  for (const name of files.map((file) => file.name)) {
    let file = await fileManager.getFile(name);
    while (file.state === "PROCESSING") {
      process.stdout.write(".")
      await new Promise((resolve) => setTimeout(resolve, 10_000));
      file = await fileManager.getFile(name)
    }
    if (file.state !== "ACTIVE") {
      throw Error(`File ${file.name} failed to process`);
    }
  }
  console.log("...all files ready\n");
}


async function Run(rootPath,videoIndex,ApiKey) {

   apiKey = ApiKey;

   genAI = new GoogleGenerativeAI(apiKey);
   fileManager = new GoogleAIFileManager(apiKey);

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };
  
  // TODO Make these files available on the local file system
  // You may need to update the file paths
  const files = [
    await uploadToGemini("./" +rootPath+`/originVideo/videoplayback${videoIndex}.mp4`, "video/mp4"),
  ];
  console.log(apiKey);
  // Some files have a processing delay. Wait for them to be ready.
  await waitForFilesActive(files);
  console.log(files[0].uri+files[0].mimeType)
  const TextResponse = fs.readFileSync("./" +rootPath+`/originSub/sub${videoIndex}.txt`,'utf8')
  console.log(TextResponse);
  const chatSession = model.startChat({
    generationConfig,
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
    ],
    history: [
      {
        role: "user",
        parts: [
          {
            fileData: {
              mimeType: files[0].mimeType,
              fileUri: files[0].uri,
            },
          },
        ],
      },
      {
        role: "user",
        parts: [
          {text: "\"**Nhiệm vụ:** Xác định các mốc thời gian khi video chuyển sang hình ảnh hoàn toàn mới\n\n**Đầu ra:** Danh sách các mốc thời gian theo định dạng sau:\n\n```\nstart time|end time\n```\n\n**Ví dụ:**\n\n```\n00:00|00:01\n00:01|00:02\n00:02|00:03\n00:03|00:04\n```\n\n**Ghi chú:**\n* \\\"start time\\\" là thời điểm bắt đầu của một hình ảnh mới.\n* \\\"end time\\\" là thời điểm kết thúc của hình ảnh đó (hoặc thời điểm bắt đầu của hình ảnh tiếp theo).\n* Phải đầy đủ chi tiết từng khung hình trong từng giây\n* Độ chính xác cao\n* Lấy *tất cả 100%* các khung hình chuyển cảnh. Bám sát theo video không được bỏ qua cảnh "},
        ],
      },
      {
        role: "model",
        parts: [
          {text: TextResponse},
        ],
      }
    ],
  });

   const result = await chatSession.sendMessage("**Nhiệm vụ:** Xác định các mốc thời gian khi video chuyển sang hình ảnh hoàn toàn mới và chuyển âm thanh thành văn bản trong mỗi phân đoạn.\n\n**Đầu ra:** Danh sách các mốc thời gian và văn bản tương ứng theo định dạng sau:\n\n```\nstart time|end time|text\n```\n\n**Ví dụ:**\n\n```\n00:00|00:01| vào lúc 00:01 ảnh của video đã thay đổi đây là văn bản được chuyển từ âm thanh của video tương ứng với thời gian hiển thị bức ảnh 1\n00:01|00:02|đây là văn bản được chuyển từ âm thanh của video tương ứng với bức ảnh 2\n00:02|00:03| đây là văn bản được chuyển từ âm thanh của video tương ứng với bức ảnh 3\n```\n\n**Ghi chú:**\n* kết quả chỉ là những đoạn văn bản cụ thể trong mỗi phân đoạn. cần đầy đủ phân đoạn\n* \"start time\" là thời điểm bắt đầu của một hình ảnh mới.\n* \"end time\" là thời điểm kết thúc của hình ảnh đó (hoặc thời điểm bắt đầu của hình ảnh tiếp theo).\n* \"text\" là văn bản chuyển đổi từ âm thanh video trong khoảng thời gian đó. văn bản có dấu câu thích hợp.\n* Phải đầy đủ chi tiết từng khung hình trong từng giây \n* Độ chính xác cao\n* Lấy *tất cả 100%* các khung hình chuyển cảnh. Bám sát theo video không được bỏ qua cảnh.");
  console.log(result.response.text());
  fs.writeFileSync("./" +rootPath+`/originSub/sub${videoIndex}.txt`,result.response.text())
}

module.exports = Run;