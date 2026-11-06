import { io } from 'socket.io-client';

class WebRTCService {
  constructor() {
    this.socket = null;
    this.peerConnections = new Map();
    this.localStream = null;
    this.screenStream = null;
    this.listeners = new Map();
    this.serverUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';
    
    this.iceServers = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ]
    };
  }

  connect() {
    if (this.socket?.connected) return;
    
    this.socket = io(this.serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.setupSocketListeners();
  }

  setupSocketListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to signaling server');
      this.emit('connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from signaling server');
      this.emit('disconnected');
    });

    this.socket.on('user-joined', async (data) => {
      console.log('User joined:', data);
      await this.createPeerConnection(data.socketId, true);
      this.emit('user-joined', data);
    });

    this.socket.on('user-left', (data) => {
      console.log('User left:', data);
      this.closePeerConnection(data.socketId);
      this.emit('user-left', data);
    });

    this.socket.on('existing-participants', async (participants) => {
      console.log('📋 Existing participants event:', participants);
      this.emit('existing-participants', participants);
      
      // Create peer connections for all existing participants
      for (const participant of participants) {
        await this.createPeerConnection(participant.socketId, false);
      }
    });

    // Waiting room events
    this.socket.on('join-request', (data) => {
      console.log('New join request:', data);
      this.emit('join-request', data);
    });

    this.socket.on('waiting-for-approval', (data) => {
      console.log('Waiting for host approval');
      this.emit('waiting-for-approval', data);
    });

    this.socket.on('join-approved', (data) => {
      console.log('Join request approved');
      this.emit('join-approved', data);
    });

    this.socket.on('join-rejected', (data) => {
      console.log('Join request rejected:', data.reason);
      this.emit('join-rejected', data);
    });

    this.socket.on('offer', async ({ from, offer }) => {
      console.log('Received offer from:', from);
      await this.handleOffer(from, offer);
    });

    this.socket.on('answer', async ({ from, answer }) => {
      console.log('Received answer from:', from);
      await this.handleAnswer(from, answer);
    });

    this.socket.on('ice-candidate', async ({ from, candidate }) => {
      await this.handleIceCandidate(from, candidate);
    });

    this.socket.on('receive-message', (message) => {
      this.emit('message', message);
    });

    this.socket.on('participant-audio-toggle', (data) => {
      this.emit('participant-audio-toggle', data);
    });

    this.socket.on('participant-video-toggle', (data) => {
      this.emit('participant-video-toggle', data);
    });

    this.socket.on('hand-raised', (data) => {
      this.emit('hand-raised', data);
    });

    this.socket.on('force-mute', () => {
      this.emit('force-mute');
    });

    this.socket.on('removed-from-meeting', () => {
      this.emit('removed-from-meeting');
    });

    this.socket.on('participant-removed', (data) => {
      this.closePeerConnection(data.socketId);
      this.emit('participant-removed', data);
    });
  }

  async createPeerConnection(socketId, isInitiator) {
    if (this.peerConnections.has(socketId)) return;

    const peerConnection = new RTCPeerConnection(this.iceServers);
    this.peerConnections.set(socketId, peerConnection);

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream);
      });
    }

    // Handle incoming tracks
    peerConnection.ontrack = (event) => {
      console.log('Received remote track:', event.streams[0]);
      this.emit('remote-stream', {
        socketId,
        stream: event.streams[0]
      });
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('ice-candidate', {
          to: socketId,
          candidate: event.candidate
        });
      }
    };

    // Handle connection state
    peerConnection.onconnectionstatechange = () => {
      console.log(`Connection state with ${socketId}:`, peerConnection.connectionState);
      if (peerConnection.connectionState === 'disconnected' || 
          peerConnection.connectionState === 'failed') {
        this.closePeerConnection(socketId);
      }
    };

    // If initiator, create and send offer
    if (isInitiator) {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      this.socket.emit('offer', {
        to: socketId,
        offer: peerConnection.localDescription
      });
    }
  }

  async handleOffer(socketId, offer) {
    let peerConnection = this.peerConnections.get(socketId);
    
    if (!peerConnection) {
      await this.createPeerConnection(socketId, false);
      peerConnection = this.peerConnections.get(socketId);
    }

    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    
    this.socket.emit('answer', {
      to: socketId,
      answer: peerConnection.localDescription
    });
  }

  async handleAnswer(socketId, answer) {
    const peerConnection = this.peerConnections.get(socketId);
    if (peerConnection) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }

  async handleIceCandidate(socketId, candidate) {
    const peerConnection = this.peerConnections.get(socketId);
    if (peerConnection) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  closePeerConnection(socketId) {
    const peerConnection = this.peerConnections.get(socketId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(socketId);
    }
  }

  setLocalStream(stream) {
    this.localStream = stream;
    
    // Add tracks to all existing peer connections
    this.peerConnections.forEach(peerConnection => {
      stream.getTracks().forEach(track => {
        const sender = peerConnection.getSenders().find(s => s.track?.kind === track.kind);
        if (sender) {
          sender.replaceTrack(track);
        } else {
          peerConnection.addTrack(track, stream);
        }
      });
    });
  }

  // Request to join meeting (goes to waiting room if host exists)
  requestJoinMeeting(meetingId, userId, userName) {
    this.socket.emit('request-join-meeting', {
      meetingId,
      userId,
      userName
    });
  }

  // Join meeting (called after approval or if user is host)
  joinMeeting(meetingId, userId, userName, isHost) {
    this.socket.emit('join-meeting', {
      meetingId,
      userId,
      userName,
      isHost
    });
  }

  // Host approves participant
  approveParticipant(meetingId, socketId) {
    this.socket.emit('approve-participant', {
      meetingId,
      socketId
    });
  }

  // Host rejects participant
  rejectParticipant(meetingId, socketId, reason = 'Host denied your request') {
    this.socket.emit('reject-participant', {
      meetingId,
      socketId,
      reason
    });
  }

  sendMessage(meetingId, message, userName, userId) {
    this.socket.emit('send-message', {
      meetingId,
      message,
      userName,
      userId
    });
  }

  toggleAudio(meetingId, enabled) {
    this.socket.emit('toggle-audio', { meetingId, enabled });
  }

  toggleVideo(meetingId, enabled) {
    this.socket.emit('toggle-video', { meetingId, enabled });
  }

  raiseHand(meetingId, raised) {
    this.socket.emit('raise-hand', { meetingId, raised });
  }

  muteParticipant(meetingId, targetSocketId) {
    this.socket.emit('mute-participant', { meetingId, targetSocketId });
  }

  removeParticipant(meetingId, targetSocketId) {
    this.socket.emit('remove-participant', { meetingId, targetSocketId });
  }

  disconnect() {
    this.peerConnections.forEach((pc, socketId) => {
      this.closePeerConnection(socketId);
    });
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Event listener methods
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }
}

export default new WebRTCService();
