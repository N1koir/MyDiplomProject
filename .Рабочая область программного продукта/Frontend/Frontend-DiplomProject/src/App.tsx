import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/auth/ProfilePage';
import CourseListPage from './pages/courses/CourseListPage';
import CourseViewPage from './pages/courses/CourseViewPage';
import CourseEditorPage from './pages/courses/CourseEditorPage';
import CourseFormPage from './pages/courses/CourseFormPage.tsx';
import CourseHistoryPage from './pages/courses/CourseHistoryPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';

function App() {
  return (
      <Router>
        <AuthProvider>
          <ToastProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/courses" element={<CourseListPage />} />
                <Route path="/courses/:id" element={<CourseViewPage />} />

                {/* Отдельные маршруты */}
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
                <Route path="/courses/editor" element={
                  <ProtectedRoute>
                    <CourseEditorPage />
                  </ProtectedRoute>
                } />
                <Route path="/courses/editor/:id" element={
                  <ProtectedRoute>
                    <CourseFormPage />
                  </ProtectedRoute>
                } />
                <Route path="/courses/history" element={
                  <ProtectedRoute>
                    <CourseHistoryPage />
                  </ProtectedRoute>
                } />
              </Routes>
            </Layout>
          </ToastProvider>
        </AuthProvider>
      </Router>
  );
}

export default App;