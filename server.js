const WebSocket = require("ws");
const PORT = process.env.PORT || 3000;

const wss = new WebSocket.Server({ port: PORT });
let rooms = {}; // { "A": [ws1, ws2], "B": [ws3, ws4] }

wss.on("connection", ws => {
    ws.room = null;

    ws.on("message", message => {
        try {
            const data = JSON.parse(message);

            if (data.action === "join") {
                ws.room = data.room;
                if (!rooms[ws.room]) rooms[ws.room] = [];
                rooms[ws.room].push(ws);
                console.log(`Client joined room: ${ws.room}`);
            } else if (data.action === "audio" && ws.room) {
                // Broadcast only to clients in the same room
                rooms[ws.room].forEach(client => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(Buffer.from(data.buffer, "base64"));
                    }
                });
            }
        } catch (e) {
            console.log("Invalid message:", e);
        }
    });

    ws.on("close", () => {
        if (ws.room && rooms[ws.room]) {
            rooms[ws.room] = rooms[ws.room].filter(c => c !== ws);
        }
    });
});

console.log(`Multi-room audio server running on port ${PORT}`);
