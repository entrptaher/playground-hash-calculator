const config = require("../config");
console.log("producer online");

const short = require("short-uuid");
const Queue = require("bull");
const queue = new Queue("hasher", config.redis);

// messengers, talks with the server and act as main worker queue
const worker = new Queue("worker", config.redis);
const server = new Queue("server", config.redis);

async function newHasher(dbResult) {
  const uuid = dbResult._id;
  const job = await queue.add({ uuid });

  const getSocket = require("../socket/client");
  const { socket } = getSocket(job);

  socket.on("connect", async () => {
    console.log("producer connected", { socketId: socket.io.engine.id, uuid });
  });

  socket.on("disconnect", async () => {
    console.log("producer disconnected", {
      socketId: socket.io.engine.id,
      uuid
    });
  });

  socket.on("hash", payload => {
    if (payload.from === "consumer") {
      const newData = Object.assign({}, payload, {
        producerId: socket.io.engine.id
      });
      server.add(newData);
    }
  });
}

worker.process(async job => {
  newHasher(job.data);
});
