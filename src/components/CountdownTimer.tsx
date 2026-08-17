import React, { useState, useEffect } from 'react';
import { Clock, Flame } from 'lucide-react';

interface CountdownTimerProps {
  endDate: string;
  compact?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ endDate, compact = false }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(endDate).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  if (timeLeft.isExpired) {
    return (
      <span className="inline-flex items-center gap-1 bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-700">
        Expired
      </span>
    );
  }

  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 24;

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1 text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-md backdrop-blur ${
          isUrgent ? 'bg-rose-950/90 text-rose-300 border border-rose-500/40 animate-pulse' : 'bg-slate-900/80 text-amber-300 border border-slate-700'
        }`}
      >
        {isUrgent ? <Flame className="w-3 h-3 text-rose-400" /> : <Clock className="w-3 h-3 text-amber-400" />}
        <span>
          {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
          {String(timeLeft.hours).padStart(2, '0')}:
          {String(timeLeft.minutes).padStart(2, '0')}:
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
      </div>
    );
  }

  return (
    <div className={`p-2.5 rounded-2xl border flex items-center justify-between gap-2 ${
      isUrgent ? 'bg-rose-950/40 border-rose-500/30 text-rose-200' : 'bg-slate-900/60 border-slate-800 text-slate-300'
    }`}>
      <div className="flex items-center gap-1.5 text-xs font-bold">
        <Clock className={`w-4 h-4 ${isUrgent ? 'text-rose-400 animate-spin' : 'text-amber-400'}`} />
        <span>Limited Time Offer:</span>
      </div>

      <div className="flex items-center gap-1 text-xs font-mono font-black">
        {timeLeft.days > 0 && (
          <span className="bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">{timeLeft.days}d</span>
        )}
        <span className="bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
          {String(timeLeft.hours).padStart(2, '0')}h
        </span>
        <span>:</span>
        <span className="bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
          {String(timeLeft.minutes).padStart(2, '0')}m
        </span>
        <span>:</span>
        <span className="bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-amber-400">
          {String(timeLeft.seconds).padStart(2, '0')}s
        </span>
      </div>
    </div>
  );
};
