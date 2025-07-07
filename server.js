const WebSocket = require("ws");

const PORT = process.env.PORT || 4000;
const server = require("http").createServer();

const wss = new WebSocket.Server({ server });

let currentSessions = [];

wss.on("connection", (ws) => {
  console.log("🟢 Клиент подключился");

  ws.send(
    JSON.stringify({ type: "updateSessions", sessions: currentSessions })
  );

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === "updateSessions") {
        currentSessions = data.sessions;

        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "updateSessions",
                sessions: currentSessions,
              })
            );
          }
        });
      }
    } catch (err) {
      console.error("Ошибка при разборе сообщения:", err);
    }
  });

  ws.on("close", () => {
    console.log("🔴 Клиент отключился");
  });
});

server.listen(PORT, () => {
  console.log(`✅ WebSocket сервер запущен на порт ${PORT}`);
});
