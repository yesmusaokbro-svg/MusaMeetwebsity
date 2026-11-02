/**
 * Generate professional-looking base64 background images
 * These are temporary placeholders until real photos are added
 */

// Create canvas and generate gradient images
function createGradientBackground(width, height, colors, direction = 'vertical') {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  const gradient = direction === 'vertical'
    ? ctx.createLinearGradient(0, 0, 0, height)
    : ctx.createLinearGradient(0, 0, width, 0);
  
  colors.forEach((color, index) => {
    gradient.addColorStop(index / (colors.length - 1), color);
  });
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL('image/jpeg', 0.8);
}

// Professional color schemes for different categories
export const backgroundPatterns = {
  office: {
    modern: ['#1a365d', '#2d5f8d', '#4a90c4'],
    executive: ['#2d1810', '#5a3020', '#8b4513'],
    conference: ['#1c1c1c', '#2d2d2d', '#404040'],
    minimalist: ['#f5f5f5', '#e0e0e0', '#d0d0d0']
  },
  library: {
    modern: ['#3d2817', '#6b4423', '#9b6234'],
    classic: ['#2f1810', '#5c3020', '#8b4726'],
    study: ['#1a2a3a', '#2d4a5a', '#406a7a']
  },
  nature: {
    forest: ['#1a3a1a', '#2d5a2d', '#4a7a4a'],
    mountains: ['#2d3d5a', '#4a6a8a', '#7a9aba'],
    beach: ['#87ceeb', '#b0d9f1', '#d4ebf7'],
    tropical: ['#1a4a2a', '#2d7a4a', '#4aaa6a']
  },
  living: {
    modern: ['#2d2d2d', '#4a4a4a', '#6a6a6a'],
    cozy: ['#5a3020', '#8b4513', '#a0522d'],
    elegant: ['#1a1a2e', '#2d2d4a', '#4a4a6a']
  },
  architecture: {
    modern: ['#1c1c1c', '#3a3a3a', '#5a5a5a'],
    glass: ['#4a6a8a', '#6a8aaa', '#8aaaca'],
    urban: ['#2d3d4a', '#4a5a6a', '#6a7a8a']
  },
  classroom: {
    modern: ['#f0f4f8', '#d9e2ec', '#bcccdc'],
    lecture: ['#2d3d4d', '#4a5a6a', '#6a7a8a'],
    training: ['#e8f4f8', '#d0e8f0', '#b8dce8']
  },
  creative: {
    space: ['#0a0a1a', '#1a1a3a', '#2a2a5a'],
    abstract: ['#ff006e', '#8338ec', '#3a86ff'],
    neon: ['#ff006e', '#fb5607', '#ffbe0b'],
    grid: ['#06ffa5', '#0aefff', '#147df5']
  }
};

export function generateAllBackgrounds() {
  const backgrounds = {};
  
  // Office backgrounds
  backgrounds['modern-office-cityview'] = createGradientBackground(1920, 1080, backgroundPatterns.office.modern);
  backgrounds['executive-office'] = createGradientBackground(1920, 1080, backgroundPatterns.office.executive);
  backgrounds['conference-room'] = createGradientBackground(1920, 1080, backgroundPatterns.office.conference);
  backgrounds['minimalist-office'] = createGradientBackground(1920, 1080, backgroundPatterns.office.minimalist);
  
  // Library backgrounds
  backgrounds['modern-library'] = createGradientBackground(1920, 1080, backgroundPatterns.library.modern);
  backgrounds['classic-library'] = createGradientBackground(1920, 1080, backgroundPatterns.library.classic);
  backgrounds['study-room'] = createGradientBackground(1920, 1080, backgroundPatterns.library.study);
  
  // Nature backgrounds
  backgrounds['forest'] = createGradientBackground(1920, 1080, backgroundPatterns.nature.forest);
  backgrounds['mountains'] = createGradientBackground(1920, 1080, backgroundPatterns.nature.mountains);
  backgrounds['beach'] = createGradientBackground(1920, 1080, backgroundPatterns.nature.beach);
  backgrounds['tropical'] = createGradientBackground(1920, 1080, backgroundPatterns.nature.tropical);
  
  // Living spaces
  backgrounds['modern-living'] = createGradientBackground(1920, 1080, backgroundPatterns.living.modern);
  backgrounds['cozy-home'] = createGradientBackground(1920, 1080, backgroundPatterns.living.cozy);
  backgrounds['elegant-interior'] = createGradientBackground(1920, 1080, backgroundPatterns.living.elegant);
  
  // Architecture
  backgrounds['modern-building'] = createGradientBackground(1920, 1080, backgroundPatterns.architecture.modern);
  backgrounds['glass-building'] = createGradientBackground(1920, 1080, backgroundPatterns.architecture.glass);
  backgrounds['urban-skyline'] = createGradientBackground(1920, 1080, backgroundPatterns.architecture.urban);
  
  // Classroom
  backgrounds['modern-classroom'] = createGradientBackground(1920, 1080, backgroundPatterns.classroom.modern);
  backgrounds['lecture-hall'] = createGradientBackground(1920, 1080, backgroundPatterns.classroom.lecture);
  backgrounds['training-room'] = createGradientBackground(1920, 1080, backgroundPatterns.classroom.training);
  
  // Creative
  backgrounds['space'] = createGradientBackground(1920, 1080, backgroundPatterns.creative.space);
  backgrounds['abstract'] = createGradientBackground(1920, 1080, backgroundPatterns.creative.abstract, 'diagonal');
  backgrounds['neon-city'] = createGradientBackground(1920, 1080, backgroundPatterns.creative.neon, 'diagonal');
  backgrounds['tech-grid'] = createGradientBackground(1920, 1080, backgroundPatterns.creative.grid);
  
  return backgrounds;
}

// Create a blob URL for an image
export function createBackgroundBlobUrl(imageData) {
  return imageData; // Already a data URL
}
