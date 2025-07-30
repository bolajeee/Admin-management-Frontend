// src/pages/admin/ReportsPage.jsx
// Updated imports
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import DateRangeSelector from '../../components/reports/DateRangeSelector';
import ReportCategorySelector from '../../components/reports/ReportCategorySelector'; // Updated component name
import { useReportStore } from '../../store/useReportStore';
import { axiosInstance } from '../../lib/axios';
import { Tabs, List, Button, Spin, Empty, Tag, Modal } from 'antd';
import { FileOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { RefreshCw, Download } from 'lucide-react';
import UploadReportForm from '../../components/reports/UploadReportForm';
import ReportViewer from '../../components/reports/ReportViewer';

const { TabPane } = Tabs;

function ReportsPage() {
  // State for filtering and UI
  const [dateRange, setDateRange] = useState([null, null]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Report store state and actions
  const {
    fetchUploadedReports,
    uploadedReports,
    isLoading,
    selectedReport,
    selectReport,
    clearReportData
  } = useReportStore();

  // Load reports when component mounts
  useEffect(() => {
    fetchUploadedReports();
  }, [fetchUploadedReports]);

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    fetchUploadedReports();
  };

  const handleSelectReport = (report) => {
    selectReport(report.id || report._id);
  };

  const getReportTypeColor = (type) => {
    const typeColors = {
      sales: 'green',
      performance: 'blue',
      financial: 'purple',
      client: 'orange',
      custom: 'default',
    };
    return typeColors[type] || 'default';
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchUploadedReports();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
    } finally {
      setRefreshing(false);
    }
  };

  // Filter reports by category
  const filteredReports = activeCategory === 'all'
    ? uploadedReports
    : uploadedReports.filter(report => report.type === activeCategory);

  // Filter reports by date if dateRange is set
  const dateFilteredReports = dateRange[0] && dateRange[1]
    ? filteredReports.filter(report => {
        const reportDate = new Date(report.createdAt);
        return reportDate >= dateRange[0] && reportDate <= dateRange[1];
      })
    : filteredReports;

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>

        <div className="flex gap-4 items-center">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-base-200 hover:bg-base-300 transition-colors"
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-content hover:bg-primary/90 transition-colors"
          >
            <PlusOutlined className="h-4 w-4" />
            Upload Report
          </button>
        </div>
      </div>

      {/* Filters and categories */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Report Categories</h3>
                <ReportCategorySelector 
                  reports={uploadedReports}
                  activeCategory={activeCategory} 
                  setActiveCategory={setActiveCategory} 
                />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Date Range</h3>
                <DateRangeSelector value={dateRange} onChange={setDateRange} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main content area - Reports List and Viewer */}
      <div className="flex gap-4 flex-col lg:flex-row">
        {/* Reports List */}
        <div className="w-full lg:w-1/3">
          <Card className="h-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  {activeCategory === 'all' 
                    ? 'All Reports' 
                    : `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Reports`}
                </CardTitle>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchUploadedReports}
                  loading={isLoading}
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading && !uploadedReports.length ? (
                <div className="flex justify-center p-8">
                  <Spin />
                </div>
              ) : dateFilteredReports.length === 0 ? (
                <Empty
                  description={
                    filteredReports.length === 0 
                      ? `No ${activeCategory === 'all' ? '' : activeCategory} reports available.` 
                      : "No reports match your date filter."
                  }
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <List
                  dataSource={dateFilteredReports}
                  renderItem={(report) => (
                    <List.Item
                      key={report.id || report._id}
                      className={`cursor-pointer hover:bg-base-200 p-2 rounded ${
                        selectedReport?.id === (report.id || report._id) ? 'bg-primary/10' : ''
                      }`}
                      onClick={() => handleSelectReport(report)}
                    >
                      <div className="flex items-center w-full">
                        <FileOutlined className="mr-2 text-primary" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">
                            {report.name}
                          </div>
                          <div className="text-xs text-base-content/60">
                            {new Date(report.createdAt).toLocaleDateString()}
                            {' • '}
                            {report.rowCount || '?'} rows
                          </div>
                        </div>
                        <Tag color={getReportTypeColor(report.type)}>
                          {report.type}
                        </Tag>
                      </div>
                    </List.Item>
                  )}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Report Viewer */}
        <div className="w-full lg:w-2/3">
          <Card>
            <CardContent>
              {selectedReport ? (
                <ReportViewer reportId={selectedReport.id || selectedReport._id} />
              ) : (
                <div className="flex flex-col items-center justify-center p-8">
                  <Empty
                    description="Select a report from the list to view"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                  <Button
                    type="primary"
                    onClick={() => setShowUploadModal(true)}
                    className="mt-4"
                  >
                    Upload New Report
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upload Report Modal */}
      <Modal
        title="Upload Report"
        open={showUploadModal}
        onCancel={() => setShowUploadModal(false)}
        footer={null}
        width={500}
      >
        <UploadReportForm onSuccess={handleUploadSuccess} />
      </Modal>
    </div>
  );
}

export default ReportsPage;