export default function QueueCard({ item }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-4 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
          {item.pos}
        </div>
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">{item.number}</div>
          <div className="text-sm text-gray-600 dark:text-slate-400">{item.name}</div>
        </div>
      </div>

      <div className="text-xs bg-yellow-400 text-black px-3 py-1 rounded-md font-medium">
        Est. {item.eta} mins
      </div>
    </div>
  );
}
