export default function QueueCard({ item }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
          {item.pos}
        </div>
        <div>
          <div className="font-semibold text-gray-900">{item.number}</div>
          <div className="text-sm text-gray-600">{item.name}</div>
        </div>
      </div>

      <div className="text-xs bg-yellow-400 text-black px-3 py-1 rounded-md font-medium">
        Est. {item.eta} mins
      </div>
    </div>
  );
}
