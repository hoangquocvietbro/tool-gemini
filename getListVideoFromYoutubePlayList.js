const ytpl = require('ytpl');
const fs = require("fs");
const readline = require("readline");
const args = process.argv.slice(2);

// Kiểm tra nếu có tham số truyền vào
    let isLast = 0; // lấy tham số đầu tiên
    let playlistId = ''; // lấy tham số đầu tiên
if (args.length > 0) {
     isLast = args[0]; // lấy tham số đầu tiên
     playlistId = args[1]; // lấy tham số đầu tiên
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function getPlaylistUrls(playlistId) {
  try {
    const playlist = await ytpl(playlistId, { limit: 2000 });
    const videoUrls = playlist.items.map(item => item.url);
    return videoUrls;
  } catch (error) {
    console.error('Error fetching playlist:', error);
  }
}

async function askForPlaylistId(playlistId) {
    const videoUrls = await getPlaylistUrls(playlistId);
    if (videoUrls) {
      console.log('Video URLs:');
      if(isLast)
      {
        fs.writeFileSync("youtubeLinks.txt", videoUrls[(videoUrls.length-1)]);
      }
      else  fs.writeFileSync("youtubeLinks.txt", videoUrls.join('\n'));
      console.log('URLs saved to youtubeLinks.txt');
    }
    process.exit()
}

askForPlaylistId(playlistId);
