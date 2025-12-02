// js/calendar.js
(function () {
    const calendarBody = document.getElementById('calendar-body');
    const monthYearLabel = document.getElementById('calendar-month-year');
    const prevBtn = document.getElementById('prev-month');
    const nextBtn = document.getElementById('next-month');

    // Modal elements (only on pages that have it)
    const modalEl = document.getElementById('calendarDayModal');
    const modalTitle = document.getElementById('calendar-modal-title');
    const modalBody = document.getElementById('calendar-modal-body');

    // If there is no calendar on this page, do nothing
    if (!calendarBody || !monthYearLabel) return;

    const WEEKLY_KEY = 'fittrackWorkouts';       // template per weekday
    const DAILY_KEY = 'fittrackWorkoutDaily';   // per-date log (completions / one-offs)

    const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const MONTH_NAMES = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();

    // ---------------------------
    // Storage helpers
    // ---------------------------
    function loadWeekly() {
        try {
            const raw = localStorage.getItem(WEEKLY_KEY);
            return raw ? JSON.parse(raw) : {
                sunday: [], monday: [], tuesday: [],
                wednesday: [], thursday: [], friday: [], saturday: []
            };
        } catch (e) {
            console.error('Calendar: failed to load weekly workouts', e);
            return {
                sunday: [], monday: [], tuesday: [],
                wednesday: [], thursday: [], friday: [], saturday: []
            };
        }
    }

    function loadDaily() {
        try {
            const raw = localStorage.getItem(DAILY_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            console.error('Calendar: failed to load daily log', e);
            return {};
        }
    }

    function saveDaily(daily) {
        try {
            localStorage.setItem(DAILY_KEY, JSON.stringify(daily));
        } catch (e) {
            console.error('Calendar: failed to save daily log', e);
        }
    }

    function dateKeyFromDate(d) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    /**
     * Combine weekly template + per-date overrides for a given date.
     * Returns:
     *  - combined: list of workouts for THAT date
     *  - dayKey: "monday" / "tuesday" ...
     *  - dateKey: "YYYY-MM-DD"
     */
    function getDayData(dateObj, weekly, daily) {
        const weekdayIndex = dateObj.getDay();
        const dayKey = DAY_KEYS[weekdayIndex];
        const dateKey = dateKeyFromDate(dateObj);

        const planList = (weekly[dayKey] || []);
        const dayLog = daily[dateKey] || {};
        const completedMap = dayLog.completed || {};
        const extras = dayLog.extra || []; // (not used yet, but ready for one-off workouts)

        const combined = [];

        // Plan-based workouts (from weekly template)
        planList.forEach(w => {
            combined.push({
                source: 'plan',
                id: w.id,
                name: w.name,
                category: w.category,
                sets: w.sets,
                reps: w.reps,
                notes: w.notes,
                completed: !!completedMap[w.id]
            });
        });

        // Extra one-off workouts for this date (future feature)
        extras.forEach(w => {
            combined.push({
                source: 'extra',
                id: w.id,
                name: w.name,
                category: w.category,
                sets: w.sets,
                reps: w.reps,
                notes: w.notes,
                completed: !!w.completed
            });
        });

        return { combined, dayKey, dateKey };
    }

    /**
     * Toggle completion ONLY for this specific date.
     * Plan workouts: completion stored in daily[dateKey].completed[id]
     * Extra workouts: completion stored on the extra object itself.
     */
    function toggleCompletedForDate(dateKey, dayKey, source, workoutId) {
        const daily = loadDaily();

        if (!daily[dateKey]) {
            daily[dateKey] = { completed: {}, extra: [] };
        }

        const entry = daily[dateKey];

        if (source === 'plan') {
            entry.completed = entry.completed || {};
            const current = !!entry.completed[workoutId];
            entry.completed[workoutId] = !current;
        } else if (source === 'extra') {
            entry.extra = entry.extra || [];
            entry.extra = entry.extra.map(w => {
                if (w.id === workoutId) {
                    return { ...w, completed: !w.completed };
                }
                return w;
            });
        }

        saveDaily(daily);
    }

    // ---------------------------
    // Calendar rendering
    // ---------------------------
    function renderCalendar(year, month) {
        const weekly = loadWeekly();
        const daily = loadDaily();

        calendarBody.innerHTML = '';

        const firstDay = new Date(year, month, 1).getDay(); // 0-6
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        monthYearLabel.textContent = `${MONTH_NAMES[month]} ${year}`;

        let date = 1;

        for (let i = 0; i < 6; i++) {
            const row = document.createElement('tr');

            for (let j = 0; j < 7; j++) {
                const cell = document.createElement('td');
                cell.className = 'align-middle calendar-cell';

                if (i === 0 && j < firstDay) {
                    cell.innerHTML = '&nbsp;';
                } else if (date > daysInMonth) {
                    cell.innerHTML = '&nbsp;';
                } else {
                    const cellDate = new Date(year, month, date);
                    const { combined, dayKey, dateKey } = getDayData(cellDate, weekly, daily);

                    const isToday =
                        cellDate.getDate() === today.getDate() &&
                        cellDate.getMonth() === today.getMonth() &&
                        cellDate.getFullYear() === today.getFullYear();

                    cell.dataset.date = cellDate.toISOString();
                    cell.dataset.dateKey = dateKey;
                    cell.dataset.dayKey = dayKey;

                    const dateDiv = document.createElement('div');
                    dateDiv.textContent = date;
                    dateDiv.className = 'fw-bold';

                    if (isToday) {
                        cell.classList.add('calendar-today');
                    }

                    cell.appendChild(dateDiv);

                    if (combined.length > 0) {
                        // Determine categories and completion count for this specific date.
                        const cats = Array.from(
                            new Set(
                                combined
                                    .map(w => (w.category || '').trim())
                                    .filter(Boolean)
                            )
                        );

                        const total = combined.length;
                        const done = combined.filter(w => w.completed).length;

                        const infoDiv = document.createElement('div');
                        infoDiv.className = 'small mt-1 calendar-category-label';


                        if (cats.length > 0) {  
                            // Show categories separated by commas (Chest, Arms, Legs)  
                            infoDiv.textContent = cats.join(', ');  
                        } else {    
                            infoDiv.textContent = 'Workout';    
                        }   



                        cell.appendChild(infoDiv);

                        if (done === total && total > 0) {
                            cell.classList.add('calendar-workout-completed');
                        } else {
                            cell.classList.add('calendar-has-workout');
                        }
                    }

                    date++;
                }

                row.appendChild(cell);
            }

            calendarBody.appendChild(row);
        }
    }

    // ---------------------------
    // Modal rendering
    // ---------------------------
    function openDayModal(cell) {
        if (!modalEl || !modalBody || !modalTitle) return;

        const iso = cell.dataset.date;
        const dateKey = cell.dataset.dateKey;
        const dayKey = cell.dataset.dayKey;
        if (!iso || !dateKey || !dayKey) return;

        const dateObj = new Date(iso);
        const weekly = loadWeekly();
        const daily = loadDaily();

        const { combined } = getDayData(dateObj, weekly, daily);

        const weekdayIndex = dateObj.getDay();
        const weekdayName = DAY_KEYS[weekdayIndex].charAt(0).toUpperCase() +
            DAY_KEYS[weekdayIndex].slice(1);

        const day = dateObj.getDate();
        const monthName = MONTH_NAMES[dateObj.getMonth()];
        const year = dateObj.getFullYear();

        modalTitle.textContent = `${weekdayName} – ${monthName} ${day}, ${year}`;
        modalBody.innerHTML = '';

        if (!combined.length) {
            const p = document.createElement('p');
            p.className = 'text-muted mb-0';
            p.textContent = 'No workouts planned for this day. Add or edit your plan on the Workouts & Plans page.';
            modalBody.appendChild(p);
        } else {
            const listGroup = document.createElement('div');
            listGroup.className = 'list-group';

            combined.forEach(w => {
                const item = document.createElement('label');
                item.className = 'list-group-item bg-dark text-white d-flex align-items-start';

                const cb = document.createElement('input');
                cb.type = 'checkbox';
                cb.className = 'form-check-input me-2 mt-1';
                cb.checked = !!w.completed;

                const bodyDiv = document.createElement('div');
                const title = document.createElement('div');
                title.className = 'fw-bold';
                title.textContent = w.name || 'Workout';

                const meta = document.createElement('div');
                meta.className = 'small text-muted';
                const parts = [];
                if (w.category) parts.push(w.category);
                if (w.sets) parts.push(`${w.sets} sets`);
                if (w.reps) parts.push(`${w.reps} reps`);
                meta.textContent = parts.join(' • ');

                bodyDiv.appendChild(title);
                bodyDiv.appendChild(meta);

                if (w.notes) {
                    const notes = document.createElement('div');
                    notes.className = 'small mt-1';
                    notes.textContent = w.notes;
                    bodyDiv.appendChild(notes);
                }

                item.appendChild(cb);
                item.appendChild(bodyDiv);

                if (w.completed) {
                    item.classList.add('calendar-modal-completed');
                }

                cb.addEventListener('change', function () {
                    // Toggle ONLY this date's completion
                    toggleCompletedForDate(dateKey, dayKey, w.source, w.id);

                    // Re-render calendar so that single day updates
                    renderCalendar(currentYear, currentMonth);

                    // Update just this item visually
                    if (cb.checked) {
                        item.classList.add('calendar-modal-completed');
                    } else {
                        item.classList.remove('calendar-modal-completed');
                    }
                });

                listGroup.appendChild(item);
            });

            modalBody.appendChild(listGroup);
        }

        const modalInstance = new bootstrap.Modal(modalEl);
        modalInstance.show();
    }

    // ---------------------------
    // Handlers & Init
    // ---------------------------
    calendarBody.addEventListener('click', function (e) {
        const cell = e.target.closest('td.calendar-cell');
        if (!cell) return;
        if (!cell.dataset.date) return;
        openDayModal(cell);
    });

    if (prevBtn) {
        prevBtn.addEventListener('click', function () {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar(currentYear, currentMonth);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', function () {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar(currentYear, currentMonth);
        });
    }

    // Initial render
    renderCalendar(currentYear, currentMonth);
})();
