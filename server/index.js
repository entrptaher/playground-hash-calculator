const io = require("socket.io")();

// Fake tasks
const subscribeToTimer = (client, interval) => {
  console.log("client is subscribing to timer with interval ", interval);
  setInterval(() => {
    client.emit("timer", new Date());
  }, interval);
}

// connection handlers
io.on("connection", client => {
  client.on("subscribeToTimer", subscribeToTimer);
});

// initialize the listener
const port = 8000;
io.listen(port);
console.log("listening on port ", port);
