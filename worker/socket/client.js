const config = require('../config');
const io = require("socket.io-client");

function getSocket(job) {
  const { uuid } = job.data;

  const socket = io(`http://${config.host}:${config.ports.ws}`, {
    transports: ["websocket"], // Only websocket works,
  });
  
  socket.on("connect", () => {
    socket.emit("room", uuid);
  });

  socket.on("cleanup", function(payload) {
    console.log("cleanup", { payload });
    job.remove();
    socket.close();
  });

  const asyncSocket = async (channel, msg) =>
    new Promise(resolve => {
      socket.emit(channel, msg, data => resolve(data));
    });

  return { asyncSocket, socket };
}

module.exports = getSocket;
