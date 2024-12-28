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
const { rejects } = require("assert");
const { error } = require("console");
const { resolve, REFUSED } = require("dns");
require("dotenv").config();
const fs = require("fs");
let path = require("path");
let apiKey = process.env.API_KEY.split("|")[0];
let genAI = new GoogleGenerativeAI(apiKey);
let fileManager = new GoogleAIFileManager(apiKey);

/**
 * Uploads the given file to Gemini.
 *
 * See https://ai.google.dev/gemini-api/docs/prompting_with_media
 */
async function uploadToGemini(filePath, mimeType) {
  const uploadResult = await fileManager.uploadFile(filePath, {
    mimeType,
    displayName: path.basename(filePath),
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
      process.stdout.write(".");
      await new Promise((resolve) => setTimeout(resolve, 10_000));
      file = await fileManager.getFile(name);
    }
    if (file.state !== "ACTIVE") {
      throw Error(`File ${file.name} failed to process`);
    }
  }
  console.log("...all files ready\n");
}

async function setUpGemini(rootFolder,videoIndex,ApiKey){

   apiKey = ApiKey; console.log(apiKey)
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
      
      // let LastLine = await getLastOrSecondLastLine("resultText.txt");
    
      // const [lastImage] = LastLine.split("|");
      // const [lastImageName] = lastImage.split(".");
      // const lastImageNameMatch = lastImageName.substring(6);
      // You may need to update the file paths
      fs.writeFileSync("./" +rootFolder+`/translatedSubTHAILAN/translate${videoIndex}.txt`,"");
      const files = [
        fs.existsSync("./" +rootFolder+`/translatedSubTHAILAN/translate${videoIndex-1}.txt`)? await uploadToGemini("./" +rootFolder+`/translatedSubTHAILAN/translate${videoIndex-1}.txt`, "text/plain"):await uploadToGemini(`./translate.txt`, "text/plain"),
        await uploadToGemini("./" +rootFolder+`/originSub/sub${videoIndex}.txt`, "text/plain"),
      ];
    
      // Some files have a processing delay. Wait for them to be ready.
         await waitForFilesActive(files);
    
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
        // safetySettings: Adjust safety settings
        // See https://ai.google.dev/gemini-api/docs/safety-settings
        history: [
          {
            role: "user",
            parts: [
              { 
                fileData: {
                  mimeType: files[0].mimeType,
                  fileUri: files[0].uri,
              
                },
              }
            ],
          },
        ],
      });
      fs.writeFileSync("./" +rootFolder+`/translatedSubTHAILAN/translate${videoIndex}.txt`, "");
      let SubText = fs.readFileSync("./" +rootFolder+`/originSub/sub${videoIndex}.txt`,"utf-8")
      console.log(SubText)
      const result =
        await chatSession.sendMessage(`dựa vào nội dung phần trước ở đã gửi ở file trên hãy dịch nội dung sau sang *tiếng Thai*: \n ${SubText} \n . Bám sát phong cánh hành văn của ở file, chỉ trả về văn bản dịch *example: 
0:22|0:28|ทันทีที่เขาเข้าใกล้นิกายดาบปีศาจ คนที่มาต้อนรับตัวละครหลักของเราก็ไม่ใช่ใครอื่นนอกจากสหายเก่าของเขา สี่โง่เขลาดาบปีศาจ พวกเขาพยายามทำตัวแข็งกร้าวกับจัวฟานแต่กลับถูกตัวละครหลักของเราร้องจนร้องไห้ไม่กล้าที่จะซนอีกต่อไป
0:28|0:37|แต่ทันใดนั้น จากระยะไกล คนกลุ่มหนึ่งก็ต่อสู้แย่งชิงสมุนไพรอันล้ำค่า กองกำลังทั้งสองรวมถึง Soul Fiend Sect และ Deep Heaven Sect แต่ดูเหมือนว่า Deep Heaven Sect ได้รับการปฏิบัติเหมือนสุนัข 
0:37|0:51|ในขณะนี้ Shui Ruo Hua ผู้นำของนิกาย Deep Heaven กำลังวิ่งเข้ามาต่อสู้*


**Chú ý**
Có một và từ ở dòng trên bị xuống dòng sai làm làm sai nghĩa câu hãy sắp sếp lại.
Dịch cả tên riêng sang tiếng Thai. Ưu tiên lấy tên riêng, tên nhân vật từ file đã gửi nếu có
Chỉ trả lại kết quả dịch. Dịch đủ phân cảnh đã tải lên
`);


