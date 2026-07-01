import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, UserCheck, UserPlus, DollarSign, AlarmClock, CalendarClock, Dumbbell } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { api } from '../api/axios';
import { StatCard } from '../components/StatCard';
import { DashboardStats } from '../types';
import { useAuth } from '../context/AuthContext';
import { ComingSoon } from '../components/ComingSoon';

const PIE_COLORS = ['#FF5A1F', '#00E5A0', '#7C6CFF', '#FFB020', '#3AA6FF', '#F45B9C'];

export default function Dashboard() {
  const { user } = useAuth();
  const canViewDashboard = user?.role === 'ADMIN' || user?.role === 'RECEPTIONIST';

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => (await api.get('/dashboard/stats')).data.data,
    enabled: canViewDashboard,
  });

  const { data: revenueChart } = useQuery({
    queryKey: ['dashboard-revenue'],
    queryFn: async () => (await api.get('/dashboard/charts/revenue')).data.data,
  });

  const { data: growthChart } = useQuery({
    queryKey: ['dashboard-growth'],
    queryFn: async () => (await api.get('/dashboard/charts/membership-growth')).data.data,
  });

  const { data: popularPlans } = useQuery({
    queryKey: ['dashboard-plans'],
    queryFn: async () => (await api.get('/dashboard/charts/popular-plans')).data.data,
    enabled: canViewDashboard,
  });

  if (!canViewDashboard) {
    return <ComingSoon title={`Welcome, ${user?.profile?.firstName || user?.email}`} />;
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="glass h-24 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-ink-muted">Here's what's happening at the gym today.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Members" value={stats?.totalMembers ?? 0} icon={<Users size={22} />} accent="kinetic" percent={100} index={0} />
        <StatCard label="Active Members" value={stats?.activeMembers ?? 0} icon={<UserCheck size={22} />} accent="pulse" percent={stats ? (stats.activeMembers / Math.max(stats.totalMembers, 1)) * 100 : 0} index={1} />
        <StatCard label="New This Month" value={stats?.newMembersThisMonth ?? 0} icon={<UserPlus size={22} />} accent="volt" percent={60} index={2} />
        <StatCard label="Monthly Revenue" value={`ETB ${Number(stats?.monthlyRevenue ?? 0).toLocaleString()}`} icon={<DollarSign size={22} />} accent="kinetic" percent={80} index={3} />
        <StatCard label="Attendance Today" value={stats?.attendanceToday ?? 0} icon={<AlarmClock size={22} />} accent="pulse" percent={50} index={4} />
        <StatCard label="Expiring Soon (7d)" value={stats?.expiringMemberships ?? 0} icon={<CalendarClock size={22} />} accent="volt" percent={30} index={5} />
        <StatCard label="Trainers" value={stats?.trainersCount ?? 0} icon={<Dumbbell size={22} />} accent="kinetic" percent={90} index={6} />
        <StatCard label="Upcoming Classes" value={stats?.upcomingClasses?.length ?? 0} icon={<CalendarClock size={22} />} accent="pulse" percent={40} index={7} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 lg:col-span-2">
          <h2 className="mb-4 font-display text-sm font-semibold text-ink-muted">Revenue — last 6 months</h2>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueChart || []}>
              <defs>
                <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF5A1F" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#FF5A1F" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" stroke="#8B93A7" fontSize={12} />
              <YAxis stroke="#8B93A7" fontSize={12} />
              <Tooltip contentStyle={{ background: '#131826', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="#FF5A1F" fill="url(#revGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-5">
          <h2 className="mb-4 font-display text-sm font-semibold text-ink-muted">Popular plans</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={popularPlans || []} dataKey="count" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {(popularPlans || []).map((_: unknown, i: number) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#131826', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-2xl p-5">
        <h2 className="mb-4 font-display text-sm font-semibold text-ink-muted">Membership growth — last 6 months</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={growthChart || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="month" stroke="#8B93A7" fontSize={12} />
            <YAxis stroke="#8B93A7" fontSize={12} />
            <Tooltip contentStyle={{ background: '#131826', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
            <Bar dataKey="newMembers" fill="#7C6CFF" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
