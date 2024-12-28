const fs = require("fs");
const youtubeVideoDownload = require("./youtubeVideoDownload");
const longYoutubeVideoDownload = require("./longYoutubeVideoDownload");
const removeAudioFromVideo = require("./removeAudioFromVideo");
const youtubeVideoDownloadWithFormat = require("./youtubeVideoDownloadWithFormat");
const createTimeStamps = require("./createTimeStamps");
const sendVideoToGemini = require("./sendVideoToGemini");
const cutVideoByTimeStampThenSendToGemini = require("./cutVideoByTimeStampThenSendToGemini");
const cutVideoByTimeStampThenConvertToText = require("./cutVideoByTimeStampThenConvertToText");
const cutVideoThenSpeechToTextPhoWhisper = require("./cutVideoThenSpeechToTextPhoWhisper")
const sendVideoAndSubToReSub = require("./sendAudioAndSubToReSub");
const sendVideoToGeminiChatTwo = require("./sendVideoToGeminiChatTwo");
const reSendVideoToGemini = require("./reSendVideoToGemini");
const sendFileToGeminiToTranslateText = require("./sendFileToGeminiToTranslateText");
const extractImage = require("./extractImageProtectCopyright");
const extractImageAndMakeMp3 = require("./extractImageAndMakeMp3");
const createVideoFromImagesAndMp3Folder = require("./createVideoFromImagesAndMp3FolderZoom");
const extractImageAndMakeMp3VN = require("./extractImageAndMakeMp3VN");
const createVideoFromImagesAndMp3FolderVN = require("./createVideoFromImagesAndMp3FolderVN");
const { error } = require("console");
const youtubeVideoDownloadAudioOnly = require("./youtubeVideoDownloadAudioOnly");
const runImgTextRemoveServer = require('./runImgTextRemoveServer')

let [language,symbol] = ["english","en"];
try{
[language,symbol] = fs.readFileSync('language.txt',"utf-8").split("|")
}catch{}

// Lấy tất cả các tham số truyền vào, bắt đầu từ vị trí thứ 2 trở đi
const args = process.argv.slice(2);

// Kiểm tra nếu có tham số truyền vào
    let startIndex = 0; // lấy tham số đầu tiên
    let endIndex = 0; // lấy tham số thứ hai
if (args.length > 0) {
     startIndex = args[0]; // lấy tham số đầu tiên
     endIndex = args[0]; // lấy tham số thứ hai

}
async function Run() {
  let apiKeys = process.env.API_KEY.split("|");
  fs.writeFileSync("Log.txt", "");

  if (!fs.existsSync("LogErrorIndex.txt"))
    fs.writeFileSync("./LogErrorIndex.txt", "");
  const textData = fs.readFileSync("./LogErrorIndex.txt", "utf-8");
  let rootFolder = `${Date.now()}`;
  let index = 0;
  fs.writeFileSync("LogErrorIndex.txt",'');

  const urls = fs
    .readFileSync("./youtubeLinks.txt", "utf-8")
    .split("\n")
    .filter((line) => line.trim() !== "");

  for (const url of urls) {
    const urlParams = new URLSearchParams(url);
    if (!urlParams) continue;
    let indexInLink = parseInt(urlParams.get("index"));
    let videoID = urlParams.get("https://www.youtube.com/watch?v");
    if (indexInLink) {
      index = indexInLink;
      console.log("Index:", index);  Output: Index: 5
    } else {
      index++;
      console.log("Index not found in the URL");
    }
    if (urlParams.get("list")) rootFolder = urlParams.get("list");
    if (!fs.existsSync(rootFolder)) {
      fs.mkdirSync(rootFolder);
    }
        [
      "./images",
      "./mp3",
      "./mp3Video",
      "./audioFileList",
      "./imageFileList",
      "./videoFileList",
      "./outputVideo",
      "./originSub",
      "./translatedSub",
      "./originVideo",
      "./mp3VN",
      "./noAudioVideo",
      "./audioFileListVN",
      "./outputVideoVN",
      "./videoFileListVN",
      "./VideoVNmese",
      "./VideoTranslated",
      "./timeStamps",
      "./outputVideoSliced",
      "./SubTurnOne",
    ].forEach((dir, index, dirs) => {
      if (!fs.existsSync("./" + rootFolder + "/" + dir)) {
        fs.mkdirSync("./" + rootFolder + "/" + dir);
      }
    });
    if(startIndex!=0){
          if (index < startIndex) continue;
    }
    if(endIndex!=0){
          if (index > endIndex) continue;
    }
    index = 1000000 + index;
      //if (fs.existsSync("./" + rootFolder + "/" + "VideoVNmese/"+`${index}_null.mp4`)) continue;
      //if (fs.existsSync("./" + rootFolder + "/" + "VideoVNmese/"+`${index}_.mp4`)) continue;
      //if (fs.existsSync("./" + rootFolder + "/" + "VideoVNmese/"+`${index}_.mp4`)) continue;
      //if (fs.existsSync("./" +rootFolder+`/translatedSub/translate${index}.txt`)) continue;
    //if (!textData.includes(index.toString())) continue;
    await TaskReview(rootFolder, index, apiKeys,url, videoID);
  }
  console.log("Hoàn thành toàn bộ");
  process.exit()
}

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function TaskReview(rootFolder, index, apiKeys,url, videoID=" ",IndexApi=0) {
  try {
   

    //runImgTextRemoveServer.runServer();
    //await wait(90000)
    console.log("Bắt đầu extract image");
    await retry(extractImage, [rootFolder, index]);
    console.log("Hoàn thành extract");
    runImgTextRemoveServer.exitServer();

   
  } catch (error) {
    console.error(error);
    console.error(`Lỗi khi tạo video từ link: ${index}`);
    fs.appendFileSync("Log.txt", `Lỗi khi tạo video từ link: ${index}\n`);
    fs.appendFileSync("LogErrorIndex.txt", `${index}\n`);
  }
}

