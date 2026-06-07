import React, { useMemo } from "react";
import { Award, TrendingUp, Calendar, Star } from "lucide-react";

function StreakCounter({ activityDates }) {
  const { currentStreak, highestStreak, consistencyScore, weeklyCount, milestone } = useMemo(() => {
    if (!activityDates || activityDates.length === 0) {
      return { currentStreak: 0, highestStreak: 0, consistencyScore: 0, weeklyCount: 0, milestone: null };
    }

    const normalizeDateString = (value) => {
      if (typeof value !== "string") return null;
      const candidate = value.split("T")[0];
      return /^\d{4}-\d{2}-\d{2}$/.test(candidate) ? candidate : null;
    };

    const msPerDay = 1000 * 60 * 60 * 24;
    const toDayIndex = (ymd) => {
      const [year, month, day] = ymd.split("-").map(Number);
      return Math.floor(Date.UTC(year, month - 1, day) / msPerDay);
    };

    const getLocalISODate = () => {
      const now = new Date();
      const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
      return local.toISOString().split("T")[0];
    };

    const uniqueSortedDates = [
      ...new Set(activityDates.map(normalizeDateString).filter(Boolean)),
    ].sort();

    // Highest streak
    let highest = 1;
    let tempStreak = 1;
    for (let i = 1; i < uniqueSortedDates.length; i++) {
      const diff = toDayIndex(uniqueSortedDates[i]) - toDayIndex(uniqueSortedDates[i - 1]);
      if (diff === 1) tempStreak++;
      else tempStreak = 1;
      if (tempStreak > highest) highest = tempStreak;
    }

    // Current streak
    let streakCount = 0;
    let expectedDay = toDayIndex(getLocalISODate());
    for (let i = uniqueSortedDates.length - 1; i >= 0; i--) {
      const dayIndex = toDayIndex(uniqueSortedDates[i]);
      if (dayIndex > expectedDay) continue;
      if (dayIndex === expectedDay) { streakCount++; expectedDay -= 1; }
      else break;
    }

    // Weekly count - last 7 days
    const todayIndex = toDayIndex(getLocalISODate());
    const weeklyCount = uniqueSortedDates.filter(d => {
      const diff = todayIndex - toDayIndex(d);
      return diff >= 0 && diff < 7;
    }).length;

    // Consistency score - last 30 days
    const activeLast30 = uniqueSortedDates.filter(d => {
      const diff = todayIndex - toDayIndex(d);
      return diff >= 0 && diff < 30;
    }).length;
    const consistencyScore = Math.round((activeLast30 / 30) * 100);

    // Milestone badge
    let milestone = null;
    if (streakCount >= 30) milestone = { label: "🔥 30 Day Legend!", color: "text-red-500" };
    else if (streakCount >= 14) milestone = { label: "⚡ 2 Week Warrior!", color: "text-purple-500" };
    else if (streakCount >= 7) milestone = { label: "🌟 7 Day Star!", color: "text-yellow-500" };
    else if (streakCount >= 3) milestone = { label: "👍 3 Day Starter!", color: "text-green-500" };

    return { currentStreak: streakCount, highestStreak: highest, consistencyScore, weeklyCount, milestone };
  }, [activityDates]);

  return (
    <main className="md:p-12 p-4">
      <div className="flex flex-col items-center space-y-4">

        {/* Circle with fire icon and current streak */}
        <div className="w-24 h-24 rounded-full border-4 border-orange-500 flex flex-col items-center justify-center shadow-lg">
          <img src="/assets/fire.svg" className="w-10 h-10" alt="fire" />
          <span className="text-xl font-bold text-surface-800 dark:text-surface-200">
            {currentStreak}
          </span>
        </div>

        {/* Highest streak */}
        <div className="text-sm text-surface-600 dark:text-surface-300 flex items-center gap-1">
          <Award size={24} color="#ff9300" />Highest: {highestStreak} day{highestStreak !== 1 ? "s" : ""}
        </div>

        {/* Weekly Summary */}
        <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-300">
          <Calendar size={18} color="#3b82f6" />
          <span>This week: <strong>{weeklyCount}/7</strong> days</span>
        </div>

        {/* Consistency Score */}
        <div className="w-full">
          <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-300 mb-1">
            <TrendingUp size={18} color="#10b981" />
            <span>Consistency: <strong>{consistencyScore}%</strong></span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${consistencyScore}%` }}
            />
          </div>
        </div>

        {/* Milestone Badge */}
        {milestone && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${milestone.color}`}>
            <Star size={16} />
            {milestone.label}
          </div>
        )}

      </div>
    </main>
  );
}

export default StreakCounter;