import React from 'react';
import { Button } from 'antd';

const ReportSelector = ({ activeReport, setActiveReport }) => {
  const reports = [
    { id: 'overview', label: 'Overview' },
    { id: 'team', label: 'Team Performance' },
    { id: 'clients', label: 'Client Reports' },
    { id: 'finance', label: 'Financial Reports' }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {reports.map(report => (
        <Button 
          key={report.id}
          type={activeReport === report.id ? 'primary' : 'default'}
          onClick={() => setActiveReport(report.id)}
          className={activeReport === report.id ? 'bg-primary' : ''}
        >
          {report.label}
        </Button>
      ))}
    </div>
  );
};

export default ReportSelector;