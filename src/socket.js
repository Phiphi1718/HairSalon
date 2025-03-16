const { Server } = require("socket.io");

let io;

function initSocket(server) {
  const allowedOrigins = [
    "http://localhost:3000",
    "https://hair-salon-forntend.vercel.app",
    "https://hair-salon-frontend.vercel.app",
  ];

  io = new Server(server, {
    cors: {
      origin: function (origin, callback) {
        console.log("Socket CORS Request Origin:", origin);
        if (!origin) {
          console.log("No origin provided, allowing request");
          return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
          console.log(`Origin ${origin} allowed for Socket.io`);
          return callback(null, origin);
        } else {
          console.log(`Socket CORS Error: Origin ${origin} not allowed`);
          return callback(new Error(`Socket CORS Error: Origin ${origin} not allowed`));
        }
      },
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
      credentials: true,
    },
    transports: ["polling", "websocket"],
  });

  io.on("connection", (socket) => {
    console.log("Client connected to Socket.io:", socket.id);
    socket.on("disconnect", () => {
      console.log("Client disconnected from Socket.io:", socket.id);
    });
  });

  console.log("Socket.io initialized successfully");
  return io;
}

function getIo() {
  if (!io) {
    throw new Error("Socket.io not initialized! Please call initSocket first.");
  }
  return io;
}

module.exports = { initSocket, getIo };
