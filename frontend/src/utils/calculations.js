/**
 * Calculations for PuffOff recovery, savings, and streaks
 */

export function calculateCleanTime(lastRelapseDate) {
  if (!lastRelapseDate) return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 };
  const diff = Math.max(0, Date.now() - new Date(lastRelapseDate).getTime());
  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return { days, hours, minutes, seconds, totalMs: diff };
}

export function calculateMoneySaved(dailySpending, lastRelapseDate) {
  if (!dailySpending || !lastRelapseDate) return '0.00';
  const days = Math.max(0, (Date.now() - new Date(lastRelapseDate).getTime()) / (1000 * 60 * 60 * 24));
  return (days * Number(dailySpending)).toFixed(2);
}

export function calculateTotalSaved(addictions = []) {
  return addictions.reduce((acc, a) => {
    const days = Math.max(0, (Date.now() - new Date(a.lastRelapseDate).getTime()) / (1000 * 60 * 60 * 24));
    return acc + (days * (Number(a.dailySpending) || 0));
  }, 0).toFixed(2);
}

export function calculateLongestStreak(addictions = []) {
  if (!addictions || addictions.length === 0) {
    return { maxCleanDays: 0, maxCleanVice: null };
  }
  const sorted = [...addictions].sort(
    (a, b) => new Date(a.lastRelapseDate).getTime() - new Date(b.lastRelapseDate).getTime()
  );
  const maxCleanVice = sorted[0];
  const maxCleanDays = Math.max(
    0,
    Math.floor((Date.now() - new Date(maxCleanVice.lastRelapseDate).getTime()) / (1000 * 60 * 60 * 24))
  );
  return { maxCleanDays, maxCleanVice };
}
