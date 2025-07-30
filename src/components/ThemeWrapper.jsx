// src/components/ThemeWrapper.jsx
import React from 'react';
import { useThemeStore } from '../store/useThemeStore';
import { THEME_COLORS } from '../constants/index';

const ThemeWrapper = ({ children, className = '', ...props }) => {
  const { theme } = useThemeStore();
  
  return (
    <div 
      className={`${className}`} 
      data-theme={theme}
      {...props}
    >
      {children}
    </div>
  );
};

export default ThemeWrapper;