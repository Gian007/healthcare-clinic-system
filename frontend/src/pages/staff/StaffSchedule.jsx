import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import * as staffApi from "../../api/staffApi";

const DAYS_ORDER = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

export default function StaffSchedule() {
  const { dark } = useOutletContext();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    staffApi.getSchedules()
      .then(setSchedules)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const muted = dark ? "text-gray-400" : "text-gray-500";
  const card  = dark ? "bg-gray-900 border-gray-800 text-white" : "bg-white border-gray-200 text-gray-900";

  // Group schedules by doctor
  const byDoctor = schedules.reduce((acc, s) => {
    const key = s.doctor_id;
    if (!acc[key]) acc[key] = { doctor: s.doctor, slots: [] };
    acc[key].slots.push(s);
    return acc;
  }, {});

  const doctors = Object.values(byDoctor);
  doctors.forEach(d => {
    d.slots.sort((a,b) => DAYS_ORDER.indexOf(a.day_of_week) - DAYS_ORDER.indexOf(b.day_of_week));
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className={`text-2xl font-semibold ${dark ? "text-white" : "text-gray-900"}`}>Hospital Schedule</h1>
          <p className={`text-sm ${muted}`}>Doctor availability from the database</p>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map(i => (
            <div key={i} className={`rounded-2xl border animate-pulse overflow-hidden ${card}`}>
              <div className="h-24 bg-gray-200 dark:bg-slate-700" />
              <div className="p-5 space-y-3">
                {[1,2,3].map(j => <div key={j} className="h-4 bg-gray-200 dark:bg-slate-700 rounded" />)}
              </div>
            </div>
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div className={`rounded-2xl border p-10 text-center ${card}`}>
          <p className="text-4xl mb-3">📅</p>
          <p className={muted}>No doctor schedules found in the database.</p>
          <p className="text-xs mt-1 text-gray-400">Schedules are added by the Admin in Manage Schedules.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {doctors.map(({ doctor, slots }) => (
            <div key={doctor?.doctor_id} className={`rounded-2xl border shadow-sm overflow-hidden ${card}`}>
              <div className={`p-5 text-white ${doctor?.status === 'Active' ? 'bg-gradient-to-r from-teal-600 to-teal-500' : 'bg-gradient-to-r from-gray-500 to-gray-600'}`}>
                <div className="flex justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">Dr. {doctor?.first_name} {doctor?.last_name}</h2>
                    <p className="text-xs opacity-80 mt-0.5">{doctor?.specialization?.name}</p>
                  </div>
                  <span className="h-fit rounded-full bg-white/20 px-3 py-1 text-xs">{doctor?.status || 'Active'}</span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-sm font-semibold mb-3">Weekly Schedule</h3>
                <div className="space-y-2">
                  {slots.map(s => (
                    <div key={s.schedule_id} className={`flex justify-between items-center text-sm px-3 py-2 rounded-lg ${dark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <span className={`font-medium w-24 ${muted}`}>{s.day_of_week}</span>
                      <span className="text-teal-600 font-medium text-xs">
                        {s.start_time?.slice(0,5)} – {s.end_time?.slice(0,5)}
                      </span>
                    </div>
                  ))}
                </div>
                {slots.length === 0 && (
                  <p className={`text-sm text-center py-4 ${muted}`}>No schedule set</p>
                )}
                <div className="mt-3 flex justify-end">
                  <button onClick={() => setExpandedId(prev => prev === doctor?.doctor_id ? null : doctor?.doctor_id)} className="text-teal-600 underline text-sm">{expandedId === doctor?.doctor_id ? 'Hide' : 'View / Edit'}</button>
                </div>
                {expandedId === doctor?.doctor_id && (
                  <div className="mt-2 p-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500">Edit schedule functionality coming soon.</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}