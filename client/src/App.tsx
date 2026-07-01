import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { ComingSoon } from './components/ComingSoon';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import MemberForm from './pages/MemberForm';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="members" element={<Members />} />
          <Route path="members/new" element={<MemberForm />} />
          <Route path="members/:id" element={<ComingSoon title="Member profile" />} />
          <Route path="trainers" element={<ComingSoon title="Trainers" />} />
          <Route path="attendance" element={<ComingSoon title="Attendance" />} />
          <Route path="payments" element={<ComingSoon title="Payments" />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
