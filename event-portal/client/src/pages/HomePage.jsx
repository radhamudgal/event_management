// HomePage — public landing page
// Shows a hero section, search/filter bar, and a grid of event cards
// Each card shows: title, date, location, organizer, spots left, status badge

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Calendar, MapPin, Users, ArrowRight, ChevronRight, Sparkles } from 'lucide-react';

import { listEvents } from '../api/events.js';
import { useAuth } from '../context/AuthContext.jsx';

// Gradient presets for event card headers — cycles through by index
const GRADIENTS = [
  'from-blue-600 to-indigo-600',
  'from-purple-600 to-pink-600',
  'from-indigo-600 to-purple-600',
  'from-violet-600 to-blue-600',
  'from-fuchsia-600 to-pink-600',
  'from-blue-500 to-cyan-500'
];

export default function HomePage() {
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Search and filter state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('active');

  // Load events whenever search or status changes
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await listEvents({ q: search || undefined, status });
        if (active) setEvents(data);
      } catch (e) {
        if (active) setError(e.message || 'Failed to load events');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [search, status]);

  return (
    <div className="flex flex-col flex-1">

      {/* ── Hero Section ── */}
      <section className="relative rounded-3xl overflow-hidden mb-10 py-16 px-6 sm:px-12 bg-gradient-to-br from-slate-900 via-blue-950 to-purple-950 text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(124,58,237,0.15),transparent_40%)]" />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30 mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Smart Event Registration Platform
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-4">
            Discover & Book <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Amazing Events
            </span>
          </h1>
          <p className="text-slate-300 text-base mb-6 max-w-lg">
            Browse conferences, workshops, and meetups. Register instantly and get a scannable QR ticket.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="#events" className="px-6 py-3 font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-lg flex items-center gap-2 group transition-all">
              Browse Events <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            {!user && (
              <Link to="/register" className="px-6 py-3 font-bold text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-xl border border-slate-700/50 transition-all">
                Create Free Account
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── Search & Filter ── */}
      <section id="events" className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm p-5 mb-8 scroll-mt-20">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Find Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search input */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="Search by title, location, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {/* Status filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="active">Active Events</option>
              <option value="completed">Past Events</option>
              <option value="cancelled">Cancelled</option>
              <option value="">All Events</option>
            </select>
          </div>
        </div>
      </section>

      {/* ── Event Cards Grid ── */}
      <section className="flex-1">
        {/* Loading spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mb-4" />
            <p className="text-sm font-medium">Loading events...</p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-400 text-sm mb-6">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}

        {/* Events grid */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((ev, index) => {
                const startDate = new Date(ev.startDate);
                const gradient = GRADIENTS[index % GRADIENTS.length];
                const isFull = ev.spotsLeft === 0;

                return (
                  <div
                    key={ev._id}
                    className="group bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-xl hover:border-blue-500/30 dark:hover:border-purple-500/40 transition-all duration-300 flex flex-col"
                  >
                    {/* Gradient card header */}
                    <div className={`h-32 bg-gradient-to-tr ${gradient} relative p-5 flex flex-col justify-between text-white`}>
                      <div className="flex justify-between items-start">
                        {/* Organizer badge */}
                        <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase bg-white/20 backdrop-blur-sm rounded-full border border-white/10 truncate max-w-[120px]">
                          {ev.organizer || 'Featured'}
                        </span>
                        {/* Status badge */}
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          ev.status === 'active'
                            ? 'bg-emerald-500/30 text-emerald-100 border border-emerald-400/20'
                            : 'bg-slate-500/30 text-slate-100 border border-slate-400/20'
                        }`}>
                          {ev.status}
                        </span>
                      </div>
                      {/* Date on card */}
                      <span className="text-xs font-bold text-blue-200">
                        {startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    {/* Card body */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {ev.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {ev.description || 'Join us for this amazing event.'}
                        </p>

                        {/* Event meta info */}
                        <div className="pt-2 space-y-1.5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate font-medium">{ev.location || 'Online / Remote'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 shrink-0" />
                            <span>{startDate.toLocaleTimeString(undefined, { timeStyle: 'short' })}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 shrink-0" />
                            <span className={`font-semibold ${isFull ? 'text-red-500 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>
                              {isFull ? 'Sold Out' : `${ev.spotsLeft} spots left`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* View details button */}
                      <div className="pt-4 flex justify-end">
                        <Link
                          to={`/event/${ev._id}`}
                          className="px-4 py-2 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 rounded-xl flex items-center gap-1 transition-all"
                        >
                          View Details <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty state */}
            {events.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl text-center p-6">
                <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">No Events Found</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm">
                  No events match your search. Try adjusting the filters.
                </p>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
