import React from 'react';
import { useThemeStyles } from '../../utils/themeUtils';

const MetricCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendText, 
  className = '' 
}) => {
  const { getMetricCardStyles } = useThemeStyles();
  const styles = getMetricCardStyles();
  
  const getTrendStyles = (trend) => {
    if (trend > 0) return 'text-success';
    if (trend < 0) return 'text-error';
    return 'text-info';
  };

  return (
    <div className={`${styles.className} ${className} transition-colors`}>
      <div className="flex justify-between items-start">
        <div>
          <p className={styles.titleClassName}>{title}</p>
          <p className={`${styles.valueClassName} mt-1`}>{value}</p>
        </div>
        {icon && (
          <div className="p-2 rounded-full bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className={`mt-2 text-sm ${getTrendStyles(trend)}`}>
          {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}% {trendText}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
