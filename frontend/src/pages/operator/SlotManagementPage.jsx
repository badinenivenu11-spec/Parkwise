import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { facilityApi, slotApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  Layers,
  Plus,
  Zap,
  Accessibility,
  Wrench,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Car,
  Filter,
  Check,
  Edit,
  Search,
  Grid,
  List,
  Sparkles,
  X
} from 'lucide-react';

export default function SlotManagementPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useToast();
  const { role } = useAuth();

  const [facilities, setFacilities] = useState([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState(searchParams.get('facilityId') || '');
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Single Slot Create Modal
  const [singleModalOpen, setSingleModalOpen] = useState(false);
  const [singleSlotNum, setSingleSlotNum] = useState('');
  const [singleSection, setSingleSection] = useState('A');
  const [singleFloor, setSingleFloor] = useState(1);
  const [singleType, setSingleType] = useState('standard');
  const [singleVehicles, setSingleVehicles] = useState(['car', 'suv']);
  const [singleStatus, setSingleStatus] = useState('available');
  const [singleEV, setSingleEV] = useState(false);
  const [singleAccessible, setSingleAccessible] = useState(false);
  const [singleNotes, setSingleNotes] = useState('');
  const [singleSaving, setSingleSaving] = useState(false);

  // Edit Slot Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [editSlotNum, setEditSlotNum] = useState('');
  const [editSection, setEditSection] = useState('A');
  const [editFloor, setEditFloor] = useState(1);
  const [editType, setEditType] = useState('standard');
  const [editVehicles, setEditVehicles] = useState(['car', 'suv']);
  const [editStatus, setEditStatus] = useState('available');
  const [editEV, setEditEV] = useState(false);
  const [editAccessible, setEditAccessible] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  // Bulk add modal
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkSection, setBulkSection] = useState('E');
  const [bulkCount, setBulkCount] = useState(10);
  const [bulkStartNum, setBulkStartNum] = useState(1);
  const [bulkType, setBulkType] = useState('standard');
  const [bulkEV, setBulkEV] = useState(false);
  const [bulkAccessible, setBulkAccessible] = useState(false);
  const [bulkCreating, setBulkCreating] = useState(false);

  // Load facilities
  useEffect(() => {
    const loadFacilities = async () => {
      try {
        const res = await facilityApi.getMyFacilities();
        let facs = res.data.facilities || [];

        // If admin and myFacilities is empty, fetch all facilities
        if (facs.length === 0) {
          const allRes = await facilityApi.getAll({ limit: 50 });
          facs = allRes.data.facilities || [];
        }

        setFacilities(facs);
        if (facs.length > 0 && !selectedFacilityId) {
          setSelectedFacilityId(facs[0]._id);
        }
      } catch (err) {
        console.error('Failed to load facilities', err);
      }
    };

    loadFacilities();
  }, []);

  // Load slots for selected facility
  const fetchSlots = async () => {
    if (!selectedFacilityId) return;
    try {
      setLoading(true);
      const res = await slotApi.getByFacility(selectedFacilityId);
      if (res.data.success) {
        setSlots(res.data.slots || []);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load slots', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [selectedFacilityId]);

  const handleFacilityChange = (id) => {
    setSelectedFacilityId(id);
    setSearchParams({ facilityId: id });
  };

  const handleStatusChange = async (slotId, newStatus) => {
    try {
      const res = await slotApi.updateStatus(slotId, newStatus);
      if (res.data.success) {
        addToast(`Slot status updated to ${newStatus.toUpperCase()}`, 'success');
        setSlots((prev) =>
          prev.map((s) => (s._id === slotId ? { ...s, status: newStatus } : s))
        );
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Status update failed', 'error');
    }
  };

  const handleDeleteSlot = async (slotId, slotNum) => {
    if (!window.confirm(`Permanently delete parking slot ${slotNum}?`)) return;
    try {
      const res = await slotApi.delete(slotId);
      if (res.data.success) {
        addToast(`Slot ${slotNum} deleted successfully`, 'info');
        setSlots((prev) => prev.filter((s) => s._id !== slotId));
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Cannot delete slot', 'error');
    }
  };

  // Open Edit Modal
  const openEditModal = (slot) => {
    setEditingSlot(slot);
    setEditSlotNum(slot.slotNumber || '');
    setEditSection(slot.section || 'A');
    setEditFloor(slot.floor || 1);
    setEditType(slot.slotType || 'standard');
    setEditVehicles(slot.supportedVehicleTypes || ['car', 'suv']);
    setEditStatus(slot.status || 'available');
    setEditEV(!!slot.hasEvCharging);
    setEditAccessible(!!slot.isAccessible);
    setEditNotes(slot.notes || '');
    setEditModalOpen(true);
  };

  // Handle Edit Slot Submit
  const handleEditSlotSubmit = async (e) => {
    e.preventDefault();
    if (!editingSlot) return;
    try {
      setEditSaving(true);
      const res = await slotApi.update(editingSlot._id, {
        slotNumber: editSlotNum.trim().toUpperCase(),
        section: editSection.trim().toUpperCase(),
        floor: parseInt(editFloor) || 1,
        slotType: editType,
        supportedVehicleTypes: editVehicles,
        status: editStatus,
        hasEvCharging: editEV,
        isAccessible: editAccessible,
        notes: editNotes.trim(),
      });

      if (res.data.success) {
        addToast(`Slot ${editSlotNum} updated successfully!`, 'success');
        setEditModalOpen(false);
        setEditingSlot(null);
        fetchSlots();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update slot', 'error');
    } finally {
      setEditSaving(false);
    }
  };

  // Handle Single Slot Create Submit
  const handleSingleSlotSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFacilityId) return;
    if (!singleSlotNum.trim()) {
      addToast('Please enter a slot number (e.g. A25)', 'warning');
      return;
    }

    try {
      setSingleSaving(true);
      const res = await slotApi.create(selectedFacilityId, {
        slotNumber: singleSlotNum.trim().toUpperCase(),
        section: singleSection.trim().toUpperCase(),
        floor: parseInt(singleFloor) || 1,
        slotType: singleType,
        supportedVehicleTypes: singleVehicles,
        status: singleStatus,
        hasEvCharging: singleEV,
        isAccessible: singleAccessible,
        notes: singleNotes.trim(),
      });

      if (res.data.success) {
        addToast(`Slot ${singleSlotNum} created successfully!`, 'success');
        setSingleModalOpen(false);
        setSingleSlotNum('');
        setSingleNotes('');
        fetchSlots();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create slot', 'error');
    } finally {
      setSingleSaving(false);
    }
  };

  // Handle Bulk Create
  const handleBulkCreate = async (e) => {
    e.preventDefault();
    if (!selectedFacilityId) return;
    try {
      setBulkCreating(true);
      const res = await slotApi.createBulk(selectedFacilityId, {
        section: bulkSection.trim().toUpperCase(),
        count: parseInt(bulkCount),
        startNumber: parseInt(bulkStartNum),
        slotType: bulkType,
        hasEvCharging: bulkEV,
        isAccessible: bulkAccessible,
      });

      if (res.data.success) {
        addToast(`${res.data.count} parking spaces generated successfully!`, 'success');
        setBulkModalOpen(false);
        fetchSlots();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Bulk creation failed', 'error');
    } finally {
      setBulkCreating(false);
    }
  };

  const selectedFacility = facilities.find((f) => f._id === selectedFacilityId);

  // Status counters (real-time from state)
  const availCount = slots.filter((s) => s.status === 'available').length;
  const occCount = slots.filter((s) => s.status === 'occupied').length;
  const resCount = slots.filter((s) => s.status === 'reserved').length;
  const oosCount = slots.filter((s) => s.status === 'out_of_service').length;

  // Filtered Slots
  const sections = ['ALL', ...Array.from(new Set(slots.map((s) => s.section || 'A'))).sort()];

  const filteredSlots = slots.filter((slot) => {
    if (searchQuery.trim() && !slot.slotNumber.toLowerCase().includes(searchQuery.trim().toLowerCase())) {
      return false;
    }
    if (selectedSection !== 'ALL' && slot.section !== selectedSection) {
      return false;
    }
    if (statusFilter !== 'ALL' && slot.status !== statusFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-800">
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase border ${
              role === 'admin'
                ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
            }`}>
              {role === 'admin' ? 'Administrator God-Mode' : 'Operator Control'}
            </span>
            <span className="text-xs text-slate-400">• Real-Time MongoDB Persistence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5 mt-1">
            <Layers className="w-7 h-7 text-emerald-400" />
            <span>Slot Management & Floor Inventory</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Full administrative control: Add, edit, delete, toggle maintenance, and configure space attributes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setSingleModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Single Slot</span>
          </button>

          <button
            onClick={() => setBulkModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-navy-850 hover:bg-navy-800 border border-navy-700 text-slate-200 font-bold text-xs transition flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Bulk Generate</span>
          </button>
        </div>
      </div>

      {/* Facility Selector & Live Capacity Banner */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Select Parking Facility
          </label>
          <select
            value={selectedFacilityId}
            onChange={(e) => handleFacilityChange(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-navy-850 border border-navy-700 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
          >
            {facilities.map((f) => (
              <option key={f._id} value={f._id}>
                {f.name} ({f.address?.city || 'India'})
              </option>
            ))}
          </select>
        </div>

        {/* Live Counters */}
        <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-navy-850 border border-navy-800 text-center min-w-[70px]">
            <span className="text-slate-400 text-[10px] block font-sans">Total</span>
            <span className="font-bold text-white text-sm">{slots.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-center min-w-[70px]">
            <span className="text-emerald-400 text-[10px] block font-sans">Available</span>
            <span className="font-bold text-emerald-400 text-sm">{availCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-center min-w-[70px]">
            <span className="text-amber-400 text-[10px] block font-sans">Reserved</span>
            <span className="font-bold text-amber-400 text-sm">{resCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-center min-w-[70px]">
            <span className="text-rose-400 text-[10px] block font-sans">Occupied</span>
            <span className="font-bold text-rose-400 text-sm">{occCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-center min-w-[70px]">
            <span className="text-slate-400 text-[10px] block font-sans">Maintenance</span>
            <span className="font-bold text-slate-300 text-sm">{oosCount}</span>
          </div>
        </div>
      </div>

      {/* Search, Filters & View Toggle Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-navy-900 border border-navy-800 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search slot (e.g. A01)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-navy-850 border border-navy-700 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono w-full"
            />
          </div>

          {/* Section Pills */}
          <div className="flex items-center bg-navy-850 p-1 rounded-xl border border-navy-700 text-xs">
            {sections.map((sec) => (
              <button
                key={sec}
                onClick={() => setSelectedSection(sec)}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  selectedSection === sec
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {sec === 'ALL' ? 'All Sec' : `Sec ${sec}`}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-navy-850 border border-navy-700 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="available">Available Only</option>
            <option value="reserved">Reserved Only</option>
            <option value="occupied">Occupied Only</option>
            <option value="out_of_service">Maintenance Only</option>
          </select>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-navy-850 p-1 rounded-xl border border-navy-700 shrink-0 self-end md:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition ${
              viewMode === 'grid' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Grid View"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg transition ${
              viewMode === 'table' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Table View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Slots Display */}
      {loading ? (
        <div className="py-24 text-center text-xs text-slate-400 space-y-2">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Querying slot bay records from MongoDB...</p>
        </div>
      ) : filteredSlots.length === 0 ? (
        <div className="p-16 rounded-3xl bg-navy-900 border border-navy-800 text-center max-w-md mx-auto space-y-3 shadow-xl">
          <Layers className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Matching Slots Found</h3>
          <p className="text-xs text-slate-400">
            {searchQuery || selectedSection !== 'ALL' || statusFilter !== 'ALL'
              ? 'Try resetting the filters or search query.'
              : 'Add your first parking slot using the buttons above.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {filteredSlots.map((slot) => {
            const statusStyles = {
              available: 'bg-navy-900 border-emerald-500/40 text-emerald-400',
              occupied: 'bg-rose-950/20 border-rose-500/40 text-rose-400',
              reserved: 'bg-amber-950/20 border-amber-500/40 text-amber-400',
              out_of_service: 'bg-slate-900/60 border-slate-700 text-slate-500 opacity-60',
            };

            return (
              <div
                key={slot._id}
                className={`p-3 rounded-2xl border flex flex-col justify-between transition-all space-y-2 ${statusStyles[slot.status] || ''}`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-black tracking-wider text-white">
                      {slot.slotNumber}
                    </span>
                    <div className="flex items-center gap-1">
                      {slot.hasEvCharging && (
                        <Zap className="w-3.5 h-3.5 text-emerald-400" title="EV Fast Charger" />
                      )}
                      {slot.isAccessible && (
                        <Accessibility className="w-3.5 h-3.5 text-blue-400" title="Accessible" />
                      )}
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 capitalize mt-0.5">
                    Sec {slot.section} • Fl {slot.floor || 1} • {slot.slotType}
                  </div>
                </div>

                {/* Status Toggle & Action Buttons */}
                <div className="space-y-1.5 pt-2 border-t border-navy-800">
                  <select
                    value={slot.status}
                    onChange={(e) => handleStatusChange(slot._id, e.target.value)}
                    className="w-full bg-navy-850 border border-navy-700 text-[10px] rounded px-1.5 py-1 text-slate-200 focus:outline-none"
                  >
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="occupied">Occupied</option>
                    <option value="out_of_service">Maintenance</option>
                  </select>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => openEditModal(slot)}
                      className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-navy-850 transition"
                      title="Edit slot details"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteSlot(slot._id, slot.slotNumber)}
                      className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-navy-850 transition"
                      title="Delete slot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[10px] uppercase text-slate-500 font-bold tracking-wider border-b border-navy-800">
              <tr>
                <th className="py-3 px-3">Slot #</th>
                <th className="py-3 px-3">Section</th>
                <th className="py-3 px-3">Floor</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Features</th>
                <th className="py-3 px-3">Allowed Vehicles</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60 font-mono">
              {filteredSlots.map((slot) => (
                <tr key={slot._id} className="hover:bg-navy-850/50 transition">
                  <td className="py-3 px-3 font-black text-white text-sm">
                    {slot.slotNumber}
                  </td>
                  <td className="py-3 px-3 font-sans text-slate-300">Sec {slot.section}</td>
                  <td className="py-3 px-3">Level {slot.floor || 1}</td>
                  <td className="py-3 px-3 font-sans capitalize text-slate-200">{slot.slotType}</td>
                  <td className="py-3 px-3 font-sans">
                    <div className="flex items-center gap-1.5">
                      {slot.hasEvCharging && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                          ⚡ EV
                        </span>
                      )}
                      {slot.isAccessible && (
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-bold">
                          ♿ Accessible
                        </span>
                      )}
                      {!slot.hasEvCharging && !slot.isAccessible && (
                        <span className="text-slate-500 text-[11px]">—</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-sans text-slate-400">
                    {slot.supportedVehicleTypes?.join(', ') || 'car'}
                  </td>
                  <td className="py-3 px-3 font-sans">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                      slot.status === 'available'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : slot.status === 'reserved'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : slot.status === 'occupied'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {slot.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(slot)}
                        className="px-2.5 py-1 rounded-lg bg-navy-850 hover:bg-navy-800 border border-navy-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <Edit className="w-3 h-3 text-emerald-400" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteSlot(slot._id, slot.slotNumber)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-navy-850 transition"
                        title="Delete slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SINGLE SLOT CREATE MODAL */}
      {singleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-navy-900 border border-navy-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-navy-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Add New Parking Slot</span>
              </h3>
              <button
                onClick={() => setSingleModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSingleSlotSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold uppercase mb-1">
                    Slot Identifier (e.g. A01, VIP-1) *
                  </label>
                  <input
                    type="text"
                    value={singleSlotNum}
                    onChange={(e) => setSingleSlotNum(e.target.value)}
                    placeholder="A01"
                    className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-700 text-white font-mono font-bold uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold uppercase mb-1">
                    Section Code *
                  </label>
                  <input
                    type="text"
                    maxLength="4"
                    value={singleSection}
                    onChange={(e) => setSingleSection(e.target.value)}
                    placeholder="A"
                    className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-700 text-white font-mono font-bold uppercase"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold uppercase mb-1">
                    Floor Level
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={singleFloor}
                    onChange={(e) => setSingleFloor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-700 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold uppercase mb-1">
                    Slot Type
                  </label>
                  <select
                    value={singleType}
                    onChange={(e) => setSingleType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-700 text-white"
                  >
                    <option value="standard">Standard</option>
                    <option value="compact">Compact</option>
                    <option value="large">Large / SUV</option>
                    <option value="accessible">Accessible</option>
                    <option value="ev">EV Bay</option>
                    <option value="vip">VIP</option>
                    <option value="motorcycle">Motorcycle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold uppercase mb-1">
                    Initial Status
                  </label>
                  <select
                    value={singleStatus}
                    onChange={(e) => setSingleStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-700 text-white"
                  >
                    <option value="available">Available</option>
                    <option value="out_of_service">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-navy-850 border border-navy-800 text-slate-300">
                  <input
                    type="checkbox"
                    checked={singleEV}
                    onChange={(e) => setSingleEV(e.target.checked)}
                    className="rounded bg-navy-900 border-navy-700 text-emerald-500"
                  />
                  <span>⚡ EV Fast Charging</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-navy-850 border border-navy-800 text-slate-300">
                  <input
                    type="checkbox"
                    checked={singleAccessible}
                    onChange={(e) => setSingleAccessible(e.target.checked)}
                    className="rounded bg-navy-900 border-navy-700 text-blue-500"
                  />
                  <span>♿ Wheelchair Access</span>
                </label>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold uppercase mb-1">
                  Slot Location Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Near Elevator C, Level 1"
                  value={singleNotes}
                  onChange={(e) => setSingleNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-700 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-navy-800">
                <button
                  type="button"
                  onClick={() => setSingleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-navy-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={singleSaving}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{singleSaving ? 'Saving...' : 'Create Slot'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SLOT MODAL */}
      {editModalOpen && editingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-navy-900 border border-navy-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-navy-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit className="w-4 h-4 text-emerald-400" />
                <span>Edit Parking Slot: {editingSlot.slotNumber}</span>
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSlotSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold uppercase mb-1">
                    Slot Identifier *
                  </label>
                  <input
                    type="text"
                    value={editSlotNum}
                    onChange={(e) => setEditSlotNum(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-700 text-white font-mono font-bold uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold uppercase mb-1">
                    Section Code *
                  </label>
                  <input
                    type="text"
                    maxLength="4"
                    value={editSection}
                    onChange={(e) => setEditSection(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-700 text-white font-mono font-bold uppercase"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold uppercase mb-1">
                    Floor Level
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={editFloor}
                    onChange={(e) => setEditFloor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-700 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold uppercase mb-1">
                    Slot Type
                  </label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-700 text-white"
                  >
                    <option value="standard">Standard</option>
                    <option value="compact">Compact</option>
                    <option value="large">Large / SUV</option>
                    <option value="accessible">Accessible</option>
                    <option value="ev">EV Bay</option>
                    <option value="vip">VIP</option>
                    <option value="motorcycle">Motorcycle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold uppercase mb-1">
                    Live Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-700 text-white font-bold"
                  >
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="occupied">Occupied</option>
                    <option value="out_of_service">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-navy-850 border border-navy-800 text-slate-300">
                  <input
                    type="checkbox"
                    checked={editEV}
                    onChange={(e) => setEditEV(e.target.checked)}
                    className="rounded bg-navy-900 border-navy-700 text-emerald-500"
                  />
                  <span>⚡ EV Fast Charging</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-navy-850 border border-navy-800 text-slate-300">
                  <input
                    type="checkbox"
                    checked={editAccessible}
                    onChange={(e) => setEditAccessible(e.target.checked)}
                    className="rounded bg-navy-900 border-navy-700 text-blue-500"
                  />
                  <span>♿ Wheelchair Access</span>
                </label>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold uppercase mb-1">
                  Notes / Location Details
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g. Near Barrier Exit 1"
                  className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-700 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-navy-800">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-navy-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editSaving ? 'Saving Changes...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK ADD SLOTS MODAL */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-navy-900 border border-navy-700 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-navy-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Bulk Generate Parking Spaces</span>
              </h3>
              <button
                onClick={() => setBulkModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBulkCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Section Code (e.g. A, B, C)
                  </label>
                  <input
                    type="text"
                    maxLength="2"
                    value={bulkSection}
                    onChange={(e) => setBulkSection(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-700 text-white font-mono font-bold uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Number of Spaces
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={bulkCount}
                    onChange={(e) => setBulkCount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-700 text-white font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Start Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={bulkStartNum}
                    onChange={(e) => setBulkStartNum(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-700 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Slot Type
                  </label>
                  <select
                    value={bulkType}
                    onChange={(e) => setBulkType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-700 text-white"
                  >
                    <option value="standard">Standard</option>
                    <option value="compact">Compact</option>
                    <option value="large">Large / SUV</option>
                    <option value="accessible">Accessible</option>
                    <option value="ev">EV Bay</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={bulkEV}
                    onChange={(e) => setBulkEV(e.target.checked)}
                    className="rounded bg-navy-850 border-navy-700 text-emerald-500"
                  />
                  <span>Install EV Fast Charger on these slots</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={bulkAccessible}
                    onChange={(e) => setBulkAccessible(e.target.checked)}
                    className="rounded bg-navy-850 border-navy-700 text-blue-500"
                  />
                  <span>Designate as Wheelchair Accessible</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-navy-800">
                <button
                  type="button"
                  onClick={() => setBulkModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-navy-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bulkCreating}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{bulkCreating ? 'Generating...' : 'Create Bays'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
