// src/pages/admin/ReportsPage.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import DateRangeSelector from '../../components/reports/DateRangeSelector';
import { useReportStore } from '../../store/useReportStore';
import { axiosInstance } from '../../lib/axios';
import { Button, Spin, Empty } from 'antd';
import { FileOutlined, ArrowLeftOutlined, UploadOutlined, ReloadOutlined } from '@ant-design/icons';
import { RefreshCw, Download, Trash2 } from 'lucide-react';
import ThemeWrapper from '../../components/ThemeWrapper';
import UploadReportForm from '../../components/reports/UploadReportForm';
import ReportViewer from '../../components/reports/ReportViewer';

function ReportsPage() {
  const [dateRange, setDateRange] = useState([null, null]);
  const [refreshing, setRefreshing] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Report store state
  const {
    fetchUploadedReports,
    uploadedReports,
    isLoading,
    selectedReport,
    selectReport,
    clearReportData,
    deleteReport
  } = useReportStore();

  
  useEffect(() => {
    fetchUploadedReports();
  }, [fetchUploadedReports]);

  // Apply date filtering to uploaded reports
  const filteredReports = uploadedReports.filter(report => {
    if (!dateRange[0] || !dateRange[1]) return true;
    
    const reportDate = new Date(report.createdAt);
    // Set hours to 0 for proper date comparison
    const startDate = new Date(dateRange[0]);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(dateRange[1]);
    endDate.setHours(23, 59, 59, 999); // End of the day
    
    return reportDate >= startDate && reportDate <= endDate;
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh uploaded reports
      await fetchUploadedReports();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = async () => {
    try {
      const reportId = selectedReport?.id || selectedReport?._id;
      
      if (!reportId) {
        alert('No report selected for export');
        return;
      }
        
      const response = await axiosInstance.get(`/reports/export?reportId=${reportId}&format=xlsx`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${selectedReport.name}-report.xlsx`);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Failed to export report. Please try again.');
    }
  };

  const { deleteReport } = useReportStore();

  const handleSelectReport = (report) => {
    selectReport(report.id || report._id);
  };

  const handleDeleteReport = (e, reportId) => {
    e.stopPropagation(); // Prevent card click event
    if (window.confirm('Are you sure you want to delete this report?')) {
      deleteReport(reportId);
    }
  };

  const handleBackToReports = () => {
    clearReportData(); // Clear the selected report
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

  return (
    <ThemeWrapper className="p-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          {selectedReport && (
            <button
              onClick={handleBackToReports}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-base-200 hover:bg-base-300 transition-colors"
              title="Back to reports"
            >
              <ArrowLeftOutlined />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}
          <h1 className="text-2xl font-bold">
            {selectedReport ? selectedReport.name : "Reports"}
          </h1>
        </div>
        <div className="flex gap-4 items-center">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-base-200 hover:bg-base-300 transition-colors"
            disabled={refreshing}
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          
          {!selectedReport && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-content hover:bg-primary-focus transition-colors"
              title="Upload Report"
            >
              <UploadOutlined />
              <span className="hidden sm:inline">Upload</span>
            </button>
          )}
          
          {selectedReport && (
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-content hover:bg-secondary-focus transition-colors"
              title="Export Report"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}
        </div>
      </div>

      {!selectedReport && (
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Filter by Date</h3>
                <DateRangeSelector value={dateRange} onChange={setDateRange} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base-content/70">
                  {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedReport ? (
        <Card>
          <CardContent className="p-0">
            <div className="p-4">
              <ReportViewer reportId={selectedReport.id || selectedReport._id} />
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Spin size="large" />
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center p-8">
              <Empty 
                description={
                  uploadedReports.length === 0 
                    ? "No reports uploaded yet"
                    : "No reports match your current date filter"
                } 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
              />
              <Button 
                className="mt-4"
                type="primary"
                onClick={() => setShowUploadModal(true)}
              >
                Upload Report
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredReports.map((report) => (
                <Card 
                  key={report.id || report._id} 
                  className="cursor-pointer transition-all hover:shadow-md hover:translate-y-[-2px]"
                  onClick={() => handleSelectReport(report)}
                >
                  <CardContent className="p-4 relative">
                    <button 
                      className="absolute top-2 right-2 p-1 rounded-full bg-base-100 hover:bg-base-300 transition-colors z-10"
                      onClick={(e) => handleDeleteReport(e, report.id || report._id)}
                    >
                      <Trash2 className="h-4 w-4 text-error" />
                    </button>
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-full bg-base-200 text-primary">
                        <FileOutlined style={{ fontSize: '24px' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate text-lg">{report.name}</div>
                        <div className="text-sm text-base-content/60 flex flex-wrap gap-2">
                          <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                          {report.rowCount && (
                            <>
                              <span>•</span>
                              <span>{report.rowCount} rows</span>
                            </>
                          )}
                          {report.type && (
                            <>
                              <span>•</span>
                              <span className={`capitalize text-${getReportTypeColor(report.type)}-600`}>
                                {report.type}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
      
      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Upload New Report</h2>
              <Button 
                type="text" 
                icon={<span>×</span>} 
                onClick={() => setShowUploadModal(false)}
                className="text-xl"
              />
            </div>
            <UploadReportForm 
              onSuccess={() => {
                setShowUploadModal(false);
                fetchUploadedReports();
              }} 
            />
          </div>
        </div>
      )}
    </ThemeWrapper>
  );
}

export default ReportsPage;