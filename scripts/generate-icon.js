const fs = require('fs');
const path = require('path');

// Create a simple SVG icon file
const iconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1024" height="1024" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Notebook background with rounded corners and 3D effect -->
  <rect x="5" y="5" width="90" height="90" rx="18" ry="18" fill="#FF6B35" stroke="#E55A2B" stroke-width="1"/>
  
  <!-- 3D effect shadow -->
  <rect x="7" y="7" width="86" height="86" rx="16" ry="16" fill="rgba(0,0,0,0.1)"/>
  
  <!-- Spiral binding rings with metallic effect -->
  <g>
    <circle cx="8" cy="15" r="3.5" fill="#E0E0E0" stroke="#B0B0B0" stroke-width="0.5"/>
    <circle cx="8" cy="15" r="2.5" fill="#F0F0F0"/>
    <circle cx="8" cy="30" r="3.5" fill="#E0E0E0" stroke="#B0B0B0" stroke-width="0.5"/>
    <circle cx="8" cy="30" r="2.5" fill="#F0F0F0"/>
    <circle cx="8" cy="45" r="3.5" fill="#E0E0E0" stroke="#B0B0B0" stroke-width="0.5"/>
    <circle cx="8" cy="45" r="2.5" fill="#F0F0F0"/>
    <circle cx="8" cy="60" r="3.5" fill="#E0E0E0" stroke="#B0B0B0" stroke-width="0.5"/>
    <circle cx="8" cy="60" r="2.5" fill="#F0F0F0"/>
    <circle cx="8" cy="75" r="3.5" fill="#E0E0E0" stroke="#B0B0B0" stroke-width="0.5"/>
    <circle cx="8" cy="75" r="2.5" fill="#F0F0F0"/>
  </g>
  
  <!-- Large checkmark -->
  <path d="M35 30 L45 40 L70 15" stroke="white" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  
  <!-- "todoify" text with better styling -->
  <g>
    <path d="M25 65 Q30 60 35 65 Q40 70 45 65 Q50 60 55 65 Q60 70 65 65 Q70 60 75 65" stroke="white" stroke-width="2" fill="none"/>
    <path d="M25 70 Q30 75 35 70 Q40 65 45 70 Q50 75 55 70 Q60 65 65 70 Q70 75 75 70" stroke="white" stroke-width="2" fill="none"/>
  </g>
  
  <!-- Curled page corner with more detail -->
  <path d="M75 75 Q85 75 85 85 Q75 85 75 75" fill="#F5F5DC" stroke="#D0D0D0" stroke-width="1"/>
  
  <!-- Inner curl detail -->
  <path d="M78 78 Q82 78 82 82 Q78 82 78 78" fill="#E8E8E8"/>
  
  <!-- Shadow for curled corner -->
  <path d="M75 75 Q85 75 85 85 Q75 85 75 75" fill="rgba(0,0,0,0.15)" transform="translate(1.5, 1.5)"/>
</svg>`;

// Write the SVG file
fs.writeFileSync(path.join(__dirname, '../assets/icon.svg'), iconSvg);

console.log('Icon SVG generated successfully!');
console.log('Note: You may need to convert this SVG to PNG format for the app icon.');
console.log('You can use online converters or tools like ImageMagick to convert SVG to PNG.');
