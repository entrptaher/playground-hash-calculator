const config = require('../config');
const socketIO = require("socket.io");
const redisAdapter = require("socket.io-redis");

const io = socketIO(config.ports.ws);
io.adapter(redisAdapter(config.redis));

io.on("connection", socket => {
  console.log("Clients connected", io.engine.clientsCount);

  socket.on("disconnect", () =>
    console.log("Clients disconnected", io.engine.clientsCount)
  );

  socket.on("room", room => socket.join(room));

  socket.on("hash", payload => {
    const { uuid, hash, from, to } = payload;
    io.of("/").adapter.allRooms((err, rooms) => {
      socket.to(uuid).emit("hash", payload);
    });
  });

  socket.on("leave", payload => {
    const { uuid, hash, from, to } = payload;
    io.of("/").adapter.allRooms((err, rooms) => {
      if (rooms.find(e => e === uuid)) io.in(uuid).emit("cleanup", payload);
    });
  });
});
