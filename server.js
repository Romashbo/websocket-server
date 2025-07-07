const http = require("http");
const WebSocket = require("ws");

const PORT = process.env.PORT || 4000;
const server = http.createServer();
const wss = new WebSocket.Server({ server });

let currentSessions = [];
let completedCount = 0;

wss.on("connection", (ws) => {
  console.log("🟢 Клиент подключился");

  // Отправляем текущее состояние
  ws.send(
    JSON.stringify({
      type: "syncState",
      sessions: currentSessions,
      completedCount,
    })
  );

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === "updateState") {
        currentSessions = data.sessions;
        completedCount = data.completedCount;

        // Рассылаем новое состояние всем клиентам, включая отправителя
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "syncState",
                sessions: currentSessions,
                completedCount,
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
  console.log(`✅ WebSocket сервер запущен на порту ${PORT}`);
});
