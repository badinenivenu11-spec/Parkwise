import React, { useEffect, useState } from 'react';
import { vehicleApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Car,
  Bike,
  Truck,
  Plus,
  Trash2,
  Edit2,
  Check,
  Star,
  Zap,
  ShieldAlert
} from 'lucide-react';

export default function VehicleManagementPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [regNumber, setRegNumber] = useState('');
  const [vType, setVType] = useState('car');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [isEV, setIsEV] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await vehicleApi.getAll();
      if (res.data.success) {
        setVehicles(res.data.vehicles || []);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load vehicles', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setRegNumber('');
    setVType('car');
    setMake('');
    setModel('');
    setColor('');
    setIsEV(false);
    setIsDefault(vehicles.length === 0);
    setNotes('');
    setModalOpen(true);
  };

  const openEditModal = (v) => {
    setEditingId(v._id);
    setRegNumber(v.registrationNumber);
    setVType(v.vehicleType);
    setMake(v.make || '');
    setModel(v.model || '');
    setColor(v.color || '');
    setIsEV(!!v.isEV);
    setIsDefault(!!v.isDefault);
    setNotes(v.notes || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!regNumber.trim()) {
      addToast('Registration plate is required', 'warning');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        registrationNumber: regNumber.trim().toUpperCase(),
        vehicleType: vType,
        make: make.trim() || undefined,
        model: model.trim() || undefined,
        color: color.trim() || undefined,
        isEV,
        isDefault,
        notes: notes.trim() || undefined,
      };

      if (editingId) {
        await vehicleApi.update(editingId, payload);
        addToast('Vehicle updated successfully', 'success');
      } else {
        await vehicleApi.create(payload);
        addToast('Vehicle registered successfully', 'success');
      }

      setModalOpen(false);
      fetchVehicles();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save vehicle', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, reg) => {
    if (!window.confirm(`Are you sure you want to remove vehicle ${reg}?`)) return;
    try {
      const res = await vehicleApi.delete(id);
      if (res.data.success) {
        addToast('Vehicle removed from profile', 'success');
        fetchVehicles();
      }
    } catch (err) {
      // Backend validates if vehicle is engaged in an active session
      addToast(err.response?.data?.message || 'Could not delete vehicle', 'error');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await vehicleApi.setDefault(id);
      addToast('Default vehicle set', 'success');
      fetchVehicles();
    } catch (err) {
      addToast('Failed to set default', 'error');
    }
  };

  const vehicleIcons = {
    car: Car,
    suv: Truck,
    motorcycle: Bike,
    van: Truck,
    other: Car,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Vehicle Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Registered vehicle license plates for rapid slot booking and automated gate barrier entry
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Vehicle</span>
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center text-xs text-slate-400">Loading registered vehicles...</div>
      ) : vehicles.length === 0 ? (
        <div className="p-16 rounded-3xl bg-navy-900 border border-navy-800 text-center max-w-md mx-auto space-y-3">
          <Car className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Vehicles Registered</h3>
          <p className="text-xs text-slate-400">
            Add your car, SUV, or motorcycle to enable fast one-click parking reservations.
          </p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
          >
            Add Your First Vehicle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((v) => {
            const Icon = vehicleIcons[v.vehicleType] || Car;

            return (
              <div
                key={v._id}
                className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between group hover:border-navy-700 transition"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-navy-850 text-emerald-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      {v.isEV && (
                        <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" title="Electric Vehicle">
                          <Zap className="w-3.5 h-3.5" />
                        </span>
                      )}
                      {v.isDefault && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold font-mono">
                          PRIMARY
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Plate number */}
                  <div className="mt-3">
                    <div className="text-lg font-black text-white font-mono tracking-wider">
                      {v.registrationNumber}
                    </div>
                    <div className="text-xs text-slate-300 font-medium">
                      {v.make || 'Vehicle'} {v.model || ''}
                      {v.color ? ` • ${v.color}` : ''}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 uppercase tracking-wider font-mono mt-2">
                    Category: <span className="text-slate-200 capitalize font-sans">{v.vehicleType}</span>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-navy-800 flex items-center justify-between text-xs">
                  {!v.isDefault ? (
                    <button
                      onClick={() => handleSetDefault(v._id)}
                      className="text-slate-400 hover:text-emerald-400 text-xs font-semibold"
                    >
                      Set as Default
                    </button>
                  ) : (
                    <span className="text-emerald-400 text-[11px] font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Default
                    </span>
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(v)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition"
                      title="Edit vehicle"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(v._id, v.registrationNumber)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-navy-800 transition"
                      title="Delete vehicle"
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

      {/* Add / Edit Vehicle Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-navy-900 border border-navy-700 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <h3 className="text-base font-bold text-white">
              {editingId ? 'Edit Vehicle' : 'Register New Vehicle'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  License Plate Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g. KA-01-AB-1234"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-850 border border-navy-700 text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Vehicle Type
                  </label>
                  <select
                    value={vType}
                    onChange={(e) => setVType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-navy-850 border border-navy-700 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="car">Car / Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="motorcycle">Motorcycle</option>
                    <option value="van">Van</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Color
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. White"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-850 border border-navy-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Make
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Maruti / Honda"
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-850 border border-navy-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Swift / Activa"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-850 border border-navy-700 text-white"
                  />
                </div>
              </div>

              <div className="pt-2 space-y-2 border-t border-navy-800">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={isEV}
                    onChange={(e) => setIsEV(e.target.checked)}
                    className="rounded bg-navy-850 border-navy-700 text-emerald-500 w-4 h-4"
                  />
                  <span>Electric Vehicle (EV) — eligible for EV charging bays</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="rounded bg-navy-850 border-navy-700 text-emerald-500 w-4 h-4"
                  />
                  <span>Set as primary default vehicle for reservations</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
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
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition"
                >
                  {saving ? 'Saving...' : 'Save Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
