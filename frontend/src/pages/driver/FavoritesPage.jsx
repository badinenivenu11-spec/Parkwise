import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { userApi } from '../../services/api';
import FacilityCard from '../../components/FacilityCard';
import { Heart, Compass, Search } from 'lucide-react';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await userApi.getFavorites();
      if (res.data.success) {
        setFavorites(res.data.favorites || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500 fill-current" />
            <span>Saved Parking Facilities</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quickly book your preferred lots and frequently visited garages
          </p>
        </div>

        <Link
          to="/find"
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Search className="w-4 h-4" />
          <span>Browse More Lots</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-24 text-center text-xs text-slate-400">Loading your favorite parking spots...</div>
      ) : favorites.length === 0 ? (
        <div className="p-16 rounded-3xl bg-navy-900 border border-navy-800 text-center max-w-md mx-auto space-y-3">
          <Heart className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Favorite Facilities Saved</h3>
          <p className="text-xs text-slate-400">
            Click the heart icon on any parking facility card to save it here for fast reservations.
          </p>
          <Link
            to="/find"
            className="inline-block px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
          >
            Explore Parking Lots
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fac) => (
            <FacilityCard key={fac._id} facility={fac} />
          ))}
        </div>
      )}
    </div>
  );
}
