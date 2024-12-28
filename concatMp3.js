const fs = require('fs');
const path = require('path');
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const ffprobePath = require("ffprobe-static").path;
if(fs.existsSync("/usr/bin/ffmpeg")) ffmpeg.setFfmpegPath("/usr/bin/ffmpeg");
else ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath("/usr/bin/ffprobe");

// Đường dẫn tới thư mục chứa các file MP3
const dirPath = '/content/drive/MyDrive/tool gemini/PL2Kym_OrRUqr_Sc4gyjFIF9ApSbXQYa86/mp3VN/1000001/output';

// Đọc tất cả các file trong thư mục
fs.readdir(dirPath, (err, files) => {
    if (err) {
        console.error('Lỗi đọc thư mục:', err);
        return;
    }

    // Lọc ra các file có đuôi .mp3
    const mp3Files = files.filter(file => path.extname(file).toLowerCase() === '.mp3');

    if (mp3Files.length === 0) {
        console.log('Không có file MP3 nào trong thư mục.');
        return;
    }

    // Tạo chuỗi lệnh để nối các file MP3
    const ffmpegCommand = ffmpeg();

    mp3Files.forEach(file => {
        ffmpegCommand.input(path.join(dirPath, file));
    });

    ffmpegCommand
        .on('end', () => {
            console.log('Nối file MP3 thành công!');
        })
        .on('error', (err) => {
            console.error('Lỗi khi nối file MP3:', err);
        })
        .mergeToFile(path.join(dirPath, 'output.mp3'));
});