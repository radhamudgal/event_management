// AppRoutes — defines all client-side routes
// Public: home, event details, login, register
// Protected by role:
//   participant → /my-tickets
//   organizer/admin → /organizer
//   admin → /admin

import { Routes, Route } from 'react-router-dom';

import Layout from '../components/Layout.jsx';
import RequireRole from '../components/RequireRole.jsx';

import HomePage from '../pages/HomePage.jsx';
import EventDetailsPage from '../pages/EventDetailsPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import MyTicketsPage from '../pages/MyTicketsPage.jsx';
import OrganizerDashboardPage from '../pages/OrganizerDashboardPage.jsx';
import AdminDashboardPage from '../pages/AdminDashboardPage.jsx';

export default function AppRoutes() {
  return (
    <Layout>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/event/:id" element={<EventDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Participant only */}
        <Route
          path="/my-tickets"
          element={
            <RequireRole roles={['participant']}>
              <MyTicketsPage />
            </RequireRole>
          }
        />

        {/* Organizer or admin */}
        <Route
          path="/organizer"
          element={
            <RequireRole roles={['organizer', 'admin']}>
              <OrganizerDashboardPage />
            </RequireRole>
          }
        />

        {/* Admin only */}
        <Route
          path="/admin"
          element={
            <RequireRole roles={['admin']}>
              <AdminDashboardPage />
            </RequireRole>
          }
        />
      </Routes>
    </Layout>
  );
}
