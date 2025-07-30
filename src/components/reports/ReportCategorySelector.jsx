
import React, { useEffect, useState } from 'react';
import { Button } from 'antd';

const ReportCategorySelector = ({ reports, activeCategory, setActiveCategory }) => {
  // Extract categories from reports
  const [categories, setCategories] = useState([]);
  
  useEffect(() => {
    if (reports && reports.length) {
      // Get unique categories from reports
      const uniqueCategories = [...new Set(reports.map(report => report.type))];
      setCategories(uniqueCategories);
      
      // If current active category doesn't exist in the list, set to first category
      if (uniqueCategories.length && !uniqueCategories.includes(activeCategory)) {
        setActiveCategory(uniqueCategories[0]);
      }
    }
  }, [reports, activeCategory, setActiveCategory]);
  
  if (!categories.length) {
    return (
      <div className="text-base-content/60 text-sm">
        No report categories available. Upload a report to get started.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button
        key="all"
        type={activeCategory === 'all' ? 'primary' : 'default'}
        onClick={() => setActiveCategory('all')}
        className={activeCategory === 'all' ? 'bg-primary' : ''}
      >
        All Reports
      </Button>
      
      {categories.map(category => (
        <Button 
          key={category}
          type={activeCategory === category ? 'primary' : 'default'}
          onClick={() => setActiveCategory(category)}
          className={activeCategory === category ? 'bg-primary' : ''}
        >
          {category.charAt(0).toUpperCase() + category.slice(1)} Reports
        </Button>
      ))}
    </div>
  );
};

export default ReportCategorySelector;
