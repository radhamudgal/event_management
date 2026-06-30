/**
 * MyTicketsPage.jsx — The attendee's personal ticket dashboard
 * Displays all of the logged-in user's event registrations as ticket cards.
 * Features: status badge, ticket type, "View QR Ticket" modal with scannable QR code,
 * Download QR as SVG, Print ticket, and Cancel registration.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Ticket, Calendar, MapPin, X, Printer, AlertCircle, RefreshCw, Download, Sparkles, Compass } from 'lucide-react';

import { cancelRegistration, myRegistrations } from '../api/registrations.js';
import { useAuth } from '../context/AuthContext.jsx';

// Renders the My Tickets dashboard for the logged-in user
export default function MyTicketsPage() {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState('');

  // Which ticket is open in the QR modal
  const [activeTicket, setActiveTicket] = useState(null);

  // Fetches the user's registrations from the API
  async function reload() {
    setLoading(true);
    setError('');
    try {
      const data = await myRegistrations();
      setItems(data);
    } catch (e) {
      setError(e.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { reload(); }, []);

  // Asks for confirmation, then cancels the given registration and reloads
  async function onCancel(regId) {
    if (!confirm('Cancel this registration?')) return;
    setCancellingId(regId);
    try {
      await cancelRegistration(regId);
      await reload();
    } catch (e) {
      setError(e.message || 'Cancellation failed');
    } finally {
      setCancellingId('');
    }
  }

  // Serializes the QR code SVG element and triggers a browser download
  function handleDownloadQR(ticketId) {
    const svgEl = document.getElementById(`qr-${ticketId}`);
    if (!svgEl) return;
    const svgString = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ticket_${ticketId}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Stats for the welcome banner
  const confirmed = items.filter((r) => r.status === 'confirmed').length;
  const cancelled = items.filter((r) => r.status === 'cancelled').length;

  return (
    <div className="max-w-5xl mx-auto flex-1 flex flex-col">

      {/* ── Welcome Banner ── */}
      <section className="relative rounded-3xl overflow-hidden mb-10 py-10 px-6 sm:px-10 bg-gradient-to-br from-slate-900 via-blue-950 to-purple-950 text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(124,58,237,0.1),transparent_50%)]" />
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">
              <Sparkles className="w-3.5 h-3.5" /> My Tickets
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Welcome, <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{user?.name || 'Attendee'}</span>!
            </h1>
            <p className="text-sm text-slate-300">
              View your event tickets, download QR codes, or cancel registrations.
            </p>
          </div>
          {/* Quick stats */}
          <div className="md:col-span-4 grid grid-cols-2 gap-4">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Active</span>
              <span className="text-3xl font-extrabold block text-blue-400 mt-1">{confirmed}</span>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Cancelled</span>
              <span className="text-3xl font-extrabold block text-red-400 mt-1">{cancelled}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ticket List ── */}
      <section className="flex-1">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Ticket className="w-5 h-5 text-blue-600 dark:text-blue-400" /> My Tickets
        </h2>

        {/* Loading */}
        {loading && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mb-3" />
            <p className="text-sm font-medium">Loading tickets...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-400 mb-6 flex items-center gap-2 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl text-center p-6">
            <Ticket className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">No Tickets Yet</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-5 text-sm">
              You haven't registered for any events. Browse upcoming events and grab your spot!
            </p>
            <Link to="/" className="px-5 py-2.5 font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-xs shadow-md flex items-center gap-1.5">
              <Compass className="w-4 h-4" /> Browse Events
            </Link>
          </div>
        )}

        {/* Ticket cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((r) => {
            const ev = r.eventId;
            const startDate = ev ? new Date(ev.startDate) : null;
            const isCancelled = r.status === 'cancelled';

            return (
              <div
                key={r._id}
                className={`bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden shadow-sm flex flex-col transition-all ${
                  isCancelled
                    ? 'border-slate-200 dark:border-slate-800 opacity-60'
                    : 'border-slate-200/80 dark:border-slate-800 hover:border-blue-500/30 hover:shadow-lg'
                }`}
              >
                {/* Card body */}
                <div className="p-5 flex-1">
                  {/* Status + ticket type badges */}
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                      isCancelled
                        ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-red-200/50'
                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200/50'
                    }`}>
                      {r.status}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded border border-blue-100 dark:border-blue-900/30 uppercase tracking-wider">
                      {r.ticketType} Pass
                    </span>
                  </div>

                  {/* Event title */}
                  <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1 mb-1">
                    {ev?.title || 'Unknown Event'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3">
                    ID: {r._id}
                  </p>

                  {/* Event meta */}
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    {startDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {startDate.toLocaleDateString(undefined, { dateStyle: 'medium' })} at{' '}
                          {startDate.toLocaleTimeString(undefined, { timeStyle: 'short' })}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{ev?.location || 'Online / Remote'}</span>
                    </div>
                  </div>

                  {/* Notes */}
                  {r.notes && (
                    <div className="mt-3 p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs text-slate-500 border border-slate-100 dark:border-slate-800">
                      <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5 text-[9px] uppercase tracking-wide">Note:</span>
                      {r.notes}
                    </div>
                  )}
                </div>

                {/* Card footer actions */}
                <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  {!isCancelled ? (
                    <>
                      <button
                        onClick={() => setActiveTicket(r)}
                        className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                      >
                        <Ticket className="w-3.5 h-3.5" /> View QR Ticket
                      </button>
                      <button
                        disabled={cancellingId === r._id}
                        onClick={() => onCancel(r._id)}
                        className="text-xs font-bold text-red-500 hover:text-red-700 disabled:opacity-50 cursor-pointer"
                      >
                        {cancellingId === r._id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-slate-400">Booking Cancelled</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── QR Ticket Modal ── */}
      {activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">

            {/* Modal header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5" />
                <span className="font-extrabold text-xs uppercase tracking-wider">Entry Ticket</span>
              </div>
              <button onClick={() => setActiveTicket(null)} className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ticket body */}
            <div className="p-6">
              {/* Event title */}
              <div className="border-b border-dashed border-slate-200 dark:border-slate-800 pb-4 mb-4">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-1 line-clamp-2">
                  {activeTicket.eventId?.title || 'Event'}
                </h2>
                {activeTicket.eventId?.organizer && (
                  <p className="text-xs text-slate-400">
                    Hosted by <span className="font-semibold text-slate-600 dark:text-slate-300">{activeTicket.eventId.organizer}</span>
                  </p>
                )}
              </div>

              {/* Ticket details grid */}
              <div className="grid grid-cols-2 gap-4 mb-5 text-xs">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Attendee</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate block mt-0.5">{user?.name}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Ticket Type</span>
                  <span className="font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest block mt-0.5">
                    {activeTicket.ticketType} Pass
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Date</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {activeTicket.eventId?.startDate
                      ? new Date(activeTicket.eventId.startDate).toLocaleDateString(undefined, { dateStyle: 'medium' })
                      : 'TBD'}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Location</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{activeTicket.eventId?.location || 'Online'}</span>
                  </span>
                </div>
              </div>

              {/* QR Code */}
              <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 flex flex-col items-center mb-5">
                <div className="p-3 bg-white rounded-xl shadow-md">
                  <QRCodeSVG
                    id={`qr-${activeTicket._id}`}
                    value={JSON.stringify({
                      ticketId: activeTicket._id,
                      event: activeTicket.eventId?.title,
                      type: activeTicket.ticketType,
                      status: activeTicket.status
                    })}
                    size={150}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <span className="mt-3 text-[9px] bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-blue-200/20">
                  Scan at Entrance
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownloadQR(activeTicket._id)}
                  className="flex-1 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download QR
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Print Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
