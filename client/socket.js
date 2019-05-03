const io = require('socket.io-client');
const config = require('./config');

const socket = io(`http://${config.host}:${config.ports.ws}`, {
  transports: ['websocket'], // Only websocket works
});

const asyncSocket = async (channel, msg) =>
  new Promise(resolve => {
    socket.emit(channel, msg, data => resolve(data));
  });

function subscribeToTimer(cb) {
  socket.on("timer", timestamp => cb(timestamp));
  socket.emit("subscribeToTimer", 1000);
}

export { subscribeToTimer, asyncSocket };
