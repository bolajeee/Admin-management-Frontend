import React from 'react';
import { Card, Row, Col, Progress, Divider } from 'antd';
import { ProjectOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useThemeStyles } from '../../utils/themeUtils';
import MetricCard from './MetricCard';

const ProjectMetrics = ({ data }) => {
  const { getCardStyles } = useThemeStyles();
  const styles = getCardStyles();
  
  if (!data) return null;
  
  const { projectPerformance } = data;
  
  return (
    <div className="space-y-6">
      {/* Project Metrics Overview */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="Total Projects"
            value={projectPerformance.totalProjects}
            icon={<ProjectOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="Completed"
            value={projectPerformance.completed}
            icon={<CheckCircleOutlined className="text-success" />}
            trend={12.5}
            trendText="from last period"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="In Progress"
            value={projectPerformance.inProgress}
            icon={<ClockCircleOutlined className="text-warning" />}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="Delayed"
            value={projectPerformance.delayed}
            icon={<ExclamationCircleOutlined className="text-error" />}
            trend={-5.2}
            trendText="from last period"
          />
        </Col>
      </Row>

      {/* Project Status Distribution */}
      <Card className={styles.className}>
        <div className={styles.headerClassName}>
          <h3 className="text-lg font-semibold">Project Status Distribution</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium mb-4">By Status</h4>
            <div className="space-y-4">
              {projectPerformance.projectsByStatus.map((item) => (
                <div key={item.status}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">{item.status}</span>
                    <span className="text-sm font-medium">
                      {item.count} ({(item.count / projectPerformance.totalProjects * 100).toFixed(0)}%)
                    </span>
                  </div>
                  <Progress 
                    percent={(item.count / projectPerformance.totalProjects * 100).toFixed(0)} 
                    showInfo={false}
                    strokeColor={
                      item.status === 'Completed' ? '#52c41a' :
                      item.status === 'In Progress' ? '#faad14' : '#ff4d4f'
                    }
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-md font-medium mb-4">Timeline & Budget</h4>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Timeline Adherence</span>
                  <span className="text-sm font-medium">{projectPerformance.timelineAdherence}%</span>
                </div>
                <Progress 
                  percent={projectPerformance.timelineAdherence} 
                  status={projectPerformance.timelineAdherence > 80 ? 'success' : 
                         projectPerformance.timelineAdherence > 50 ? 'active' : 'exception'}
                  strokeWidth={8}
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Budget Variance</span>
                  <span className={`text-sm font-medium ${
                    projectPerformance.budgetVariance >= 0 ? 'text-success' : 'text-error'
                  }`}>
                    {projectPerformance.budgetVariance >= 0 ? '+' : ''}{projectPerformance.budgetVariance}%
                  </span>
                </div>
                <Progress 
                  percent={Math.abs(projectPerformance.budgetVariance)} 
                  status={projectPerformance.budgetVariance >= 0 ? 'success' : 'exception'}
                  strokeWidth={8}
                  strokeColor={projectPerformance.budgetVariance >= 0 ? '#52c41a' : '#ff4d4f'}
                  format={() => ''}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {projectPerformance.budgetVariance >= 0 ? 'Under' : 'Over'} budget
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

const ProjectPerformance = ({ data, isLoading }) => {
  const { getCardStyles } = useThemeStyles();
  const styles = getCardStyles();

  return (
    <Card className={styles.className}>
      <div className={styles.headerClassName}>
        <h2 className="text-xl font-semibold">Project Performance Overview</h2>
      </div>
      <div className={styles.bodyClassName}>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <ProjectMetrics data={data} />
        )}
      </div>
    </Card>
  );
};

export default ProjectPerformance;
