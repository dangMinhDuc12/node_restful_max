const { Server } = require("socket.io");
let io = null;

module.exports = {
    init(httpServer) {
         io = new Server(httpServer, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
            }
        });
        return io;
    },
    getIO() {
        if (!io) {
            throw new Error('Not IO');
        }
        return io
    }
}