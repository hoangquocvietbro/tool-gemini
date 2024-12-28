const fs = require("fs");
const youtubeVideoDownload = require("./youtubeVideoDownload");
const youtubeVideoDownloadWithFormat = require("./youtubeVideoDownloadWithFormat");
const sendVideoToGemini = require("./sendVideoToGemini");
const sendFileToGeminiToTranslateText = require("./sendFileToGeminiToTranslateText");
const extractImageAndMakeMp3 = require("./extractImageAndMakeMp3");
const createVideoFromImagesAndMp3Folder = require("./createVideoFromImagesAndMp3Folder");
const extractImageAndMakeMp3VN = require("./extractImageAndMakeMp3VN");
const createVideoFromImagesAndMp3FolderVN = require("./createVideoFromImagesAndMp3FolderVN");
const { error } = require("console");
let apiKeys = (process.env.API_KEY).split("|");

async function Run() {

  fs.writeFileSync("Log.txt", "");
  if(!fs.existsSync("LogErrorIndex.txt")) fs.writeFileSync("./LogErrorIndex.txt","");
  const textData = fs.readFileSync("./LogErrorIndex.txt", "utf-8");
  let rootFolder = `${Date.now()}`;
  let index = 0;
  //fs.writeFileSync("LogErrorIndex.txt",'');

  const urls = fs.readFileSync("./youtubeLinks.txt", "utf-8").split("\n").filter((line) => line.trim() !== "");
  //run
  let IndexApi = -1;
  let promiseWaitTranslateText =  new Promise((resolve, reject) => {

  });

  let promiseWaitTaskReviews = [];
  for (const url of urls) {
    if(IndexApi == apiKeys.length - 3) IndexApi = 0
      else IndexApi++;
    const urlParams = new URLSearchParams(url);
    if(!urlParams) continue;
    let indexInLink = parseInt(urlParams.get("index"));
    let videoID = urlParams.get("https://www.youtube.com/watch?v");
    if (indexInLink) {
      index = indexInLink;
      console.log("Index:", index); // Output: Index: 5
    } else {
      index++;
      console.log("Index not found in the URL");
    }
    if(urlParams.get("list")) rootFolder = urlParams.get("list");
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
      ].forEach((dir, index, dirs) => {
        fs.mkdirSync("./" +rootFolder + "/" + dir);
      });
    }
    if(index<=0) continue;
    index = 1000000 + index;



 
   
    promiseWaitTaskReviews.push(TaskReview(rootFolder,url,index, IndexApi, videoID, promiseWaitTranslateText));

    if(promiseWaitTaskReviews.length == 2) 
      {
        await Promise.all(promiseWaitTaskReviews);
        promiseWaitTaskReviews = [];
      }

  }
  console.log("Hoàn thành toàn bộ");
}

async function TaskReview(rootFolder, url ,index, IndexApi ,videoID, promiseWaitTranslateText){
  try {
    //set up dir

    console.log("Bắt đầu download video");
    try {
      try {
        await youtubeVideoDownload(
          url,
          "./" +rootFolder + `/originVideo/videoplayback${index}.mp4`
        );
      } catch {
        await youtubeVideoDownload(
          url,
          "./" +rootFolder + `/originVideo/videoplayback${index}.mp4`
        );
      }
    } catch {
      await youtubeVideoDownload(
        url,
        "./" +rootFolder + `/originVideo/videoplayback${index}.mp4`
      );
    }
    console.log("Hoàn thành download video");
    console.log("Bắt đầu chuyển video thành văn bản");
    try {
      try {
        await sendVideoToGemini(rootFolder, index,apiKeys[IndexApi]);
      } catch(error) {
        console.log("thử lại 1 "+ error);
        await sendVideoToGemini(rootFolder, index,apiKeys[IndexApi + 1]);
      }
    } catch(error) {
      console.log("thử lại 2 "+error);
      await sendVideoToGemini(rootFolder, index,apiKeys[IndexApi + 2]);
    }

    console.log("Hoàn thành chuyển video thành văn bản");
    console.log("Bắt đầu download video chất lượng cao");
    try {
      try {
        await youtubeVideoDownloadWithFormat(
          url,
          "./" +rootFolder + `/originVideo/videoplayback${index}.mp4`,
          "480p"
        );
      } catch {
        await youtubeVideoDownloadWithFormat(
          url,
          "./" +rootFolder + `/originVideo/videoplayback${index}.mp4`,
          "480p"
        );
      }
    } catch {
      await youtubeVideoDownloadWithFormat(
        url,
        "./" +rootFolder + `/originVideo/videoplayback${index}.mp4`,
        "480p"
      );
    }

    console.log("Hoàn thành download video chất lượng cao");
    if(index>1) await promiseWaitTranslateText;
    console.log("translate file index "+ index);
    console.log("Bắt đầu chuyển văn bản sang tiếng anh");
    try {
      try {
        await sendFileToGeminiToTranslateText(rootFolder, index,apiKeys[IndexApi]);
      } catch(error) {
        console.log("Thử dịch lại 1 "+error);
        await sendFileToGeminiToTranslateText(rootFolder, index,apiKeys[IndexApi + 1]);
      }
    } catch(error) {
      console.log("Thử dịch lại 2 "+error);
      await sendFileToGeminiToTranslateText(rootFolder, index,apiKeys[IndexApi + 2]);
    }
    promiseWaitTranslateText =  await new Promise((resolve, reject) => {
        resolve()
    });
    promiseWaitTranslateText =  new Promise((resolve, reject) => {

    });
    console.log("Hoàn thành chuyển văn bản sang tiếng anh");
    console.log("Bắt đầu exatract image và download mp3 file VN");
    try {
      try {
        await extractImageAndMakeMp3VN(rootFolder, index);
      } catch {
        await extractImageAndMakeMp3VN(rootFolder, index);
      }
    } catch {
      await extractImageAndMakeMp3VN(rootFolder, index);
    }

    console.log("Hoàn thành exatract image và download mp3 file VN");
    console.log("Bắt đầu tạo video VN");
    try {
      try {
        await createVideoFromImagesAndMp3FolderVN(rootFolder, index,videoID);
      } catch {
        await createVideoFromImagesAndMp3FolderVN(rootFolder, index,videoID);
      }
    } catch {
      await createVideoFromImagesAndMp3FolderVN(rootFolder, index,videoID);
    }

    console.log("Kết thúc tạo video VN");

    console.log("Bắt đầu exatract image và download mp3 file đã dịch");
    try {
      try {
        await extractImageAndMakeMp3(rootFolder, index);
      } catch {
        await extractImageAndMakeMp3(rootFolder, index);
      }
    } catch {
      await extractImageAndMakeMp3(rootFolder, index);
    }

    console.log("Hoàn thành exatract image và download mp3 file đã dịch");
    console.log("Bắt đầu tạo video dịch");
    try {
      try {
        await createVideoFromImagesAndMp3Folder(rootFolder, index,videoID);
      } catch {
        await createVideoFromImagesAndMp3Folder(rootFolder, index,videoID);
      }
    } catch {
      await createVideoFromImagesAndMp3Folder(rootFolder, index,videoID);
    }

    console.log("Kết thúc tạo video dịch");
  } catch (error) {
    console.error(error);
    console.error("Lỗi khi tạo video từ link" + url);
    fs.appendFileSync("Log.txt", "Lỗi khi tạo video từ link: " + url + "\n");
    fs.appendFileSync("LogErrorIndex.txt", index + "\n");
    
  }
  return Promise.resolve();
}

Run();
