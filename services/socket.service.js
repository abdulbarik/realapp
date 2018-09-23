'use strict';
let socket = require('socket.io');

class SocketService {
  constructor() {
    this.socketConnection = null;
  }
  createConnection(server) {
    let self = this;
    return new Promise((resolve, reject) => {
      let io = socket.listen(server);
      io.sockets.on('connection', (socket) => {
        console.log('Socket connection opened...');
        socket.on('fire-message',(data)=>{
          console.log('Message from client>>',data);
        });
        self.socketConnection = socket;
        resolve();
      });
      io.sockets.on('error', (error) => {
        console.log
        reject(error);
      });
    })
  }
  sendData(data) {
    let self = this;
    self.socketConnection.emit('fire-server', { message: data });
  }
}
module.exports = new SocketService();