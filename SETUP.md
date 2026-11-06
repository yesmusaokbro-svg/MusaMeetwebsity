# MusaMeet Setup Guide 🚀

## Quick Start

### 1. Install Server Dependencies
```bash
cd server
npm install
```

### 2. Install Client Dependencies
```bash
cd client
npm install
```

### 3. Start the Backend Server
```bash
cd server
npm start
```
Server will run on **http://localhost:3001**

### 4. Start the Frontend (in a new terminal)
```bash
cd client
npm run dev
```
Frontend will run on **http://localhost:5173** or **5174**

## Testing Locally

1. Open **http://localhost:5173** in your browser
2. Click on the meeting link or navigate to `/meeting/test123`
3. Allow camera/microphone permissions
4. Open the same URL in a **new incognito/private window** to simulate a second user
5. You should now have a real WebRTC connection between two tabs!

## Features Available

✅ **Real-time video/audio** - WebRTC peer-to-peer connections  
✅ **Chat** - Send messages in real-time  
✅ **Screen sharing** - Share your screen with participants  
✅ **Virtual backgrounds** - 26+ professional backgrounds  
✅ **Participant management** - See who's in the meeting  
✅ **Host controls** - Mute/remove participants (for host)  
✅ **Raise hand** - Non-disruptive way to get attention  

## Environment Variables

### Client (.env)
```
VITE_SERVER_URL=http://localhost:3001
```

### Server (optional .env)
```
PORT=3001
```

## Deployment

### Deploy Backend (Render/Railway/Heroku)
1. Push server folder to git
2. Set PORT environment variable
3. Run `npm start`

### Deploy Frontend (Vercel/Netlify)
1. Push client folder to git
2. Set `VITE_SERVER_URL` to your backend URL
3. Build command: `npm run build`
4. Output directory: `dist`

## Troubleshooting

**Issue:** Can't connect to server  
**Fix:** Make sure server is running on port 3001

**Issue:** No video/audio between users  
**Fix:** Check browser permissions and firewall settings

**Issue:** CORS errors  
**Fix:** Update server CORS settings to include your frontend URL

## Browser Requirements

- Chrome 72+
- Firefox 66+
- Safari 13+
- Edge 79+

## Development Tips

- Use Chrome DevTools to inspect WebRTC connections: `chrome://webrtc-internals`
- Check network tab for Socket.io connections
- Open browser console to see connection logs

---

**Need help?** Check the logs in both server and client consoles.
