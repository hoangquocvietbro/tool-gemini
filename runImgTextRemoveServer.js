const { exec } = require('child_process');

async function runServer() {
    console.log("Đã khởi động server removeTextOnImage");
    exec(`python3 createRemoveImgTextServerEasyOCR.py`, (error, stdout, stderr) => {
    });

}

async function exitServer(){
  console.log("Đã đóng server removeTextOnImage");
  const command = `curl -X POST http://localhost:5006/remove-text -H "Content-Type: application/json" -d '{\"img_path\": \"${'close'}\"}'`;
  exec(command, (error, stdout, stderr) => {
    console.log(`stdout: ${stdout}`);
    console.log(`stdout: ${error}`);
    console.log(`stdout: ${stderr}`);
  }); 
}
module.exports = {
  runServer,
  exitServer,
};
/*
runServer()
  setTimeout(()=>{
    const command = `curl -X POST http://localhost:5006/remove-text -H "Content-Type: application/json" -d '{\"img_path\": \"${'/content/drive/MyDrive/tool gemini/3aDbeDieaH0/images/1000000/1724772206245_Line13.png'}\"}'`;
  console.log(`xóa chữ`);
  exec(command, (error, stdout, stderr) => {
    console.log(`stdout: ${stdout}`);
    console.log(`stdout: ${error}`);
    console.log(`stdout: ${stderr}`);exitServer()
  }); 
  },60000)
 */