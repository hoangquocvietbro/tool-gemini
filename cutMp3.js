const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Đường dẫn tới thư mục chứa các file MP3
const folderPath = '/content/drive/MyDrive/tool gemini/PL2Kym_OrRUqr_Sc4gyjFIF9ApSbXQYa86/mp3VN/1000001';
const outputFolder = path.join(folderPath, 'output');

// Tạo thư mục đầu ra nếu chưa tồn tại
if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder);
}

// Hàm cắt bỏ một giây cuối cùng của file MP3
const cutMP3 = (filePath, outputFilePath) => {
  return new Promise((resolve, reject) => {
    // Lấy độ dài của file
    exec(`ffmpeg -i "${filePath}" 2>&1 | grep "Duration" | cut -d ' ' -f 4 | sed s/,//`, (error, stdout, stderr) => {
      if (error) {
        return reject(`Error getting duration: ${stderr}`);
      }

      const duration = stdout.trim();
      const [hours, minutes, seconds] = duration.split(':').map(parseFloat);
      let totalSeconds = hours * 3600 + minutes * 60 + seconds;
      if(totalSeconds>1) totalSeconds=totalSeconds-0.272;

      // Cắt bỏ một giây cuối cùng và lưu file mới
      exec(`ffmpeg -i "${filePath}" -t ${totalSeconds} -acodec copy "${outputFilePath}" -y`, (error, stdout, stderr) => {
        if (error) {
          return reject(`Error trimming file: ${stderr}`);
        }
        resolve(`File saved: ${outputFilePath}`);
      });
    });
  });
};

// Duyệt qua từng file MP3 trong thư mục và cắt bỏ một giây cuối cùng
fs.readdir(folderPath, (err, files) => {
  if (err) {
    return console.error(`Unable to read directory: ${err}`);
  }

  files.filter(file => file.endsWith('.mp3')).forEach(file => {
    const filePath = path.join(folderPath, file);
    const outputFilePath = path.join(outputFolder, file.replace('.mp3', '_cut.mp3'));

    cutMP3(filePath, outputFilePath)
      .then(message => console.log(message))
      .catch(error => console.error(error));
  });
});
