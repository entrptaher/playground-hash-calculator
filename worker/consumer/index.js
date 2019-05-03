const config = require('../config');

console.log("consumer online");
const Chance = require("chance");
const chance = new Chance();

const Queue = require("bull");
const queue = new Queue("hasher", config.redis);

function processFakeWork({ socket, job }) {
  const { uuid } = job.data;
  let hashCount = 0;
  const hashInterval = setInterval(async () => {
    // fake generated data/hash
    const guid = await chance.guid();
    socket.emit("hash", {
      uuid,
      hash: guid,
      from: "consumer",
      to: "provider"
    });

    ++hashCount;
    if (hashCount >= 5) {
      clearInterval(hashInterval);
      socket.emit("leave", {
        uuid,
        hash: guid,
        from: "consumer",
        consumerId: socket.io.engine.id,
        to: "provider"
      });
    }
  }, 100);
}

queue.process(async function process(job) {
  const { uuid } = job.data;
  const getSocket = require("../socket/client");
  const { socket } = getSocket(job);

  socket.on("disconnect", () => {
    console.log("slave disconnected", {socketId: socket.io.engine.id, uuid});
  });

  // join the room
  socket.on("connect", () => {
    console.log("slave connected", {socketId: socket.io.engine.id, uuid});
    processFakeWork({ socket, job });
  });

  return;
});
