import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './components/LoginPage';
import { ProcessingPage } from './components/ProcessingPage';
import { HistoryPage } from './components/HistoryPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/process" replace /> : <LoginPage />}
      />
      <Route
        path="/process"
        element={
          <ProtectedRoute>
            <ProcessingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
              <div className="max-w-6xl mx-auto">
                <HistoryPage />
              </div>
            </div>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/process" replace />} />
    </Routes>
  );
}

export default App;
