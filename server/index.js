const config = require("./config");
const io = require("socket.io")();

const Queue = require("bull");
const server = new Queue("server", config.redis);
const worker = new Queue("worker", config.redis);

const Datastore = require("nedb-promises");
const db = new Datastore({
  filename: "hash-workers.db",
  autoload: true,
  timestampData: true
});

server.process(async job => {
  io.emit("timer", job.data.hash);
});

// connection handlers
io.on("connection", client => {
  let counterInterval;

  client.on("subscribeToTimer", interval =>
    worker.add({ time: Date.now(), interval })
  );

  client.on("addOne", async (data, callback) => {
    const result = await db.insert({});
    callback(result);
  });

  client.on("removeOne", async (data, callback) => {
    const result = await db.remove({ _id: data._id });
    callback(result);
  });

  client.on("disconnect", () => {
    console.log('disconnecting interval')
    clearInterval(counterInterval);
  });

  client.on("init", async (data, callback) => {
    const result = await db.find({});
    callback(result);

    if (!counterInterval) {
      counterInterval = setInterval(async () => {
        const resultInterval = await db.find({});
        for (let hasher of resultInterval) {
          const hash = Date.now();
          await db.update({ _id: hasher._id }, { $set: { hash } });
          const data = await db.findOne({ _id: hasher._id });
          io.emit("singleHash", { id: hasher._id, data });
        }
      }, 1000);
    }
  });
});

// initialize the listener
const port = 8000;
io.listen(port);
console.log("listening on port ", port);
