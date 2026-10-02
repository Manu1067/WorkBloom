import { useState, useEffect } from 'react';
import { analyticsApi } from '../api/analyticsApi';
import { useToast } from '../components/ToastContext';
import { PageHero } from '../components/PageHero';
import { BarChart, ChartCard, DonutChart, toSeries } from '../components/analytics/Charts';

export function AnalyticsView({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const addToast = useToast();

  const loadOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await analyticsApi.getOverview();
      setData(res);
    } catch (err) {
      setError(err.message || 'Unable to fetch analytics overview from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  return (
    <div className="content page-shell">
      <PageHero page="analytics" />
      {/* Hero */}
      <div 
        className="module-hero" 
        style={{ 
          marginBottom: 28,
          background: 'linear-gradient(135deg, hsl(var(--paper-warm)), hsl(var(--paper))), radial-gradient(circle at 90% 15%, hsl(var(--sage) / 0.15), transparent 45%)'
        }}
      >
        <p className="eyebrow" style={{ color: 'hsl(var(--sage))' }}>Insights & Rhythms</p>
        <h1>Wellbeing & Workplace Analytics</h1>
        <p className="subtitle" style={{ maxWidth: 620 }}>
          Real-time aggregate health metrics, engagement indicators, and organizational momentum calculated directly from live Spring Boot backend data.
        </p>
        <div style={{ marginTop: 16 }}>
          <button className="button button-quiet" onClick={loadOverview} disabled={loading}>
            🔄 Refresh Analytics
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <div className="skeleton" style={{ height: 120, borderRadius: 14 }} />
          <div className="skeleton" style={{ height: 120, borderRadius: 14 }} />
          <div className="skeleton" style={{ height: 120, borderRadius: 14 }} />
          <div className="skeleton" style={{ height: 120, borderRadius: 14 }} />
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="card card-pad" style={{ marginBottom: 24, borderColor: 'hsl(var(--coral-soft))', backgroundColor: 'hsl(var(--coral-soft) / 0.15)' }}>
          <h3 style={{ margin: '0 0 8px', color: 'hsl(var(--coral))' }}>Analytics Unavailable</h3>
          <p style={{ margin: '0 0 16px', fontSize: 14 }}>{error}</p>
          <button className="button button-primary" onClick={loadOverview}>Retry Loading</button>
        </div>
      )}

      {/* Analytics Dashboard Content */}
      {!loading && !error && data && (
        <div style={{ display: 'grid', gap: 24 }}>
          {/* Top KPI Cards Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
            <div className="card card-pad" style={{ background: 'hsl(var(--paper))' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'hsl(var(--muted))', textTransform: 'uppercase' }}>TOTAL EMPLOYEES</span>
              <strong style={{ display: 'block', fontSize: 28, color: 'hsl(var(--ink))', marginTop: 4 }}>
                {data.totalEmployees ?? 0}
              </strong>
            </div>

            <div className="card card-pad" style={{ background: 'hsl(var(--paper))' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'hsl(var(--sage))', textTransform: 'uppercase' }}>WELLNESS LOGS</span>
              <strong style={{ display: 'block', fontSize: 28, color: 'hsl(var(--sage))', marginTop: 4 }}>
                {data.totalWellnessLogs ?? 0}
              </strong>
              <span style={{ fontSize: 11, color: 'hsl(var(--muted))' }}>{data.totalMoodLogs ?? 0} mood check-ins</span>
            </div>

            <div className="card card-pad" style={{ background: 'hsl(var(--paper))' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'hsl(var(--coral))', textTransform: 'uppercase' }}>APPRECIATION CARDS</span>
              <strong style={{ display: 'block', fontSize: 28, color: 'hsl(var(--coral))', marginTop: 4 }}>
                {data.totalRecognitions ?? 0}
              </strong>
            </div>

            <div className="card card-pad" style={{ background: 'hsl(var(--paper))' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'hsl(var(--ink))', textTransform: 'uppercase' }}>COMMUNITY POSTS</span>
              <strong style={{ display: 'block', fontSize: 28, color: 'hsl(var(--ink))', marginTop: 4 }}>
                {data.totalCommunityPosts ?? 0}
              </strong>
            </div>

            <div className="card card-pad" style={{ background: 'hsl(var(--paper))' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'hsl(var(--sage))', textTransform: 'uppercase' }}>VOLUNTEER SIGNUPS</span>
              <strong style={{ display: 'block', fontSize: 28, color: 'hsl(var(--sage))', marginTop: 4 }}>
                {data.totalVolunteerRegistrations ?? 0}
              </strong>
            </div>
          </div>

          {/* Visual insights - every figure is a real aggregate from GET /api/analytics/overview */}
          <div>
            <h2 style={{ margin: '0 0 4px', fontSize: 20 }}>Visual insights</h2>
            <p style={{ margin: '0 0 14px', fontSize: 12, color: 'hsl(var(--muted))' }}>
              All-time totals across the organisation{data.generatedAt ? ` · updated ${new Date(data.generatedAt).toLocaleString()}` : ''}.
              The backend currently reports totals only, so no over-time trend is shown.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 20 }}>
              <ChartCard title="Mood check-in distribution" caption="Share of all recorded mood check-ins by mood">
                <DonutChart data={toSeries(data.moodDistribution)} centerLabel="check-ins" ariaLabel="Mood check-in distribution donut chart" />
              </ChartCard>

              <ChartCard title="Engagement across WorkBloom" caption="All-time totals per activity (counts, not rates)">
                <BarChart
                  ariaLabel="Total activity counts by module"
                  data={[
                    { label: 'Wellness logs', value: Number(data.totalWellnessLogs) },
                    { label: 'Mood check-ins', value: Number(data.totalMoodLogs) },
                    { label: 'Community posts', value: Number(data.totalCommunityPosts) },
                    { label: 'Appreciation cards', value: Number(data.totalRecognitions) },
                    { label: 'Event registrations', value: Number(data.totalEventRegistrations) },
                    { label: 'Course enrollments', value: Number(data.totalCourseEnrollments) },
                    { label: 'Volunteer sign-ups', value: Number(data.totalVolunteerRegistrations) },
                  ]
                    .filter((r) => Number.isFinite(r.value))
                    .sort((a, b) => b.value - a.value)}
                />
              </ChartCard>

              <ChartCard title="Events by status" caption="Number of events in each lifecycle status">
                <BarChart data={toSeries(data.eventsByStatus)} unit="events" colorOffset={2} ariaLabel="Events by status" />
              </ChartCard>

              <ChartCard title="Event registrations by status" caption="Registrations grouped by their current status">
                <BarChart data={toSeries(data.eventRegistrationsByStatus)} unit="registrations" colorOffset={4} ariaLabel="Event registrations by status" />
              </ChartCard>

              <ChartCard title="Club memberships by status" caption="Memberships grouped by their current status">
                <BarChart data={toSeries(data.clubMembershipsByStatus)} unit="memberships" colorOffset={1} ariaLabel="Club memberships by status" />
              </ChartCard>

              <ChartCard title="Workforce by status" caption="Headcount by employment status (counts only)">
                <DonutChart data={toSeries(data.employeesByStatus)} centerLabel="employees" ariaLabel="Employees by status donut chart" />
              </ChartCard>
            </div>
          </div>

          {/* Secondary Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {/* Events & Gatherings */}
            <div className="card card-pad" style={{ background: 'hsl(var(--paper))' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: 16 }}>Events & Gatherings</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: 'hsl(var(--muted))' }}>Total Events Scheduled:</span>
                <strong style={{ fontSize: 14 }}>{data.totalEvents ?? 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: 'hsl(var(--muted))' }}>Event Registrations:</span>
                <strong style={{ fontSize: 14 }}>{data.totalEventRegistrations ?? 0}</strong>
              </div>
              {data.eventsByStatus && Object.keys(data.eventsByStatus).length > 0 && (
                <div style={{ marginTop: 12, borderTop: '1px solid hsl(var(--line) / 0.5)', paddingTop: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'hsl(var(--muted))', display: 'block', marginBottom: 6 }}>EVENTS BY STATUS</span>
                  {Object.entries(data.eventsByStatus).map(([status, count]) => (
                    <div key={status} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span className="badge-pill badge-calm" style={{ fontSize: 10 }}>{status}</span>
                      <strong>{count}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Learning & Growth */}
            <div className="card card-pad" style={{ background: 'hsl(var(--paper))' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: 16 }}>Learning & Micro-Courses</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: 'hsl(var(--muted))' }}>Course Enrollments:</span>
                <strong style={{ fontSize: 14, color: 'hsl(var(--sage))' }}>{data.totalCourseEnrollments ?? 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: 'hsl(var(--muted))' }}>Active Interest Clubs:</span>
                <strong style={{ fontSize: 14 }}>{data.totalClubs ?? 0}</strong>
              </div>
              {data.clubMembershipsByStatus && Object.keys(data.clubMembershipsByStatus).length > 0 && (
                <div style={{ marginTop: 12, borderTop: '1px solid hsl(var(--line) / 0.5)', paddingTop: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'hsl(var(--muted))', display: 'block', marginBottom: 6 }}>CLUB MEMBERSHIPS</span>
                  {Object.entries(data.clubMembershipsByStatus).map(([status, count]) => (
                    <div key={status} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span className="badge-pill badge-kind" style={{ fontSize: 10 }}>{status}</span>
                      <strong>{count}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mood Distribution Breakdown */}
            {data.moodDistribution && Object.keys(data.moodDistribution).length > 0 && (
              <div className="card card-pad" style={{ background: 'hsl(var(--paper))' }}>
                <h3 style={{ margin: '0 0 14px', fontSize: 16 }}>Mood Check-in Distribution</h3>
                <div style={{ display: 'grid', gap: 8 }}>
                  {Object.entries(data.moodDistribution).map(([mood, count]) => (
                    <div key={mood} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: 'hsl(var(--paper-warm))', borderRadius: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{mood}</span>
                      <strong style={{ fontSize: 13, color: 'hsl(var(--sage))' }}>{count}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalyticsView;
