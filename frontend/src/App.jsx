import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import Layout from './Layout';
import Dashboard from './Dashboard';
import UploadContent from './UploadContent';
import ContentDetail from './ContentDetail';

const queryClient = new QueryClient();

function ProtectedRoute({ children }) {
  const { isAuthenticated, login } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="mb-4 text-slate-600">You are not logged in.</p>
        <button onClick={login} className="btn-primary">
          Log In
        </button>
      </div>
    );
  }
  return children;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="upload" element={<UploadContent />} />
          <Route path="content/:id" element={<ContentDetail />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </QueryClientProvider>
  );
}
