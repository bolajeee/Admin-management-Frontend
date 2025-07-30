// src/components/reports/ReportViewer.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useReportStore } from '../../store/useReportStore';
import { 
  Table, Button, Select, Input, Spin, Empty, Tabs, 
  Card, Typography, Tooltip, Radio, DatePicker 
} from 'antd';
import { Line, Bar, Pie, Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { 
  DownloadOutlined, ReloadOutlined, SettingOutlined,
  TableOutlined, BarChartOutlined, LineChartOutlined, 
  PieChartOutlined, ScatterPlotOutlined
} from '@ant-design/icons';
import { axiosInstance } from '../../lib/axios';

// Register all chart.js components
ChartJS.register(...registerables);

const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const ReportViewer = ({ reportId }) => {
  const { reportData, isLoading, fetchReportData } = useReportStore();
  
  // State for visualization options
  const [chartType, setChartType] = useState('bar');
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [chartData, setChartData] = useState(null);
  const [activeTab, setActiveTab] = useState('table');
  
  // Pagination and filter state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [searchText, setSearchText] = useState('');
  const [filterColumn, setFilterColumn] = useState('');
  
  useEffect(() => {
    if (reportId) {
      fetchReportData(reportId, {
        page: pagination.current,
        limit: pagination.pageSize
      });
    }
  }, [reportId, pagination.current, pagination.pageSize, fetchReportData]);
  
  // Set default columns for chart when data changes
  useEffect(() => {
    if (reportData?.report?.columns && reportData.report.columns.length > 0) {
      // Try to intelligently select default axes based on data types
      const numericColumns = [];
      const textColumns = [];
      const dateColumns = [];
      
      // Analyze first data row for data types
      if (reportData.data && reportData.data.length > 0) {
        const firstRow = reportData.data[0];
        
        reportData.report.columns.forEach(col => {
          const value = firstRow[col];
          if (typeof value === 'number') {
            numericColumns.push(col);
          } else if (value instanceof Date || !isNaN(Date.parse(value))) {
            dateColumns.push(col);
          } else {
            textColumns.push(col);
          }
        });
      }
      
      // Set default axes if not already selected
      if (!xAxis && (dateColumns.length > 0 || textColumns.length > 0)) {
        setXAxis(dateColumns[0] || textColumns[0]);
      }
      
      if (!yAxis && numericColumns.length > 0) {
        setYAxis(numericColumns[0]);
      }
    }
  }, [reportData, xAxis, yAxis]);
  
  // Prepare chart data when columns selected
  useEffect(() => {
    if (reportData?.data && xAxis && yAxis && reportData.data.length > 0) {
      prepareChartData();
    }
  }, [reportData, xAxis, yAxis, chartType]);
  
  const prepareChartData = () => {
    if (!reportData?.data || !xAxis || !yAxis) return;
    
    const labels = reportData.data.map(item => item[xAxis]);
    const dataValues = reportData.data.map(item => {
      const val = item[yAxis];
      return typeof val === 'number' ? val : parseFloat(val) || 0;
    });
    
    // Generate colors
    const backgroundColors = labels.map((_, i) => 
      `hsla(${(i * 360 / labels.length) % 360}, 70%, 60%, 0.7)`
    );
    
    const chartDataConfig = {
      labels,
      datasets: [
        {
          label: yAxis,
          data: dataValues,
          backgroundColor: backgroundColors,
          borderColor: chartType === 'line' ? 'rgba(75, 192, 192, 1)' : backgroundColors,
          borderWidth: 1,
          pointBackgroundColor: 'rgba(75, 192, 192, 1)',
          pointRadius: chartType === 'scatter' ? 5 : 0,
        },
      ],
    };
    
    setChartData(chartDataConfig);
  };
  
  const handleRefresh = () => {
    if (reportId) {
      fetchReportData(reportId, {
        page: pagination.current,
        limit: pagination.pageSize,
        ...(searchText && filterColumn ? { [filterColumn]: searchText } : {})
      });
    }
  };
  
  const handleTableChange = (pagination, filters, sorter) => {
    setPagination({
      current: pagination.current,
      pageSize: pagination.pageSize
    });
  };
  
  const handleSearch = () => {
    if (reportId && filterColumn && searchText) {
      fetchReportData(reportId, {
        page: 1,
        limit: pagination.pageSize,
        [filterColumn]: searchText
      });
      setPagination(prev => ({ ...prev, current: 1 })); // Reset to first page
    }
  };
  
  const handleExport = async () => {
    try {
      // Generate CSV from the data
      if (!reportData || !reportData.data || reportData.data.length === 0) {
        return;
      }
      
      const columns = reportData.report.columns;
      const csvHeader = columns.join(',');
      const csvRows = reportData.data.map(row => 
        columns.map(col => {
          const val = row[col] !== undefined ? row[col] : '';
          // Handle values with commas by quoting them
          return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
        }).join(',')
      );
      
      const csvContent = [csvHeader, ...csvRows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${reportData.report.name}-export.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };
  
  if (!reportId) {
    return <Empty description="Please select a report to view" />;
  }
  
  if (isLoading && !reportData) {
    return (
      <div className="flex justify-center p-8">
        <Spin size="large" />
      </div>
    );
  }
  
  // Prepare table columns
  let columns = [];
  if (reportData?.report?.columns) {
    columns = reportData.report.columns.map(col => ({
      title: col,
      dataIndex: col,
      key: col,
      sorter: true,
      render: (text) => text !== undefined ? text.toString() : '-'
    }));
  }
  
  return (
    <div>
      {reportData?.report && (
        <div className="mb-4">
          <Title level={4}>{reportData.report.name}</Title>
          <div className="flex flex-wrap gap-2 text-base-content/60">
            <Text>Type: {reportData.report.type}</Text>
            <Text>•</Text>
            <Text>Rows: {reportData.report.totalRows}</Text>
            <Text>•</Text>
            <Text>Columns: {reportData.report.columns?.length || 0}</Text>
          </div>
        </div>
      )}
      
      <div className="mb-4 flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Select
            placeholder="Filter column"
            value={filterColumn}
            onChange={setFilterColumn}
            style={{ width: 150 }}
          >
            {reportData?.report?.columns?.map(col => (
              <Select.Option key={col} value={col}>{col}</Select.Option>
            ))}
          </Select>
          
          <Input
            placeholder="Search value"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
          />
          
          <Button type="primary" onClick={handleSearch}>Search</Button>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>Reset</Button>
        </div>
        
        <Button 
          type="default" 
          icon={<DownloadOutlined />} 
          onClick={handleExport}
        >
          Export CSV
        </Button>
      </div>
      
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab={<span><TableOutlined /> Table View</span>} key="table">
          <Table
            columns={columns}
            dataSource={reportData?.data?.map((item, i) => ({ ...item, key: i })) || []}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: reportData?.report?.totalRows || 0,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} items`
            }}
            onChange={handleTableChange}
            scroll={{ x: 'max-content' }}
            loading={isLoading}
            size="small"
          />
        </TabPane>
        
        <TabPane tab={<span><BarChartOutlined /> Chart View</span>} key="chart">
          <div className="p-4 bg-base-100 rounded-lg">
            <div className="mb-4 flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Chart Type</label>
                <Radio.Group
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value)}
                  buttonStyle="solid"
                >
                  <Tooltip title="Bar Chart">
                    <Radio.Button value="bar"><BarChartOutlined /></Radio.Button>
                  </Tooltip>
                  <Tooltip title="Line Chart">
                    <Radio.Button value="line"><LineChartOutlined /></Radio.Button>
                  </Tooltip>
                  <Tooltip title="Pie Chart">
                    <Radio.Button value="pie"><PieChartOutlined /></Radio.Button>
                  </Tooltip>
                  <Tooltip title="Scatter Plot">
                    <Radio.Button value="scatter"><ScatterPlotOutlined /></Radio.Button>
                  </Tooltip>
                </Radio.Group>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">X Axis</label>
                <Select
                  placeholder="Select X Axis"
                  value={xAxis}
                  onChange={setXAxis}
                  style={{ width: 150 }}
                >
                  {reportData?.report?.columns?.map(col => (
                    <Select.Option key={col} value={col}>{col}</Select.Option>
                  ))}
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Y Axis</label>
                <Select
                  placeholder="Select Y Axis (Numeric)"
                  value={yAxis}
                  onChange={setYAxis}
                  style={{ width: 150 }}
                >
                  {reportData?.report?.columns?.filter(col => {
                    // Try to identify numeric columns
                    if (!reportData?.data || reportData.data.length === 0) return true;
                    const sample = reportData.data[0][col];
                    return typeof sample === 'number' || !isNaN(parseFloat(sample));
                  }).map(col => (
                    <Select.Option key={col} value={col}>{col}</Select.Option>
                  ))}
                </Select>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Spin size="large" />
              </div>
            ) : (
              <div className="h-[400px] w-full">
                {chartData ? (
                  <>
                    {chartType === 'bar' && (
                      <Bar 
                        data={chartData} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            title: {
                              display: true,
                              text: `${yAxis} by ${xAxis}`
                            }
                          }
                        }}
                      />
                    )}
                    {chartType === 'line' && (
                      <Line 
                        data={chartData} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            title: {
                              display: true,
                              text: `${yAxis} Trend by ${xAxis}`
                            }
                          }
                        }}
                      />
                    )}
                    {chartType === 'pie' && (
                      <Pie 
                        data={chartData} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            title: {
                              display: true,
                              text: `${yAxis} Distribution by ${xAxis}`
                            }
                          }
                        }}
                      />
                    )}
                    {chartType === 'scatter' && (
                      <Scatter 
                        data={chartData} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            title: {
                              display: true,
                              text: `${yAxis} vs ${xAxis} Scatter Plot`
                            }
                          }
                        }}
                      />
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-base-content/60 mb-2">Select X and Y axes to generate chart</p>
                    <SettingOutlined style={{ fontSize: 40, opacity: 0.2 }} />
                  </div>
                )}
              </div>
            )}
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ReportViewer;