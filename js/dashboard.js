// js/dashboard.js
(function () {
    const WORKOUTS_KEY = 'fittrackWorkouts';
    const WATER_KEY = 'fittrackWaterToday';
    const STREAK_VALUE_KEY = 'fittrackStreak';
    const STREAK_LAST_DATE_KEY = 'fittrackStreakLastDate';

    // Run only on pages that have the Today card (dashboard)
    const titleEl = document.getElementById('today-workout-title');
    if (!titleEl) return;

    const subtitleEl = document.getElementById('today-workout-subtitle');
    const waterCard = document.getElementById('water-card');
    const waterLabel = document.getElementById('water-intake-label');
    const waterSubtitle = document.getElementById('water-intake-subtitle');
    const motivationCard = document.getElementById('motivation-card');
    const motivationText = document.getElementById('motivation-card-text');
    const streakValueEl = document.getElementById('streak-value');
    const streakSubtitleEl = document.getElementById('streak-subtitle');

    // ---------- Helpers ----------

    function todayISO() {
        return new Date().toISOString().split('T')[0];
    }

    function loadWorkouts() {
        try {
            const raw = localStorage.getItem(WORKOUTS_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            console.error('Dashboard: failed to load workouts', e);
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

    // ---------- TODAY'S WORKOUT CARD ----------

    // ---------- TODAY'S WORKOUT CARD ----------
    function updateTodayCard() {
        const workoutsByDay = loadWorkouts();
    
        if (!workoutsByDay) {
            titleEl.textContent = 'Rest Day';
            if (subtitleEl) subtitleEl.textContent = 'No workouts scheduled.';
            return workoutsByDay;
        }
    
        const map = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const todayKey = map[new Date().getDay()];
        const todayList = workoutsByDay[todayKey] || [];
    
        if (!todayList.length) {
            titleEl.textContent = 'Rest Day';
            if (subtitleEl) subtitleEl.textContent = 'No workouts scheduled.';
            return workoutsByDay;
        }
    
        // Collect all categories for today (Chest, Arms, etc.)
        const categories = [...new Set(
            todayList
                .map(w => w.category || w.bodyPart || '')  // fallbacks if you used different property names
                .filter(Boolean)
        )];
    
        if (categories.length > 0) {
            // Show categories as main title (like calendar)
            titleEl.textContent = categories.join(', ');
            const count = todayList.length;
            if (subtitleEl) {
                subtitleEl.textContent = count === 1
                    ? '1 workout planned'
                    : `${count} workouts planned`;
            }
        } else {
            // Fallback: use original behaviour (first workout name)
            const incomplete = todayList.find(w => !w.completed);
            const workout = incomplete || todayList[0];
        
            titleEl.textContent = workout.name || 'Planned workout';
        
            const parts = [];
            if (workout.type) parts.push(formatType(workout.type));
            if (workout.time) parts.push(workout.time);
        
            if (subtitleEl) subtitleEl.textContent = parts.join(' • ');
        }
    
        return workoutsByDay;
    }


    // ---------- WATER CARD ----------

    function loadWaterState() {
        const today = todayISO();
        try {
            const raw = localStorage.getItem(WATER_KEY);
            const all = raw ? JSON.parse(raw) : {};
            const entry = all[today] || { current: 0, goal: 2500 };
            return { date: today, current: entry.current, goal: entry.goal, all };
        } catch (e) {
            console.error('Water load error', e);
            return { date: today, current: 0, goal: 2500, all: {} };
        }
    }

    function saveWaterState(state) {
        const all = state.all || {};
        all[state.date] = { current: state.current, goal: state.goal };
        localStorage.setItem(WATER_KEY, JSON.stringify(all));
    }

    function initWaterCard() {
        if (!waterCard || !waterLabel) return;

        let state = loadWaterState();

        function render() {
            waterLabel.textContent = `${state.current} / ${state.goal} ml`;
            if (waterSubtitle) {
                waterSubtitle.textContent = 'Click to add water';
            }
        }

        waterCard.addEventListener('click', () => {
            const input = window.prompt('How much water did you drink? (ml)');
            if (!input) return;
            const amount = parseInt(input, 10);
            if (isNaN(amount) || amount <= 0) return;

            state.current += amount;
            saveWaterState(state);
            render();
        });

        render();
    }

    // ---------- MOTIVATION CARD ----------

    function initMotivationCard() {
        if (!motivationCard || !motivationText) return;

        const quotes = [
            'You don’t have to be extreme, just consistent.',
            'One workout at a time. One day at a time.',
            'The only bad workout is the one that didn’t happen.',
            'Small progress is still progress.',
            'Discipline is choosing what you want most over what you want now.',
            'Your future self is watching you. Don’t let them down.',
            'Strong body, stronger mind.',
            'Show up for yourself today.'
        ];

        function pickQuote() {
            const i = Math.floor(Math.random() * quotes.length);
            motivationText.textContent = quotes[i];
        }

        motivationCard.addEventListener('click', pickQuote);
        pickQuote();
    }

    // ---------- STREAK CARD ----------

    function initStreakCard(workoutsByDay) {
        if (!streakValueEl || !streakSubtitleEl) return;

        // We only know the weekly plan by weekday (sunday..saturday).
        // So we approximate a streak based on whether today has any planned workouts.

        const today = new Date();
        const todayIso = todayISO();

        const rawStreak = parseInt(localStorage.getItem(STREAK_VALUE_KEY), 10);
        let streak = isNaN(rawStreak) ? 0 : rawStreak;
        const lastDate = localStorage.getItem(STREAK_LAST_DATE_KEY) || null;

        const map = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const todayKey = map[today.getDay()];
        const todayList = (workoutsByDay && workoutsByDay[todayKey]) ? workoutsByDay[todayKey] : [];

        // If we've already updated for today, just display
        if (lastDate === todayIso) {
            // no change to streak
        } else {
            // New day: update streak based on whether there is at least one workout today
            if (todayList.length > 0) {
                // Check if yesterday had workouts as well (approx streak)
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayKey = map[yesterday.getDay()];
                const yesterdayList = (workoutsByDay && workoutsByDay[yesterdayKey]) ? workoutsByDay[yesterdayKey] : [];

                if (yesterdayList.length > 0 && lastDate === yesterday.toISOString().split('T')[0]) {
                    streak = streak + 1;
                } else {
                    streak = 1;
                }
            } else {
                streak = 0;
            }

            localStorage.setItem(STREAK_VALUE_KEY, String(streak));
            localStorage.setItem(STREAK_LAST_DATE_KEY, todayIso);
        }

        streakValueEl.textContent = streak === 1 ? '1 Day' : `${streak} Days`;
        streakSubtitleEl.textContent = streak > 0
            ? 'Keep it going!'
            : 'No streak yet – start today!';
    }

    // ---------- INIT DASHBOARD ----------

    const workoutsByDay = updateTodayCard();
    initWaterCard();
    initMotivationCard();
    initStreakCard(workoutsByDay);

})();
