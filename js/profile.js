// js/profile.js

(function () {
    const { getCurrentUser, loadUsers, saveUsers, setCurrentUserId } = window.FitTrackAuth;

    const user = getCurrentUser();
    const errorEl = document.getElementById("profile-error");

    if (!user) {
        errorEl.textContent = "No user logged in.";
        setTimeout(() => window.location.href = "signin.html", 1500);
        return;
    }

    // Elements
    const nameInput = document.getElementById("profile-name");
    const ageInput = document.getElementById("profile-age");
    const heightInput = document.getElementById("profile-height");
    const weightInput = document.getElementById("profile-weight");
    const goalInput = document.getElementById("profile-goal");

    const photoPreview = document.getElementById("profile-photo-preview");
    const photoInput = document.getElementById("profile-photo-input");

    const form = document.getElementById("profile-form");

    // ---------------------------
    // Load current values
    // ---------------------------
    function loadProfile() {
        nameInput.value = user.name || "";
        ageInput.value = user.profile?.age || "";
        heightInput.value = user.profile?.height || "";
        weightInput.value = user.profile?.weight || "";
        goalInput.value = user.profile?.goal || "";

        photoPreview.src = user.photo || "img/guest.jpg";
    }

    loadProfile();

    // ---------------------------
    // Photo preview on change
    // ---------------------------
    photoInput.addEventListener("change", () => {
        if (photoInput.files && photoInput.files[0]) {
            const url = URL.createObjectURL(photoInput.files[0]);
            photoPreview.src = url;
            user.photo = url; // Save temporary preview URL
        }
    });

    // ---------------------------
    // Save Changes
    // ---------------------------
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const users = loadUsers();
        const index = users.findIndex(u => u.id === user.id);

        if (index === -1) {
            errorEl.textContent = "User record not found.";
            return;
        }

        // Update user fields
        users[index].name = nameInput.value.trim();
        users[index].profile.age = ageInput.value.trim();
        users[index].profile.height = heightInput.value.trim();
        users[index].profile.weight = weightInput.value.trim();
        users[index].profile.goal = goalInput.value.trim();

        users[index].photo = user.photo || "img/guest.jpg";
        users[index].updatedAt = new Date().toISOString();

        // Save
        saveUsers(users);

        // Refresh navbar name/photo on next pages
        alert("Profile updated!");
        window.location.href = "index.html";
    });

    // ---------------------------
    // Delete Account
    // ---------------------------
    document.getElementById("delete-account").addEventListener("click", () => {
        if (!confirm("Are you sure you want to delete your FitTrack account?")) return;

        const users = loadUsers();
        const updated = users.filter(u => u.id !== user.id);

        saveUsers(updated);
        setCurrentUserId(null);

        alert("Account deleted.");
        window.location.href = "signin.html";
    });

})();
