const fs = require("fs");
const youtubeVideoDownload = require("./youtubeVideoDownload");
const youtubeVideoDownloadWithFormat = require("./youtubeVideoDownloadWithFormat");
const sendVideoToGemini = require("./sendVideoToGemini");
const cutVideoByTimeStampThenSendToGemini = require("./cutVideoByTimeStampThenSendToGemini");
const sendVideoAndSubToReSub = require("./sendVideoAndSubToReSub");
const sendVideoToGeminiChatTwo = require("./sendVideoToGeminiChatTwo");
const sendFileToGeminiToTranslateText = require("./sendFileToGeminiToTranslateText");
const extractImageAndMakeMp3 = require("./extractImageAndMakeMp3");
const createVideoFromImagesAndMp3Folder = require("./createVideoFromImagesAndMp3Folder");
const extractImageAndMakeMp3VN = require("./extractImageAndMakeMp3VN");
const createVideoFromImagesAndMp3FolderVN = require("./createVideoFromImagesAndMp3FolderVNZoom");
const { error } = require("console");

async function Run() {
  let apiKeys = process.env.API_KEY.split("|");
  fs.writeFileSync("Log.txt", "");

  if (!fs.existsSync("LogErrorIndex.txt"))
    fs.writeFileSync("./LogErrorIndex.txt", "");
  const textData = fs.readFileSync("./LogErrorIndex.txt", "utf-8");
  let rootFolder = `${Date.now()}`;
  let index = 0;
  //fs.writeFileSync("LogErrorIndex.txt",'');

  const urls = fs
    .readFileSync("./youtubeLinks.txt", "utf-8")
    .split("\n")
    .filter((line) => line.trim() !== "");
  //run

  for (const url of urls) {
    const urlParams = new URLSearchParams(url);
    if (!urlParams) continue;
    let indexInLink = parseInt(urlParams.get("index"));
    let videoID = urlParams.get("https://www.youtube.com/watch?v");
    if (indexInLink) {
      index = indexInLink;
      console.log("Index:", index); // Output: Index: 5
    } else {
      index++;
      console.log("Index not found in the URL");
    }
    if (urlParams.get("list")) rootFolder = urlParams.get("list");
    if (!fs.existsSync(rootFolder)) {
      fs.mkdirSync(rootFolder);
      [
        "./images",
        "./mp3",
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
      });
    }
    if (index <= 0) continue;
    index = 1000000 + index;
    //if (!textData.includes(index.toString())) continue;
    try {
      //set up dir


      console.log("Bắt đầu tạo video VN");
      try {
        try {
          await createVideoFromImagesAndMp3FolderVN(rootFolder, index, videoID);
        } catch {
          await createVideoFromImagesAndMp3FolderVN(rootFolder, index, videoID);
        }
      } catch {
        await createVideoFromImagesAndMp3FolderVN(rootFolder, index, videoID);
      }

      console.log("Kết thúc tạo video VN");

      
    } catch (error) {
      console.error(error);
      console.error("Lỗi khi tạo video từ link" + url);
      fs.appendFileSync("Log.txt", "Lỗi khi tạo video từ link: " + url + "\n");
      fs.appendFileSync("LogErrorIndex.txt", index + "\n");
    }
  }
  console.log("Hoàn thành toàn bộ");return;
}

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


Run();
