// src/components/reports/ReportViewer.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useReportStore } from '../../store/useReportStore';
import { Table, Button, Select, Input, Spin, Empty, Tabs } from 'antd';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { ReloadOutlined, TableOutlined, BarChartOutlined, LineChartOutlined, PieChartOutlined } from '@ant-design/icons';

// Register all chart.js components
ChartJS.register(...registerables);

const { TabPane } = Tabs;

const ReportViewer = ({ reportId }) => {
  const { reportData, isLoading, fetchReportData } = useReportStore();
  
  // State for visualization options
  const [chartType, setChartType] = useState('bar');
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
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
    if (reportData?.report?.columns && reportData.report.columns.length > 0 && reportData.data?.length > 0) {
      // Try to intelligently select default axes
      const columns = reportData.report.columns;
      const firstRow = reportData.data[0];
      
      // Look for a date column for X axis
      const dateColumn = columns.find(col => 
        firstRow[col] && (
          firstRow[col] instanceof Date || 
          !isNaN(Date.parse(firstRow[col])) || 
          /date|time/i.test(col)
        )
      );
      
      // Look for a numeric column for Y axis
      const numericColumn = columns.find(col => 
        typeof firstRow[col] === 'number' || 
        (!isNaN(parseFloat(firstRow[col])) && /value|amount|total|count|sum|price|cost/i.test(col))
      );
      
      if (dateColumn && !xAxis) {
        setXAxis(dateColumn);
      } else if (!xAxis && columns.length > 0) {
        // Fallback to first column
        setXAxis(columns[0]);
      }
      
      if (numericColumn && !yAxis) {
        setYAxis(numericColumn);
      } else if (!yAxis) {
        // Try to find any numeric column
        const anyNumeric = columns.find(col => 
          typeof firstRow[col] === 'number' || !isNaN(parseFloat(firstRow[col]))
        );
        
        if (anyNumeric) {
          setYAxis(anyNumeric);
        }
      }
    }
  }, [reportData, xAxis, yAxis]);
  
  const chartData = useMemo(() => {
    if (!reportData?.data || !xAxis || !yAxis || reportData.data.length === 0) return null;
    
    const labels = reportData.data.map(item => item[xAxis]);
    const dataValues = reportData.data.map(item => {
      const val = item[yAxis];
      return typeof val === 'number' ? val : parseFloat(val) || 0;
    });
    
    // Generate colors
    const backgroundColors = labels.map((_, i) => 
      `hsla(${(i * 360 / labels.length) % 360}, 70%, 60%, 0.7)`
    );
    
    return {
      labels,
      datasets: [
        {
          label: yAxis,
          data: dataValues,
          backgroundColor: backgroundColors,
          borderColor: chartType === 'line' ? 'rgba(75, 192, 192, 1)' : backgroundColors,
          borderWidth: 1,
        },
      ],
    };
  }, [reportData, xAxis, yAxis, chartType]);
  
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
      render: (text) => text !== undefined ? String(text) : '-'
    }));
  }
  
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Select
            placeholder="Filter column"
            value={filterColumn}
            onChange={setFilterColumn}
            style={{ width: 150 }}
            options={reportData?.report?.columns?.map(col => ({ value: col, label: col }))}
          />
          
          <Input
            placeholder="Search value"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
          />
          
          <Button type="primary" onClick={handleSearch}>Search</Button>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>Reset</Button>
        </div>
      </div>
      
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab={<span><TableOutlined /> Table View</span>} key="table">
          {!reportData?.data || reportData.data.length === 0 ? (
            <Empty description="No data available" />
          ) : (
            <Table
              columns={columns}
              dataSource={reportData.data.map((item, i) => ({ ...item, key: i }))}
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
          )}
        </TabPane>
        
        <TabPane tab={<span><BarChartOutlined /> Chart View</span>} key="chart">
          <div className="p-4 bg-base-100 rounded-lg">
            <div className="mb-4 flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Chart Type</label>
                <div className="flex gap-2">
                  <Button
                    type={chartType === 'bar' ? 'primary' : 'default'}
                    icon={<BarChartOutlined />}
                    onClick={() => setChartType('bar')}
                  >
                    Bar
                  </Button>
                  <Button
                    type={chartType === 'line' ? 'primary' : 'default'}
                    icon={<LineChartOutlined />}
                    onClick={() => setChartType('line')}
                  >
                    Line
                  </Button>
                  <Button
                    type={chartType === 'pie' ? 'primary' : 'default'}
                    icon={<PieChartOutlined />}
                    onClick={() => setChartType('pie')}
                  >
                    Pie
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">X Axis</label>
                <Select
                  placeholder="Select X Axis"
                  value={xAxis}
                  onChange={setXAxis}
                  style={{ width: 150 }}
                  options={reportData?.report?.columns?.map(col => ({ value: col, label: col }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Y Axis</label>
                <Select
                  placeholder="Select Y Axis (Numeric)"
                  value={yAxis}
                  onChange={setYAxis}
                  style={{ width: 150 }}
                  options={reportData?.report?.columns?.filter(col => {
                    if (!reportData?.data || reportData.data.length === 0) return true;
                    const sample = reportData.data[0][col];
                    return typeof sample === 'number' || !isNaN(parseFloat(sample));
                  }).map(col => ({ value: col, label: col }))}
                />
              </div>
            </div>
            
            <div className="h-[400px] w-full overflow-hidden">
              {!chartData ? (
                <Empty description="Select X and Y axes to generate chart" />
              ) : chartType === 'bar' ? (
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
              ) : chartType === 'line' ? (
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
              ) : (
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
            </div>
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ReportViewer;