async function retry(fn, args, retries = 3,apiKeys=[], IndexApi = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(args[2])
      return await fn(...args);
    } catch (error) {
      if (i === retries - 1) throw error;
      args[2] = apiKeys[IndexApi+i];//change api key
      console.log(`Retry ${i + 1} for function ${fn.name} failed with error: ${error}`);
    }
  }
}



Run();



/*
const fs = require("fs");
const youtubeVideoDownload = require("./youtubeVideoDownload");
const longYoutubeVideoDownload = require("./longYoutubeVideoDownload");
const removeAudioFromVideo = require("./removeAudioFromVideo");
const youtubeVideoDownloadWithFormat = require("./youtubeVideoDownloadWithFormat");
const createTimeStamps = require("./createTimeStamps");
const sendVideoToGemini = require("./sendVideoToGemini");
const cutVideoByTimeStampThenSendToGemini = require("./cutVideoByTimeStampThenSendToGemini");
const cutVideoByTimeStampThenConvertToText = require("./cutVideoByTimeStampThenConvertToText");
const cutVideoThenSpeechToTextPhoWhisper = require("./cutVideoThenSpeechToTextPhoWhisper")
const sendVideoAndSubToReSub = require("./sendAudioAndSubToReSub");
const sendVideoToGeminiChatTwo = require("./sendVideoToGeminiChatTwo");
const reSendVideoToGemini = require("./reSendVideoToGemini");
const sendFileToGeminiToTranslateText = require("./sendFileToGeminiToTranslateText");
const extractImage = require("./extractImage");
const extractImageAndMakeMp3 = require("./extractImageAndMakeMp3");
const createVideoFromImagesAndMp3Folder = require("./createVideoFromImagesAndMp3FolderZoom");
const extractImageAndMakeMp3VN = require("./extractImageAndMakeMp3VN");
const createVideoFromImagesAndMp3FolderVN = require("./createVideoFromImagesAndMp3FolderVN");
const { error } = require("console");
const youtubeVideoDownloadAudioOnly = require("./youtubeVideoDownloadAudioOnly");
const runImgTextRemoveServer = require('./runImgTextRemoveServer')

let [language,symbol] = ["english","en"];
try{
[language,symbol] = fs.readFileSync('language.txt',"utf-8").split("|")
}catch{}

// Lấy tất cả các tham số truyền vào, bắt đầu từ vị trí thứ 2 trở đi
const args = process.argv.slice(2);

// Kiểm tra nếu có tham số truyền vào
    let startIndex = 0; // lấy tham số đầu tiên
    let endIndex = 0; // lấy tham số thứ hai
if (args.length > 0) {
     startIndex = args[0]; // lấy tham số đầu tiên
     endIndex = args[0]; // lấy tham số thứ hai

}
async function Run() {
  let apiKeys = process.env.API_KEY.split("|");
  fs.writeFileSync("Log.txt", "");

  if (!fs.existsSync("LogErrorIndex.txt"))
    fs.writeFileSync("./LogErrorIndex.txt", "");
  const textData = fs.readFileSync("./LogErrorIndex.txt", "utf-8");
  let rootFolder = `${Date.now()}`;
  let index = 0;
  fs.writeFileSync("LogErrorIndex.txt",'');

  const urls = fs
    .readFileSync("./youtubeLinks.txt", "utf-8")
    .split("\n")
    .filter((line) => line.trim() !== "");

  for (const url of urls) {
    const urlParams = new URLSearchParams(url);
    if (!urlParams) continue;
    let indexInLink = parseInt(urlParams.get("index"));
    let videoID = urlParams.get("https://www.youtube.com/watch?v");
    if (indexInLink) {
      index = indexInLink;
      console.log("Index:", index);  Output: Index: 5
    } else {
      index++;
      console.log("Index not found in the URL");
    }
    if (urlParams.get("list")) rootFolder = urlParams.get("list");
    if (!fs.existsSync(rootFolder)) {
      fs.mkdirSync(rootFolder);
    }
        [
      "./images",
      "./mp3",
      "./mp3Video",
      "./audioFileList",
      "./imageFileList",
      "./videoFileList",
      "./outputVideo",
      "./originSub",
      "./translatedSub",
      "./originVideo",
      "./mp3VN",
      "./noAudioVideo",
      "./audioFileListVN",
      "./outputVideoVN",
      "./videoFileListVN",
      "./VideoVNmese",
      "./VideoTranslated",
      "./timeStamps",
      "./outputVideoSliced",
      "./SubTurnOne",
    ].forEach((dir, index, dirs) => {
      if (!fs.existsSync("./" + rootFolder + "/" + dir)) {
        fs.mkdirSync("./" + rootFolder + "/" + dir);
      }
    });
    if(startIndex!=0){
          if (index < startIndex) continue;
    }
    if(endIndex!=0){
          if (index > endIndex) continue;
    }
    index = 1000000 + index;
      //if (fs.existsSync("./" + rootFolder + "/" + "VideoVNmese/"+`${index}_null.mp4`)) continue;
      //if (fs.existsSync("./" + rootFolder + "/" + "VideoVNmese/"+`${index}_.mp4`)) continue;
      //if (fs.existsSync("./" + rootFolder + "/" + "VideoVNmese/"+`${index}_.mp4`)) continue;
      //if (fs.existsSync("./" +rootFolder+`/translatedSub/translate${index}.txt`)) continue;
    //if (!textData.includes(index.toString())) continue;
    await TaskReview(rootFolder, index, apiKeys,url, videoID);
  }
  console.log("Hoàn thành toàn bộ");
  process.exit()
}

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function TaskReview(rootFolder, index, apiKeys,url, videoID=" ",IndexApi=0) {
  try {
   
      
    if (!fs.existsSync("./" + rootFolder + `/originVideo/videoplayback${index}.mp4`)) {
          console.log("Bắt đầu download video");
          await retry(youtubeVideoDownload,[url, "./" + rootFolder + `/originVideo/videoplayback${index}.mp4`]);
          console.log("Hoàn thành download video");
          
          console.log("Bắt đầu download video chất lượng cao");
          await retry(youtubeVideoDownloadWithFormat,[url,"./" + rootFolder + `/originVideo/videoHightQuality${index}.mp4`,'720p']);
          console.log("Hoàn thành download video chất lượng cao");
    }
    console.log("Bắt đầu chuyển video thành list timestamps");
    await retry(createTimeStamps, [rootFolder, index]);
    console.log("Hoàn thành chuyển video thành list timestamps");

    console.log("Bắt đầu cắt video theo list timestamps sau đó chuyển sang text");
    await retry(cutVideoThenSpeechToTextPhoWhisper, [rootFolder, index, apiKeys[IndexApi]]);
    console.log("Hoàn thành cắt video theo list timestamps sau đó chuyển sang text");

    console.log("Bắt đầu gửi file sub turn one để sub lại");
    await retry(sendVideoAndSubToReSub, [rootFolder, index, apiKeys[IndexApi]], apiKeys.length, apiKeys);
    console.log("Hoàn thành gửi file sub turn one để sub lại");


    runImgTextRemoveServer.runServer();
    await wait(90000)
    console.log("Bắt đầu extract image");
    await retry(extractImage, [rootFolder, index]);
    console.log("Hoàn thành extract");
    runImgTextRemoveServer.exitServer();

    console.log("Bắt đầu extract mp3 file VN");
    await retry(extractImageAndMakeMp3VN, [rootFolder, index]);
    console.log("Hoàn thành extract mp3 file VN");

    console.log("Bắt đầu tạo video VN");
    await retry(createVideoFromImagesAndMp3FolderVN, [rootFolder, index, videoID]);
    console.log("Kết thúc tạo video VN");

    console.log("Bắt đầu chuyển văn bản sang "+language);
    await retry(sendFileToGeminiToTranslateText, [rootFolder, index, apiKeys[IndexApi]], apiKeys.length, apiKeys);
    console.log("Hoàn thành chuyển văn bản sang "+language);

    console.log("Bắt đầu extract mp3 file đã dịch");
    await retry(extractImageAndMakeMp3, [rootFolder, index]);
    console.log("Hoàn thành extract mp3 file đã dịch");

    console.log("Bắt đầu tạo video dịch");
    await retry(createVideoFromImagesAndMp3Folder, [rootFolder, index, videoID]);
    console.log("Kết thúc tạo video dịch");

  } catch (error) {
    console.error(error);
    console.error(`Lỗi khi tạo video từ link: ${index}`);
    fs.appendFileSync("Log.txt", `Lỗi khi tạo video từ link: ${index}\n`);
    fs.appendFileSync("LogErrorIndex.txt", `${index}\n`);
  }
}

async function retry(fn, args, retries = 3,apiKeys=[], IndexApi = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(args[2])
      return await fn(...args);
    } catch (error) {
      if (i === retries - 1) throw error;
      args[2] = apiKeys[IndexApi+i];//change api key
      console.log(`Retry ${i + 1} for function ${fn.name} failed with error: ${error}`);
    }
  }
}



Run();


*/