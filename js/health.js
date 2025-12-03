// js/health.js
(function () {
    document.addEventListener("DOMContentLoaded", () => {
        initBMI();
        initWaterTracker();
        initMotivation();
    });

    // ---------------- BMI ----------------
    function initBMI() {
        const heightInput = document.getElementById("bmi-height");
        const weightInput = document.getElementById("bmi-weight");
        const btn = document.getElementById("bmi-calc-btn");
        const valueEl = document.getElementById("bmi-value");
        const catEl = document.getElementById("bmi-category");

        if (!btn) return; // not on this page

        btn.addEventListener("click", () => {
            const h = parseFloat(heightInput.value);
            const w = parseFloat(weightInput.value);

            if (!h || !w || h <= 0 || w <= 0) {
                valueEl.textContent = "--";
                catEl.textContent = "Please enter a valid height and weight.";
                return;
            }

            const bmi = w / Math.pow(h / 100, 2);
            const rounded = bmi.toFixed(1);
            valueEl.textContent = rounded;

            let category = "";
            if (bmi < 18.5) category = "Underweight";
            else if (bmi < 25) category = "Normal weight";
            else if (bmi < 30) category = "Overweight";
            else category = "Obese";

            catEl.textContent = category;
        });
    }

    // ---------------- WATER ----------------
    const WATER_KEY = "fittrackWaterToday";

    function initWaterTracker() {
        const goalInput = document.getElementById("water-goal");
        const amountInput = document.getElementById("water-amount");
        const addBtn = document.getElementById("water-add-btn");
        const resetBtn = document.getElementById("water-reset-btn");
        const label = document.getElementById("water-today-label");
        const bar = document.getElementById("water-progress");

        if (!addBtn) return; // not on this page

        let state = loadWaterState();

        function render() {
            label.textContent = `${state.current} / ${state.goal} ml`;
            const pct = state.goal > 0 ? Math.min(100, (state.current / state.goal) * 100) : 0;
            bar.style.width = pct + "%";
        }

        addBtn.addEventListener("click", () => {
            const amount = parseInt(amountInput.value, 10);
            const goal = parseInt(goalInput.value, 10);

            if (goal > 0) state.goal = goal;
            if (amount > 0) state.current += amount;

            saveWaterState(state);
            render();
            amountInput.value = "";
        });

        resetBtn.addEventListener("click", () => {
            state.current = 0;
            saveWaterState(state);
            render();
        });

        // Load previous and pre-fill goal
        goalInput.value = state.goal || "";
        render();
    }

    function loadWaterState() {
        const todayKey = new Date().toISOString().split("T")[0];
        try {
            const raw = localStorage.getItem(WATER_KEY);
            const data = raw ? JSON.parse(raw) : {};
            const existing = data[todayKey] || { current: 0, goal: 2500 };
            return { ...existing, date: todayKey, rawStore: data };
        } catch (e) {
            console.error("Water tracker load error", e);
            return { current: 0, goal: 2500, date: todayKey, rawStore: {} };
        }
    }

    function saveWaterState(state) {
        const todayKey = state.date;
        const all = state.rawStore || {};
        all[todayKey] = { current: state.current, goal: state.goal };
        localStorage.setItem(WATER_KEY, JSON.stringify(all));
    }

    // ---------------- MOTIVATION ----------------
    function initMotivation() {
        const textEl = document.getElementById("motivation-text");
        const btn = document.getElementById("motivation-refresh");
        if (!textEl || !btn) return;

        const quotes = [
            "One workout at a time. One day at a time.",
            "You don’t have to be extreme, just consistent.",
            "Sweat is just your fat crying.",
            "Discipline is choosing what you want most over what you want now.",
            "Small progress is still progress.",
            "Your future self is watching you. Don’t let them down.",
            "The only bad workout is the one that didn’t happen.",
            "Strong body, stronger mind."
        ];

        function pickQuote() {
            const i = Math.floor(Math.random() * quotes.length);
            textEl.textContent = quotes[i];
        }

        btn.addEventListener("click", pickQuote);
        pickQuote(); // initial
    }

})();
