// js/dashboard.js
(function () {

    document.addEventListener("DOMContentLoaded", () => {
        updateTodayWorkoutCard();
        initWaterCard();
        initMotivationCard();
        updateStreakCard();
    });

    // ---------- Shared helpers ----------

    const WORKOUTS_KEY = "fittrackWorkouts";
    const WATER_KEY = "fittrackWaterToday";

    function loadWorkouts() {
        try {
            const raw = localStorage.getItem(WORKOUTS_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            console.error("Dashboard: failed to load workouts", e);
            return {};
        }
    }

    function todayKey() {
        return new Date().toISOString().split("T")[0];
    }

    // ---------- Today's Workout card ----------

    function updateTodayWorkoutCard() {
        const titleEl = document.getElementById("today-workout-title");
        const subtitleEl = document.getElementById("today-workout-subtitle");
        if (!titleEl) return;

        const workouts = loadWorkouts();
        const key = todayKey();
        const list = workouts[key] || [];

        if (!list.length) {
            titleEl.textContent = "Rest Day";
            if (subtitleEl) subtitleEl.textContent = "No workouts scheduled.";
            return;
        }

        if (list.length === 1) {
            titleEl.textContent = list[0].name || "1 Workout";
        } else {
            titleEl.textContent = `${list.length} Workouts Planned`;
        }

        const categories = [...new Set(list.map(w => w.category).filter(Boolean))];
        if (subtitleEl) {
            subtitleEl.textContent = categories.length
                ? categories.join(", ")
                : "";
        }
    }

    // ---------- Water Intake card ----------

    function initWaterCard() {
        const card = document.getElementById("water-card");
        const label = document.getElementById("water-intake-label");
        const subtitle = document.getElementById("water-intake-subtitle");
        if (!card || !label) return;

        let state = loadWaterState();

        function render() {
            label.textContent = `${state.current} / ${state.goal} ml`;
            if (subtitle) subtitle.textContent = "Click to add water";
        }

        card.addEventListener("click", () => {
            const input = window.prompt("How much water did you drink? (ml)");
            if (!input) return;
            const amount = parseInt(input, 10);
            if (isNaN(amount) || amount <= 0) return;

            state.current += amount;
            saveWaterState(state);
            render();
        });

        render();
    }

    function loadWaterState() {
        const today = todayKey();
        try {
            const raw = localStorage.getItem(WATER_KEY);
            const all = raw ? JSON.parse(raw) : {};
            const entry = all[today] || { current: 0, goal: 2500 };
            return { date: today, current: entry.current, goal: entry.goal, all };
        } catch (e) {
            console.error("Water load error", e);
            return { date: today, current: 0, goal: 2500, all: {} };
        }
    }

    function saveWaterState(state) {
        const all = state.all || {};
        all[state.date] = { current: state.current, goal: state.goal };
        localStorage.setItem(WATER_KEY, JSON.stringify(all));
    }

    // ---------- Motivation card ----------

    function initMotivationCard() {
        const card = document.getElementById("motivation-card");
        const textEl = document.getElementById("motivation-card-text");
        if (!card || !textEl) return;

        const quotes = [
            "You don’t have to be extreme, just consistent.",
            "One workout at a time. One day at a time.",
            "The only bad workout is the one that didn’t happen.",
            "Small progress is still progress.",
            "Discipline is choosing what you want most over what you want now.",
            "Your future self is watching you. Don’t let them down.",
            "Strong body, stronger mind.",
            "Show up for yourself today."
        ];

        function pickQuote() {
            const i = Math.floor(Math.random() * quotes.length);
            textEl.textContent = quotes[i];
        }

        card.addEventListener("click", pickQuote);
        pickQuote(); // initial
    }

    // ---------- Streak card ----------

    function updateStreakCard() {
        const valueEl = document.getElementById("streak-value");
        const subtitleEl = document.getElementById("streak-subtitle");
        if (!valueEl) return;

        const workouts = loadWorkouts();

        let streak = 0;
        let d = new Date();

        while (true) {
            const key = d.toISOString().split("T")[0];
            const list = workouts[key] || [];
            if (!list.length) break;
            streak++;
            d.setDate(d.getDate() - 1);
        }

        valueEl.textContent = streak === 1 ? "1 Day" : `${streak} Days`;
        if (subtitleEl) {
            subtitleEl.textContent = streak > 0
                ? "Keep it going!"
                : "No streak yet – start today!";
        }
    }

})();
