export function PageHeader({ title, subtitle, action }) {
  return <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"><div><h1 className="text-2xl md:text-3xl font-bold">{title}</h1><p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p></div>{action}</div>;
}

export function Card({ children, className = '' }) {
  return <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm ${className}`}>{children}</div>;
}

export function Badge({ children, tone = 'teal' }) {
  const map = {
    teal: 'bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300',
    green: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
    yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
    gray: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  };
  return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${map[tone]}`}>{children}</span>;
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const styles = {
    primary: 'bg-teal-600 hover:bg-teal-700 text-white',
    green: 'bg-green-600 hover:bg-green-700 text-white',
    red: 'bg-red-600 hover:bg-red-700 text-white',
    outline: 'border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800',
    ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800',
  };
  return <button {...props} className={`px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50 ${styles[variant]} ${className}`}>{children}</button>;
}

export function Modal({ title, children, onClose }) {
  return <div className="fixed inset-0 z-[70] bg-black/50 grid place-items-center p-4"><div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl"><div className="flex justify-between items-center mb-5"><h2 className="text-xl font-bold">{title}</h2><button onClick={onClose} className="text-slate-500 hover:text-slate-900 dark:hover:text-white">✕</button></div>{children}</div></div>;
}
