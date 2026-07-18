import { Helmet } from 'react-helmet-async';
import { Dashboard } from '../components/Dashboard';

export const DashboardView = () => {
  return (
    <main className="page-container" aria-label="Live Analytics Dashboard">
      <Helmet>
        <title>Live Analytics Dashboard | FIFA World Cup 2026</title>
        <meta name="description" content="Real-time stadium operations dashboard featuring AI analytics, crowd density heatmaps, and facility intelligence." />
        <meta name="keywords" content="FIFA Dashboard, Smart Stadium Analytics, Operations, Real-Time Telemetry" />
        {/* Structured Data for SEO */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "FIFA 2026 Live Operations Dashboard",
              "applicationCategory": "Dashboard",
              "description": "Real-time AI-powered stadium operations telemetry."
            }
          `}
        </script>
      </Helmet>

      <header style={{ marginBottom: '2rem' }}>
        <h2>Live Stadium Dashboard</h2>
        <p className="text-muted">Enterprise operational telemetry, real-time metrics, and AI recommendations.</p>
      </header>
      
      <div className="dashboard-full-view">
        <Dashboard />
      </div>
    </main>
  );
};
