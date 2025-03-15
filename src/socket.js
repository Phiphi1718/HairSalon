const { Server } = require("socket.io"); // Sử dụng cú pháp ES6 import thay vì commonjs để rõ ràng hơn

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: function (origin, callback) {
        const allowedOrigins = [
          "http://localhost:3000", // Thêm origin cho local development
          "https://hair-salon-frontend.vercel.app", // Sửa lỗi chính tả "forntend" thành "frontend"
        ];

        // Cho phép request không có origin (như từ server hoặc công cụ)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
}

function getIo() {
  if (!io) {
    throw new Error("Socket.io not initialized! Please call initSocket first.");
  }
  return io;
}

module.exports = { initSocket, getIo };
