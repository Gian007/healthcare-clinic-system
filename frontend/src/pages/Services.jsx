import { useEffect, useState } from "react";
import ServiceCard from "../components/ServiceCard";
import * as publicApi from "../api/publicApi";

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi.getServices()
      .then(res => {
        // Map DB fields to ServiceCard expected format
        const mapped = res.map(s => ({
          id: s.service_id,
          name: s.service_name,
          desc: s.description || 'No description provided.',
          status: s.service_status || 'Available',
          durationMin: s.estimated_duration || 30,
          price: s.base_fee || 0
        }));
        setServices(mapped);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-neutralbg dark:bg-slate-950 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Our Services</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Comprehensive healthcare services for all your needs
        </p>

        {loading ? (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-xl h-32 animate-pulse border border-slate-100 dark:border-slate-800" />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="mt-10 text-center text-gray-500 dark:text-gray-400">
            <p className="text-4xl mb-3">🩺</p>
            <p>No services listed currently.</p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
