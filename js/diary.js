// js/diary.js
(function () {
    const STORAGE_KEY = 'fittrackDiaryEntries';

    // ----------------- Helpers -----------------
    function todayDateKey() {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    function formatLongDate(dateStr) {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }

    function loadEntries() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error('Diary: failed to load entries', e);
            return [];
        }
    }

    function saveEntries(entries) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
        } catch (e) {
            console.error('Diary: failed to save entries', e);
        }
    }

    function upsertEntry(dateKey, text) {
        const entries = loadEntries();
        const trimmed = (text || '').trim();
        const nowIso = new Date().toISOString();

        const index = entries.findIndex(e => e.dateKey === dateKey);

        if (trimmed === '') {
            // Empty text = delete existing entry for that day
            if (index !== -1) {
                entries.splice(index, 1);
            }
            saveEntries(entries);
            return null;
        }

        if (index === -1) {
            entries.push({
                id: nowIso + '_' + Math.random().toString(16).slice(2),
                dateKey,
                dateISO: dateKey,
                text: trimmed,
                createdAt: nowIso,
                updatedAt: nowIso,
            });
        } else {
            entries[index] = {
                ...entries[index],
                text: trimmed,
                updatedAt: nowIso,
            };
        }

        // Sort newest first
        entries.sort((a, b) => (a.dateKey < b.dateKey ? 1 : -1));
        saveEntries(entries);
        return entries.find(e => e.dateKey === dateKey) || null;
    }

    // ----------------- Editor (daily diary on dashboard/widgets) -----------------
    function initDiaryEditor() {
        const textarea = document.getElementById('diary-text');
        const saveBtn = document.getElementById('diary-save-btn');
        const statusEl = document.getElementById('diary-status');
        const dateLabel = document.getElementById('diary-date-label');

        if (!textarea || !saveBtn) return; // not on a page with the editor

        const todayKey = todayDateKey();

        if (dateLabel) {
            dateLabel.textContent = formatLongDate(todayKey);
        }

        // Load existing entry for today
        const entries = loadEntries();
        const todayEntry = entries.find(e => e.dateKey === todayKey);
        if (todayEntry) {
            textarea.value = todayEntry.text || '';
            if (statusEl) {
                statusEl.textContent = 'Last saved: ' +
                    new Date(todayEntry.updatedAt || todayEntry.createdAt).toLocaleTimeString();
            }
        } else if (statusEl) {
            statusEl.textContent = 'Not saved yet.';
        }

        function handleSave() {
            const entry = upsertEntry(todayKey, textarea.value);
            if (statusEl) {
                if (entry) {
                    statusEl.textContent = 'Saved at ' +
                        new Date(entry.updatedAt).toLocaleTimeString();
                } else {
                    statusEl.textContent = 'Entry cleared.';
                }
            }
        }

        saveBtn.addEventListener('click', handleSave);

        // Ctrl+Enter to save
        textarea.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleSave();
            }
        });
    }

    // ----------------- Diary book page -----------------
    function initDiaryList() {
        const listContainer = document.getElementById('diary-list');
        if (!listContainer) return; // not on diary book page

        const entries = loadEntries();

        listContainer.innerHTML = '';

        if (!entries.length) {
            const p = document.createElement('p');
            p.className = 'text-muted mb-0';
            p.textContent = 'No diary entries yet. Start writing from the dashboard or widgets page.';
            listContainer.appendChild(p);
            return;
        }

        entries.forEach(entry => {
            const card = document.createElement('div');
            card.className = 'bg-secondary rounded p-3 mb-3';

            const header = document.createElement('div');
            header.className = 'd-flex justify-content-between align-items-center mb-2';

            const title = document.createElement('h6');
            title.className = 'mb-0';
            title.textContent = formatLongDate(entry.dateKey);

            const time = document.createElement('small');
            time.className = 'text-muted';
            if (entry.updatedAt) {
                time.textContent = 'Last updated at ' +
                    new Date(entry.updatedAt).toLocaleTimeString();
            }

            header.appendChild(title);
            header.appendChild(time);

            const body = document.createElement('p');
            body.className = 'mb-0';
            body.textContent = entry.text;

            card.appendChild(header);
            card.appendChild(body);

            listContainer.appendChild(card);
        });
    }

    // ----------------- Init on page load -----------------
    initDiaryEditor();
    initDiaryList();
})();
