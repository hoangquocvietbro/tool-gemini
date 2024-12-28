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
let [language,symbol] = ["english","en"];
try{
[language,symbol] = fs.readFileSync('language.txt',"utf-8").split("|")
}catch{}
/**
 * Uploads the given file to Gemini.
 *
 * See https://ai.google.dev/gemini-api/docs/prompting_with_media
 */
async function uploadToGemini(filePath, mimeType,fileManager) {
  const uploadResult = await fileManager.uploadFile(filePath, {
    mimeType,
    displayName: path.basename(filePath),
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
    console.log("\nfile id là: "+name)
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
        responseMimeType: "application/json",
      };
      
      // let LastLine = await getLastOrSecondLastLine("resultText.txt");
    
      // const [lastImage] = LastLine.split("|");
      // const [lastImageName] = lastImage.split(".");
      // const lastImageNameMatch = lastImageName.substring(6);
      // You may need to update the file paths
      const files = [
        fs.existsSync("./" +rootFolder+`/translatedSub${language}/translate${videoIndex-1}.txt`)? await uploadToGemini("./" +rootFolder+`/translatedSub${language}/translate${videoIndex-1}.txt`, "text/plain",fileManager): (fs.existsSync("./" +rootFolder+`/translatedSub${language}/translate${videoIndex-2}.txt`)? await uploadToGemini("./" +rootFolder+`/translatedSub${language}/translate${videoIndex-2}.txt`, "text/plain",fileManager):(        fs.existsSync("./" +rootFolder+`/translatedSub${language}/translate${videoIndex-3}.txt`)? await uploadToGemini("./" +rootFolder+`/translatedSub${language}/translate${videoIndex-3}.txt`, "text/plain",fileManager):await uploadToGemini(`./translate.txt`, "text/plain",fileManager))),
      ];
    
      // Some files have a processing delay. Wait for them to be ready.
        // await waitForFilesActive(files);
    
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


      let mangaName = "";
      if(fs.existsSync("./" +rootFolder+`/mangaName.txt`)) mangaName = fs.readFileSync("./" +rootFolder+`/mangaName.txt`,"utf-8");
      let SubText = fs.readFileSync("./" +rootFolder+`/translatedSub/translate${videoIndex}.json`,"utf-8")
   
      /*
      const result =

        await chatSession.sendMessage(`dựa vào nội dung phần trước ở đã gửi ở trên hãy dịch nội dung sau: \n ${SubText} \n sang *tiếng anh*. Bám sát phong cánh hành văn của ở fileSub.txt và định dang ở file sub.txt. Kết quả trả về *không in đậm*, chỉ trả về văn bản dịch *example: 
0:22|0:28|As soon as he approached the Devil Sword Sect, the person who came to welcome our main character was none other than his old comrade, the Devil Sword Four Idiots. They tried to act tough with Zhuo Fan but were chanted by our main character until they cried, not daring to be mischievous anymore.
0:28|0:37|But suddenly, from afar, a group of people were fighting over a precious medicinal herb. The two forces included the Soul Fiend Sect and the Profound Heaven Sect, but it seemed that the Profound Heaven Sect was being treated like a dog. 
0:37|0:51|At this moment, Shui Ruo Hua, the leader of the Profound Heaven Sect, was rushing up to figh*


**Chú ý**
Có một và từ ở dòng trên bị xuống dòng sai làm làm sai nghĩa câu hãy sắp sếp lại.
Dịch cả tên riêng sang tiếng anh. Ưu tiên lấy tên riêng, tên nhân vật từ file translate.txt nếu có
Chỉ trả lại kết quả dịch
`);
*/


      const result =
await chatSession.sendMessage(`Dựa vào nội dung phần trước ở file đã gửi ở trên hãy dịch nội dung sau: \n\n${mangaName}\n ${SubText} \n\n sang *${language}*

        
**Chú ý**
* Dịch cả tên riêng, tên địa danh theo bản ligtnovel tiếng ${language}. Dịch cả tên các loại động vật, hoa quả sang ${language}.  ** Ưu tiên lấy tên nhân vật từ file đã gửi
* Giữ nguyên số lượng dòng văn bản và format.
* Chữ đã dịch ở dòng nào giữ nguyên ở đúng dòng đó không chuyển sang dòng khác tránh tình trạng dòng không có chữ
* Tất cả các dòng dịch phải có chữ
`);
let textResult = result.response.text()
fs.writeFileSync("./" +rootFolder+`/translatedSub${language}/translate${videoIndex}.json`, textResult);


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
console.log(result.response.text());
console.log(textResult);
                fs.writeFileSync("./" +rootFolder+`/translatedSub${language}/translate${videoIndex}.txt`, textResult.replace(/\*|\[|\]/g, " "));
              
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
