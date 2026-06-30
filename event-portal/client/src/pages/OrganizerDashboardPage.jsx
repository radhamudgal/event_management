/**
 * OrganizerDashboardPage.jsx — Dashboard for organizers to manage their events
 * Tab 1 "My Events":  stats cards, event table with Edit/Delete, "Create Event" modal.
 * Tab 2 "Registrations": filter by event, search by name/email, attendee table, Export CSV.
 * Only shows events created by the currently logged-in organizer (filtered by createdBy._id).
 */

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Download, Calendar, Users, FileSpreadsheet, Search, X, Briefcase, CheckCircle, XCircle } from 'lucide-react';

import { listEvents, createEvent, updateEvent, deleteEvent } from '../api/events.js';
import { organizerRegistrations } from '../api/registrations.js';
import { useAuth } from '../context/AuthContext.jsx';

// Renders the organizer dashboard with events and registrations tabs
export default function OrganizerDashboardPage() {
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('events'); // 'events' | 'registrations'

  // Registrations tab filters
  const [selectedEventId, setSelectedEventId] = useState('');
  const [regSearch, setRegSearch] = useState('');

  // Event modal state
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState('');
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', location: '', organizer: '',
    startDate: '', endDate: '', capacity: 100, status: 'active'
  });

  // Fetches all events and filters to only those created by the logged-in organizer
  async function reloadEvents() {
    const data = await listEvents({});
    setEvents(data.filter((ev) => ev.createdBy?._id?.toString() === user?.id));
  }

  // Fetches registrations for this organizer's events, optionally filtered by eventId
  async function reloadRegs(eventId = '') {
    const data = await organizerRegistrations(eventId || undefined);
    setRegs(data);
  }

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        await reloadEvents();
        await reloadRegs();
      } catch (e) {
        if (active) setError(e.message || 'Failed to load data');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  // Clears the form and opens the create-event modal
  function openCreate() {
    setEditId('');
    setForm({ title: '', description: '', location: '', organizer: '', startDate: '', endDate: '', capacity: 100, status: 'active' });
    setFormError('');
    setShowModal(true);
  }

  // Populates the form with existing event data and opens the edit modal
  function openEdit(ev) {
    setEditId(ev._id);
    setForm({
      title: ev.title || '',
      description: ev.description || '',
      location: ev.location || '',
      organizer: ev.organizer || '',
      startDate: ev.startDate ? new Date(ev.startDate).toISOString().slice(0, 16) : '',
      endDate: ev.endDate ? new Date(ev.endDate).toISOString().slice(0, 16) : '',
      capacity: ev.capacity || 1,
      status: ev.status || 'active'
    });
    setFormError('');
    setShowModal(true);
  }

  // Handles both create and update: submits the form, reloads events, closes modal
  async function onSubmit(e) {
    e.preventDefault();
    setFormError('');
    const payload = { ...form, capacity: Number(form.capacity) };
    try {
      if (editId) {
        await updateEvent(editId, payload);
      } else {
        await createEvent(payload);
      }
      await reloadEvents();
      setShowModal(false);
    } catch (err) {
      setFormError(err.message || 'Save failed');
    }
  }

  // Asks for confirmation, then deletes the event and refreshes the data
  async function onDelete(id) {
    if (!confirm('Delete this event? This cannot be undone.')) return;
    try {
      await deleteEvent(id);
      await reloadEvents();
      await reloadRegs(selectedEventId);
    } catch (e) {
      setError(e.message || 'Delete failed');
    }
  }

  // Export registrations as CSV
  function exportCSV() {
    if (filtered.length === 0) { alert('No registrations to export.'); return; }

    const headers = ['Name', 'Email', 'Event', 'Ticket Type', 'Status', 'Date'];
    const rows = filtered.map((r) => [
      r.userId?.name || '',
      r.userId?.email || '',
      r.eventId?.title || '',
      r.ticketType || '',
      r.status || '',
      r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''
    ]);

    // Escape CSV values that contain commas or quotes
    const escape = (v) => {
      const s = String(v ?? '');
      return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
    };

    const csv = [headers.join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registrations_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // Filter registrations by event and search term
  const filtered = regs.filter((r) => {
    if (selectedEventId && r.eventId?._id !== selectedEventId) return false;
    if (!regSearch) return true;
    const kw = regSearch.toLowerCase();
    return (
      r.userId?.name?.toLowerCase().includes(kw) ||
      r.userId?.email?.toLowerCase().includes(kw)
    );
  });

  // Stats
  const totalRegs = regs.length;
  const confirmedRegs = regs.filter((r) => r.status === 'confirmed').length;

  return (
    <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full">

      {/* ── Header Banner ── */}
      <div className="relative rounded-3xl overflow-hidden mb-8 py-10 px-6 sm:px-10 bg-gradient-to-br from-slate-900 via-blue-950 to-purple-950 text-white shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30 mb-2">
              <Briefcase className="w-3.5 h-3.5" /> Organizer Dashboard
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">My Events</h1>
            <p className="text-xs text-slate-300 mt-1">Create and manage your events, view attendee registrations.</p>
          </div>
          <button
            onClick={openCreate}
            className="px-5 py-3 font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-xs shadow-lg flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-center"
          >
            <Plus className="w-4 h-4" /> Create Event
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-400 mb-6 text-sm">
          {error}
        </div>
      )}

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'My Events', value: events.length, icon: Calendar },
          { label: 'Total Registrations', value: totalRegs, icon: Users },
          { label: 'Confirmed', value: confirmedRegs, icon: CheckCircle },
          { label: 'Cancelled', value: totalRegs - confirmedRegs, icon: XCircle }
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{s.label}</span>
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block">{s.value}</span>
              </div>
              <div className="p-2.5 bg-gradient-to-tr from-blue-500 to-purple-500 text-white rounded-xl">
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 gap-4">
        {[
          { id: 'events', label: 'My Events', icon: Calendar },
          { id: 'registrations', label: 'Registrations', icon: Users }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-2 text-sm font-bold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── My Events Tab ── */}
      {activeTab === 'events' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Capacity</th>
                  <th className="py-3 px-4">Spots Left</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev._id} className="border-b border-slate-50 dark:border-slate-800/40 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{ev.title}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">{new Date(ev.startDate).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4 text-xs font-semibold">{ev.capacity}</td>
                    <td className="py-3.5 px-4 text-xs font-semibold">
                      <span className={ev.spotsLeft === 0 ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}>
                        {ev.spotsLeft ?? ev.capacity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        ev.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {ev.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => openEdit(ev)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-xl transition-all cursor-pointer" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => onDelete(ev._id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all cursor-pointer" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {events.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500 text-sm">
                      No events yet. Click "Create Event" to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Registrations Tab ── */}
      {activeTab === 'registrations' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          {/* Filters row */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="Search by name or email..."
                value={regSearch}
                onChange={(e) => setRegSearch(e.target.value)}
              />
            </div>
            {/* Event filter */}
            <select
              className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              value={selectedEventId}
              onChange={(e) => { setSelectedEventId(e.target.value); reloadRegs(e.target.value); }}
            >
              <option value="">All My Events</option>
              {events.map((ev) => (
                <option key={ev._id} value={ev._id}>{ev.title}</option>
              ))}
            </select>
            {/* Export CSV */}
            <button
              onClick={exportCSV}
              disabled={filtered.length === 0}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 rounded-xl flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" /> Export CSV
            </button>
          </div>

          {/* Registrations table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r._id} className="border-b border-slate-50 dark:border-slate-800/40 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{r.userId?.name || 'User'}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">{r.userId?.email || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-xs">{r.eventId?.title || 'Unknown'}</td>
                    <td className="py-3.5 px-4 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">{r.ticketType}</td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        r.status === 'confirmed'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500 text-sm">
                      No registrations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Create/Edit Event Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">

            {/* Modal header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 flex justify-between items-center">
              <span className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {editId ? 'Edit Event' : 'Create New Event'}
              </span>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-400">
                  {formError}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Title *</label>
                <input
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="Event title"
                  value={form.title}
                  onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                  placeholder="Describe the event..."
                  value={form.description}
                  onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                />
              </div>

              {/* Location + Organizer */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Location</label>
                  <input
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="City or Online"
                    value={form.location}
                    onChange={(e) => setForm((s) => ({ ...s, location: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Organizer Name</label>
                  <input
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="Your org name"
                    value={form.organizer}
                    onChange={(e) => setForm((s) => ({ ...s, organizer: e.target.value }))}
                  />
                </div>
              </div>

              {/* Start + End dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Start Date *</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    value={form.startDate}
                    onChange={(e) => setForm((s) => ({ ...s, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">End Date *</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    value={form.endDate}
                    onChange={(e) => setForm((s) => ({ ...s, endDate: e.target.value }))}
                  />
                </div>
              </div>

              {/* Capacity + Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Capacity *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    value={form.capacity}
                    onChange={(e) => setForm((s) => ({ ...s, capacity: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Status</label>
                  <select
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                    value={form.status}
                    onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}
                  >
                    <option value="active">Active</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all text-sm cursor-pointer mt-2"
              >
                {editId ? 'Save Changes' : 'Create Event'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
