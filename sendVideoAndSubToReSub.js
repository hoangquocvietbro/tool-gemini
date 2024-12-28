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

  let apiKey;
  
  let genAI;
  let fileManager;
  
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
                    console.log("\nfile id là: "+ file.name)
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
     apiKey = ApiKey; console.log("đây là apikey"+apiKey)
   genAI = new GoogleGenerativeAI(apiKey);
   fileManager = new GoogleAIFileManager(apiKey);

    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
      });
      
      const generationConfig = {
        temperature: 1,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 81920,
        responseMimeType: "text/plain",
      };
  // TODO Make these files available on the local file system
  // You may need to update the file paths
    const files = [
      await uploadToGemini("./" +rootPath+`/originVideo/videoplayback${videoIndex}.mp4`, "video/mp4",fileManager),
    ];

  // Some files have a processing delay. Wait for them to be ready.
  //await waitForFilesActive(files);

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
        
      ],
    });
    
    let SubText = fs.readFileSync("./" +rootPath+`/SubTurnOne/sub${videoIndex}.txt`,"utf-8")
    //const result = await chatSession.sendMessage("Dựa vào các phân cảnh trong video đã gửi trên và các yêu cầu ở dưới hãy sửa lại và hoàn thiện nội dung sub sau: \n"+SubText+"\n**Chú ý**\n\n *Không được bỏ bớt phân cảnh.\n *sửa lại nội dung và sửa lại **chính tả** theo video.  \n* Thêm các phân cảnh còn thiếu \n * Sửa lại tất cả tên riêng theo video \n *Sửa lại chính tả.\n *Không thay đổi các mốc thời gian.\n *Giữ nguyên số lượng dòng văn bản. \n *Không được để trống văn bản trên dòng  ");
/*    const result = await chatSession.sendMessage("Dựa vào các phân cảnh trong video đã gửi trên và các yêu cầu ở dưới hãy sửa lại và hoàn thiện nội dung sub sau: \n"+SubText+`
**lưu ý**: thực hiện chỉnh sửa theo đúng yêu cầu , bao gồm:
* sửa **chính tả** theo video.
* sửa **tên riêng** theo video.
* sửa **lỗi chính tả** chung.
* **giữ nguyên** mốc thời gian.
* **giữ nguyên** số lượng dòng.
* **không để trống** phần văn bản của dòng. `);*/
    //const result = await chatSession.sendMessage("dựa vào file âm thanh hãy giữ nguyên format và sủa lại chính tả đoạn văn sau: \n"+SubText+`");
    const result = await chatSession.sendMessage("dựa vào file âm thanh hãy chỉnh  sửa chính tả và giữ nguyên format 'start time|end time|text' giống y hệt phần sub bản sau: \n+SubText");
    let textResult = await result.response.text();
    console.log(textResult);
    fs.writeFileSync("./" +rootPath+`/originSub/sub${videoIndex}.txt`,result.response.text().replace(/'|"|`/g," ").toLowerCase())


    
  }
  
  module.exports = Run