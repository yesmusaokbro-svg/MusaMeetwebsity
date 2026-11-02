# Setup Virtual Backgrounds

The app is ready to use virtual backgrounds with real person segmentation, but it needs actual background images to work properly.

## Quick Setup (5 minutes)

### Option 1: Download Sample Backgrounds

Visit these sites and download one image for each category:

1. **Office Background**:
   - Go to: https://unsplash.com/s/photos/office-interior-city-view
   - Download any professional office photo
   - Save as: `client/public/backgrounds/office/modern-office-cityview.jpg`

2. **Library Background**:
   - Go to: https://unsplash.com/s/photos/library-interior
   - Download a library/bookshelf photo
   - Save as: `client/public/backgrounds/library/modern-library.jpg`

3. **Nature Background**:
   - Go to: https://unsplash.com/s/photos/forest-landscape
   - Download a nature scene
   - Save as: `client/public/backgrounds/nature/forest.jpg`

4. **Living Room**:
   - Go to: https://unsplash.com/s/photos/modern-living-room
   - Download a living room photo
   - Save as: `client/public/backgrounds/living/modern-living.jpg`

### Option 2: Use Your Own Images

1. Take or find photos you want to use
2. Resize them to 1920x1080 (16:9 aspect ratio)
3. Save them to the appropriate folder:
   - `backgrounds/office/`
   - `backgrounds/library/`
   - `backgrounds/nature/`
   - etc.

### Option 3: Download a Complete Set

I can help you create a script to download free backgrounds from Unsplash API. Would you like me to create that?

## File Structure After Setup

```
client/public/backgrounds/
├── office/
│   ├── modern-office-cityview.jpg
│   ├── executive-office.jpg
│   ├── conference-room.jpg
│   └── minimalist-office.jpg
├── library/
│   ├── modern-library.jpg
│   ├── classic-library.jpg
│   └── study-room.jpg
├── nature/
│   ├── forest.jpg
│   ├── mountains.jpg
│   ├── beach.jpg
│   └── tropical.jpg
└── ... (other categories)
```

## Testing Without Images

The app will show an error if an image isn't found, but:
- ✅ The "Original" option (no background) will always work
- ✅ The "Blur" options will work
- ✅ Custom upload will work
- ❌ Preset backgrounds won't work until images are added

## How It Works

1. **Person Segmentation**: Uses MediaPipe Selfie Segmentation to detect you
2. **Background Replacement**: Replaces everything behind you with the selected image
3. **Edge Smoothing**: Applies feathering around your outline for natural look
4. **Real-time Processing**: Runs at 30 FPS in your browser

## Performance

- Works best on modern computers with good GPU
- May be slower on older devices
- Blur effects are faster than virtual backgrounds
- Chrome/Edge recommended for best performance

## Need Help?

If you want me to:
- Create a download script for backgrounds
- Generate more placeholder images
- Optimize the segmentation performance
- Add more background categories

Just ask!
