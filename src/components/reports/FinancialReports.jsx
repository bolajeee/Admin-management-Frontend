import React, { useState } from 'react';
import { Card, Row, Col, Tabs, DatePicker, Select, Button, message, Spin } from 'antd';
import { DownloadOutlined, ReloadOutlined, FilterOutlined } from '@ant-design/icons';
import { useTheme } from '../../utils/themeUtils';
import MetricCard from './MetricCard';
import DateRangeSelector from './DateRangeSelector';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

const FinancialReports = () => {
  const { theme, isDark, styles } = useTheme();
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    new Date() // Today
  ]);
  const [currency, setCurrency] = useState('USD');
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - replace with API calls
  const financialData = {
    overview: {
      totalRevenue: 125000,
      totalExpenses: 85600,
      netProfit: 39400,
      profitMargin: '31.5%',
      revenueTrend: 12.5,
      expenseTrend: 8.2,
    },
    revenueBySource: [
      { name: 'Product Sales', value: 75000 },
      { name: 'Services', value: 35000 },
      { name: 'Subscriptions', value: 15000 },
    ],
    expensesByCategory: [
      { name: 'Salaries', value: 45000 },
      { name: 'Office', value: 15000 },
      { name: 'Marketing', value: 12000 },
      { name: 'Software', value: 8600 },
    ],
    monthlyTrends: [
      { month: 'Jan', revenue: 10000, expenses: 8000 },
      { month: 'Feb', revenue: 12000, expenses: 8500 },
      { month: 'Mar', revenue: 15000, expenses: 9000 },
      { month: 'Apr', revenue: 11000, expenses: 8200 },
      { month: 'May', revenue: 13000, expenses: 9500 },
      { month: 'Jun', revenue: 14000, expenses: 10000 },
    ]
  };

  const handleDateChange = (dates) => {
    if (dates && dates.length === 2) {
      setDateRange(dates);
      // Refresh data with new date range
      fetchFinancialData(dates);
    }
  };

  const fetchFinancialData = async (dates) => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await financialReportService.getData({
      //   startDate: dates[0],
      //   endDate: dates[1],
      //   currency
      // });
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      message.success('Financial data updated');
    } catch (error) {
      console.error('Error fetching financial data:', error);
      message.error('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format = 'csv') => {
    message.loading({ content: 'Preparing export...', key: 'export' });
    // TODO: Implement export functionality
    setTimeout(() => {
      message.success({ content: `Exported financial data as ${format.toUpperCase()}`, key: 'export' });
    }, 1500);
  };

  const renderOverviewCards = () => (
    <Row gutter={[16, 16]} className="mb-6">
      <Col xs={24} sm={12} lg={6}>
        <MetricCard
          title="Total Revenue"
          value={`${currency} ${financialData.overview.totalRevenue.toLocaleString()}`}
          trend={financialData.overview.revenueTrend}
          trendLabel="vs last period"
          icon={<i className="fas fa-dollar-sign" />}
          color="success"
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <MetricCard
          title="Total Expenses"
          value={`${currency} ${financialData.overview.totalExpenses.toLocaleString()}`}
          trend={financialData.overview.expenseTrend}
          trendLabel="vs last period"
          icon={<i className="fas fa-receipt" />}
          color="warning"
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <MetricCard
          title="Net Profit"
          value={`${currency} ${financialData.overview.netProfit.toLocaleString()}`}
          trend={financialData.overview.netProfit / financialData.overview.totalRevenue * 100 - 100}
          trendLabel="Margin"
          secondaryValue={financialData.overview.profitMargin}
          icon={<i className="fas fa-chart-line" />}
          color="info"
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <MetricCard
          title="Open Invoices"
          value="12"
          trend={-5.5}
          trendLabel="vs last month"
          secondaryValue={`${currency} 28,500`}
          icon={<i className="fas fa-file-invoice" />}
          color="danger"
        />
      </Col>
    </Row>
  );

  const renderRevenueChart = () => (
    <Card title="Monthly Financial Trends" className="mb-6">
      <div style={{ height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={financialData.monthlyTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" fill="#4CAF50" name="Revenue" />
            <Bar dataKey="expenses" fill="#FF9800" name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );

  const renderBreakdowns = () => (
    <Row gutter={[16, 16]} className="mb-6">
      <Col xs={24} md={12}>
        <Card title="Revenue by Source">
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={financialData.revenueBySource}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#4CAF50" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </Col>
      <Col xs={24} md={12}>
        <Card title="Expenses by Category">
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={financialData.expensesByCategory}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#FF9800" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </Col>
    </Row>
  );

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Financial Reports</h1>
        <div className="flex space-x-2">
          <Select 
            value={currency} 
            onChange={setCurrency}
            className="w-32"
          >
            <Option value="USD">USD ($)</Option>
            <Option value="EUR">EUR (€)</Option>
            <Option value="GBP">GBP (£)</Option>
          </Select>
          <DateRangeSelector 
            onChange={handleDateChange}
            initialRange={dateRange}
          />
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => fetchFinancialData(dateRange)}
            loading={loading}
          >
            Refresh
          </Button>
          <Button 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={() => handleExport('csv')}
          >
            Export
          </Button>
        </div>
      </div>

      <Spin spinning={loading}>
        <Tabs 
          activeKey={activeTab}
          onChange={setActiveTab}
          className="financial-tabs"
        >
          <TabPane tab="Overview" key="overview">
            {renderOverviewCards()}
            {renderRevenueChart()}
            {renderBreakdowns()}
          </TabPane>
          <TabPane tab="Income Statement" key="income">
            <Card>
              <p>Income Statement content will go here</p>
            </Card>
          </TabPane>
          <TabPane tab="Balance Sheet" key="balance">
            <Card>
              <p>Balance Sheet content will go here</p>
            </Card>
          </TabPane>
          <TabPane tab="Cash Flow" key="cashflow">
            <Card>
              <p>Cash Flow content will go here</p>
            </Card>
          </TabPane>
        </Tabs>
      </Spin>
    </div>
  );
};

export default FinancialReports;
