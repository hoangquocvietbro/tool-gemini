 
const fs = require("fs");
  const youtubeVideoDownload = require("./youtubeVideoDownload");
const removeAudioFromVideo = require("./removeAudioFromVideo");
const youtubeVideoDownloadWithFormat = require("./youtubeVideoDownloadWithFormat");
const createTimeStamps = require("./createTimeStamps");
const sendVideoToGemini = require("./sendVideoToGemini");
const cutVideoByTimeStampThenSendToGemini = require("./cutVideoByTimeStampThenSendToGemini");
const cutVideoByTimeStampThenConvertToText = require("./cutVideoByTimeStampThenConvertToText");
const cutVideoThenSpeechToTextPhoWhisper = require("./cutVideoThenSpeechToTextPhoWhisper1")
const sendVideoAndSubToReSub = require("./sendAudioAndSubToReSub");
const sendVideoToGeminiChatTwo = require("./sendVideoToGeminiChatTwo");
const reSendVideoToGemini = require("./reSendVideoToGemini");
const sendFileToGeminiToTranslateText = require("./sendFileToGeminiToTranslateText");
const extractImage = require("./extractImage");
const extractImageNoRemoveText = require("./extractImageNoRemoveText");
const extractImageAndMakeMp3 = require("./extractImageAndMakeMp3");
const createVideoFromImagesAndMp3Folder = require("./createVideoFromImagesAndMp3FolderZoom");
const extractImageAndMakeMp3VN = require("./extractImageAndMakeMp3VN");
const createVideoFromImagesAndMp3FolderVN = require("./createVideoFromImagesAndMp3FolderVNZoom");
const { error } = require("console");
const youtubeVideoDownloadAudioOnly = require("./youtubeVideoDownloadAudioOnly");
const runImgTextRemoveServer = require('./runImgTextRemoveServer')
let [language,symbol] = ["english","en"];
try{
[language,symbol] = fs.readFileSync('language.txt',"utf-8").split("|")
}catch{}
var apiKeys = process.env.API_KEY_PROCESS_SEGMENT.split("|").slice(5);

// Lấy tất cả các tham số truyền vào, bắt đầu từ vị trí thứ 2 trở đi
const args = process.argv.slice(2);
// Kiểm tra nếu có tham số truyền vào
    let startIndex = 0; // lấy tham số đầu tiên
    let endIndex = 300; // lấy tham số thứ hai
if (args[0]) {
     startIndex = args[0]; // lấy tham số đầu tiên
}
if (args[1]) {
     endIndex = args[1]; // lấy tham số thứ hai
}
  const urls = fs
    .readFileSync("./youtubeLinks.txt", "utf-8")
    .split("\n")
    .filter((line) => line.trim() !== "");
        const urlParams = new URLSearchParams(urls[0]);
        let videoID = urlParams.get("https://www.youtube.com/watch?v");
