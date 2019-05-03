const config = require('../config');
console.log("producer online");

const short = require("short-uuid");
const Queue = require("bull");
const queue = new Queue("hasher", config.redis);

// messengers, talks with the server and act as main worker queue
const worker = new Queue("worker", config.redis);
const server = new Queue("server", config.redis);

async function newHasher() {
  const uuid = short().new();
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
      server.add(payload);
    }
  });
}

worker.process(async(job)=>{
  console.log(job);
  newHasher(job.data);
})