const socketIO = require("socket.io");

// Redis adapter makes sure all sockets on all servers get the data
const redisAdapter = require("socket.io-redis");

const config = require("../config");
const io = socketIO(config.ports.ws);
io.adapter(redisAdapter(config.redis));

io.on("connection", socket => {
  function roomExist(roomUUID) {
    return new Promise((resolve, reject) => {
      io.of("/").adapter.allRooms((err, rooms) => {
        if (err) {
          return reject(err);
        }
        if (rooms.find(e => e === roomUUID)) {
          return resolve(true);
        }
        return resolve(false);
      });
    });
  }

  console.log("Client connected", io.engine.clientsCount);

  socket.on("disconnect", () => {
    console.log("Client disconnected", io.engine.clientsCount);
  });

  socket.on("room", room => {
    socket.join(room);
  });

  socket.on("leave", room => {
    socket.leave(room);
  });

  socket.on("exist", async (msg, fn) => {
    try {
      const doesRoomExist = await roomExist(msg.uuid);
      fn({ roomExist: doesRoomExist });
    } catch (error) {
      fn({ msg: "Error Happened", error });
    }
  });
});
