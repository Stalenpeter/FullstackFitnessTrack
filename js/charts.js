// js/charts.js
// ------------------------------------------------------------
// WEEKLY WORKOUT COMPLETION CHART (Chart.js)
// ------------------------------------------------------------

// Load workouts from localStorage
function loadWorkouts() {
    try {
        return JSON.parse(localStorage.getItem("fittrackWorkouts")) || {};
    } catch (e) {
        console.error("Failed to load workouts", e);
        return {};
    }
}

/**
 * Count workouts for a “virtual week”.
 * We do NOT bind to real-world calendar week.
 * Instead, we look at the earliest workout date
 * and build a Monday–Sunday week around it.
 */
function countWorkoutsForWeek() {
    const workouts = loadWorkouts();
    const allDates = Object.keys(workouts);

    // If nothing exists → return empty week
    if (allDates.length === 0) {
        return {
            labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            data: [0, 0, 0, 0, 0, 0, 0]
        };
    }

    // Sort dates to find earliest workout date
    allDates.sort(); // yyyy-mm-dd sorts naturally

    const firstDate = new Date(allDates[0]);

    // Find the Sunday of that week
    const start = new Date(firstDate);
    start.setDate(start.getDate() - start.getDay()); // Go back to Sunday

    // Build 7-day week list
    const virtualWeek = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        virtualWeek.push(d.toISOString().split("T")[0]);
    }

    // Map workout counts for each date
    const counts = virtualWeek.map(date => {
        return workouts[date] ? workouts[date].length : 0;
    });

    return {
        labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        data: counts
    };
}

// ------------------------------------------------------------
// INIT CHART
// ------------------------------------------------------------
function initWeeklyWorkoutChart() {
    const canvas = document.getElementById("weekly-workout-chart");
    if (!canvas) {
        console.warn("Chart canvas not found: weekly-workout-chart");
        return;
    }

    const ctx = canvas.getContext("2d");

    const weekData = countWorkoutsForWeek();

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: weekData.labels,
            datasets: [
                {
                    label: "Workouts Completed",
                    data: weekData.data,
                    backgroundColor: "rgba(255, 64, 64, 0.8)",
                    borderColor: "rgba(255, 99, 99, 1)",
                    borderWidth: 2,
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: "#ccc" },
                    grid: { color: "rgba(255,255,255,0.1)" }
                },
                x: {
                    ticks: { color: "#ccc" },
                    grid: { display: false }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: "#fff"
                    }
                }
            }
        }
    });
}

// Run when page loads
document.addEventListener("DOMContentLoaded", initWeeklyWorkoutChart);

