const { exec } = require('child_process');

const filePath = '/content/drive/MyDrive/tool gemini/PL2Kym_OrRUqr_Sc4gyjFIF9ApSbXQYa86/mp3VN/1000002/1722613760496_Line5.mp3';
const command = `curl -X POST http://localhost:5000/transcribe -H "Content-Type: application/json" -d '{\"file_path\": \"${filePath}\"}'`;

console.log('Waiting for 200 seconds...');

setTimeout(() => {
  exec(command, (error, stdout, stderr) => {
    console.log(`stdout: ${stdout}`);
  });
}, 20000);  // 200 seconds = 200,000 milliseconds


