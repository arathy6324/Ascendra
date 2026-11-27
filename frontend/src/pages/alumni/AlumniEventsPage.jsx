import React, { useState, useEffect } from "react";
import AppLayout from "../../components/layout/AppLayout";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../context/ToastContext";
import { careersApi } from "../../services/api";
import { CalendarDays, MapPin, Plus, Sparkles } from "lucide-react";

export const AlumniEventsPage = () => {
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    event_date: "",
    location_or_link: "",
    event_type: "WEBINAR",
  });

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await careersApi.getEvents();
      setEvents(res.data.results || res.data || []);
    } catch (err) {
      console.error("Failed to load alumni events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await careersApi.createEvent(form);
      toast.success("Alumni event published to the community!");
      setIsModalOpen(false);
      setForm({ title: "", description: "", event_date: "", location_or_link: "", event_type: "WEBINAR" });
      loadEvents();
    } catch (err) {
      toast.error("Failed to create event.");
    }
  };

  return (
    <AppLayout title="Alumni Events & Webinars" subtitle="Tech talks, leadership summits, and networking meetups">
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Community Summits & Tech Talks</h2>
            <p className="text-xs text-slate-500">Join upcoming alumni sessions or host a knowledge-sharing webinar.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-bold shadow-xs hover:brightness-105 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Host Alumni Event</span>
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-xs text-slate-500">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">No upcoming events scheduled yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((evt) => (
              <div key={evt.id} className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="teal" size="sm">{evt.event_type}</Badge>
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5 text-emerald-600" />
                      {new Date(evt.event_date).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">{evt.title}</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{evt.description}</p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="truncate">{evt.location_or_link}</span>
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 shrink-0 ml-2">
                    By {evt.created_by_name || "Alumni Council"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Host Alumni Event or Webinar">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Event Title</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Scaling Distributed APIs in Production"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Type</label>
                <select
                  value={form.event_type}
                  onChange={(e) => setForm({ ...form, event_type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                >
                  <option value="WEBINAR">Webinar</option>
                  <option value="WORKSHOP">Skill Workshop</option>
                  <option value="NETWORKING">Networking Session</option>
                  <option value="REUNION">Alumni Meetup / Reunion</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={form.event_date}
                  onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Venue or Meeting Link</label>
              <input
                type="text"
                required
                value={form.location_or_link}
                onChange={(e) => setForm({ ...form, location_or_link: e.target.value })}
                placeholder="https://meet.google.com/... or Auditorium"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Description</label>
              <textarea
                rows={3}
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">
                Publish Event
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
};

export default AlumniEventsPage;
