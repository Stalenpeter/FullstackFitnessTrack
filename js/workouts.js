(function () {
    const STORAGE_KEY = 'fittrackWorkouts';

    // Elements
    const dayButtons = document.querySelectorAll('.day-btn');
    const dayTitle = document.getElementById('selected-day-title');
    const daySubtitle = document.getElementById('selected-day-subtitle');
    const workoutCountBadge = document.getElementById('workout-count-badge');
    const workoutList = document.getElementById('workout-list');

    const workoutNameInput = document.getElementById('workout-name');
    const workoutTypeSelect = document.getElementById('workout-type');
    const workoutTimeInput = document.getElementById('workout-time');
    const workoutNotesInput = document.getElementById('workout-notes');
    const addWorkoutBtn = document.getElementById('add-workout-btn');

    // If this page isn't workouts.html, exit
    if (!dayButtons.length || !dayTitle || !workoutList) return;

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
    function loadWorkouts() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                workouts = JSON.parse(raw);
            } else {
                // Initialize all days
                workouts = {
                    sunday: [],
                    monday: [],
                    tuesday: [],
                    wednesday: [],
                    thursday: [],
                    friday: [],
                    saturday: []
                };
            }
        } catch (e) {
            console.error('Failed to load workouts from storage', e);
            workouts = {
                sunday: [],
                monday: [],
                tuesday: [],
                wednesday: [],
                thursday: [],
                friday: [],
                saturday: []
            };
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
        daySubtitle.textContent = `Plan your training schedule for ${label}. Add workouts below and mark them completed after you train.`;
    }

    function renderWorkoutCount() {
        const list = workouts[selectedDay] || [];
        const count = list.length;
        workoutCountBadge.textContent = count + (count === 1 ? ' Workout' : ' Workouts');
    }

    function createWorkoutElement(item) {
        const wrapper = document.createElement('div');
        wrapper.className = 'border-bottom py-2';
        wrapper.dataset.id = item.id;

        const topRow = document.createElement('div');
        topRow.className = 'd-flex align-items-center justify-content-between';

        const left = document.createElement('div');
        left.className = 'd-flex align-items-center';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'form-check-input m-0 me-2';
        checkbox.checked = item.completed;
        checkbox.addEventListener('change', function () {
            toggleCompleted(item.id);
        });

        const titleSpan = document.createElement('span');
        if (item.completed) {
            const del = document.createElement('del');
            del.textContent = item.name;
            titleSpan.appendChild(del);
        } else {
            titleSpan.textContent = item.name;
        }

        const tag = document.createElement('span');
        tag.className = 'badge ms-2';
        switch (item.type) {
            case 'cardio':
                tag.classList.add('bg-danger');
                tag.textContent = 'Cardio';
                break;
            case 'mobility':
                tag.classList.add('bg-info');
                tag.textContent = 'Mobility';
                break;
            case 'rest':
                tag.classList.add('bg-secondary', 'border', 'border-light');
                tag.textContent = 'Rest';
                break;
            default:
                tag.classList.add('bg-primary');
                tag.textContent = 'Strength';
        }

        left.appendChild(checkbox);
        left.appendChild(titleSpan);
        left.appendChild(tag);

        const right = document.createElement('div');
        right.className = 'd-flex align-items-center';

        if (item.time) {
            const timeSmall = document.createElement('small');
            timeSmall.className = 'text-muted me-3';
            timeSmall.innerHTML = `<i class="fa fa-clock me-1"></i>${item.time}`;
            right.appendChild(timeSmall);
        }

        // Delete button (we can add edit later)
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm text-muted';
        deleteBtn.innerHTML = '<i class="fa fa-times"></i>';
        deleteBtn.addEventListener('click', function () {
            deleteWorkout(item.id);
        });

        right.appendChild(deleteBtn);

        topRow.appendChild(left);
        topRow.appendChild(right);

        wrapper.appendChild(topRow);

        if (item.notes && item.notes.trim() !== '') {
            const notes = document.createElement('div');
            notes.className = 'mt-1 small text-muted';
            notes.textContent = item.notes;
            wrapper.appendChild(notes);
        }

        return wrapper;
    }

    function renderWorkouts() {
        workoutList.innerHTML = '';

        const list = workouts[selectedDay] || [];

        if (list.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'text-muted small py-2';
            empty.textContent = 'No workouts planned yet for this day. Add one above.';
            workoutList.appendChild(empty);
        } else {
            list.forEach(item => {
                workoutList.appendChild(createWorkoutElement(item));
            });
        }

        renderWorkoutCount();
    }

    // ----------------------
    // Mutations
    // ----------------------
    function addWorkout() {
        const name = (workoutNameInput.value || '').trim();
        const type = workoutTypeSelect.value || 'strength';
        const time = (workoutTimeInput.value || '').trim();
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
            type,
            time,
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
        workoutTimeInput.value = '';
        workoutNotesInput.value = '';
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

        // Update active state on buttons
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
