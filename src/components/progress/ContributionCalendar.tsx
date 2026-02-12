import { useMemo } from 'react';
import { useStore } from '../../store/StoreProvider';

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function ContributionCalendar() {
  const { store } = useStore();

  const calendarData = useMemo(() => {
    const sessions = store.getTable('sessions');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get current month boundaries
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    // Get all completed sessions from current month
    const completedSessions = Object.values(sessions).filter((s) => {
      if (s.status !== 'completed' || !s.start_time) return false;
      const sessionDate = new Date(s.start_time as number);
      return (
        sessionDate.getFullYear() === currentYear &&
        sessionDate.getMonth() === currentMonth
      );
    });

    // Create a set of dates that have workouts
    const workoutDates = new Set<string>();
    completedSessions.forEach((s) => {
      const date = new Date(s.start_time as number);
      date.setHours(0, 0, 0, 0);
      const key = date.toISOString().split('T')[0];
      workoutDates.add(key);
    });

    // Calculate first day of week (Sunday = 0)
    const firstDayOfWeek = firstDayOfMonth.getDay();

    // Generate calendar grid
    const weeks: Array<Array<{ day: number; hasWorkout: boolean; isToday: boolean; isCurrentMonth: boolean }>> = [];
    let currentWeek: Array<{ day: number; hasWorkout: boolean; isToday: boolean; isCurrentMonth: boolean }> = [];

    // Add padding days from previous month
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({
        day: 0,
        hasWorkout: false,
        isToday: false,
        isCurrentMonth: false,
      });
    }

    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      date.setHours(0, 0, 0, 0);
      const key = date.toISOString().split('T')[0];
      const hasWorkout = workoutDates.has(key);
      const isToday = date.toDateString() === today.toDateString();

      currentWeek.push({
        day,
        hasWorkout,
        isToday,
        isCurrentMonth: true,
      });

      // Start new week on Sunday
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    // Add padding days from next month
    while (currentWeek.length < 7 && currentWeek.length > 0) {
      currentWeek.push({
        day: 0,
        hasWorkout: false,
        isToday: false,
        isCurrentMonth: false,
      });
    }
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return {
      weeks,
      monthName: monthNames[currentMonth],
      year: currentYear,
      totalWorkouts: completedSessions.length,
    };
  }, [store, store.getTable('sessions')]);

  return (
    <div className="animate-fade-slide-up rounded-2xl bg-atlas-surface border border-atlas-border p-4 elevation-1">
      <div className="mb-4">
        <h3 className="text-base font-bold text-atlas-text mb-1">
          {calendarData.monthName} {calendarData.year}
        </h3>
        <p className="text-xs text-atlas-text-muted">
          {calendarData.totalWorkouts} workout{calendarData.totalWorkouts !== 1 ? 's' : ''} this month
        </p>
      </div>

      {/* Calendar grid */}
      <div className="w-full">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-[10px] font-semibold text-atlas-text-muted py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarData.weeks.map((week, weekIndex) =>
            week.map((dayData, dayIndex) => {
              if (!dayData.isCurrentMonth) {
                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className="aspect-square flex items-center justify-center text-xs text-atlas-text-muted/30"
                  />
                );
              }

              return (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs transition-all duration-150 ${
                    dayData.isToday
                      ? dayData.hasWorkout
                        ? 'text-white border-2'
                        : 'bg-atlas-surface-alt/30 border-2 border-atlas-accent'
                      : dayData.hasWorkout
                        ? 'text-white border-2'
                        : 'bg-atlas-surface-alt/30'
                  }`}
                  style={
                    dayData.hasWorkout && !dayData.isToday
                      ? { backgroundColor: '#22c55e', borderColor: '#22c55e' }
                      : dayData.hasWorkout && dayData.isToday
                        ? { backgroundColor: '#22c55e', borderColor: '#22c55e' }
                        : dayData.isToday && !dayData.hasWorkout
                          ? { borderColor: '#3b82f6' }
                          : undefined
                  }
                  title={
                    dayData.hasWorkout
                      ? `${dayData.day}: Workout logged`
                      : `${dayData.day}`
                  }
                >
                  <span
                    className={`font-medium ${
                      dayData.isToday
                        ? dayData.hasWorkout
                          ? 'text-white font-semibold'
                          : 'text-atlas-accent font-bold'
                        : dayData.hasWorkout
                          ? 'text-white font-semibold'
                          : 'text-atlas-text-muted'
                    }`}
                  >
                    {dayData.day}
                  </span>
                  {dayData.isToday && (
                    <div className={`w-1 h-1 rounded-full mt-0.5 ${dayData.hasWorkout ? 'bg-white' : 'bg-atlas-accent'}`} />
                  )}
                </div>
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
}
