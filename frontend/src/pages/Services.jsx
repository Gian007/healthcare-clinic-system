import { useEffect, useState } from "react";
import ServiceCard from "../components/ServiceCard";
import * as publicApi from "../api/publicApi";

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('az');
  const [category, setCategory] = useState('All');

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

  const filteredServices = services
    .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.desc.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(s => {
      if (category === 'All') return true;
      const name = s.name.toLowerCase();
      const isSpecialized = name.includes('cardiology') || name.includes('panel') || name.includes('therapy') || name.includes('dermatology') || name.includes('diagnostic');
      if (category === 'Specialized') return isSpecialized;
      if (category === 'General') return !isSpecialized;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'az') return a.name.localeCompare(b.name);
      if (sortBy === 'za') return b.name.localeCompare(a.name);
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'price_high') return b.price - a.price;
      return 0;
    });

  return (
    <div className="bg-neutralbg dark:bg-slate-950 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Our Services</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-8">
          Comprehensive healthcare services for all your needs
        </p>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input 
            type="text" 
            placeholder="Search services..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-teal-500"
          />
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-teal-500"
          >
            <option value="All">All Categories</option>
            <option value="General">General</option>
            <option value="Specialized">Specialized</option>
          </select>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-teal-500"
          >
            <option value="az">A - Z</option>
            <option value="za">Z - A</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-xl h-32 animate-pulse border border-slate-100 dark:border-slate-800" />
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="mt-10 text-center text-gray-500 dark:text-gray-400">
            <p>No services found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredServices.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
