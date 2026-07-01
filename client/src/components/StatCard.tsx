import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  accent?: 'kinetic' | 'pulse' | 'volt';
  percent?: number; // 0-100, drives the ring gauge
  index?: number;
}

const ACCENT_HEX: Record<string, string> = {
  kinetic: '#FF5A1F',
  pulse: '#00E5A0',
  volt: '#7C6CFF',
};

export function StatCard({ label, value, icon, accent = 'kinetic', percent = 70, index = 0 }: StatCardProps) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference;
  const color = ACCENT_HEX[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="glass rounded-2xl p-5 flex items-center gap-4"
    >
      <div className="relative h-16 w-16 shrink-0">
        <svg className="ring-gauge h-16 w-16" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={radius} fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="5" />
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center" style={{ color }}>
          {icon}
        </div>
      </div>
      <div className="min-w-0">
        <p className="font-display text-2xl font-bold leading-tight truncate">{value}</p>
        <p className="text-sm text-ink-muted truncate">{label}</p>
      </div>
    </motion.div>
  );
}
