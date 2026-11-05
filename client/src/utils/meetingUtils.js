/**
 * Meeting Utilities - Handle host/participant roles and permissions
 */

/**
 * Determine if current user is the host
 * Host is the first person to join the meeting
 */
export const determineHostStatus = (meetingId) => {
  const storageKey = `meeting_${meetingId}_host`;
  const existingHost = localStorage.getItem(storageKey);
  
  if (!existingHost) {
    // First person to join - make them host
    const hostId = generateUserId();
    localStorage.setItem(storageKey, hostId);
    localStorage.setItem('current_user_id', hostId);
    return { isHost: true, userId: hostId };
  } else {
    // Not first person - check if we're the host
    const currentUserId = localStorage.getItem('current_user_id');
    const isHost = currentUserId === existingHost;
    return { isHost, userId: currentUserId || generateUserId() };
  }
};

/**
 * Generate unique user ID
 */
export const generateUserId = () => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get user name from localStorage or generate new one
 */
export const getUserName = () => {
  let userName = localStorage.getItem('meeting_user_name');
  if (!userName) {
    userName = `User ${Math.floor(Math.random() * 1000)}`;
    localStorage.setItem('meeting_user_name', userName);
  }
  return userName;
};

/**
 * Get meeting link for sharing
 */
export const getMeetingLink = (meetingId) => {
  return `${window.location.origin}/meeting/${meetingId}`;
};

/**
 * Permissions for host vs participants
 */
export const PERMISSIONS = {
  HOST: {
    canMute: true,
    canVideo: true,
    canScreenShare: true,
    canChat: true,
    canRaiseHand: true,
    canRecord: true,
    canChangeBackground: true,
    canKickParticipants: true,
    canMuteOthers: true,
    canEndMeeting: true,
    canLockMeeting: true,
    canManageWaitingRoom: true,
    canChangePermissions: true,
  },
  PARTICIPANT: {
    canMute: true,              // Can mute/unmute themselves
    canVideo: true,             // Can turn camera on/off
    canScreenShare: false,      // Cannot screen share (host only)
    canChat: true,              // Can send messages
    canRaiseHand: true,         // Can raise hand
    canRecord: false,           // Cannot record (host only)
    canChangeBackground: true,  // Can change own background
    canKickParticipants: false, // Cannot kick others
    canMuteOthers: false,       // Cannot mute others
    canEndMeeting: false,       // Cannot end meeting
    canLockMeeting: false,      // Cannot lock meeting
    canManageWaitingRoom: false,// Cannot manage waiting room
    canChangePermissions: false,// Cannot change permissions
  }
};

/**
 * Check if user has permission for an action
 */
export const hasPermission = (isHost, action) => {
  const permissions = isHost ? PERMISSIONS.HOST : PERMISSIONS.PARTICIPANT;
  return permissions[action] || false;
};

/**
 * Get display name based on role
 */
export const getDisplayName = (userName, isHost) => {
  return isHost ? `${userName} (Host)` : userName;
};