async function Run(apiKeys, startIndex = 0,condition=false,endIndex=10,colors,colorIndex, console = {}) {


   const logColor = function (...args) {
    // Thêm mã màu vào trước mỗi tham số
    const coloredArgs = args.map(arg => `${colors[colorIndex]}${arg}${Reset}`);
    // Gọi hàm console.log gốc với các tham số đã thêm màu
    originalConsoleLog.apply(console, coloredArgs);
};
  originConsole.log=logColor;
  console = originConsole;
  endIndex= endIndex;
  fs.writeFileSync("Log.txt", "");
  if (!fs.existsSync("LogErrorIndex.txt"))
    fs.writeFileSync("./LogErrorIndex.txt", "");
  const textData = fs.readFileSync("./LogErrorIndex.txt", "utf-8");
  let rootFolder = videoID;
  if (args[2]) {
     rootFolder = args[2]; // lấy tham số thứ hai
}
  let index = startIndex - 1;
  //fs.writeFileSync("LogErrorIndex.txt",'');
  console.log(startIndex);
  console.log(endIndex);
  for (let i = startIndex; i < endIndex; i++) {
    console.log(endIndex);
    index++;
    console.log(index);
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
    const realIndex = index;
    
    if(startIndex!=0){
          if (index < startIndex) continue;
          if (index > 500) process.exit();
    }
    if(endIndex!=0){
          if (index > endIndex) continue;
    }
    // if (fs.existsSync("./" + rootFolder + "/" + "originSub/"+`sub${1000000+index}.txt`)) continue;
    //if (fs.existsSync("./" + rootFolder + "/" + "VideoVNmese/"+`${1000000+index}_ .mp4`)) continue;
    //if (fs.existsSync("./" + rootFolder + "/" + "VideoTranslated/"+`${1000000+index}_ .mp4`)) continue;
    index = 1000000 + index;

    //if (!textData.includes(index.toString())) continue;
    await TaskReview(rootFolder, index, apiKeys, (videoID = " "),0,console);
    index = realIndex;
  }
  console.log("Hoàn thành toàn bộ");
}

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function TaskReview(
  rootFolder,
  index,
  apiKeys,
  videoID = " ",
  IndexApi = 0,
  console
) {
  console.log(apiKeys[0]);
  try {




    console.log("Bắt đầu cắt video thành list timestamps");
    await retry(createTimeStamps,[rootFolder, index]);
    console.log("Hoàn thành cắt video thành list timestamps");

    console.log("Bắt đầu cắt video theo list timestamps sau đó chuyển sang text");
    await retry(cutVideoThenSpeechToTextPhoWhisper,[rootFolder, index, apiKeys[IndexApi]]);
    console.log("Hoàn thành cắt video theo list timestamps sau đó chuyển sang text");

    console.log("Bắt đầu gửi file sub turn one để sub lại");
    await retry(sendVideoAndSubToReSub,[rootFolder, index, apiKeys[IndexApi]],apiKeys.length,apiKeys);
    console.log("Hoàn thành gửi file sub turn one để sub lại");


    console.log("Bắt đầu extract image");
    await retry(extractImageNoRemoveText, [rootFolder, index]);
    console.log("Hoàn thành extract");

/*
    runImgTextRemoveServer.runServer();
    await wait(60000)
    console.log("Bắt đầu extract image");
    await retry(extractImage, [rootFolder, index]);
    console.log("Hoàn thành extract");
    runImgTextRemoveServer.exitServer();
*/
    console.log("Bắt đầu extract mp3 file VN");
    await retry(extractImageAndMakeMp3VN, [rootFolder, index]);
    console.log("Hoàn thành extract mp3 file VN");

    console.log("Bắt đầu tạo video VN");
    await retry(createVideoFromImagesAndMp3FolderVN, [rootFolder, index, videoID]);
    console.log("Kết thúc tạo video VN");

    console.log("Bắt đầu chuyển văn bản sang "+language);
    await retry(sendFileToGeminiToTranslateText, [rootFolder, index, apiKeys[IndexApi+1]], apiKeys.length, apiKeys);
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
  async function retry(fn, args, retries = 3,apiKeys=[], IndexApi = 1) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(args[2]);
      await fn(...args);
      return true;
    } catch (error) { console.log(error);
      if (i === retries - 1) throw error;
      args[2] = apiKeys[IndexApi + i]; //change api key
      console.log(
        `Retry ${i + 1} for function ${fn.name} failed with error: ${error}`
      );
    }
  }
}
}



// Lưu lại hàm console.log gốc
const originConsole = console;
const originalConsoleLog = console.log;

// Định nghĩa các mã màu ANSI
const colors = [
    "\x1b[32m", // Xanh lá
    "\x1b[33m", // Vàng
    "\x1b[34m", // Xanh dương
    "\x1b[35m", // Tím
    "\x1b[36m", // Xanh lơ
    "\x1b[37m", // Trắng
    "\x1b[90m", // Xám
    "\x1b[91m", // Đỏ nhạt
    "\x1b[92m", // Xanh lá nhạt
    "\x1b[93m", // Vàng nhạt
    "\x1b[94m", // Xanh dương nhạt
    "\x1b[95m", // Tím nhạt
    "\x1b[96m", // Xanh lơ nhạt
    "\x1b[97m", // Trắng nhạt
    "\x1b[40m", // Nền đen
    "\x1b[41m", // Nền đỏ
    "\x1b[42m", // Nền xanh lá
    "\x1b[43m", // Nền vàng
    "\x1b[44m", // Nền xanh dương
    "\x1b[45m", // Nền tím
    "\x1b[46m", // Nền xanh lơ
    "\x1b[47m", // Nền trắng
    "\x1b[100m", // Nền xám
    "\x1b[101m", // Nền đỏ nhạt
    "\x1b[102m", // Nền xanh lá nhạt
    "\x1b[103m", // Nền vàng nhạt
    "\x1b[104m", // Nền xanh dương nhạt
    "\x1b[105m", // Nền tím nhạt
    "\x1b[106m", // Nền xanh lơ nhạt
    "\x1b[107m", // Nền trắng nhạt
];

const Reset = "\x1b[0m";
let colorIndex=0;

const apiStep = 555;
const numberTaskInOneRun = 150;
async function runTask(){
for(let i=0;i<apiKeys.length;i = i + apiStep){

  Run(apiKeys.slice(i,i+apiStep), startIndex,false,endIndex,colors,(colorIndex++));
  startIndex += numberTaskInOneRun;
  await wait(180000)
}
}
runTask()
// cd /content/drive/MyDrive/tool gemini/PLc2ttf_U-sGPsFV4TIZBDiqscDxEgcSvZ/originVideo
// !ffmpeg -i videoplayback1.mp4 -c copy -map 0 -segment_time 300 -reset_timestamps 1 -f segment videoplayback1%06d.mp4





