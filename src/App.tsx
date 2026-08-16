import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminLogin } from './pages/admin/AdminLogin';
import { TestEditor } from './pages/admin/TestEditor';
import { TestPreview } from './pages/admin/TestPreview';
import { TestMonitor } from './pages/admin/TestMonitor';
import { TestResults } from './pages/admin/TestResults';
import { TestJoin } from './pages/taker/TestJoin';
import { TestInstructions } from './pages/taker/TestInstructions';
import { TestSession } from './pages/taker/TestSession';
import { TestSubmitted } from './pages/taker/TestSubmitted';
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { ErrorBoundary } from './components/admin/ErrorBoundary';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Admin Login */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Administrator Routes */}
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tests/new"
            element={
              <ProtectedRoute>
                <TestEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tests/:testId/edit"
            element={
              <ProtectedRoute>
                <TestEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tests/:testId/preview"
            element={
              <ProtectedRoute>
                <TestPreview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tests/:testId/monitor"
            element={
              <ProtectedRoute>
                <TestMonitor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tests/:testId/results"
            element={
              <ProtectedRoute>
                <TestResults />
              </ProtectedRoute>
            }
          />

          {/* Candidate / Test Taker Routes */}
          <Route path="/test" element={<Navigate to="/test/join" replace />} />
          <Route path="/test/join" element={<TestJoin />} />
          <Route path="/test/instructions/:attemptId" element={<TestInstructions />} />
          <Route path="/test/session/:attemptId" element={<TestSession />} />
          <Route path="/test/submitted/:attemptId" element={<TestSubmitted />} />
          <Route path="/test/results/:attemptId" element={<TestSubmitted />} />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
