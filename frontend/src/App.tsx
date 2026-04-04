import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DepartmentsPage from './pages/DepartmentsPage';
import NewPolicyPage from './pages/NewPolicyPage';
import PolicyEditorPage from './pages/PolicyEditorPage';
import CasesPage from './pages/CasesPage';
import CaseDetailPage from './pages/CaseDetailPage';
import MonitorPage from './pages/MonitorPage';
import AnalyticsPage from './pages/AnalyticsPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div>Cargando...</div>;
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/departments" element={<PrivateRoute><DepartmentsPage /></PrivateRoute>} />
      <Route path="/policies/new" element={<PrivateRoute><NewPolicyPage /></PrivateRoute>} />
      <Route path="/policies/:id/editor" element={<PrivateRoute><PolicyEditorPage /></PrivateRoute>} />
      <Route path="/policies/:policyId/cases" element={<PrivateRoute><CasesPage /></PrivateRoute>} />
      <Route path="/cases/:id" element={<PrivateRoute><CaseDetailPage /></PrivateRoute>} />
      <Route path="/monitor" element={<PrivateRoute><MonitorPage /></PrivateRoute>} />
      <Route path="/analytics" element={<PrivateRoute><AnalyticsPage /></PrivateRoute>} />
    </Routes>
  );
}

export default App;
