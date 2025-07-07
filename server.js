// Установи: npm install ws
const WebSocket = require("ws");

const PORT = 4000;
const wss = new WebSocket.Server({ port: PORT });

let currentSessions = [];

wss.on("connection", (ws) => {
  console.log("🟢 Клиент подключился");

  // Отправляем текущие сессии новому клиенту
  ws.send(
    JSON.stringify({ type: "updateSessions", sessions: currentSessions })
  );

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === "updateSessions") {
        currentSessions = data.sessions;

        // Рассылаем всем другим клиентам
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

console.log(`✅ WebSocket сервер запущен на ws://localhost:${PORT}`);
