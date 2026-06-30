/**
 * EventDetailsPage.jsx — Full details view for a single event
 * Shows: banner, date/location/capacity info, description, and a registration form.
 * Registration form handles: ticket type (standard/vip) + optional notes.
 * States handled: loading, error, already registered, event full, not logged in.
 */

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, ChevronLeft, Info, Ticket, CheckCircle2 } from 'lucide-react';

import { getEvent } from '../api/events.js';
import { registerForEvent } from '../api/registrations.js';
import { useAuth } from '../context/AuthContext.jsx';

// Renders the event detail view with registration form
export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Registration form state
  const [ticketType, setTicketType] = useState('standard');
  const [notes, setNotes] = useState('');
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);

  // Fetches event details from the API when the page loads
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getEvent(id);
        if (active) setEvent(data);
      } catch (e) {
        if (active) setError(e.message || 'Failed to load event');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id]);

  // Submits the registration form; redirects to login if the user isn't authenticated
  async function onRegister(e) {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setRegLoading(true);
    setRegError('');
    try {
      await registerForEvent({ eventId: id, ticketType, notes });
      setRegSuccess(true);
      setNotes('');
    } catch (err) {
      setRegError(err.message || 'Registration failed');
    } finally {
      setRegLoading(false);
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mb-4" />
        <p className="text-sm font-medium">Loading event details...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-10">
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
          <Info className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
        <Link to="/" className="mt-4 inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold hover:underline text-sm">
          <ChevronLeft className="w-4 h-4" /> Back to Events
        </Link>
      </div>
    );
  }

  if (!event) return null;

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const isActive = event.status === 'active';
  const isFull = event.spotsLeft === 0;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back link */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold text-sm mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Events
      </Link>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl mb-8">

        {/* ── Event Banner ── */}
        <div className="relative py-14 px-6 sm:px-10 bg-gradient-to-br from-blue-900 via-indigo-950 to-purple-950 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(124,58,237,0.15),transparent_40%)]" />
          <div className="relative z-10 max-w-2xl">
            {/* Status badge */}
            <span className={`inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full tracking-wider mb-4 border ${
              isActive
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-500/10 text-slate-300 border-slate-500/30'
            }`}>
              {event.status}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">{event.title}</h1>
            {event.organizer && (
              <p className="text-xs text-slate-300 font-semibold uppercase tracking-wider">
                Hosted by <span className="text-blue-400 font-extrabold">{event.organizer}</span>
              </p>
            )}
          </div>
        </div>

        {/* ── Event Info Row ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 sm:p-10 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10">
          {/* Date */}
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Date & Time</p>
              <p className="font-bold text-sm mt-1 text-slate-800 dark:text-slate-200">
                {startDate.toLocaleDateString(undefined, { dateStyle: 'medium' })}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {startDate.toLocaleTimeString(undefined, { timeStyle: 'short' })} – {endDate.toLocaleTimeString(undefined, { timeStyle: 'short' })}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Location</p>
              <p className="font-bold text-sm mt-1 text-slate-800 dark:text-slate-200">
                {event.location || 'Online / Remote'}
              </p>
            </div>
          </div>

          {/* Capacity */}
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Capacity</p>
              <p className={`font-bold text-sm mt-1 ${isFull ? 'text-red-500' : 'text-slate-800 dark:text-slate-200'}`}>
                {isFull ? 'Sold Out' : `${event.spotsLeft} spots remaining`}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">of {event.capacity} total</p>
            </div>
          </div>
        </div>

        {/* ── Description + Registration Form ── */}
        <div className="p-6 sm:p-10">
          {/* Description */}
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About This Event</h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm mb-8 whitespace-pre-line">
            {event.description || 'Join us for this exciting event. Network with industry experts and explore the latest trends.'}
          </p>

          {/* Registration section */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Register for This Event
            </h2>

            {/* Success state */}
            {regSuccess ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 text-center max-w-md mx-auto">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Registration Confirmed!</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-5">
                  Your ticket has been added to your dashboard.
                </p>
                <div className="flex gap-3 justify-center">
                  <Link to="/my-tickets" className="px-5 py-2.5 font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-xs shadow-md">
                    View My Tickets
                  </Link>
                  <button onClick={() => setRegSuccess(false)} className="px-5 py-2.5 font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
                    Register Again
                  </button>
                </div>
              </div>
            ) : (
              /* Registration form */
              <form onSubmit={onRegister} className="max-w-xl">
                {/* Error message */}
                {regError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>{regError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  {/* Ticket type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Ticket Type
                    </label>
                    <select
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                      value={ticketType}
                      onChange={(e) => setTicketType(e.target.value)}
                    >
                      <option value="standard">Standard (Free)</option>
                      <option value="vip">VIP Pass</option>
                    </select>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Notes (Optional)
                    </label>
                    <input
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="Dietary needs, accessibility..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={regLoading || !isActive || isFull}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-sm cursor-pointer"
                >
                  {regLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
                      Registering...
                    </>
                  ) : !isActive ? (
                    'Registration Closed'
                  ) : isFull ? (
                    'Event is Full'
                  ) : !user ? (
                    'Login to Register'
                  ) : (
                    <>
                      <Ticket className="w-4 h-4" /> Complete Registration
                    </>
                  )}
                </button>

                {/* Prompt to login if not authenticated */}
                {!user && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 text-center">
                    <Link to="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Sign in</Link> or{' '}
                    <Link to="/register" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">create an account</Link> to register.
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
