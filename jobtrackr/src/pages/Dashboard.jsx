import { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardContainer = styled.div`
  padding: 2rem;
`;

const WelcomeSection = styled.div`
  background: var(--white);
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const WelcomeTitle = styled.h1`
  color: var(--primary-blue);
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: var(--white);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  }
`;

const StatTitle = styled.div`
  color: var(--text-light);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-blue);
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const ActionButton = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: var(--primary-teal);
  color: var(--white);
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }
`;

const RecentActivity = styled.div`
  background: var(--white);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const ActivityList = styled.ul`
  list-style: none;
`;

const ActivityItem = styled.li`
  padding: 1rem 0;
  border-bottom: 1px solid var(--bg-light);
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }
`;

function Dashboard() {
  const { user } = useAuth();
  const [stats] = useState({
    activeUrls: 5,
    totalJobs: 156,
    newToday: 12,
    applications: 8
  });

  const [activities] = useState([
    { text: 'New job found at Google', time: '2 hours ago' },
    { text: 'URL check completed', time: '4 hours ago' },
    { text: 'Added new job source', time: '1 day ago' }
  ]);

  return (
    <DashboardContainer>
      <WelcomeSection>
        <WelcomeTitle>Welcome back, {user?.name}</WelcomeTitle>
        <p>Track your job search progress and discover new opportunities.</p>
      </WelcomeSection>

      <StatsGrid>
        <StatCard>
          <StatTitle>Active Sources</StatTitle>
          <StatValue>{stats.activeUrls}</StatValue>
        </StatCard>
        <StatCard>
          <StatTitle>Total Jobs Found</StatTitle>
          <StatValue>{stats.totalJobs}</StatValue>
        </StatCard>
        <StatCard>
          <StatTitle>New Today</StatTitle>
          <StatValue>{stats.newToday}</StatValue>
        </StatCard>
        <StatCard>
          <StatTitle>Applications</StatTitle>
          <StatValue>{stats.applications}</StatValue>
        </StatCard>
      </StatsGrid>

      <QuickActions>
        <ActionButton to="/urls">Add Job Source</ActionButton>
        <ActionButton to="/jobs">Browse Jobs</ActionButton>
      </QuickActions>

      <RecentActivity>
        <h2>Recent Activity</h2>
        <ActivityList>
          {activities.map((activity, index) => (
            <ActivityItem key={index}>
              <span>{activity.text}</span>
              <span>{activity.time}</span>
            </ActivityItem>
          ))}
        </ActivityList>
      </RecentActivity>
    </DashboardContainer>
  );
}

export default Dashboard; 