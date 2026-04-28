import AnnouncementCard from "../components/AnnouncementCard";
import { announcements } from "../data/announcements";

export default function Announcements() {
  return (
    <div className="bg-neutralbg min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-gray-900">Announcements</h1>
        <p className="text-sm text-gray-600 mt-1">
          Stay updated with the latest news and information
        </p>

        <div className="mt-6 space-y-4 max-w-4xl">
          {announcements.map((a) => (
            <AnnouncementCard key={a.id} item={a} />
          ))}
        </div>
      </div>
    </div>
  );
}
