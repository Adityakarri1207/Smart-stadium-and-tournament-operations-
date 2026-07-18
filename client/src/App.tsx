import { Helmet, HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layout & Pages
import { Layout } from './layouts/Layout';
import { Home } from './pages/Home';
import { Assistant } from './pages/Assistant';
import { DashboardView } from './pages/DashboardView';
import { Maps } from './pages/Maps';
import { Login } from './pages/Login';
import { Analytics } from './pages/Analytics';
import { StadiumProvider } from './contexts/StadiumContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

const queryClient = new QueryClient();

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Helmet>
          <title>Smart Stadium Assistant | FIFA 2026</title>
          <meta name="description" content="AI-powered multilingual stadium assistant for the FIFA World Cup 2026." />
        </Helmet>
        
        <AuthProvider>
          <StadiumProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="assistant" element={
                    <ProtectedRoute>
                      <Assistant />
                    </ProtectedRoute>
                  } />
                  <Route path="dashboard" element={
                    <ProtectedRoute>
                      <DashboardView />
                    </ProtectedRoute>
                  } />
                  <Route path="maps" element={
                    <ProtectedRoute>
                      <Maps />
                    </ProtectedRoute>
                  } />
                  <Route path="analytics" element={
                    <ProtectedRoute>
                      <Analytics />
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={<Home />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </StadiumProvider>
        </AuthProvider>
        
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
