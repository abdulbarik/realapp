'use strict';
const fs = require('fs');
const socketService = require('./socket.service');
const EOL = require('os').EOL;

class FileService {
  constructor() {
    this.options = {
      endOfLineChar: EOL
    };
    this.fileName = 'log.txt';
    this.socketService = socketService;
  }
  checkFile(server) {
    let self = this;
    self.socketService.createConnection(server)
      .then(data => {
        fs.stat(`${__dirname}/../logs/${self.fileName}`, (err, stats) => {
          if (err && err.code === 'ENOENT') {
            let content = `This is a paragraph 1\r\n
                    This is a paragraph 2 \r\n
                    This is a paragraph 3 \r\n
                    This is a paragraph 4 \r\n
                    This is a paragraph 5 \r\n
                    This is a paragraph 6 \r\n
                    This is a paragraph 7 \r\n
                    This is a paragraph 8 \r\n
                    This is a paragraph 9 \r\n
                    This is a paragraph 10`

            fs.writeFile(`${__dirname}/../logs/${self.fileName}`, content, (err) => {
              if (err) throw err;
              console.log(`New File created for log ${self.fileName}`);
              self.monitorFile();
              self.parseBuffer(content);
            })
          } else if (stats.isFile()) {
            console.log('File exists...');
            fs.readFile(`${__dirname}/../logs/${self.fileName}`, (err, data) => {
              if (err) throw err;
              let arr = String(data).split(self.options.endOfLineChar);
              if (arr.lenth <= 3) {
                self.sendToSocket(arr);
              } else {
                arr.slice(Math.max(arr.length - 3));
                self.sendToSocket(arr);
              }
              self.parseBuffer(data);
            });
            self.monitorFile();
          } else {
            console.log('Unable to get file in server');
          }
        });
      })

  }
  monitorFile() {
    console.log('Server watching the file changes...');
    let self = this;
    let fileSize = fs.statSync(`${__dirname}/../logs/${self.fileName}`).size;
    fs.watchFile(`${__dirname}/../logs/${self.fileName}`, { interval: 100 }, (current, previous) => {
      if (current.mtime <= previous.mtime) { return false; }

      let newFileSize = fs.statSync(`${__dirname}/../logs/${self.fileName}`).size;
      let sizeDiff = newFileSize - fileSize;

      if (sizeDiff < 0) {
        fileSize = 0;
        sizeDiff = newFileSize;
      }

      let buffer = new Buffer(sizeDiff);
      let fileDescriptor = fs.openSync(`${__dirname}/../logs/${self.fileName}`, 'r');

      fs.readSync(fileDescriptor, buffer, 0, sizeDiff, fileSize);
      fs.closeSync(fileDescriptor); // close the file
      fileSize = newFileSize;
      self.parseBuffer(buffer);
    });
  }
  parseBuffer(buffer) {
    let self = this;
    let arr = buffer.toString().split(self.options.endOfLineChar);
    self.sendToSocket(arr);
  }
  sendToSocket(arr) {
    let self = this;
    arr.forEach((item) => {
      if (item) {
        self.socketService.sendData(item);
      }
    });
  }
}
module.exports = new FileService();

