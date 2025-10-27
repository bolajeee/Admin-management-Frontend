import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Check, Sun, Moon, Sparkles, Briefcase, Zap } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';
import { THEMES, THEME_CATEGORIES } from '../../constants';

const ThemeSelector = ({ isOpen, onClose }) => {
  const { theme, setTheme } = useThemeStore();
  const [selectedCategory, setSelectedCategory] = useState('Popular');

  const getCategoryIcon = (category) => {
    const icons = {
      'Popular': Sparkles,
      'Colorful': Palette,
      'Dark': Moon,
      'Light': Sun,
      'Professional': Briefcase,
      'Creative': Zap
    };
    return icons[category] || Palette;
  };

  const getThemePreview = (themeName) => {
    // Create a temporary element to get theme colors
    const tempDiv = document.createElement('div');
    tempDiv.setAttribute('data-theme', themeName);
    tempDiv.style.display = 'none';
    document.body.appendChild(tempDiv);
    
    const computedStyle = getComputedStyle(tempDiv);
    const colors = {
      primary: computedStyle.getPropertyValue('--p') || '259 94% 51%',
      secondary: computedStyle.getPropertyValue('--s') || '314 100% 47%',
      accent: computedStyle.getPropertyValue('--a') || '174 60% 51%',
      neutral: computedStyle.getPropertyValue('--n') || '219 14% 28%',
      base: computedStyle.getPropertyValue('--b1') || '0 0% 100%'
    };
    
    document.body.removeChild(tempDiv);
    return colors;
  };

  const ThemePreviewCard = ({ themeName, isSelected, onClick }) => {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`relative p-3 rounded-lg border-2 transition-all duration-200 ${
          isSelected 
            ? 'border-primary bg-primary/10 shadow-lg' 
            : 'border-base-300 hover:border-primary/50 hover:shadow-md'
        }`}
        data-theme={themeName}
      >
        {/* Theme Preview */}
        <div className="space-y-2">
          <div className="flex gap-1">
            <div className="w-4 h-4 rounded bg-primary"></div>
            <div className="w-4 h-4 rounded bg-secondary"></div>
            <div className="w-4 h-4 rounded bg-accent"></div>
          </div>
          <div className="w-full h-2 rounded bg-base-200"></div>
          <div className="flex gap-1">
            <div className="w-6 h-1 rounded bg-base-300"></div>
            <div className="w-4 h-1 rounded bg-base-300"></div>
          </div>
        </div>

        {/* Theme Name */}
        <p className="text-xs font-medium mt-2 capitalize text-base-content">
          {themeName}
        </p>

        {/* Selected Indicator */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
          >
            <Check className="w-3 h-3 text-primary-content" />
          </motion.div>
        )}
      </motion.button>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            exit={{ y: 20 }}
            className="bg-base-100 rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-base-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Palette className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-base-content">Choose Theme</h2>
                    <p className="text-sm text-base-content/60">
                      Customize your admin panel appearance
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="btn btn-ghost btn-circle"
                >
                  ✕
                </button>
              </div>

              {/* Category Tabs */}
              <div className="flex gap-2 mt-4 overflow-x-auto">
                {Object.keys(THEME_CATEGORIES).map((category) => {
                  const IconComponent = getCategoryIcon(category);
                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                        selectedCategory === category
                          ? 'bg-primary text-primary-content'
                          : 'bg-base-200 text-base-content hover:bg-base-300'
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Theme Grid */}
            <div className="p-6 overflow-y-auto max-h-96">
              <motion.div
                key={selectedCategory}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
              >
                {THEME_CATEGORIES[selectedCategory]?.map((themeName) => (
                  <ThemePreviewCard
                    key={themeName}
                    themeName={themeName}
                    isSelected={theme === themeName}
                    onClick={() => setTheme(themeName)}
                  />
                ))}
              </motion.div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-base-300 bg-base-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-base-content/60">
                  Current theme: <span className="font-medium capitalize">{theme}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTheme('light')}
                    className="btn btn-ghost btn-sm"
                  >
                    Reset to Light
                  </button>
                  <button
                    onClick={onClose}
                    className="btn btn-primary btn-sm"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ThemeSelector;