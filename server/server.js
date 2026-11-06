import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174", "https://*.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Store active meetings and participants
const meetings = new Map();
// Store waiting room participants
const waitingRoom = new Map();
// Store hand raise queue per meeting
const handRaiseQueues = new Map();

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Request to join meeting (new participants go to waiting room)
  socket.on('request-join-meeting', ({ meetingId, userId, userName }) => {
    const meetingParticipants = meetings.get(meetingId);
    
    // If meeting doesn't exist or no host, user becomes host and joins directly
    if (!meetingParticipants || meetingParticipants.size === 0) {
      socket.emit('join-approved', { isHost: true });
      return;
    }
    
    // Find the host
    const host = Array.from(meetingParticipants.values()).find(p => p.isHost);
    
    if (!host) {
      // No host found, join directly
      socket.emit('join-approved', { isHost: false });
      return;
    }
    
    // Add to waiting room
    if (!waitingRoom.has(meetingId)) {
      waitingRoom.set(meetingId, new Map());
    }
    
    waitingRoom.get(meetingId).set(socket.id, {
      socketId: socket.id,
      userId,
      userName,
      requestedAt: Date.now()
    });
    
    // Notify host about new participant request
    io.to(host.socketId).emit('join-request', {
      socketId: socket.id,
      userId,
      userName,
      requestedAt: Date.now()
    });
    
    // Notify the waiting participant
    socket.emit('waiting-for-approval', { 
      message: 'Waiting for host approval...',
      hostName: host.userName 
    });
    
    console.log(`${userName} is waiting to join meeting ${meetingId}`);
  });

  // Host approves participant
  socket.on('approve-participant', ({ meetingId, socketId: participantSocketId }) => {
    const waiting = waitingRoom.get(meetingId);
    if (!waiting || !waiting.has(participantSocketId)) {
      return;
    }
    
    const participant = waiting.get(participantSocketId);
    waiting.delete(participantSocketId);
    
    // Notify participant they're approved
    io.to(participantSocketId).emit('join-approved', { isHost: false });
    
    console.log(`${participant.userName} approved to join ${meetingId}`);
  });

  // Host rejects participant
  socket.on('reject-participant', ({ meetingId, socketId: participantSocketId, reason }) => {
    const waiting = waitingRoom.get(meetingId);
    if (!waiting || !waiting.has(participantSocketId)) {
      return;
    }
    
    const participant = waiting.get(participantSocketId);
    waiting.delete(participantSocketId);
    
    // Notify participant they're rejected
    io.to(participantSocketId).emit('join-rejected', { 
      reason: reason || 'Host denied your request to join'
    });
    
    console.log(`${participant.userName} rejected from ${meetingId}`);
  });

  // Join meeting (after approval)
  socket.on('join-meeting', ({ meetingId, userId, userName, isHost }) => {
    socket.join(meetingId);
    
    if (!meetings.has(meetingId)) {
      meetings.set(meetingId, new Map());
    }
    
    const meetingParticipants = meetings.get(meetingId);
    meetingParticipants.set(socket.id, {
      userId,
      userName,
      isHost,
      socketId: socket.id,
      audioEnabled: true,
      videoEnabled: true,
      isHandRaised: false,
      joinedAt: Date.now()
    });

    // Notify others in the room
    socket.to(meetingId).emit('user-joined', {
      socketId: socket.id,
      userId,
      userName,
      isHost
    });

    // Send current participants to the new user
    const participants = Array.from(meetingParticipants.values()).filter(p => p.socketId !== socket.id);
    socket.emit('existing-participants', participants);

    console.log(`${userName} joined meeting ${meetingId}`);
  });

  // WebRTC signaling
  socket.on('offer', ({ to, offer }) => {
    socket.to(to).emit('offer', {
      from: socket.id,
      offer
    });
  });

  socket.on('answer', ({ to, answer }) => {
    socket.to(to).emit('answer', {
      from: socket.id,
      answer
    });
  });

  socket.on('ice-candidate', ({ to, candidate }) => {
    socket.to(to).emit('ice-candidate', {
      from: socket.id,
      candidate
    });
  });

  // Chat messages
  socket.on('send-message', ({ meetingId, message, userName, userId }) => {
    io.to(meetingId).emit('receive-message', {
      id: Date.now().toString(),
      userId,
      userName,
      message,
      timestamp: new Date().toISOString()
    });
  });

  // Participant updates
  socket.on('toggle-audio', ({ meetingId, enabled }) => {
    for (const [mid, participants] of meetings.entries()) {
      if (mid === meetingId && participants.has(socket.id)) {
        const participant = participants.get(socket.id);
        participant.audioEnabled = enabled;
        socket.to(meetingId).emit('participant-audio-toggle', {
          socketId: socket.id,
          enabled
        });
        break;
      }
    }
  });

  socket.on('toggle-video', ({ meetingId, enabled }) => {
    for (const [mid, participants] of meetings.entries()) {
      if (mid === meetingId && participants.has(socket.id)) {
        const participant = participants.get(socket.id);
        participant.videoEnabled = enabled;
        socket.to(meetingId).emit('participant-video-toggle', {
          socketId: socket.id,
          enabled
        });
        break;
      }
    }
  });

  socket.on('raise-hand', ({ meetingId, raised }) => {
    console.log(`🖐️ Hand raise event: ${socket.id}, raised: ${raised}`);
    
    for (const [mid, participants] of meetings.entries()) {
      if (mid === meetingId && participants.has(socket.id)) {
        const participant = participants.get(socket.id);
        participant.isHandRaised = raised;
        
        let queueNumber = null;
        
        if (raised) {
          // Initialize queue for meeting if doesn't exist
          if (!handRaiseQueues.has(meetingId)) {
            handRaiseQueues.set(meetingId, []);
          }
          
          const queue = handRaiseQueues.get(meetingId);
          
          // Add to queue if not already there
          if (!queue.find(item => item.socketId === socket.id)) {
            queueNumber = queue.length + 1;
            queue.push({
              socketId: socket.id,
              userId: participant.userId,
              userName: participant.userName,
              queueNumber,
              timestamp: Date.now()
            });
            console.log(`✋ ${participant.userName} is #${queueNumber} in queue`);
          }
        } else {
          // Remove from queue
          if (handRaiseQueues.has(meetingId)) {
            const queue = handRaiseQueues.get(meetingId);
            const index = queue.findIndex(item => item.socketId === socket.id);
            if (index !== -1) {
              queue.splice(index, 1);
              // Reassign queue numbers
              queue.forEach((item, idx) => {
                item.queueNumber = idx + 1;
              });
              console.log(`👋 ${participant.userName} left queue`);
            }
          }
        }
        
        // Broadcast to ALL participants in the meeting
        io.to(meetingId).emit('hand-raised', {
          socketId: socket.id,
          userId: participant.userId,
          userName: participant.userName,
          raised,
          queueNumber
        });
        
        console.log(`📡 Broadcasted hand-raised to meeting ${meetingId}`);
        break;
      }
    }
  });

  // Screen sharing
  socket.on('start-screen-share', ({ meetingId }) => {
    socket.to(meetingId).emit('user-started-screen-share', {
      socketId: socket.id
    });
  });

  socket.on('stop-screen-share', ({ meetingId }) => {
    socket.to(meetingId).emit('user-stopped-screen-share', {
      socketId: socket.id
    });
  });

  // Host controls
  socket.on('mute-participant', ({ meetingId, targetSocketId }) => {
    io.to(targetSocketId).emit('force-mute');
    io.to(meetingId).emit('participant-audio-toggle', {
      socketId: targetSocketId,
      enabled: false
    });
  });

  socket.on('remove-participant', ({ meetingId, targetSocketId }) => {
    io.to(targetSocketId).emit('removed-from-meeting');
    const targetSocket = io.sockets.sockets.get(targetSocketId);
    if (targetSocket) {
      targetSocket.leave(meetingId);
    }
    
    if (meetings.has(meetingId)) {
      meetings.get(meetingId).delete(targetSocketId);
    }
    
    io.to(meetingId).emit('participant-removed', { socketId: targetSocketId });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    for (const [meetingId, participants] of meetings.entries()) {
      if (participants.has(socket.id)) {
        const participant = participants.get(socket.id);
        participants.delete(socket.id);
        
        socket.to(meetingId).emit('user-left', {
          socketId: socket.id,
          userId: participant.userId,
          userName: participant.userName
        });
        
        if (participants.size === 0) {
          meetings.delete(meetingId);
        }
        break;
      }
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    activeMeetings: meetings.size,
    timestamp: new Date().toISOString()
  });
});

// Get meeting info
app.get('/api/meetings/:meetingId', (req, res) => {
  const { meetingId } = req.params;
  const participants = meetings.get(meetingId);
  
  if (!participants) {
    return res.json({ exists: false, participants: [] });
  }
  
  res.json({
    exists: true,
    participants: Array.from(participants.values()).map(p => ({
      userId: p.userId,
      userName: p.userName,
      isHost: p.isHost,
      joinedAt: p.joinedAt
    }))
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 MusaMeet signaling server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready for connections`);
});
