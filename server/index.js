const config = require("./config");
const io = require("socket.io")();

const Queue = require("bull");
const server = new Queue("server", config.redis);
const worker = new Queue("worker", config.redis);

server.process(async job => {
  io.emit("timer", job.data.hash);
});

// connection handlers
io.on("connection", client => {
  client.on("subscribeToTimer", interval =>
    worker.add({ time: Date.now(), interval })
  );
});

// initialize the listener
const port = 8000;
io.listen(port);
console.log("listening on port ", port);
