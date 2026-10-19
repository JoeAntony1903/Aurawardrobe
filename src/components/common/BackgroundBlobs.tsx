import React from 'react';

export const BackgroundBlobs: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Deep dark gradient baseline */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950" />

      {/* Primary Blurred Colorful Gradient Blobs */}
      <div 
        className="absolute -top-32 -left-32 w-96 h-96 sm:w-[32rem] sm:h-[32rem] bg-indigo-600/25 rounded-full blur-[100px] animate-pulse"
        style={{ animationDuration: '8s' }}
      />
      
      <div 
        className="absolute top-1/4 -right-24 w-80 h-80 sm:w-[30rem] sm:h-[30rem] bg-purple-600/20 rounded-full blur-[110px]"
      />

      <div 
        className="absolute bottom-10 left-1/4 w-72 h-72 sm:w-[26rem] sm:h-[26rem] bg-fuchsia-600/15 rounded-full blur-[90px]"
      />

      <div 
        className="absolute -bottom-20 right-1/4 w-96 h-96 bg-cyan-600/15 rounded-full blur-[120px]"
      />

      {/* Subtle fine grid texture for glass depth */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />
    </div>
  );
};
