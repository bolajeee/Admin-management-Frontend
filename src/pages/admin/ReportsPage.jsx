import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import DateRangeSelector from '../../components/reports/DateRangeSelector';
import ReportSelector from '../../components/reports/ReportSelector';
import ReportMetrics from '../../components/reports/ReportMetrics';
import TeamPerformanceChart from '../../components/reports/TeamPerformanceChart';
import ClientActivityChart from '../../components/reports/ClientActivityChart';
import FinancialReportChart from '../../components/reports/FinancialReportChart';
import { useReportData } from '../../hooks/useReportData';
import { axiosInstance } from '../../lib/axios';
import { Download, RefreshCw } from 'lucide-react';

function ReportsPage() {
  const [dateRange, setDateRange] = useState([null, null]);
  const [activeReport, setActiveReport] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  // Get metrics data
  const {
    data: metricsData,
    loading: metricsLoading,
    error: metricsError
  } = useReportData('metrics', dateRange);

  // Get team performance data
  const {
    data: teamData,
    loading: teamLoading,
    error: teamError
  } = useReportData('team-performance', dateRange);

  // Get client data
  const {
    data: clientData,
    loading: clientLoading,
    error: clientError
  } = useReportData('client-activity', dateRange);

  // Get financial data
  const {
    data: financeRevenueData,
    loading: financeRevenueLoading,
    error: financeRevenueError
  } = useReportData('finance/revenue', dateRange);

  const {
    data: financeExpenseData,
    loading: financeExpenseLoading,
    error: financeExpenseError
  } = useReportData('finance/categories', dateRange);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // This would trigger a refresh of all report data
      // The useEffect in the useReportData hook will fetch new data
      // You could also implement more specific refreshing logic here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await axiosInstance.get(`/reports/export?type=${activeReport}`, {
        responseType: 'blob'
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${activeReport}-report.xlsx`);
      document.body.appendChild(link);
      link.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Failed to export report. Please try again.');
    }
  };

  // Determine what to render based on active report
  const renderReportContent = () => {
    switch (activeReport) {
      case 'team':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Performance Report</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base-content/60 mb-4">
                  This report shows task completion and productivity metrics for your team.
                </p>
                {teamError && <div className="text-error mb-4">{teamError}</div>}
                <TeamPerformanceChart data={teamData?.performance} loading={teamLoading} />
              </CardContent>
            </Card>
          </div>
        );

      case 'clients':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Engagement Report</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base-content/60 mb-4">
                  This report shows client activity and engagement metrics over time.
                </p>
                {clientError && <div className="text-error mb-4">{clientError}</div>}
                <ClientActivityChart data={clientData?.activity} loading={clientLoading} />
              </CardContent>
            </Card>
          </div>
        );

      case 'finance':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base-content/60 mb-4">
                  These reports show revenue trends and expense categories for the selected period.
                </p>
                {(financeRevenueError || financeExpenseError) &&
                  <div className="text-error mb-4">
                    {financeRevenueError || financeExpenseError}
                  </div>
                }
                <div className="grid md:grid-cols-2 gap-6">
                  <FinancialReportChart
                    data={financeRevenueData?.data}
                    subType="revenue"
                    loading={financeRevenueLoading}
                  />
                  <FinancialReportChart
                    data={financeExpenseData?.data}
                    subType="categories"
                    loading={financeExpenseLoading}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'overview':
      default:
        return (
          <div className="space-y-6">
            <ReportMetrics metrics={metricsData} loading={metricsLoading} />

            <div className="grid md:grid-cols-2 gap-6">
              <TeamPerformanceChart data={teamData?.performance} loading={teamLoading} />
              <ClientActivityChart data={clientData?.activity} loading={clientLoading} />
            </div>

            <FinancialReportChart
              data={financeRevenueData?.data}
              subType="revenue"
              loading={financeRevenueLoading}
            />
          </div>
        );
    }
  };

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
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-content hover:bg-primary/90 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <ReportSelector activeReport={activeReport} setActiveReport={setActiveReport} />
            <DateRangeSelector value={dateRange} onChange={setDateRange} />
          </div>
        </CardContent>
      </Card>

      {metricsError && activeReport === 'overview' && (
        <div className="bg-error/10 border border-error/30 text-error p-4 rounded-lg mb-6">
          {metricsError}
        </div>
      )}

      {renderReportContent()}
    </div>
  );
}

export default ReportsPage;
