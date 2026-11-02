/**
 * Meeting Service
 * Manages meeting state, participants, and settings
 */

class MeetingService {
  constructor() {
    this.meetingId = null;
    this.isHost = false;
    this.participants = new Map();
    this.settings = {
      isLocked: false,
      requirePassword: false,
      password: null,
      waitingRoomEnabled: false,
      allowRecording: true,
      allowScreenShare: true
    };
    this.listeners = [];
    this.meetingStartTime = null;
    this.waitingRoom = [];
  }

  /**
   * Create a new meeting
   */
  createMeeting(hostName = 'Host', password = null) {
    this.meetingId = this.generateMeetingId();
    this.isHost = true;
    this.meetingStartTime = new Date();
    
    if (password) {
      this.settings.requirePassword = true;
      this.settings.password = password;
    }

    // Add host as first participant
    const hostId = 'local';
    this.addParticipant(hostId, hostName, true, true);
    
    console.log('Meeting created:', this.meetingId);
    this.notifyListeners('created', { meetingId: this.meetingId });
    
    return this.meetingId;
  }

  /**
   * Join an existing meeting
   */
  async joinMeeting(meetingId, participantName = 'Guest', password = null) {
    // In a real app, this would validate with backend
    this.meetingId = meetingId;
    this.meetingStartTime = new Date();
    
    // Simulate password check
    if (this.settings.requirePassword && this.settings.password !== password) {
      throw new Error('Incorrect password');
    }

    // Add as participant
    const participantId = 'local';
    this.addParticipant(participantId, participantName, false, false);
    
    console.log('Joined meeting:', meetingId);
    this.notifyListeners('joined', { meetingId, participantId });
    
    return true;
  }

  /**
   * Generate unique meeting ID
   */
  generateMeetingId() {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const parts = [];
    
    for (let i = 0; i < 3; i++) {
      let part = '';
      const length = i === 1 ? 4 : 3;
      for (let j = 0; j < length; j++) {
        part += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      parts.push(part);
    }
    
    return parts.join('-');
  }

  /**
   * Add participant to meeting
   */
  addParticipant(id, name, isHost = false, isCoHost = false) {
    const participant = {
      id,
      name,
      isHost,
      isCoHost,
      isMuted: false,
      isCameraOff: false,
      isHandRaised: false,
      isSpeaking: false,
      isScreenSharing: false,
      joinedAt: new Date()
    };

    this.participants.set(id, participant);
    this.notifyListeners('participant-added', participant);
    
    return participant;
  }

  /**
   * Remove participant from meeting
   */
  removeParticipant(id) {
    const participant = this.participants.get(id);
    if (participant) {
      this.participants.delete(id);
      this.notifyListeners('participant-removed', participant);
      return true;
    }
    return false;
  }

  /**
   * Update participant state
   */
  updateParticipant(id, updates) {
    const participant = this.participants.get(id);
    if (participant) {
      Object.assign(participant, updates);
      this.participants.set(id, participant);
      this.notifyListeners('participant-updated', participant);
      return participant;
    }
    return null;
  }

  /**
   * Get all participants
   */
  getParticipants() {
    return Array.from(this.participants.values());
  }

  /**
   * Get participant by ID
   */
  getParticipant(id) {
    return this.participants.get(id);
  }

  /**
   * Get local participant
   */
  getLocalParticipant() {
    return this.participants.get('local');
  }

  /**
   * Waiting room management
   */
  addToWaitingRoom(id, name) {
    this.waitingRoom.push({ id, name, timestamp: new Date() });
    this.notifyListeners('waiting-room-update', this.waitingRoom);
  }

  admitParticipant(id, name) {
    this.waitingRoom = this.waitingRoom.filter(p => p.id !== id);
    this.addParticipant(id, name, false, false);
    this.notifyListeners('waiting-room-update', this.waitingRoom);
  }

  rejectParticipant(id) {
    this.waitingRoom = this.waitingRoom.filter(p => p.id !== id);
    this.notifyListeners('participant-rejected', { id });
    this.notifyListeners('waiting-room-update', this.waitingRoom);
  }

  /**
   * Meeting settings
   */
  updateSettings(updates) {
    Object.assign(this.settings, updates);
    this.notifyListeners('settings-updated', this.settings);
  }

  lockMeeting() {
    this.settings.isLocked = true;
    this.notifyListeners('meeting-locked', true);
  }

  unlockMeeting() {
    this.settings.isLocked = false;
    this.notifyListeners('meeting-locked', false);
  }

  /**
   * Host controls
   */
  muteParticipant(id) {
    if (!this.isHost && !this.getLocalParticipant()?.isCoHost) {
      console.warn('Only host can mute participants');
      return false;
    }
    
    this.updateParticipant(id, { isMuted: true });
    // In real app, send command via WebRTC data channel
    return true;
  }

  assignCoHost(id) {
    if (!this.isHost) {
      console.warn('Only host can assign co-host');
      return false;
    }
    
    this.updateParticipant(id, { isCoHost: true });
    return true;
  }

  /**
   * Get meeting duration
   */
  getMeetingDuration() {
    if (!this.meetingStartTime) return 0;
    return Math.floor((new Date() - this.meetingStartTime) / 1000);
  }

  /**
   * End meeting
   */
  endMeeting() {
    this.notifyListeners('meeting-ended', { meetingId: this.meetingId });
    this.cleanup();
  }

  /**
   * Leave meeting (without ending for others)
   */
  leaveMeeting() {
    this.notifyListeners('left-meeting', { meetingId: this.meetingId });
    this.cleanup();
  }

  /**
   * Subscribe to meeting events
   */
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify listeners
   */
  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Error in meeting listener:', error);
      }
    });
  }

  /**
   * Cleanup
   */
  cleanup() {
    this.meetingId = null;
    this.isHost = false;
    this.participants.clear();
    this.waitingRoom = [];
    this.meetingStartTime = null;
    this.settings = {
      isLocked: false,
      requirePassword: false,
      password: null,
      waitingRoomEnabled: false,
      allowRecording: true,
      allowScreenShare: true
    };
  }

  /**
   * Get meeting info
   */
  getMeetingInfo() {
    return {
      meetingId: this.meetingId,
      isHost: this.isHost,
      participantCount: this.participants.size,
      duration: this.getMeetingDuration(),
      settings: { ...this.settings },
      waitingRoomCount: this.waitingRoom.length
    };
  }
}

export default new MeetingService();
