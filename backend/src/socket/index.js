const socketSetup = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join expert-specific room to receive slot updates
    socket.on('joinExpert', (expertId) => {
      socket.join(`expert:${expertId}`);
      console.log(`📌 Socket ${socket.id} joined room expert:${expertId}`);
    });

    socket.on('leaveExpert', (expertId) => {
      socket.leave(`expert:${expertId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketSetup;