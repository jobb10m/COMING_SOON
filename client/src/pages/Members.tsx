import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../api/axios';
import { Paginated, Member } from '../types';
import { useAuth } from '../context/AuthContext';

export default function Members() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'suspended'>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<Paginated<Member>>({
    queryKey: ['members', search, status, page],
    queryFn: async () =>
      (await api.get('/members', { params: { search, status, page, limit: 10 } })).data,
  });

  const canManage = user?.role === 'ADMIN' || user?.role === 'RECEPTIONIST';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Members</h1>
          <p className="text-sm text-ink-muted">{data?.pagination.total ?? 0} total members</p>
        </div>
        {canManage && (
          <Link
            to="/members/new"
            className="focus-ring flex items-center gap-2 rounded-xl bg-kinetic px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            <Plus size={16} /> Add Member
          </Link>
        )}
      </div>

      <div className="glass flex flex-wrap items-center gap-3 rounded-2xl p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, phone, or email…"
            className="focus-ring w-full rounded-xl border border-border bg-base/40 py-2 pl-9 pr-3 text-sm"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as typeof status);
            setPage(1);
          }}
          className="focus-ring rounded-xl border border-border bg-base/40 px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-base/40" />
            ))}
          </div>
        ) : data && data.data.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-ink-muted">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Contact</th>
                <th className="px-5 py-3 font-medium">Trainer</th>
                <th className="px-5 py-3 font-medium">Plan</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((m, i) => (
                <motion.tr
                  key={m.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border/60 last:border-0 hover:bg-base/30"
                >
                  <td className="px-5 py-3 font-medium">
                    <Link to={`/members/${m.id}`} className="hover:text-kinetic">
                      {m.firstName} {m.lastName}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-ink-muted">{m.user?.email || m.phone || '—'}</td>
                  <td className="px-5 py-3 text-ink-muted">
                    {m.assignedTrainer ? `${m.assignedTrainer.firstName} ${m.assignedTrainer.lastName}` : '—'}
                  </td>
                  <td className="px-5 py-3 text-ink-muted">{m.memberships?.[0]?.plan?.name || '—'}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        m.isSuspended ? 'bg-kinetic/15 text-kinetic' : 'bg-pulse/15 text-pulse'
                      }`}
                    >
                      {m.isSuspended ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-10 text-center text-ink-muted">
            No members match your search yet. Try a different name or add a new member.
          </div>
        )}
      </div>

      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="focus-ring rounded-lg border border-border p-2 disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-ink-muted">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </span>
          <button
            disabled={page >= data.pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="focus-ring rounded-lg border border-border p-2 disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
