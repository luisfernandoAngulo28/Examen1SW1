import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DepartmentsPage from './pages/DepartmentsPage';
import NewPolicyPage from './pages/NewPolicyPage';
import PolicyEditorPage from './pages/PolicyEditorPage';
import CasesPage from './pages/CasesPage';
import CaseDetailPage from './pages/CaseDetailPage';
import MonitorPage from './pages/MonitorPage';
import AnalyticsPage from './pages/AnalyticsPage';

function PrivateRoute({ children, withLayout = true }: { children: React.ReactNode; withLayout?: boolean }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Cargando...</div>;
  if (!user) return <Navigate to="/login" />;
  return withLayout ? <Layout>{children}</Layout> : <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/departments" element={<PrivateRoute><DepartmentsPage /></PrivateRoute>} />
      <Route path="/policies/new" element={<PrivateRoute><NewPolicyPage /></PrivateRoute>} />
      <Route path="/policies/:id/editor" element={<PrivateRoute withLayout={false}><PolicyEditorPage /></PrivateRoute>} />
      <Route path="/policies/:policyId/cases" element={<PrivateRoute><CasesPage /></PrivateRoute>} />
      <Route path="/cases/:id" element={<PrivateRoute><CaseDetailPage /></PrivateRoute>} />
      <Route path="/monitor" element={<PrivateRoute><MonitorPage /></PrivateRoute>} />
      <Route path="/analytics" element={<PrivateRoute><AnalyticsPage /></PrivateRoute>} />
    </Routes>
  );
}

export default App;
