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
        responseMimeType: "application/json",
      };
  // TODO Make these files available on the local file system
  // You may need to update the file paths
    const files = [
      await uploadToGemini("./" +rootPath+`/originVideo/videoplayback${videoIndex}.mp4.mp3`, "audio/mp3",fileManager),
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
    let SubTextPrevious ;
    if(fs.existsSync("./" +rootPath+`/originSub/sub${videoIndex-1}.txt`)) SubTextPrevious = fs.readFileSync("./" +rootPath+`/originSub/sub${videoIndex-1}.txt`,"utf-8")
    else SubTextPrevious = "Sửa chính tả theo file âm thanh";//"Do đây là phần đầu tiên nên lấy chính tả chính xác theo file âm thanh";
    let SubText = fs.readFileSync("./" +rootPath+`/SubTurnOne/sub${videoIndex}.txt`,"utf-8")
    //const result  =   await chatSession.sendMessage("Dựa vào các phân cảnh trong file âm thanh đã gửi trên và các yêu cầu ở dưới hãy sửa lại và hoàn thiện nội dung sub sau: \n"+SubText+"\n**Chú ý**\n\n *Chỉ sửa lại **chính tả** theo video.\n *Tên nhân vật lấy theo phần trước. Dữ nguyên format text");
    const result = await chatSession.sendMessage("*Dựa vào nội dung phần trước \n"+SubTextPrevious+" \n * và dựa vào file mp3 đã gửi trên và các yêu cầu ở dưới hãy sửa lại chính tả của nội dung subtitles phần tiếp theo ở dưới đây: \n"+SubText+"\n**Chú ý**\n\n *Chỉ sửa lại **chính tả** theo video. Sửa tên nhân vật đồng bộ với các phần trước và phù hợp với manga \n.Output trả về Json có các trường 'start' giữ nguyên format, 'end' giữ nguyên format, và 'text' tương ứng trên một dòng");
    //const result = await chatSession.sendMessage("dựa vào file âm thanh hãy chỉnh  sửa chính tả và giữ nguyên format 'start time|end time|text' giống y hệt phần sub bản sau: \n+SubText");
    let textResult = await result.response.text();
    fs.writeFileSync("./" +rootPath+`/originSub/sub${videoIndex}.json`,result.response.text())
const convertSubtitles = (text) => {
  let data;

  // Parse JSON text to a JavaScript object
  try {
    data = JSON.parse(text);
  } catch (error) {
    throw new Error("Invalid JSON format: " + error.message);
  }

  // Validate structure
  if (!data || !data.subtitles || !Array.isArray(data.subtitles)) {
    throw new Error("Invalid subtitles data structure");
  }

  // Convert to desired format
  return data.subtitles.map(sub => {
    return `${sub.start}|${sub.end}|${sub.text}`;
  }).join('\n');
};

    textResult = convertSubtitles(textResult);
    console.log(textResult);
    fs.writeFileSync("./" +rootPath+`/originSub/sub${videoIndex}.txt`,textResult.replace(/'|"|`/g," ").toLowerCase())


    
  }
  
  module.exports = Run