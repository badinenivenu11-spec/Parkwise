import React, { useEffect, useState } from 'react';
import { userApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  Search,
  Shield,
  Car,
  Building2,
  CheckCircle2,
  Ban,
  Clock,
  Sparkles,
  ArrowUpDown,
  Trash2
} from 'lucide-react';

export default function UserManagementPage() {
  const { user: currentAdmin } = useAuth();
  const { addToast } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userApi.getAll();
      if (res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load user accounts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await userApi.updateRole(userId, newRole);
      if (res.data.success) {
        addToast(`Role updated to ${newRole.toUpperCase()}`, 'success');
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update role', 'error');
    }
  };

  const handleToggleActive = async (userId) => {
    try {
      const res = await userApi.toggleActive(userId);
      if (res.data.success) {
        const u = res.data.user;
        addToast(`User ${u.isActive ? 'activated' : 'suspended'}`, 'info');
        setUsers((prev) =>
          prev.map((item) => (item._id === userId ? { ...item, isActive: u.isActive } : item))
        );
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Toggle failed', 'error');
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Permanently delete account for "${userEmail}" from the platform? This cannot be undone.`)) return;
    try {
      const res = await userApi.delete(userId);
      if (res.data.success) {
        addToast(`User account ${userEmail} permanently deleted`, 'info');
        setUsers((prev) => prev.filter((u) => u._id !== userId));
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete user failed', 'error');
    }
  };

  const filtered = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (search.trim()) {
      const s = search.toLowerCase();
      return (
        u.email?.toLowerCase().includes(s) ||
        u.name?.toLowerCase().includes(s)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-purple-400" />
            <span>Demo User Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Audit registered identities, update experience roles, and toggle access states
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 bg-navy-900 border border-navy-800 px-3 py-1.5 rounded-xl">
          Total Users: <strong className="text-white">{users.length}</strong>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search by user name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-navy-850 border border-navy-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-2 text-xs">
          {['ALL', 'driver', 'operator', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl font-semibold border transition ${
                roleFilter === r
                  ? 'bg-purple-600 border-purple-500 text-white shadow-md'
                  : 'bg-navy-850 border-navy-700 text-slate-400 hover:text-white'
              }`}
            >
              {r === 'ALL' ? 'All Roles' : r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="py-24 text-center text-xs text-slate-400">Loading user directory...</div>
      ) : (
        <div className="bg-navy-900 border border-navy-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-navy-950 text-slate-500 uppercase text-[10px] tracking-wider border-b border-navy-800">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4">Last Activity</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60">
                {filtered.map((u) => {
                  const roleColors = {
                    driver: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                    operator: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                    admin: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                  };

                  return (
                    <tr key={u._id} className="hover:bg-navy-850/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-navy-800 border border-navy-700 text-purple-400 font-bold flex items-center justify-center text-xs shrink-0">
                            {u.name ? u.name[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs">{u.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold uppercase border bg-navy-850 focus:outline-none ${roleColors[u.role] || ''}`}
                        >
                          <option value="driver">Driver</option>
                          <option value="operator">Operator</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono border ${
                            u.isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {u.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 font-mono">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 font-mono">
                        {u.lastLogin ? new Date(u.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleActive(u._id)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${
                              u.isActive
                                ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30'
                                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            }`}
                          >
                            {u.isActive ? 'Suspend' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u._id, u.email)}
                            className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-navy-850 transition"
                            title="Delete User Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
