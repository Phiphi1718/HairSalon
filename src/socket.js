const { Server } = require("socket.io");

let io;

function initSocket(server) {
  const allowedOrigins = [
    "http://localhost:3000", // Local development
    "https://hair-salon-forntend.vercel.app", // Frontend production (giữ nguyên tên domain bạn cung cấp)
    "https://hair-salon-frontend.vercel.app", // Thêm biến thể có thể
  ];

  io = new Server(server, {
    cors: {
      origin: function (origin, callback) {
        console.log("Socket CORS Request Origin:", origin); // Log để debug
        if (!origin) return callback(null, true); // Cho phép request không có origin
        if (allowedOrigins.includes(origin)) {
          return callback(null, origin); // Trả về origin cụ thể
        } else {
          console.log(`Socket CORS Error: Origin ${origin} not allowed`);
          return callback(new Error(`Socket CORS Error: Origin ${origin} not allowed`));
        }
      },
      methods: ["GET", "POST", "OPTIONS"], // Thêm OPTIONS để hỗ trợ preflight
      allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
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
