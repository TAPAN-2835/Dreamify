import { createServer } from 'http';
import app from './app.js';
import { initSocket } from './config/socket.js';

const PORT = process.env.PORT || 4000;

const httpServer = createServer(app);

// Init Socket.io
const io = initSocket(httpServer);
global.io = io;

httpServer.listen(PORT, () => console.log(`Server + Socket.io running on port ${PORT}`));
