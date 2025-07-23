import React, { useState, useMemo } from 'react';
import { Tabs, Button, Card, Select, Space, Spin } from 'antd';
import { 
  DownloadOutlined, 
  ReloadOutlined, 
  ProjectOutlined, 
  TeamOutlined, 
  DollarOutlined, 
  UserOutlined,
  FallOutlined,
  FileExcelOutlined,
  FilePdfOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import DateRangeSelector from '../../components/reports/DateRangeSelector';
import MetricCard from '../../components/reports/MetricCard';
import ProjectPerformance from '../../components/reports/ProjectPerformance';
import FinancialReports from '../../components/reports/FinancialReports';
import useReportData from '../../hooks/useReportData';
import { useThemeStyles } from '../../utils/themeUtils';
import TeamPerformance from '../../components/reports/TeamPerformance';

const { TabPane } = Tabs;
const { Option } = Select;

// Mock data for metrics that aren't in the API
const mockMetrics = {
  activeProjects: 12,
  overdueTasks: 5,
  teamUtilization: 78,
  budgetVariance: -4.2,
};

// Format date for display
const formatDate = (date) => {
  return dayjs(date).format('MMM D, YYYY');
};

const ExportButton = ({ format, onExport, loading = false }) => {
  const { getButtonStyles } = useThemeStyles();
  const icon = format === 'pdf' ? <FilePdfOutlined /> : <FileExcelOutlined />;
  
  return (
    <Button
      icon={icon}
      onClick={() => onExport(format)}
      className={getButtonStyles('ghost')}
      loading={loading}
    >
      {format.toUpperCase()}
    </Button>
  );
};

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'day'),
    dayjs(),
  ]);
  const [filters, setFilters] = useState({
    projectStatus: 'all',
  });
  
  const { data, isLoading, error, refetch } = useReportData(dateRange, filters);
  const { getCardStyles, getButtonStyles } = useThemeStyles();
  const styles = getCardStyles();

  const handleDateChange = (dates) => {
    setDateRange(dates);
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExport = async (format) => {
    // In a real app, this would trigger an API call to generate a report
    console.log(`Exporting ${format} report for`, { dateRange, filters });
    // Simulate export
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Export complete!');
  };

  const refreshData = () => {
    refetch();
  };
  
  // Merge mock data with API data
  const metrics = useMemo(() => ({
    ...mockMetrics,
    ...(data?.metrics || {})
  }), [data]);

  if (error) {
    return (
      <div className="p-6">
        <Card className="bg-error/10 border-error/30">
          <div className="text-error flex flex-col items-center justify-center p-8">
            <ExclamationCircleOutlined className="text-4xl mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Reports</h2>
            <p className="text-center mb-4">We encountered an error while loading the reports. Please try again.</p>
            <Button 
              type="primary" 
              onClick={refreshData}
              icon={<ReloadOutlined />}
              className={getButtonStyles('primary')}
            >
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400">Key metrics and insights for your projects and team</p>
        </div>
        <Space>
          <Space.Compact>
            <ExportButton 
              format="pdf" 
              onExport={handleExport} 
              loading={isLoading}
            />
            <ExportButton 
              format="excel" 
              onExport={handleExport} 
              loading={isLoading}
            />
          </Space.Compact>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={refreshData}
            loading={isLoading}
            className={getButtonStyles('ghost')}
          >
            Refresh
          </Button>
        </Space>
      </div>

      {/* Date Range Selector */}
      <Card className={styles.className}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <DateRangeSelector 
            value={dateRange} 
            onChange={handleDateChange} 
          />
          <Select 
            value={filters.projectStatus}
            onChange={(value) => handleFilterChange('projectStatus', value)}
            style={{ width: 200 }}
            className="w-full md:w-auto"
            disabled={isLoading}
          >
            <Option value="all">All Projects</Option>
            <Option value="active">Active Projects</Option>
            <Option value="completed">Completed Projects</Option>
            <Option value="delayed">Delayed Projects</Option>
          </Select>
        </div>
      </Card>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard 
          title="Active Projects" 
          value={metrics.activeProjects} 
          icon={<ProjectOutlined />}
          trend={12.5}
          trendText="from last month"
        />
        <MetricCard 
          title="Overdue Tasks" 
          value={metrics.overdueTasks} 
          icon={<FallOutlined className="text-error" />}
          trend={-8.3}
          trendText="from last month"
          className="border-l-4 border-error/50"
        />
        <MetricCard 
          title="Team Utilization" 
          value={`${metrics.teamUtilization}%`} 
          icon={<TeamOutlined />}
          trend={5.2}
          trendText="from last month"
        />
        <MetricCard 
          title="Budget Variance" 
          value={`${Math.abs(metrics.budgetVariance)}% ${metrics.budgetVariance >= 0 ? 'Under' : 'Over'}`} 
          icon={<DollarOutlined className={metrics.budgetVariance >= 0 ? 'text-success' : 'text-error'} />}
          trend={metrics.budgetVariance}
          trendText={metrics.budgetVariance >= 0 ? 'under budget' : 'over budget'}
          className={`border-l-4 ${metrics.budgetVariance >= 0 ? 'border-success/50' : 'border-error/50'}`}
        />
      </div>

      {/* Main Reports Tabs */}
      <Tabs 
        defaultActiveKey="1" 
        className="report-tabs"
        onChange={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <TabPane 
          tab={
            <span className="flex items-center">
              <ProjectOutlined className="mr-1" />
              Project Performance
            </span>
          } 
          key="1"
        >
          <ProjectPerformance 
            data={data} 
            isLoading={isLoading} 
          />
        </TabPane>
        
        <TabPane 
          tab={
            <span className="flex items-center">
              <TeamOutlined className="mr-1" />
              Team Performance
            </span>
          } 
          key="2"
        >
          <Card className={styles.className}>
           <TeamPerformance 
            data={data} 
            isLoading={isLoading} 
          />
          </Card>
        </TabPane>
        
        <TabPane 
          tab={
            <span className="flex items-center">
              <DollarOutlined className="mr-1" />
              Financial Reports
            </span>
          } 
          key="3"
        >
          <FinancialReports />
        </TabPane>
        
        <TabPane 
          tab={
            <span className="flex items-center">
              <UserOutlined className="mr-1" />
              Client Reports
            </span>
          } 
          key="4"
        >
          <Card className={styles.className}>
            <div className={styles.headerClassName}>
              <h2 className="text-xl font-semibold">Client Reports</h2>
            </div>
            <div className={`${styles.bodyClassName} p-6 text-center`}>
              <p>Client reports will be available in the next update.</p>
              <p className="text-sm text-gray-500 mt-2">This will include client engagement metrics, project portfolio, and satisfaction scores.</p>
            </div>
          </Card>
        </TabPane>
      </Tabs>

      <style jsx global>{`
        .report-tabs .ant-tabs-nav::before {
          border-bottom: 1px solid var(--color-border);
        }
        .report-tabs .ant-tabs-tab {
          padding: 12px 16px;
          margin-right: 8px;
          border-radius: 8px 8px 0 0;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-bottom: none;
          margin-bottom: 0;
          transition: all 0.2s ease;
        }
        .report-tabs .ant-tabs-tab-active {
          background: var(--color-bg-base);
          border-bottom: 1px solid var(--color-bg-base);
          margin-bottom: -1px;
          box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
        }
        .report-tabs .ant-tabs-ink-bar {
          height: 3px;
          background: var(--color-primary);
        }
        .report-tabs .ant-tabs-tab-btn {
          color: var(--color-text);
        }
        .report-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: var(--color-primary);
          font-weight: 500;
        }
        .report-tabs .ant-tabs-tab:hover {
          color: var(--color-primary);
        }
      `}</style>
    </div>
  );
}
