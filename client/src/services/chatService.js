/**
 * Chat Service
 * Manages chat messages and private messaging
 */

class ChatService {
  constructor() {
    this.messages = [];
    this.unreadCount = 0;
    this.listeners = [];
    this.typingUsers = new Set();
    this.typingTimeout = null;
  }

  /**
   * Send a message
   */
  sendMessage(content, recipientId = null, senderId = 'local', senderName = 'You') {
    const message = {
      id: Date.now() + Math.random(),
      content,
      senderId,
      senderName,
      recipientId, // null for public, userId for private
      timestamp: new Date(),
      read: senderId === 'local' // Mark own messages as read
    };

    this.messages.push(message);
    this.notifyListeners('message', message);
    
    // In a real app, this would send via WebSocket
    console.log('Message sent:', message);
    
    return message;
  }

  /**
   * Receive a message (for simulation/testing)
   */
  receiveMessage(content, senderId, senderName, recipientId = null) {
    const message = {
      id: Date.now() + Math.random(),
      content,
      senderId,
      senderName,
      recipientId,
      timestamp: new Date(),
      read: false
    };

    this.messages.push(message);
    this.unreadCount++;
    this.notifyListeners('message', message);
    
    return message;
  }

  /**
   * Get all messages
   */
  getAllMessages() {
    return [...this.messages];
  }

  /**
   * Get messages for a specific conversation
   */
  getMessages(userId = null) {
    if (userId === null) {
      // Public messages only
      return this.messages.filter(m => m.recipientId === null);
    } else {
      // Private conversation with userId
      return this.messages.filter(m => 
        (m.recipientId === userId && m.senderId === 'local') ||
        (m.senderId === userId && (m.recipientId === 'local' || m.recipientId === null))
      );
    }
  }

  /**
   * Mark messages as read
   */
  markAsRead(userId = null) {
    let unreadBefore = this.unreadCount;
    
    this.messages.forEach(message => {
      if (!message.read) {
        if (userId === null && message.recipientId === null) {
          // Mark public messages as read
          message.read = true;
          this.unreadCount--;
        } else if (userId !== null && message.senderId === userId) {
          // Mark messages from specific user as read
          message.read = true;
          this.unreadCount--;
        }
      }
    });

    this.unreadCount = Math.max(0, this.unreadCount);
    
    if (unreadBefore !== this.unreadCount) {
      this.notifyListeners('read', { userId, count: this.unreadCount });
    }
  }

  /**
   * Get unread message count
   */
  getUnreadCount() {
    return this.unreadCount;
  }

  /**
   * Set user typing status
   */
  setTyping(userId, isTyping, userName = 'User') {
    if (isTyping) {
      this.typingUsers.add(userId);
      
      // Auto-clear typing after 3 seconds
      clearTimeout(this.typingTimeout);
      this.typingTimeout = setTimeout(() => {
        this.typingUsers.delete(userId);
        this.notifyListeners('typing', this.getTypingUsers());
      }, 3000);
    } else {
      this.typingUsers.delete(userId);
    }

    this.notifyListeners('typing', this.getTypingUsers());
    
    // In a real app, broadcast typing status via WebSocket
    console.log('Typing status:', userId, isTyping);
  }

  /**
   * Get currently typing users
   */
  getTypingUsers() {
    return Array.from(this.typingUsers);
  }

  /**
   * Subscribe to chat events
   */
  subscribe(callback) {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify all listeners
   */
  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Error in chat listener:', error);
      }
    });
  }

  /**
   * Clear chat history
   */
  clearHistory() {
    this.messages = [];
    this.unreadCount = 0;
    this.typingUsers.clear();
    this.notifyListeners('clear', null);
  }

  /**
   * Export chat history
   */
  exportHistory() {
    return {
      messages: this.messages.map(m => ({
        ...m,
        timestamp: m.timestamp.toISOString()
      })),
      exportedAt: new Date().toISOString()
    };
  }
}

export default new ChatService();
