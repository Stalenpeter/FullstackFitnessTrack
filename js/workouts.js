(function () {
    const STORAGE_KEY = 'fittrackWorkouts';

    // Day selection elements
    const dayButtons = document.querySelectorAll('.day-btn');
    const dayTitle = document.getElementById('selected-day-title');
    const daySubtitle = document.getElementById('selected-day-subtitle');
    const workoutCountBadge = document.getElementById('workout-count-badge');

    // Form elements
    const workoutNameInput = document.getElementById('workout-name');
    const workoutCategoryInput = document.getElementById('workout-category');
    const workoutSetsInput = document.getElementById('workout-sets');
    const workoutRepsInput = document.getElementById('workout-reps');
    const workoutNotesInput = document.getElementById('workout-notes');
    const addWorkoutBtn = document.getElementById('add-workout-btn');

    // Table body
    const workoutListBody = document.getElementById('workout-list');

    // If this page isn't workouts.html, exit
    if (!dayButtons.length || !dayTitle || !workoutListBody) return;

    const DAY_LABELS = {
        sunday: 'Sunday',
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday'
    };

    let selectedDay = 'sunday';
    let workouts = {};

    // ----------------------
    // Storage helpers
    // ----------------------
    function defaultWeek() {
        return {
            sunday: [],
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: []
        };
    }

    function loadWorkouts() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                workouts = JSON.parse(raw);
            } else {
                workouts = defaultWeek();
            }
        } catch (e) {
            console.error('Failed to load workouts from storage', e);
            workouts = defaultWeek();
        }
    }

    function saveWorkouts() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
        } catch (e) {
            console.error('Failed to save workouts to storage', e);
        }
    }

    // ----------------------
    // Rendering
    // ----------------------
    function renderDayHeader() {
        const label = DAY_LABELS[selectedDay] || 'Day';
        dayTitle.textContent = `Workouts for ${label}`;
        daySubtitle.textContent = `Plan your exercises with categories, sets and reps for ${label}.`;
    }

    function renderWorkoutCount() {
        const list = workouts[selectedDay] || [];
        const count = list.length;
        workoutCountBadge.textContent = count + (count === 1 ? ' Workout' : ' Workouts');
    }

    function createRow(item) {
        const tr = document.createElement('tr');
        tr.dataset.id = item.id;

        // Done checkbox
        const tdDone = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'form-check-input m-0';
        checkbox.checked = item.completed;
        checkbox.addEventListener('change', function () {
            toggleCompleted(item.id);
        });
        tdDone.appendChild(checkbox);

        // Workout name
        const tdName = document.createElement('td');
        if (item.completed) {
            const del = document.createElement('del');
            del.textContent = item.name;
            tdName.appendChild(del);
        } else {
            tdName.textContent = item.name;
        }

        // Category
        const tdCat = document.createElement('td');
        tdCat.textContent = item.category || '-';

        // Sets
        const tdSets = document.createElement('td');
        tdSets.textContent = item.sets ? String(item.sets) : '-';

        // Reps
        const tdReps = document.createElement('td');
        tdReps.textContent = item.reps ? String(item.reps) : '-';

        // Notes
        const tdNotes = document.createElement('td');
        tdNotes.className = 'small text-muted';
        tdNotes.textContent = item.notes || '';

        // Actions (delete only for now)
        const tdActions = document.createElement('td');
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm text-muted';
        deleteBtn.innerHTML = '<i class="fa fa-times"></i>';
        deleteBtn.addEventListener('click', function () {
            deleteWorkout(item.id);
        });
        tdActions.appendChild(deleteBtn);

        tr.appendChild(tdDone);
        tr.appendChild(tdName);
        tr.appendChild(tdCat);
        tr.appendChild(tdSets);
        tr.appendChild(tdReps);
        tr.appendChild(tdNotes);
        tr.appendChild(tdActions);

        return tr;
    }

    function renderWorkouts() {
        workoutListBody.innerHTML = '';

        const list = workouts[selectedDay] || [];

        if (list.length === 0) {
            const emptyRow = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 7;
            td.className = 'text-muted small py-3';
            td.textContent = 'No workouts added yet for this day. Use the form above to add exercises.';
            emptyRow.appendChild(td);
            workoutListBody.appendChild(emptyRow);
        } else {
            list.forEach(item => {
                workoutListBody.appendChild(createRow(item));
            });
        }

        renderWorkoutCount();
    }

    // ----------------------
    // Mutations
    // ----------------------
    function addWorkout() {
        const name = (workoutNameInput.value || '').trim();
        const category = (workoutCategoryInput.value || '').trim();
        const sets = workoutSetsInput.value ? parseInt(workoutSetsInput.value, 10) : null;
        const reps = workoutRepsInput.value ? parseInt(workoutRepsInput.value, 10) : null;
        const notes = (workoutNotesInput.value || '').trim();

        if (!name) {
            workoutNameInput.focus();
            return;
        }

        const now = new Date();
        const id = now.getTime().toString() + '_' + Math.random().toString(16).slice(2);

        const newItem = {
            id,
            name,
            category,
            sets,
            reps,
            notes,
            completed: false,
            createdAt: now.toISOString()
        };

        workouts[selectedDay].push(newItem);
        saveWorkouts();
        clearForm();
        renderWorkouts();
    }

    function clearForm() {
        workoutNameInput.value = '';
        workoutCategoryInput.value = '';
        workoutSetsInput.value = '';
        workoutRepsInput.value = '';
        workoutNotesInput.value = '';
        workoutNameInput.focus();
    }

    function toggleCompleted(id) {
        const list = workouts[selectedDay] || [];
        workouts[selectedDay] = list.map(item => {
            if (item.id === id) {
                return { ...item, completed: !item.completed };
            }
            return item;
        });
        saveWorkouts();
        renderWorkouts();
    }

    function deleteWorkout(id) {
        const list = workouts[selectedDay] || [];
        workouts[selectedDay] = list.filter(item => item.id !== id);
        saveWorkouts();
        renderWorkouts();
    }

    // ----------------------
    // Day switching
    // ----------------------
    function setSelectedDay(dayKey) {
        if (!DAY_LABELS[dayKey]) return;
        selectedDay = dayKey;

        dayButtons.forEach(btn => {
            if (btn.dataset.day === dayKey) {
                btn.classList.add('btn-primary');
                btn.classList.remove('btn-dark');
            } else {
                btn.classList.add('btn-dark');
                btn.classList.remove('btn-primary');
            }
        });

        renderDayHeader();
        renderWorkouts();
    }

    function initDefaultDay() {
        const today = new Date().getDay(); // 0=Sun ... 6=Sat
        const map = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const todayKey = map[today] || 'sunday';
        setSelectedDay(todayKey);
    }

    // ----------------------
    // Event bindings
    // ----------------------
    addWorkoutBtn.addEventListener('click', function () {
        addWorkout();
    });

    workoutNameInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addWorkout();
        }
    });

    dayButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const dayKey = btn.dataset.day;
            setSelectedDay(dayKey);
        });
    });

    // ----------------------
    // Init
    // ----------------------
    loadWorkouts();
    initDefaultDay();

})();
