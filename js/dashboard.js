(function () {
    const STORAGE_KEY = 'fittrackWorkouts';

    const titleEl = document.getElementById('today-workout-title');
    const subtitleEl = document.getElementById('today-workout-subtitle');

    // Only run on pages that have the Today card
    if (!titleEl) return;

    function loadWorkouts() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            console.error('Failed to load workouts for dashboard', e);
            return null;
        }
    }

    function formatType(type) {
        switch (type) {
            case 'cardio': return 'Cardio';
            case 'mobility': return 'Mobility';
            case 'rest': return 'Rest / Recovery';
            default: return 'Strength';
        }
    }

    const workoutsByDay = loadWorkouts();
    if (!workoutsByDay) {
        titleEl.textContent = 'Rest Day';
        subtitleEl.textContent = 'No workouts scheduled.';
        return;
    }

    const map = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayKey = map[new Date().getDay()];
    const todayList = (workoutsByDay[todayKey] || []);

    if (!todayList.length) {
        titleEl.textContent = 'Rest Day';
        subtitleEl.textContent = 'No workouts scheduled.';
        return;
    }

    // Prefer the first incomplete workout, otherwise just take the first
    const incomplete = todayList.find(w => !w.completed);
    const workout = incomplete || todayList[0];

    titleEl.textContent = workout.name || 'Planned workout';

    const parts = [];
    if (workout.type) parts.push(formatType(workout.type));
    if (workout.time) parts.push(workout.time);

    subtitleEl.textContent = parts.join(' • ');
})();
