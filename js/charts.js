// js/charts.js
(function () {
    const CHART_ID = 'weekly-workout-chart';

    // Wait until DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        const canvas = document.getElementById(CHART_ID);
        if (!canvas) {
            console.warn("Weekly chart: canvas not found.");
            return;
        }

        const ctx = canvas.getContext("2d");
        loadWeeklyWorkoutChart(ctx);
    });

    // -------------------------------
    // Load data & draw chart
    // -------------------------------
    function loadWeeklyWorkoutChart(ctx) {
        const workouts = loadWorkouts();
        const weeklyData = getWeeklyData(workouts);

        const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const data = labels.map(day => weeklyData[day] || 0);

        new Chart(ctx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Workouts Completed",
                        data: data,
                        backgroundColor: "#ff3838",
                        borderColor: "#ff3838",
                        borderWidth: 1,
                        borderRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: {
                            color: "#fff"
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: "#fff" },
                        grid: { color: "rgba(255,255,255,0.1)" }
                    },
                    y: {
                        ticks: { color: "#fff", precision: 0 },
                        grid: { color: "rgba(255,255,255,0.1)" }
                    }
                }
            }
        });
    }

    // -------------------------------
    // Load workouts from localStorage
    // -------------------------------
    function loadWorkouts() {
        try {
            const raw = localStorage.getItem("fittrackWorkouts");
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            console.error("Error loading workouts:", e);
            return {};
        }
    }

    // -------------------------------
    // Count workouts for current week
    // -------------------------------
    function getWeeklyData(workouts) {
        const result = {
            Sun: 0, Mon: 0, Tue: 0, Wed: 0,
            Thu: 0, Fri: 0, Sat: 0
        };

        const now = new Date();
        const currentWeek = getWeekNumber(now);

        for (const dateKey in workouts) {
            const dayWorkouts = workouts[dateKey] || [];
            const date = new Date(dateKey);

            if (getWeekNumber(date) === currentWeek) {
                const dayIndex = date.getDay();
                const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayIndex];
                result[dayName] += dayWorkouts.length;
            }
        }

        return result;
    }

    // -------------------------------
    // Get ISO week number
    // -------------------------------
    function getWeekNumber(date) {
        const temp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = temp.getUTCDay() || 7;
        temp.setUTCDate(temp.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
        return Math.ceil((((temp - yearStart) / 86400000) + 1) / 7);
    }

})();
