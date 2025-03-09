// server.js
const app = require('./app');
const http = require('http');
const { initSocket } = require('./socket');

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000; // Render sẽ cung cấp PORT qua biến môi trường
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
