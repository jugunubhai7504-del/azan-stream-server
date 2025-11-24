const WebSocket = require("ws");
const PORT = process.env.PORT || 3000;

const wss = new WebSocket.Server({ port: PORT });
let listeners = [];

wss.on("connection", ws => {
  ws.on("message", data => {
    listeners.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });

  ws.on("close", () => {
    listeners = listeners.filter(c => c !== ws);
  });

  listeners.push(ws);
});

console.log(`Audio server running on port ${PORT}`);