/*

const fs = require("fs");
const youtubeVideoDownload = require("./youtubeVideoDownload");
const youtubeVideoDownloadWithFormat = require("./youtubeVideoDownloadWithFormat");
const sendVideoToGemini = require("./sendVideoToGemini");
const cutVideoByTimeStampThenSendToGemini = require("./cutVideoByTimeStampThenConvertToText");
const sendVideoAndSubToReSub = require("./sendVideoAndSubToReSub");
const sendVideoToGeminiChatTwo = require("./sendVideoToGeminiChatTwo");
const reSendVideoToGemini = require("./reSendVideoToGemini");
const sendFileToGeminiToTranslateText = require("./sendFileToGeminiToTranslateText");
const extractImageAndMakeMp3 = require("./extractImageAndMakeMp3");
const createVideoFromImagesAndMp3Folder = require("./createVideoFromImagesAndMp3Folder");
const extractImageAndMakeMp3VN = require("./extractImageAndMakeMp3VN");
const createVideoFromImagesAndMp3FolderVN = require("./createVideoFromImagesAndMp3FolderVN");
const { error } = require("console");
const youtubeVideoDownloadAudioOnly = require("./youtubeVideoDownloadAudioOnly");
let apiKeys = process.env.API_KEY_PROCESS_SEGMENT.split("|");

async function Run() {

  fs.writeFileSync("Log.txt", "");

  if (!fs.existsSync("LogErrorIndex.txt"))
    fs.writeFileSync("./LogErrorIndex.txt", "");
  const textData = fs.readFileSync("./LogErrorIndex.txt", "utf-8");
  let rootFolder = `QuaiLucLoanThan`;
  let index = 2;
  //fs.writeFileSync("LogErrorIndex.txt",'');



  for (let i = 0;i<1000;i++) {
  
    index++;
    console.log(index)
    if (!fs.existsSync(rootFolder)) {
      fs.mkdirSync(rootFolder);
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
        "./audioFileListVN",
        "./outputVideoVN",
        "./videoFileListVN",
        "./VideoVNmese",
        "./VideoTranslated",
        "./timeStamps",
        "./outputVideoSliced",
        "./SubTurnOne",
      ].forEach((dir, index, dirs) => {
        fs.mkdirSync("./" + rootFolder + "/" + dir);
      });}
    const realIndex = index;
    if (index <  3 || index >  11) continue;
    index = 1000000 + index;
    //if (!textData.includes(index.toString())) continue;
    await TaskReview(rootFolder, index, apiKeys, videoID=" ");
    index = realIndex;
  }
  console.log("Hoàn thành toàn bộ");

}

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function TaskReview(rootFolder, index, apiKeys, videoID=" ",IndexApi=0) {
  try {
    
    console.log("Bắt đầu chuyển video thành list timestamps");
    await retry(sendVideoToGemini, [rootFolder, index, apiKeys[IndexApi]], apiKeys.length);
    console.log("Hoàn thành chuyển video thành list timestamps");

    console.log("Bắt đầu chuyển video thành list timestamps chi tiết hơn");
    await retry(reSendVideoToGemini, [rootFolder, index, apiKeys[IndexApi]], apiKeys.length);
    console.log("Hoàn thành chuyển video thành list timestamps chi tiết hơn");

    console.log("Bắt đầu cắt video theo list timestamps sau đó chuyển sang text");
    await retry(cutVideoThenSpeechToTextPhoWhisper, [rootFolder, index, apiKeys[IndexApi]], apiKeys.length);
    console.log("Hoàn thành cắt video theo list timestamps sau đó chuyển sang text");


    console.log("Bắt đầu gửi file sub turn one để sub lại");
    await retry(sendVideoAndSubToReSub, [rootFolder, index, apiKeys[IndexApi]], apiKeys.length);
    console.log("Hoàn thành gửi file sub turn one để sub lại");

    console.log("Bắt đầu extract image và download mp3 file VN");
    await retry(extractImageAndMakeMp3VN, [rootFolder, index]);
    console.log("Hoàn thành extract image và download mp3 file VN");

    console.log("Bắt đầu tạo video VN");
    await retry(createVideoFromImagesAndMp3FolderVN, [rootFolder, index, videoID]);
    console.log("Kết thúc tạo video VN");

    console.log("Bắt đầu chuyển văn bản sang tiếng anh");
    await retry(sendFileToGeminiToTranslateText, [rootFolder, index, apiKeys[IndexApi]], apiKeys.length);
    console.log("Hoàn thành chuyển văn bản sang tiếng anh");

    console.log("Bắt đầu extract image và download mp3 file đã dịch");
    await retry(extractImageAndMakeMp3, [rootFolder, index]);
    console.log("Hoàn thành extract image và download mp3 file đã dịch");

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

async function retry(fn, args, retries = 3, IndexApi = 0) {
  for (let i = 0; i < retries; i++) {
    try {
      await wait(60000);
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
// cd /content/drive/MyDrive/tool gemini/PLc2ttf_U-sGPsFV4TIZBDiqscDxEgcSvZ/originVideo
// !ffmpeg -i videoplayback1.mp4 -c copy -map 0 -segment_time 300 -reset_timestamps 1 -f segment videoplayback1%06d.mp4

    */
