import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { facilityApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  MapPin,
  Car,
  Zap,
  Umbrella,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Layers
} from 'lucide-react';

export default function FacilityManagementPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [facilityType, setFacilityType] = useState('garage');
  const [totalSlots, setTotalSlots] = useState(60);
  const [hourlyCarRate, setHourlyCarRate] = useState(60);
  const [hourlyMotoRate, setHourlyMotoRate] = useState(20);
  const [hourlySuvRate, setHourlySuvRate] = useState(80);
  const [covered, setCovered] = useState(true);
  const [evCharging, setEvCharging] = useState(true);
  const [security, setSecurity] = useState(true);
  const [accessible, setAccessible] = useState(true);
  const [coverImage, setCoverImage] = useState('');
  const [generateSlots, setGenerateSlots] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const res = await facilityApi.getMyFacilities();
      if (res.data.success) {
        setFacilities(res.data.facilities || []);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load facilities', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setCity('Bengaluru');
    setStreet('');
    setFacilityType('garage');
    setTotalSlots(60);
    setHourlyCarRate(60);
    setHourlyMotoRate(20);
    setHourlySuvRate(80);
    setCovered(true);
    setEvCharging(true);
    setSecurity(true);
    setAccessible(true);
    setCoverImage('https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800');
    setGenerateSlots(true);
    setModalOpen(true);
  };

  const openEditModal = (fac) => {
    setEditingId(fac._id);
    setName(fac.name);
    setCity(fac.address?.city || '');
    setStreet(fac.address?.street || '');
    setFacilityType(fac.facilityType || 'garage');
    setTotalSlots(fac.totalSlots || 60);
    setCovered(!!fac.amenities?.covered);
    setEvCharging(!!fac.amenities?.evCharging);
    setSecurity(!!fac.amenities?.security);
    setAccessible(!!fac.amenities?.accessible);
    setCoverImage(fac.coverImage || '');
    setGenerateSlots(false);

    const carR = fac.pricingRules?.find(p => p.vehicleType === 'car');
    if (carR) setHourlyCarRate(carR.baseRate);
    const motoR = fac.pricingRules?.find(p => p.vehicleType === 'motorcycle');
    if (motoR) setHourlyMotoRate(motoR.baseRate);
    const suvR = fac.pricingRules?.find(p => p.vehicleType === 'suv');
    if (suvR) setHourlySuvRate(suvR.baseRate);

    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !city.trim()) {
      addToast('Name and city are required', 'warning');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: name.trim(),
        facilityType,
        totalSlots: parseInt(totalSlots),
        address: {
          street: street.trim(),
          city: city.trim(),
        },
        coverImage: coverImage.trim() || undefined,
        amenities: {
          covered,
          evCharging,
          security,
          cctv: security,
          accessible,
          lighting: true,
        },
        pricingRules: [
          { vehicleType: 'motorcycle', rateType: 'hourly', baseRate: parseFloat(hourlyMotoRate) },
          { vehicleType: 'car', rateType: 'hourly', baseRate: parseFloat(hourlyCarRate) },
          { vehicleType: 'suv', rateType: 'hourly', baseRate: parseFloat(hourlySuvRate) },
        ],
        supportedVehicleTypes: ['motorcycle', 'car', 'suv'],
        generateSlots,
      };

      if (editingId) {
        await facilityApi.update(editingId, payload);
        addToast('Facility updated successfully', 'success');
      } else {
        await facilityApi.create(payload);
        addToast('Facility created and slots generated', 'success');
      }

      setModalOpen(false);
      fetchFacilities();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save facility', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id, name) => {
    if (!window.confirm(`Deactivate facility "${name}"? It will no longer appear in public searches.`)) return;
    try {
      await facilityApi.delete(id);
      addToast('Facility deactivated', 'info');
      fetchFacilities();
    } catch (err) {
      addToast(err.response?.data?.message || 'Action failed', 'error');
    }
  };

  const handlePermanentDelete = async (id, name) => {
    if (!window.confirm(`PERMANENTLY DELETE facility "${name}" and all associated parking slots from the database? This action is irreversible.`)) return;
    try {
      const res = await facilityApi.delete(id, { permanent: 'true' });
      addToast(res.data?.message || `Facility "${name}" permanently deleted`, 'success');
      setFacilities(prev => prev.filter(f => f._id !== id));
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete facility', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-blue-400" />
            <span>Facility Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure parking garages, pricing schedules, capacity, and amenities
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Parking Lot</span>
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center text-xs text-slate-400">Loading facility records...</div>
      ) : facilities.length === 0 ? (
        <div className="p-16 rounded-3xl bg-navy-900 border border-navy-800 text-center max-w-md mx-auto space-y-3">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Facilities Found</h3>
          <p className="text-xs text-slate-400">
            Create your first parking complex to start managing slot layouts and gate operations.
          </p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
          >
            Create Facility
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((fac) => {
            const carRate = fac.pricingRules?.find(p => p.vehicleType === 'car') || fac.pricingRules?.[0];
            return (
              <div
                key={fac._id}
                className="bg-navy-900 border border-navy-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="h-40 relative bg-navy-950 overflow-hidden">
                    <img
                      src={fac.coverImage || 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800'}
                      alt={fac.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-transparent to-black/30" />
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                      {fac.facilityType}
                    </span>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-base font-bold text-white line-clamp-1">{fac.name}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{fac.address?.street ? `${fac.address.street}, ` : ''}{fac.address?.city}</span>
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-navy-850 border border-navy-800 space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-sans">Total Spaces:</span>
                        <span className="text-white font-bold">{fac.totalSlots}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-sans">Current Free:</span>
                        <span className="text-emerald-400 font-bold">{fac.availableSlots}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-sans">Car Rate:</span>
                        <span className="text-white font-bold">₹{carRate?.baseRate || 60}/hr</span>
                      </div>
                    </div>

                    {/* Amenities pills */}
                    <div className="flex flex-wrap gap-1 text-[10px]">
                      {fac.amenities?.evCharging && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                          ⚡ EV
                        </span>
                      )}
                      {fac.amenities?.covered && (
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                          Covered
                        </span>
                      )}
                      {fac.amenities?.security && (
                        <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">
                          Security
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-navy-800/80 flex items-center justify-between text-xs mt-3">
                  <Link
                    to={`/operator/slots?facilityId=${fac._id}`}
                    className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Slots ({fac.totalSlots})</span>
                  </Link>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(fac)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition"
                      title="Edit facility details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(fac._id, fac.name)}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition"
                      title="Permanently Delete Facility & All Slots"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-navy-900 border border-navy-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white">
              {editingId ? 'Edit Parking Facility' : 'Create New Parking Complex'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Facility Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Phoenix Mall Multi-Level Parking"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-700 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-700 text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Structure Type
                  </label>
                  <select
                    value={facilityType}
                    onChange={(e) => setFacilityType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-700 text-white"
                  >
                    <option value="garage">Multi-Level Garage</option>
                    <option value="underground">Underground</option>
                    <option value="surface">Surface Lot</option>
                    <option value="covered">Covered Surface</option>
                    <option value="rooftop">Rooftop</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. 45 Outer Ring Road"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-700 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-700 text-white font-mono text-[11px]"
                />
              </div>

              {/* Slot Capacity & Pricing Schedule */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Total Slot Capacity *
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="500"
                    value={totalSlots}
                    onChange={(e) => setTotalSlots(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-700 text-white font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Car Hourly Rate (₹) *
                  </label>
                  <input
                    type="number"
                    min="10"
                    value={hourlyCarRate}
                    onChange={(e) => setHourlyCarRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-700 text-white font-mono font-bold"
                    required
                  />
                </div>
              </div>

              {/* Additional vehicle rates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Motorcycle Hourly (₹)
                  </label>
                  <input
                    type="number"
                    min="5"
                    value={hourlyMotoRate}
                    onChange={(e) => setHourlyMotoRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    SUV Hourly (₹)
                  </label>
                  <input
                    type="number"
                    min="15"
                    value={hourlySuvRate}
                    onChange={(e) => setHourlySuvRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-700 text-white font-mono"
                  />
                </div>
              </div>

              {/* Amenities checkboxes */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-navy-800">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={covered}
                    onChange={(e) => setCovered(e.target.checked)}
                    className="rounded bg-navy-850 border-navy-700 text-blue-500"
                  />
                  <span>Covered Garage</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={evCharging}
                    onChange={(e) => setEvCharging(e.target.checked)}
                    className="rounded bg-navy-850 border-navy-700 text-emerald-500"
                  />
                  <span>EV Charging Bays</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={security}
                    onChange={(e) => setSecurity(e.target.checked)}
                    className="rounded bg-navy-850 border-navy-700 text-purple-500"
                  />
                  <span>Guarded + CCTV</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={accessible}
                    onChange={(e) => setAccessible(e.target.checked)}
                    className="rounded bg-navy-850 border-navy-700 text-slate-400"
                  />
                  <span>Wheelchair Access</span>
                </label>
              </div>

              {!editingId && (
                <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/30">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-200 font-semibold">
                    <input
                      type="checkbox"
                      checked={generateSlots}
                      onChange={(e) => setGenerateSlots(e.target.checked)}
                      className="rounded bg-navy-850 border-navy-700 text-blue-500"
                    />
                    <span>Auto-generate parking spaces (A01, B01, etc.) for this capacity</span>
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-navy-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition"
                >
                  {saving ? 'Saving...' : editingId ? 'Update Facility' : 'Create & Generate Slots'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