console.log(result.response.text());
                fs.appendFileSync("./" +rootFolder+`/translatedSubTHAILAN/translate${videoIndex}.txt`, result.response.text().replace(/[*]/g, ""));
              
                //if (chunk.text().includes(lastImageNameMatch)) return Promise.resolve;
            
              //await sendChatRepeat(chatSession,lastImageNameMatch)
              return Promise.resolve;
}
async function sendChatRepeat(chatSession,lastImageNameMatch) {
  // TODO Make these files available on the local file system
  try {
    let promise;
    let isContinue=true;
    while (isContinue) {
      const resultContinue = await chatSession.sendMessageStream(
        "tiếp"
      );
      for await (const chunk of resultContinue.stream) {
        console.log(chunk.text());
        fs.appendFileSync("translate.txt", chunk.text().replace(/[*]/g, "").replace(/\s\./g, ""));
        if (chunk.text().includes('. .')) chunk.text().replace(/\.\s\./g, "")
        if (chunk.text().includes(lastImageNameMatch)) {promise = Promise.resolve; isContinue=false; break;}
      }
    }
     await Promise.all([promise])
     return Promise.resolve;
  } catch(error) {
    console.log(error+"\n Try Again");
    sendChatRepeat(chatSession,lastImageNameMatch);
  }
}


function readLastLine(filePath, callback) {
  fs.stat(filePath, (err, stats) => {
      if (err) {
          return callback(err);
      }

      const fileSize = stats.size;
      const bufferSize = 1024;
      let buffer = Buffer.alloc(bufferSize);
      let position = fileSize - bufferSize;
      let data = '';
      let foundLine = false;

      if (position < 0) {
          position = 0;
      }

      const readStream = fs.createReadStream(filePath, {
          start: position,
          end: fileSize - 1,
          encoding: 'utf-8'
      });

      readStream.on('data', chunk => {
          data = chunk + data;
          const lines = data.split('\n');

          if (lines.length > 1) {
              foundLine = true;
              readStream.destroy();
              callback(null, lines.slice(-2)); // Return the last two lines
          } else {
              position -= bufferSize;

              if (position < 0) {
                  position = 0;
              }

              readStream.destroy();
              readStream.open();
          }
      });

      readStream.on('end', () => {
          if (!foundLine) {
              const lines = data.split('\n');
              callback(null, lines.slice(-2)); // Return the last two lines
          }
      });

      readStream.on('error', err => {
          callback(err);
      });
  });
}

async function getLastOrSecondLastLine(filePath) {
  return new Promise((resolve, reject) => {
      readLastLine(filePath, (err, lines) => {
          if (err) {
              return reject(err);
          }
          
          let lastLine = lines[lines.length - 1];
          let secondLastLine = lines.length > 1 ? lines[lines.length - 2] : null;
          
          if (lastLine.includes('|')) {
              resolve(lastLine);
          } else if (secondLastLine) {
              resolve(secondLastLine);
          } else {
              resolve(lastLine);
          }
      });
  });
}

async function runTranslateText(rootFolder,videoIndex,ApiKey){
  await setUpGemini(rootFolder,videoIndex,ApiKey);
  return Promise.resolve;
}
module.exports = runTranslateText;
//runTranslateText()
