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
  async function uploadToGemini(path, mimeType,fileManager) {
    const uploadResult = await fileManager.uploadFile(path, {
      mimeType,
      displayName: path,
    });
    let file = uploadResult.file;
    console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
     while (file.state === "PROCESSING") {
    process.stdout.write(".");
    await new Promise((resolve) => setTimeout(resolve, 10_000));
    file = await fileManager.getFile(file.name);
  }
  if (file.state !== "ACTIVE") {
    throw Error(`File ${file.name} failed to process`);
  }
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
      model: "gemini-1.5-pro",
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
      await uploadToGemini("./" +rootPath+`/noAudioVideo/videoplayback${videoIndex}.mp4`, "video/mp4",fileManager),
    ];
    console.log(apiKey);
    // Some files have a processing delay. Wait for them to be ready.
    //await waitForFilesActive(files);
    console.log(files[0].uri+files[0].mimeType)
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
        }
      ],
    });
  
    const result = await chatSession.sendMessage("**Nhiệm vụ:** Dựa vào video đã giửi trên hãy Xác định các mốc thời gian khi video chuyển sang hình ảnh hoàn toàn mới\n\n**Đầu ra:** Danh sách các mốc thời gian theo định dạng sau:\n\n```\nstart time( minute:second,milisecond )|end time( minute:second,milisecond )\n```\n\n**Ví dụ:**\n\n```\n0:00,000|0:01,234\n0:01,234|0:02,768\n0:02,768|0:03,233\n0:03,233|0:04,541\n```\n\n**Ghi chú:**\n* \\\"start time\\\" là thời điểm bắt đầu của một hình ảnh mới.\n* \\\"end time\\\" là thời điểm kết thúc của hình ảnh đó.\n* Phải đầy đủ chi tiết từng khung hình trong từng giây\n* Độ chính xác cao\n* Lấy *tất cả 100%* các khung hình chuyển cảnh. Bám sát theo video không được bỏ qua cảnh \n ");
    let textResult = await result.response.text();
    console.log(textResult);
    fs.writeFileSync("./" +rootPath+`/timeStamps/timeStamps${videoIndex}.txt`,result.response.text())
        fileManager.deleteFile(files[0].name);
  }

  async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
  
  module.exports = Run;