# MusaMeet 🎥

A modern, full-featured video conferencing application with WebRTC peer-to-peer connections, virtual backgrounds, and real-time communication.

![MusaMeet](https://img.shields.io/badge/Status-Beta-orange) ![React](https://img.shields.io/badge/React-19-blue) ![Node.js](https://img.shields.io/badge/Node.js-WebRTC-green)

## ✨ Features

### Core Video Conferencing
- 🎥 **WebRTC P2P Connections** - Real peer-to-peer video/audio
- 🖥️ **Screen Sharing** - Share your screen with participants
- 🎙️ **Audio/Video Controls** - Toggle camera and microphone
- 📹 **Multiple Participants** - Support for multi-user meetings
- 🔄 **Device Selection** - Choose your camera and microphone

### Visual Effects
- 🖼️ **Virtual Backgrounds** - 26+ professional backgrounds
  - Office environments
  - Nature scenes
  - Living spaces
  - Libraries & study rooms
  - Creative & abstract
- 🌫️ **Background Blur** - MediaPipe-powered person segmentation
- 🎨 **Custom Backgrounds** - Upload your own images

### Collaboration Tools
- 💬 **Real-time Chat** - Send messages during meetings
- 👥 **Participant Management** - See who's in the meeting
- ✋ **Raise Hand** - Non-disruptive way to get attention
- 👤 **User Profiles** - Custom names and avatars

### Host Controls
- 🔇 **Mute Participants** - Host can mute others
- ⛔ **Remove Participants** - Host can remove disruptive users
- 👑 **Host Privileges** - First to join becomes host
- 📊 **Meeting Analytics** - Track participants and duration

## 🏗️ Architecture

### Frontend (`/client`)
- **React 19** with hooks
- **React Router** for navigation
- **Socket.io Client** for real-time communication
- **MediaPipe** for AI-powered background effects
- **Vite** for fast development and building

### Backend (`/server`)
- **Node.js** with Express
- **Socket.io** for WebSocket communication
- **WebRTC Signaling** server
- **CORS** enabled for cross-origin requests

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Modern browser (Chrome 72+, Firefox 66+, Safari 13+)
- Camera and microphone

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/MusaMeetwebsity.git
cd MusaMeetwebsity
```

2. **Install server dependencies**
```bash
cd server
npm install
```

3. **Install client dependencies**
```bash
cd ../client
npm install
```

### Running Locally

1. **Start the backend server** (Terminal 1)
```bash
cd server
npm start
```
✅ Server runs on `http://localhost:3001`

2. **Start the frontend** (Terminal 2)
```bash
cd client
npm run dev
```
✅ Frontend runs on `http://localhost:5173`

3. **Test with multiple users**
   - Open `http://localhost:5173` in your browser
   - Click "Join Meeting" or go to `/meeting/test123`
   - Open the same URL in an incognito/private window
   - You now have a real WebRTC connection! 🎉

## 📁 Project Structure

```
MusaMeetwebsity/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   └── meeting/   # Meeting-specific components
│   │   ├── services/      # WebRTC & video effects services
│   │   ├── pages/         # Page components
│   │   ├── data/          # Background library data
│   │   └── utils/         # Helper functions
│   ├── public/
│   │   └── backgrounds/   # Virtual background images
│   └── package.json
│
├── server/                # Node.js backend
│   ├── server.js         # Main server file with Socket.io
│   └── package.json
│
├── README.md             # This file
└── SETUP.md             # Detailed setup guide
```

## 🛠️ Configuration

### Client Environment Variables
Create `client/.env`:
```env
VITE_SERVER_URL=http://localhost:3001
```

### Server Environment Variables
Create `server/.env` (optional):
```env
PORT=3001
```

## 🌐 Deployment

### Deploy Backend
**Recommended: Render, Railway, or Heroku**

1. Push server code to GitHub
2. Create new web service
3. Set environment variables
4. Deploy with `npm start`

### Deploy Frontend
**Recommended: Vercel or Netlify**

1. Push client code to GitHub
2. Import project
3. Set `VITE_SERVER_URL` to your backend URL
4. Build command: `npm run build`
5. Output directory: `dist`

## 🧪 Testing

### Local Testing
```bash
# Terminal 1 - Start server
cd server && npm start

# Terminal 2 - Start client
cd client && npm run dev
```

### Multi-User Testing
1. Open meeting in normal browser window
2. Open same meeting URL in incognito window
3. Test video, audio, chat, and screen sharing

### WebRTC Debugging
- Chrome: `chrome://webrtc-internals`
- Firefox: `about:webrtc`

## 🔧 Technologies Used

| Category | Technology |
|----------|-----------|
| Frontend | React 19, React Router |
| Backend | Node.js, Express |
| Real-time | Socket.io, WebRTC |
| AI/ML | MediaPipe Selfie Segmentation |
| Build Tool | Vite |
| Styling | CSS3 with custom properties |

## 📱 Browser Support

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 72+ |
| Firefox | 66+ |
| Safari | 13+ |
| Edge | 79+ |

## 🐛 Troubleshooting

**Connection Issues**
- Ensure both server and client are running
- Check firewall settings
- Verify WebSocket connection in DevTools

**No Video/Audio**
- Grant camera/microphone permissions
- Check device selection
- Try different browser

**CORS Errors**
- Update server CORS settings
- Check environment variables

See [SETUP.md](./SETUP.md) for detailed troubleshooting.

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please open an issue first to discuss changes.

## 📧 Contact

Built with ❤️ by [Your Name]

---

**Ready to start?** Follow the [Quick Start](#-quick-start) guide above!
