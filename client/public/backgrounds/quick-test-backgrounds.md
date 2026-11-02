# Quick Test - Get Started in 2 Minutes

Don't want to download 24 images? Here's how to test with just 3:

## Minimal Setup (3 images)

### 1. Office Background
- Go to: https://unsplash.com/photos/white-ipad-on-brown-wooden-table-hFQ1A7BTiKI
- Click "Download free" → "Small (640 x 960)"
- Save as: `client/public/backgrounds/office/modern-office-cityview.jpg`

### 2. Nature Background
- Go to: https://unsplash.com/photos/green-leaf-trees-beside-river-KSllBPm8FZ4
- Click "Download free" → "Small (640 x 427)"
- Save as: `client/public/backgrounds/nature/forest.jpg`

### 3. Library Background
- Go to: https://unsplash.com/photos/person-standing-inside-building-near-glass-window-FMPfMYi_Sl4
- Click "Download free" → "Small (640 x 427)"
- Save as: `client/public/backgrounds/library/modern-library.jpg`

## Test It

1. Start your app: `npm run dev`
2. Go to meeting room
3. Click the background button (landscape icon)
4. Try "Light Blur" → Your background should blur, your face stays sharp ✅
5. Try "Strong Blur" → More blur ✅
6. Click "Office" category → Click your office background → Background changes behind you ✅
7. Click "Upload" → Select any image from your computer → Custom background ✅

## What You Should See

### With Blur:
```
[Your clear face/body] + [Blurred background]
```

### With Virtual Background:
```
[Your clear face/body] + [Chosen background image]
```

### Key Test: Wave your hand
- When you wave your hand, the background should stay put
- Your hand should move in front of the background
- The edge around your hand should look natural
- This proves real segmentation is working!

## Still Not Working?

Check console (F12) for errors:
- "Failed to load background image" → Image file missing or wrong path
- "Segmentation not ready" → MediaPipe loading issue, refresh page
- Performance issues → Try blur instead of virtual background first

## Next Level

Once you confirm it works:
- Add more backgrounds following the full guide in `SETUP_BACKGROUNDS.md`
- All 24+ backgrounds for complete library
- Optimize images for faster loading
- Consider adding your own custom branded backgrounds
