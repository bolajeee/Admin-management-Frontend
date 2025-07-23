import React from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  DatePicker,
  Select,
} from 'antd';
import {
  DownloadOutlined,
  SyncOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import useTeamPerformance from '../../hooks/useTeamPerformance';
import DateRangeSelector from './DateRangeSelector';
import { useThemeStyles } from '../../utils/themeUtils';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import MetricCard from './MetricCard';

const { RangePicker } = DatePicker;
const { Option } = Select;

const TeamPerformance = () => {
  const { data, isLoading, error, filters, setFilters, fetchData } = useTeamPerformance();
  const { getCardStyles } = useThemeStyles();
  const styles = getCardStyles();

  const handleDateChange = (dates) => {
    if (dates && dates[0] && dates[1]) {
      setFilters({
        ...filters,
        startDate: dates[0].format('YYYY-MM-DD'),
        endDate: dates[1].format('YYYY-MM-DD'),
      });
    }
  };

  const handleFilterChange = (value) => {
    setFilters({
      ...filters,
      team: value,
    });
  };

  const refreshData = () => {
    fetchData();
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Card className="bg-gray-100 border-gray-300">
          <div className="text-gray-600 flex flex-col items-center justify-center p-8">
            <SyncOutlined className="text-4xl mb-4 animate-spin" />
            <h2 className="text-xl font-semibold mb-2">Loading Team Performance Data...</h2>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="bg-red-50 border-red-300">
          <div className="text-red-600 flex flex-col items-center justify-center p-8">
            <ExclamationCircleOutlined className="text-4xl mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Team Performance Data</h2>
            <p className="text-center mb-4">{error.message || 'An unexpected error occurred. Please try again.'}</p>
            <Button type="primary" onClick={refreshData}>Try Again</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card title="Team Performance" className="mb-6" style={styles}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <DateRangeSelector
              value={[filters.startDate ? dayjs(filters.startDate) : null, filters.endDate ? dayjs(filters.endDate) : null]}
              onChange={handleDateChange}
            />
          </Col>
          <Col xs={24} md={12}>
            <Select value={filters.team} onChange={handleFilterChange} style={{ width: '100%' }}>
              <Option value="all">All Teams</Option>
              {data?.teams?.map((team) => (
                <Option key={team.id} value={team.id}>{team.name}</Option>
              ))}
            </Select>
          </Col>
        </Row>
        <Row gutter={[16, 16]} className="mt-6">
          <Col xs={24} md={12}>
            <MetricCard title="Team Velocity" value={data?.velocity ?? 'N/A'} />
          </Col>
          <Col xs={24} md={12}>
            <MetricCard title="Team Utilization" value={data?.utilization ?? 'N/A'} />
          </Col>
        </Row>
        <Row gutter={[16, 16]} className="mt-6">
          <Col span={24}>
            <div style={{ width: '100%', maxWidth: '100%' }}>
              <LineChart width={Math.min(window.innerWidth - 100, 800)} height={400} data={data?.performanceTrend || []}>
                <Line type="monotone" dataKey="velocity" stroke="#5B21B6" />
                <Line type="monotone" dataKey="utilization" stroke="#059669" />
                <XAxis dataKey="date" />
                <YAxis />
                <CartesianGrid stroke="#e5e7eb" />
                <Tooltip />
                <Legend />
              </LineChart>
            </div>
          </Col>
        </Row>
        <Row gutter={[16, 16]} className="mt-6">
          <Col span={24}>
            <div style={{ width: '100%', maxWidth: '100%' }}>
              <BarChart width={Math.min(window.innerWidth - 100, 800)} height={400} data={data?.performanceByTeam || []}>
                <Bar dataKey="velocity" fill="#5B21B6" />
                <Bar dataKey="utilization" fill="#059669" />
                <XAxis dataKey="team" />
                <YAxis />
                <CartesianGrid stroke="#e5e7eb" />
                <Tooltip />
                <Legend />
              </BarChart>
            </div>
          </Col>
        </Row>
        <Row gutter={[16, 16]} className="mt-6">
          <Col span={24}>
            <div style={{ width: '100%', maxWidth: '100%' }}>
              <PieChart width={Math.min(window.innerWidth - 100, 800)} height={400}>
                <Pie
                  data={data?.performanceByTeam || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#5B21B6"
                  dataKey="velocity"
                  nameKey="team"
                  label
                />
                <Pie
                  data={data?.performanceByTeam || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  fill="#059669"
                  dataKey="utilization"
                  nameKey="team"
                  label
                />
                <Tooltip />
                <Legend />
              </PieChart>
            </div>
          </Col>
        </Row>
        <Row gutter={[16, 16]} className="mt-6">
          <Col span={24}>
            <Button
              type="primary"
              icon={<SyncOutlined />}
              onClick={refreshData}
              loading={isLoading}
            >
              Refresh Data
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default TeamPerformance;