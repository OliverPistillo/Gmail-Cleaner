import React from 'react';

const GmailCleanerIcon = ({ size = 48, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 256 256" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Background circle */}
    <circle cx="128" cy="128" r="120" fill="#f5f5f5" fillOpacity="0.1"/>
    
    {/* Gmail envelope */}
    <g transform="translate(40, 60)">
      {/* Envelope body */}
      <rect x="0" y="20" width="120" height="80" rx="8" fill="#EA4335" />
      
      {/* Envelope flap */}
      <path d="M0 28 L60 60 L120 28 L120 20 L0 20 Z" fill="#EA4335" />
      <path d="M0 28 L60 60 L120 28" stroke="#C5221F" strokeWidth="2" />
      
      {/* M logo with prohibition sign */}
      <circle cx="30" cy="30" r="24" fill="#FFFFFF" fillOpacity="0.9" />
      <circle cx="30" cy="30" r="22" fill="none" stroke="#EA4335" strokeWidth="3" />
      <path d="M18 25 L24 35 L30 28 L36 35 L42 25" 
            stroke="#EA4335" 
            strokeWidth="2.5" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round" />
      <path d="M12 12 L48 48" stroke="#EA4335" strokeWidth="3" strokeLinecap="round" />
    </g>
    
    {/* Broom */}
    <g transform="translate(100, 80) rotate(-30 40 40)">
      {/* Broom handle */}
      <rect x="35" y="0" width="10" height="60" rx="5" fill="#37474F" />
      
      {/* Broom bristles */}
      <path d="M20 60 L60 60 L65 85 L55 90 L45 88 L35 90 L25 88 L15 85 Z" 
            fill="#EA4335" 
            stroke="#37474F" 
            strokeWidth="2" />
      
      {/* Bristle lines */}
      <path d="M25 60 L22 85 M35 60 L35 88 M45 60 L48 85 M55 60 L58 85" 
            stroke="#C5221F" 
            strokeWidth="1.5" 
            strokeLinecap="round" />
    </g>
    
    {/* Dust particles being swept */}
    <g transform="translate(140, 120)">
      <rect x="0" y="0" width="6" height="6" fill="#EA4335" opacity="0.8" transform="rotate(45 3 3)" />
      <rect x="15" y="5" width="5" height="5" fill="#EA4335" opacity="0.6" transform="rotate(30 17.5 7.5)" />
      <rect x="25" y="0" width="4" height="4" fill="#EA4335" opacity="0.4" transform="rotate(60 27 2)" />
      <rect x="35" y="8" width="3" height="3" fill="#EA4335" opacity="0.3" transform="rotate(15 36.5 9.5)" />
      <rect x="8" y="15" width="5" height="5" fill="#EA4335" opacity="0.5" transform="rotate(75 10.5 17.5)" />
      <rect x="20" y="18" width="3" height="3" fill="#EA4335" opacity="0.2" transform="rotate(45 21.5 19.5)" />
      <rect x="30" y="20" width="4" height="4" fill="#EA4335" opacity="0.4" transform="rotate(20 32 22)" />
      <rect x="40" y="15" width="3" height="3" fill="#EA4335" opacity="0.2" transform="rotate(50 41.5 16.5)" />
    </g>
  </svg>
);

export default GmailCleanerIcon;