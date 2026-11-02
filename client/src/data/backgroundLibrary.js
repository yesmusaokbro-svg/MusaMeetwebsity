/**
 * Virtual Background Library
 * Uses high-quality free stock photos from Unsplash
 * All images are free to use under Unsplash License
 */

// Fallback gradient generator for when images don't load
export const generateGradient = (colors) => {
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
          ${colors.map((color, i) => 
            `<stop offset="${(i / (colors.length - 1)) * 100}%" style="stop-color:${color}"/>`
          ).join('')}
        </linearGradient>
      </defs>
      <rect width="1920" height="1080" fill="url(#grad)"/>
    </svg>
  `)}`;
};

export const backgroundCategories = {
  office: {
    name: 'Professional Office',
    icon: '🏢',
    backgrounds: [
      {
        id: 'modern-office-1',
        name: 'Modern Office with City View',
        thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
        url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&h=1080&fit=crop',
        fallback: generateGradient(['#1a365d', '#2d5f8d', '#4a90c4']),
        description: 'Bright modern office with panoramic city skyline'
      },
      {
        id: 'executive-office',
        name: 'Executive Office',
        thumbnail: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&h=300&fit=crop',
        url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1920&h=1080&fit=crop',
        fallback: generateGradient(['#2d1810', '#5a3020', '#8b4513']),
        description: 'Professional executive office with wood furniture'
      },
      {
        id: 'conference-room',
        name: 'Conference Room',
        thumbnail: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&h=300&fit=crop',
        url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1920&h=1080&fit=crop',
        fallback: generateGradient(['#1c1c1c', '#2d2d2d', '#404040']),
        description: 'Modern conference room setup'
      },
      {
        id: 'minimalist-office',
        name: 'Minimalist Workspace',
        thumbnail: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&h=300&fit=crop',
        url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1920&h=1080&fit=crop',
        fallback: generateGradient(['#f5f5f5', '#e0e0e0', '#d0d0d0']),
        description: 'Clean minimalist office design'
      }
    ]
  },
  
  library: {
    name: 'Library & Books',
    icon: '📚',
    backgrounds: [
      {
        id: 'modern-library',
        name: 'Modern Library',
        thumbnail: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400&h=300&fit=crop',
        url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1920&h=1080&fit=crop',
        fallback: generateGradient(['#3d2817', '#6b4423', '#9b6234']),
        description: 'Contemporary library with artistic ceiling'
      },
      {
        id: 'classic-library',
        name: 'Classic Bookshelf',
        thumbnail: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&h=300&fit=crop',
        url: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1920&h=1080&fit=crop',
        fallback: generateGradient(['#2f1810', '#5c3020', '#8b4726']),
        description: 'Traditional library with wooden bookshelves'
      },
      {
        id: 'study-room',
        name: 'Study Room',
        thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
        url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1920&h=1080&fit=crop',
        fallback: generateGradient(['#1a2a3a', '#2d4a5a', '#406a7a']),
        description: 'Cozy study room with books'
      }
    ]
  },
  
  nature: {
    name: 'Nature & Outdoors',
    icon: '🌲',
    backgrounds: [
      {
        id: 'forest-path',
        name: 'Forest Path',
        thumbnail: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=400&h=300&fit=crop',
        url: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=1920&h=1080&fit=crop',
        fallback: generateGradient(['#1a3a1a', '#2d5a2d', '#4a7a4a']),
        description: 'Serene forest pathway'
      },
      {
        id: 'mountain-view',
        name: 'Mountain Vista',
        thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
        fallback: generateGradient(['#2d3d5a', '#4a6a8a', '#7a9aba']),
        description: 'Majestic mountain landscape'
      },
      {
        id: 'beach-ocean',
        name: 'Beach & Ocean',
        thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&h=1080&fit=crop',
        fallback: generateGradient(['#87ceeb', '#b0d9f1', '#d4ebf7']),
        description: 'Peaceful beach scene'
      },
      {
        id: 'tropical-paradise',
        name: 'Tropical Paradise',
        thumbnail: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
        url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&h=1080&fit=crop',
        fallback: generateGradient(['#1a4a2a', '#2d7a4a', '#4aaa6a']),
        description: 'Lush tropical environment'
      }
    ]
  },
  
  living: {
    name: 'Living Spaces',
    icon: '🏠',
    backgrounds: [
      {
        id: 'modern-living',
        name: 'Modern Living Room',
        thumbnail: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&h=300&fit=crop',
        url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1920&h=1080&fit=crop',
        fallback: generateGradient(['#2d2d2d', '#4a4a4a', '#6a6a6a']),
        description: 'Contemporary living room design'
      },
      {
        id: 'cozy-home',
        name: 'Cozy Home Office',
        thumbnail: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=300&fit=crop',
        url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1920&h=1080&fit=crop',
        fallback: generateGradient(['#5a3020', '#8b4513', '#a0522d']),
        description: 'Warm and inviting home workspace'
      },
      {
        id: 'elegant-interior',
        name: 'Elegant Interior',
        thumbnail: 'https://images.unsplash.com/photo-1505873242700-f289a29e1e0f?w=400&h=300&fit=crop',
        url: 'https://images.unsplash.com/photo-1505873242700-f289a29e1e0f?w=1920&h=1080&fit=crop',
        fallback: generateGradient(['#1a1a2e', '#2d2d4a', '#4a4a6a']),
        description: 'Sophisticated interior design'
      }
    ]
  },
  
  architecture: {
    name: 'Architecture',
    icon: '🏛️',
    backgrounds: [
      {
        id: 'modern-architecture',
        name: 'Modern Architecture',
        thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
        url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&h=1080&fit=crop',
        fallback: generateGradient(['#1c1c1c', '#3a3a3a', '#5a5a5a']),
        description: 'Contemporary architectural design'
      },
      {
        id: 'glass-building',
        name: 'Glass Building',
        thumbnail: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop',
        url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1920&h=1080&fit=crop',
        fallback: generateGradient(['#4a6a8a', '#6a8aaa', '#8aaaca']),
        description: 'Modern glass and steel structure'
      },
      {
        id: 'urban-skyline',
        name: 'Urban Skyline',
        thumbnail: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
        url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1920&h=1080&fit=crop',
        fallback: generateGradient(['#2d3d4a', '#4a5a6a', '#6a7a8a']),
        description: 'City skyline view'
      }
    ]
  },
  
  classroom: {
    name: 'Education',
    icon: '🎓',
    backgrounds: [
      {
        id: 'modern-classroom',
        name: 'Modern Classroom',
        thumbnail: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=300&fit=crop',
        url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1920&h=1080&fit=crop',
        fallback: generateGradient(['#f0f4f8', '#d9e2ec', '#bcccdc']),
        description: 'Contemporary classroom setting'
      },
      {
        id: 'lecture-hall',
        name: 'Lecture Hall',
        thumbnail: 'https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=300&fit=crop',
        url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1920&h=1080&fit=crop',
        fallback: generateGradient(['#2d3d4d', '#4a5a6a', '#6a7a8a']),
        description: 'University lecture hall'
      },
      {
        id: 'training-room',
        name: 'Training Room',
        thumbnail: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=300&fit=crop',
        url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1920&h=1080&fit=crop',
        fallback: generateGradient(['#e8f4f8', '#d0e8f0', '#b8dce8']),
        description: 'Professional training space'
      }
    ]
  },
  
  creative: {
    name: 'Creative & Unique',
    icon: '🎨',
    backgrounds: [
      {
        id: 'space-station',
        name: 'Space Station',
        thumbnail: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=300&fit=crop',
        url: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=1920&h=1080&fit=crop',
        fallback: generateGradient(['#0a0a1a', '#1a1a3a', '#2a2a5a']),
        description: 'Futuristic space environment'
      },
      {
        id: 'abstract-art',
        name: 'Abstract Art',
        thumbnail: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&h=300&fit=crop',
        url: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1920&h=1080&fit=crop',
        fallback: generateGradient(['#ff006e', '#8338ec', '#3a86ff']),
        description: 'Colorful abstract design'
      },
      {
        id: 'neon-city',
        name: 'Neon Cityscape',
        thumbnail: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400&h=300&fit=crop',
        url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1920&h=1080&fit=crop',
        fallback: generateGradient(['#ff006e', '#fb5607', '#ffbe0b']),
        description: 'Vibrant neon city at night'
      },
      {
        id: 'tech-grid',
        name: 'Digital Grid',
        thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=300&fit=crop',
        url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1920&h=1080&fit=crop',
        fallback: generateGradient(['#06ffa5', '#0aefff', '#147df5']),
        description: 'Futuristic digital grid'
      }
    ]
  }
};

// Get all backgrounds in a flat array
export const getAllBackgrounds = () => {
  return Object.values(backgroundCategories).flatMap(category => 
    category.backgrounds.map(bg => ({
      ...bg,
      category: category.name
    }))
  );
};

// Get backgrounds by category
export const getBackgroundsByCategory = (categoryKey) => {
  return backgroundCategories[categoryKey]?.backgrounds || [];
};

// Find background by ID
export const getBackgroundById = (id) => {
  for (const category of Object.values(backgroundCategories)) {
    const background = category.backgrounds.find(bg => bg.id === id);
    if (background) return background;
  }
  return null;
};
