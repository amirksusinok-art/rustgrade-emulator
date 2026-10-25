import React from 'react';

interface ScrapIconProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const ScrapIcon: React.FC<ScrapIconProps> = ({ className = '', size = 'sm' }) => {
  const sizeMap: Record<string, string> = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  };

  const chosenSize = sizeMap[size] || sizeMap.sm;

  return (
    <img
      src="/images/scrap.png"
      alt="Scrap"
      className={`inline-block object-contain select-none shrink-0 ${chosenSize} ${className}`}
      loading="eager"
      draggable={false}
    />
  );
};
