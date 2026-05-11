import { X, Search, Filter } from "lucide-react";
import { Link } from "react-router-dom";

export function statusClass(status) {
  const value = String(status || "").toLowerCase();
  if (["active", "available", "confirmed", "checked-in", "verified", "serving", "on duty"].includes(value)) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
  if (["pending", "waiting"].includes(value)) return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
  if (["inactive", "rejected", "cancelled", "day off", "warned"].includes(value)) return "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300";
  return "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200";
}

export function PageHeader({ title, subtitle, actionLabel, onAction }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{title}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>
      {actionLabel && <button onClick={onAction} className="rounded-xl bg-teal-500 px-5 py-3 text-white font-medium hover:bg-teal-600 active:scale-[.98] transition">{actionLabel}</button>}
    </div>
  );
}

export function StatCard({ title, value, sub, icon: Icon, to }) {
  const Wrapper = to ? Link : 'div';
  return (
    <Wrapper 
      to={to}
      className={`rounded-2xl bg-white dark:bg-slate-800 p-5 shadow-sm border border-slate-100 dark:border-slate-700 ${to ? 'hover:-translate-y-1 hover:shadow-md transition-all block' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
          <h2 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{value}</h2>
          <p className="text-xs text-teal-600 dark:text-teal-300 mt-1">{sub}</p>
        </div>
        {Icon && <div className="h-12 w-12 rounded-2xl bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-300 grid place-items-center"><Icon size={22}/></div>}
      </div>
    </Wrapper>
  );
}

export function Toolbar({ query, setQuery, label = "Search records...", filter }) {
  return (
    <div className="mb-4 flex flex-col md:flex-row gap-3">
      <div className="flex-1 relative">
        <Search size={18} className="absolute left-3 top-3.5 text-slate-400" />
        <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder={label} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-10 py-3 outline-none focus:ring-2 focus:ring-teal-400" />
      </div>
      {filter && <button onClick={filter} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 flex items-center justify-center gap-2"><Filter size={18}/> Filter</button>}
    </div>
  );
}

export function Badge({ children }) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass(children)}`}>{children}</span>;
}

export function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-700 max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-900 flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={20}/></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function TextInput({ label, value, onChange, type="text" }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
      <input type={type} value={value || ""} onChange={(e)=>onChange(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 outline-none focus:ring-2 focus:ring-teal-400" />
    </label>
  );
}

export function SelectInput({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
      <select value={value || ""} onChange={(e)=>onChange(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 outline-none focus:ring-2 focus:ring-teal-400">
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </label>
  );
}

export function EmptyState({ message }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-10 text-center text-slate-500 dark:text-slate-400">{message}</div>;
}
