// ==============================
// FITNESS TRACKER – CALENDAR JS
// ==============================

document.addEventListener('DOMContentLoaded', function () {

    const monthYearLabel = document.getElementById('calendar-month-year');
    const calendarBody   = document.getElementById('calendar-body');
    const prevBtn        = document.getElementById('prev-month');
    const nextBtn        = document.getElementById('next-month');

    // Quick sanity check
    if (!monthYearLabel || !calendarBody || !prevBtn || !nextBtn) {
        console.error('Calendar: required elements not found in DOM.');
        return;
    }

    // Example data (replace later with real data)
    const calendarData = {
        // 'YYYY-MM-DD': { workouts: [...], tasks: [...] }
        '2025-11-28': {
            workouts: ['Chest & Triceps'],
            tasks: ['Drink 3L water']
        },
        '2025-11-29': {
            workouts: ['Leg Day'],
            tasks: ['10k steps', 'Stretch 10 min']
        }
    };

    let currentDate = new Date();
    currentDate.setDate(1);

    function renderCalendar(dateObj) {
        const year  = dateObj.getFullYear();
        const month = dateObj.getMonth();

        // Header: "November 2025"
        const headerFormat = { month: 'long', year: 'numeric' };
        monthYearLabel.textContent = dateObj.toLocaleDateString(undefined, headerFormat);

        // Clear old rows
        calendarBody.innerHTML = '';

        const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun
        const daysInMonth     = new Date(year, month + 1, 0).getDate();

        let dayCounter = 1;

        for (let week = 0; week < 6; week++) {
            const row = document.createElement('tr');

            for (let weekday = 0; weekday < 7; weekday++) {
                const cell = document.createElement('td');
                cell.classList.add('align-top', 'p-2');

                if (week === 0 && weekday < firstDayOfMonth) {
                    cell.innerHTML = '&nbsp;';
                } else if (dayCounter > daysInMonth) {
                    cell.innerHTML = '&nbsp;';
                } else {
                    const day = dayCounter;

                    const fullDate = new Date(year, month, day);
                    const yyyy = fullDate.getFullYear();
                    const mm   = String(fullDate.getMonth() + 1).padStart(2, '0');
                    const dd   = String(fullDate.getDate()).padStart(2, '0');
                    const key  = `${yyyy}-${mm}-${dd}`;

                    // Label inside cell: "Nov 28"
                    const dayLabel = document.createElement('div');
                    dayLabel.className = 'small text-muted fw-bold mb-1';
                    dayLabel.textContent = fullDate.toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                    });
                    cell.appendChild(dayLabel);

                    // Tooltip: "Nov 28, 2025"
                    cell.title = fullDate.toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    });

                    const info = calendarData[key];
                    if (info) {
                        if (info.workouts) {
                            info.workouts.forEach(w => {
                                const badge = document.createElement('div');
                                badge.innerHTML = `<span class="badge bg-primary mt-1">${w}</span>`;
                                cell.appendChild(badge);
                            });
                        }
                        if (info.tasks) {
                            info.tasks.forEach(t => {
                                const badge = document.createElement('div');
                                badge.innerHTML = `<span class="badge bg-info mt-1">${t}</span>`;
                                cell.appendChild(badge);
                            });
                        }
                    }

                    dayCounter++;
                }

                row.appendChild(cell);
            }

            calendarBody.appendChild(row);
            if (dayCounter > daysInMonth) break;
        }
    }

    // Navigation buttons
    prevBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
    });

    nextBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
    });

    // First render
    renderCalendar(currentDate);
});
