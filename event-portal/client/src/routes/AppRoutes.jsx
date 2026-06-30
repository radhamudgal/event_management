/**
 * AppRoutes.jsx — All client-side routes
 * Public:    /  /event/:id  /login  /register
 * Protected: /my-tickets (any logged-in user)
 *            /organizer   (organizer or admin)
 *            /admin       (admin only)
 */

import { Routes, Route } from 'react-router-dom';
import Layout                  from '../components/Layout.jsx';
import RequireRole             from '../components/RequireRole.jsx';
import HomePage                from '../pages/HomePage.jsx';
import EventDetailsPage        from '../pages/EventDetailsPage.jsx';
import LoginPage               from '../pages/LoginPage.jsx';
import RegisterPage            from '../pages/RegisterPage.jsx';
import MyTicketsPage           from '../pages/MyTicketsPage.jsx';
import OrganizerDashboardPage  from '../pages/OrganizerDashboardPage.jsx';
import AdminDashboardPage      from '../pages/AdminDashboardPage.jsx';

export default function AppRoutes() {
  return (
    <Layout>
      <Routes>
        {/* Public */}
        <Route path="/"          element={<HomePage />} />
        <Route path="/event/:id" element={<EventDetailsPage />} />
        <Route path="/login"     element={<LoginPage />} />
        <Route path="/register"  element={<RegisterPage />} />

        {/* Any logged-in user */}
        <Route path="/my-tickets" element={
          <RequireRole roles={['participant', 'organizer', 'admin']}>
            <MyTicketsPage />
          </RequireRole>
        } />

        {/* Organizer or admin */}
        <Route path="/organizer" element={
          <RequireRole roles={['organizer', 'admin']}>
            <OrganizerDashboardPage />
          </RequireRole>
        } />

        {/* Admin only */}
        <Route path="/admin" element={
          <RequireRole roles={['admin']}>
            <AdminDashboardPage />
          </RequireRole>
        } />
      </Routes>
    </Layout>
  );
}
