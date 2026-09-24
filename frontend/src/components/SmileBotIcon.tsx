import React from 'react';

interface SmileBotIconProps {
  size?: number;
  color?: string;
  bgFill?: string;
}

export const SmileBotIcon: React.FC<SmileBotIconProps> = ({
  size = 24,
  color = '#2563EB',
  bgFill = '#EFF6FF'
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Antenna Stem & Glowing Ball */}
    <path d="M12 2V5" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="2" r="1.5" fill={color} />
    
    {/* Robot Head Body */}
    <rect x="3" y="5" width="18" height="15" rx="5" fill={bgFill} stroke={color} strokeWidth="2" />
    
    {/* Left & Right Ear Bolts */}
    <path d="M1.5 10.5V14.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M22.5 10.5V14.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
    
    {/* Glowing Happy Robot Eyes */}
    <circle cx="8.5" cy="11" r="1.8" fill={color} />
    <circle cx="15.5" cy="11" r="1.8" fill={color} />
    
    {/* Cute Friendly Smiling Mouth */}
    <path 
      d="M8.5 14.8C8.5 14.8 10 17.2 12 17.2C14 17.2 15.5 14.8 15.5 14.8" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
  </svg>
);
