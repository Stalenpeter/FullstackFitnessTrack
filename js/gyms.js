// js/gyms.js
(function () {
    document.addEventListener('DOMContentLoaded', () => {
        const mapFrame = document.getElementById('gym-map');
        if (!mapFrame) return; // not on this page

        const statusEl = document.getElementById('gyms-status');
        const useLocBtn = document.getElementById('use-location-btn');
        const resetBtn = document.getElementById('reset-location-btn');
        const manualInput = document.getElementById('manual-location');
        const manualBtn = document.getElementById('manual-search-btn');

        function setMapToQuery(query, statusText) {
            const encoded = encodeURIComponent(query);
            mapFrame.src = `https://www.google.com/maps?q=${encoded}&z=14&output=embed`;
            if (statusEl && statusText) statusEl.textContent = statusText;
        }

        function setMapToCoords(lat, lng) {
            const url = `https://www.google.com/maps?q=gyms+near+${lat},${lng}&z=14&output=embed`;
            mapFrame.src = url;
            if (statusEl) statusEl.textContent = 'Showing gyms near your current location.';
        }

        // --- Use my location ---
        if (useLocBtn && 'geolocation' in navigator) {
            useLocBtn.addEventListener('click', () => {
                if (statusEl) statusEl.textContent = 'Getting your location...';

                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        const { latitude, longitude } = pos.coords;
                        setMapToCoords(latitude, longitude);
                    },
                    (err) => {
                        console.error('Geolocation error', err);
                        if (statusEl) {
                            statusEl.textContent = 'Could not access your location. You can search manually.';
                        }
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 600000
                    }
                );
            });
        } else if (useLocBtn) {
            useLocBtn.disabled = true;
            if (statusEl) {
                statusEl.textContent = 'Your browser does not support location. Use manual search instead.';
            }
        }

        // --- Reset to default (Wolfville, NS) ---
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                setMapToQuery('gyms near Wolfville, NS, Canada', 'Using default location (Wolfville, NS)');
                if (manualInput) manualInput.value = '';
            });
        }

        // --- Manual search ---
        if (manualBtn && manualInput) {
            manualBtn.addEventListener('click', () => {
                const value = manualInput.value.trim();
                if (!value) return;
                setMapToQuery(`gyms near ${value}`, `Showing gyms near "${value}"`);
            });

            manualInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    manualBtn.click();
                }
            });
        }
    });
})();
