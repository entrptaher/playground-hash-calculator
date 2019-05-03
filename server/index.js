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
  const { uuid, consumerId, producerId, hash } = job.data;
  await db.update({ _id: uuid }, { $set: { hash, consumerId, producerId } });
  const data = await db.findOne({ _id: uuid });
  io.emit("singleHash", { id: uuid, data });
});

// connection handlers
io.on("connection", client => {
  client.on("addOne", async (data, callback) => {
    const result = await db.insert({});
    worker.add(result);
    callback(result);
  });

  client.on("removeOne", async (data, callback) => {
    const result = await db.remove({ _id: data._id });
    callback(result);
  });

  client.on("disconnect", () => {
    console.log("disconnecting interval");
  });

  client.on("init", async (data, callback) => {
    const result = await db.find({});
    callback(result);
  });
});

// initialize the listener
const port = config.ports.ws;
io.listen(port);
console.log("listening on port ", port);
