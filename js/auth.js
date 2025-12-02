// js/auth.js
(function () {
    const USERS_KEY = 'fittrackUsers';
    const CURRENT_USER_KEY = 'fittrackCurrentUserId';

    // =============================
    // Storage Helpers
    // =============================
    function loadUsers() {
        try {
            const raw = localStorage.getItem(USERS_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error('Auth: failed to load users', e);
            return [];
        }
    }

    function saveUsers(users) {
        try {
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
        } catch (e) {
            console.error('Auth: failed to save users', e);
        }
    }

    function setCurrentUserId(id) {
        if (!id) {
            localStorage.removeItem(CURRENT_USER_KEY);
        } else {
            localStorage.setItem(CURRENT_USER_KEY, id);
        }
    }

    function getCurrentUserId() {
        return localStorage.getItem(CURRENT_USER_KEY) || null;
    }

    function getCurrentUser() {
        const id = getCurrentUserId();
        if (!id) return null;
        return loadUsers().find(u => u.id === id) || null;
    }

    window.FitTrackAuth = {
        loadUsers,
        saveUsers,
        getCurrentUserId,
        getCurrentUser,
        setCurrentUserId
    };

    // =============================
    // Helpers
    // =============================
    function normalizeEmail(email) {
        return (email || '').trim().toLowerCase();
    }

    function createUser({ name, email, password, age, height, weight, goal, photo }) {
        const id = Date.now().toString() + '_' + Math.random().toString(16).slice(2);
        const now = new Date().toISOString();

        return {
            id,
            name: (name || '').trim(),
            email: normalizeEmail(email),
            password: password || '',
            photo: photo || "img/guest.jpg",   // IMPORTANT FIX
            profile: {
                age: age || '',
                height: height || '',
                weight: weight || '',
                goal: (goal || '').trim()
            },
            createdAt: now,
            updatedAt: now
        };
    }

    function findUserByEmail(email) {
        return loadUsers().find(u => u.email === normalizeEmail(email)) || null;
    }

    // =============================
    // SIGN UP
    // =============================
    function initSignupForm() {
        const form = document.getElementById('signup-form');
        if (!form) return;

        const photoInput = document.getElementById('signup-photo');

        const nameInput = document.getElementById('signup-name');
        const emailInput = document.getElementById('signup-email');
        const passwordInput = document.getElementById('signup-password');
        const confirmInput = document.getElementById('signup-confirm');

        const ageInput = document.getElementById('signup-age');
        const heightInput = document.getElementById('signup-height');
        const weightInput = document.getElementById('signup-weight');
        const goalInput = document.getElementById('signup-goal');

        const errorEl = document.getElementById('signup-error');

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (errorEl) errorEl.textContent = "";

            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const confirm = confirmInput.value;

            if (!name || !email || !password || !confirm) {
                errorEl.textContent = "Please fill in all required fields.";
                return;
            }

            if (password.length < 6) {
                errorEl.textContent = "Password must be at least 6 characters.";
                return;
            }

            if (password !== confirm) {
                errorEl.textContent = "Passwords do not match.";
                return;
            }

            if (findUserByEmail(email)) {
                errorEl.textContent = "Email already registered.";
                return;
            }

            let photoData = "img/guest.jpg";
            if (photoInput?.files?.[0]) {
                photoData = URL.createObjectURL(photoInput.files[0]);
            }

            const users = loadUsers();
            const user = createUser({
                name,
                email,
                password,
                age: ageInput.value,
                height: heightInput.value,
                weight: weightInput.value,
                goal: goalInput.value,
                photo: photoData
            });

            users.push(user);
            saveUsers(users);
            setCurrentUserId(user.id);

            window.location.href = "index.html";
        });
    }

    // =============================
    // SIGN IN
    // =============================
    function initSigninForm() {
        const form = document.getElementById('signin-form');
        if (!form) return;

        const emailInput = document.getElementById('signin-email');
        const passwordInput = document.getElementById('signin-password');
        const errorEl = document.getElementById('signin-error');

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            errorEl.textContent = "";

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            const user = findUserByEmail(email);

            if (!user || user.password !== password) {
                errorEl.textContent = "Invalid email or password.";
                return;
            }

            setCurrentUserId(user.id);
            window.location.href = "index.html";
        });
    }

    // =============================
    // UPDATE NAVBAR USER UI
    // =============================
    function updateUserDisplay() {
        const user = getCurrentUser();

        const navbarPhoto = document.getElementById("navbar-photo");
        const navbarName = document.getElementById("navbar-username");

        const fallback = "img/guest.jpg";

        if (!user) {
            if (navbarPhoto) navbarPhoto.src = fallback;
            if (navbarName) navbarName.textContent = "Guest";
            return;
        }

        const photoSrc = user.photo || fallback;

        if (navbarPhoto) {
            navbarPhoto.onerror = () => (navbarPhoto.src = fallback);
            navbarPhoto.src = photoSrc;
        }

        if (navbarName) {
            navbarName.textContent = user.name || "Guest";
        }
    }

    // =============================
    // LOGOUT LINKS
    // =============================
    function initLogoutLinks() {
        const links = document.querySelectorAll("[data-ft-logout]");
        links.forEach(link => {
            link.addEventListener("click", e => {
                e.preventDefault();
                setCurrentUserId(null);
                window.location.href = "signin.html";
            });
        });
    }

    // =============================
    // INIT SCRIPT
    // =============================
    initSignupForm();
    initSigninForm();
    updateUserDisplay();
    initLogoutLinks();
})();
