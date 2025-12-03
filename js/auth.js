// js/auth.js
(function () {
    const USERS_KEY = 'fittrackUsers';
    const CURRENT_USER_KEY = 'fittrackCurrentUserId';

    // ---------- Storage helpers ----------
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
        const users = loadUsers();
        return users.find(u => u.id === id) || null;
    }

    // Expose for other scripts
    window.FitTrackAuth = {
        loadUsers,
        saveUsers,
        getCurrentUserId,
        getCurrentUser,
        setCurrentUserId
    };

    // ---------- Utilities ----------
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
            photo: photo || '',   // file URL / base64
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
        const users = loadUsers();
        const target = normalizeEmail(email);
        return users.find(u => u.email === target) || null;
    }

    // ---------- Sign Up ----------
    function initSignupForm() {
        const form = document.getElementById('signup-form');
        if (!form) return;

        const photoInput   = document.getElementById('signup-photo');
        const nameInput    = document.getElementById('signup-name');
        const emailInput   = document.getElementById('signup-email');
        const passwordInput= document.getElementById('signup-password');
        const confirmInput = document.getElementById('signup-confirm');
        const ageInput     = document.getElementById('signup-age');
        const heightInput  = document.getElementById('signup-height');
        const weightInput  = document.getElementById('signup-weight');
        const goalInput    = document.getElementById('signup-goal');
        const errorEl      = document.getElementById('signup-error');

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (errorEl) errorEl.textContent = '';

            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const confirm = confirmInput.value;

            if (!name || !email || !password || !confirm) {
                if (errorEl) errorEl.textContent = 'Please fill in all required fields.';
                return;
            }

            if (password.length < 6) {
                if (errorEl) errorEl.textContent = 'Password should be at least 6 characters.';
                return;
            }

            if (password !== confirm) {
                if (errorEl) errorEl.textContent = 'Passwords do not match.';
                return;
            }

            if (findUserByEmail(email)) {
                if (errorEl) errorEl.textContent = 'An account with that email already exists.';
                return;
            }

            let photoData = '';
            if (photoInput && photoInput.files && photoInput.files[0]) {
                // Quick preview-style URL (good enough for this project)
                photoData = URL.createObjectURL(photoInput.files[0]);
            }

            const users = loadUsers();
            const user = createUser({
                name,
                email,
                password,
                age:    ageInput.value,
                height: heightInput.value,
                weight: weightInput.value,
                goal:   goalInput.value,
                photo:  photoData
            });

            users.push(user);
            saveUsers(users);
            setCurrentUserId(user.id);

            window.location.href = 'index.html';
        });
    }

    // ---------- Sign In ----------
    function initSigninForm() {
        const form = document.getElementById('signin-form');
        if (!form) return;

        const emailInput    = document.getElementById('signin-email');
        const passwordInput = document.getElementById('signin-password');
        const errorEl       = document.getElementById('signin-error');

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (errorEl) errorEl.textContent = '';

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            if (!email || !password) {
                if (errorEl) errorEl.textContent = 'Please enter email and password.';
                return;
            }

            const user = findUserByEmail(email);
            if (!user || user.password !== password) {
                if (errorEl) errorEl.textContent = 'Invalid email or password.';
                return;
            }

            setCurrentUserId(user.id);
            window.location.href = 'index.html';
        });
    }

    // ---------- UI: names, photos, menu visibility ----------
    function updateUserDisplay() {
        const user = getCurrentUser();

        const sidebarPhoto = document.getElementById('sidebar-photo');
        const navbarPhoto  = document.getElementById('navbar-photo');
        const sidebarName  = document.getElementById('sidebar-username');
        const sidebarRole  = document.getElementById('sidebar-role');
        const navbarName   = document.getElementById('navbar-username');

        const guestBlocks = document.querySelectorAll('[data-ft-guest-only]');
        const authBlocks  = document.querySelectorAll('[data-ft-auth-only]');

        const fallbackImg = 'img/guest.jpg';

        if (!user) {
            // Names
            if (sidebarName) sidebarName.textContent = 'Guest User';
            if (sidebarRole) sidebarRole.textContent = 'Fitness Enthusiast';
            if (navbarName)  navbarName.textContent  = 'Guest';

            // Photos
            if (sidebarPhoto) sidebarPhoto.src = fallbackImg;
            if (navbarPhoto)  navbarPhoto.src  = fallbackImg;

            // Show guest menu, hide auth menu
            guestBlocks.forEach(el => el.style.display = '');
            authBlocks.forEach(el  => el.style.display = 'none');
            return;
        }

        // Logged-in user
        const photoSrc = user.photo && user.photo.trim() !== '' ? user.photo : fallbackImg;

        if (sidebarPhoto) {
            sidebarPhoto.onerror = () => { sidebarPhoto.src = fallbackImg; };
            sidebarPhoto.src = photoSrc;
        }
        if (navbarPhoto) {
            navbarPhoto.onerror = () => { navbarPhoto.src = fallbackImg; };
            navbarPhoto.src = photoSrc;
        }

        if (sidebarName) sidebarName.textContent = user.name || user.email;
        if (sidebarRole) {
            sidebarRole.textContent = user.profile && user.profile.goal
                ? user.profile.goal
                : 'FitTrack Member';
        }
        if (navbarName) navbarName.textContent = user.name || user.email;

        // Show auth menu, hide guest menu
        guestBlocks.forEach(el => el.style.display = 'none');
        authBlocks.forEach(el  => el.style.display = '');
    }

    // ---------- Logout ----------
    function initLogoutLinks() {
        const logoutLinks = document.querySelectorAll('[data-ft-logout]');
        logoutLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                setCurrentUserId(null);
                window.location.href = 'signin.html';
            });
        });
    }

    // ---------- Init ----------
    initSignupForm();
    initSigninForm();
    updateUserDisplay();
    initLogoutLinks();
})();
