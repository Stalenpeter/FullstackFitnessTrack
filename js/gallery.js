(function () {
    const STORAGE_KEY = 'fittrackGalleryPhotos';

    const uploadZone = document.getElementById('upload-zone');
    const photoInput = document.getElementById('photo-input');
    const galleryGrid = document.getElementById('gallery-grid');
    const photoCountBadge = document.getElementById('photo-count-badge');
    const helperText = document.getElementById('gallery-helper-text');
    const clearBtn = document.getElementById('clear-gallery');

    let photos = [];

    function loadFromStorage() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            photos = raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error('Failed to load gallery', e);
            photos = [];
        }
    }

    function saveToStorage() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
        } catch (e) {
            console.error('Failed to save gallery', e);
        }
    }

    function updatePhotoCount() {
        const count = photos.length;
        photoCountBadge.textContent = count + (count === 1 ? ' Photo' : ' Photos');
        helperText.textContent = count === 0
            ? 'No photos yet. Upload your first progress picture!'
            : 'Click a photo to view larger (future feature).';
    }

    function createPhotoCard(photo) {
        const col = document.createElement('div');
        col.className = 'col-6 col-md-4 col-lg-3';

        const card = document.createElement('div');
        card.className = 'position-relative overflow-hidden rounded bg-dark';

        const img = document.createElement('img');
        img.src = photo.dataUrl;
        img.alt = 'Progress photo';
        img.style.width = '100%';
        img.style.height = '220px';
        img.style.objectFit = 'cover';

        const overlay = document.createElement('div');
        overlay.className = 'position-absolute bottom-0 start-0 end-0 px-2 py-1 d-flex justify-content-between align-items-center';
        overlay.style.background = 'linear-gradient(transparent, rgba(0,0,0,0.85))';

        const label = document.createElement('small');
        label.className = 'text-light';
        label.textContent = photo.label || photo.dateString;

        const delBtn = document.createElement('button');
        delBtn.className = 'btn btn-sm btn-danger ms-2';
        delBtn.innerHTML = '<i class="fa fa-trash"></i>';
        delBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            deletePhoto(photo.id);
        });

        overlay.appendChild(label);
        overlay.appendChild(delBtn);

        card.appendChild(img);
        card.appendChild(overlay);
        col.appendChild(card);

        return col;
    }

    function renderGallery() {
        galleryGrid.innerHTML = '';
        photos.forEach(photo => {
            galleryGrid.appendChild(createPhotoCard(photo));
        });
        updatePhotoCount();
    }

    function addPhotosFromFiles(fileList) {
        const files = Array.from(fileList);
        if (!files.length) return;

        files.forEach(file => {
            if (!file.type.startsWith('image/')) return;

            const reader = new FileReader();
            reader.onload = function (ev) {
                const dataUrl = ev.target.result;
                const now = new Date();
                const id = Date.now().toString() + '_' + Math.random().toString(16).slice(2);
                const dateString = now.toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });

                photos.unshift({
                    id,
                    dataUrl,
                    dateString,
                    label: dateString
                });

                saveToStorage();
                renderGallery();
            };
            reader.readAsDataURL(file);
        });
    }

    function deletePhoto(id) {
        photos = photos.filter(p => p.id !== id);
        saveToStorage();
        renderGallery();
    }

    function clearGallery() {
        if (!photos.length) return;
        if (!confirm('Remove all photos from this device?')) return;

        photos = [];
        saveToStorage();
        renderGallery();
    }

    // Upload zone interactions
    uploadZone.addEventListener('click', () => {
        photoInput.click();
    });

    photoInput.addEventListener('change', (e) => {
        addPhotosFromFiles(e.target.files);
        photoInput.value = '';
    });

    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('border-primary');
    });

    uploadZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('border-primary');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('border-primary');
        if (e.dataTransfer && e.dataTransfer.files) {
            addPhotosFromFiles(e.dataTransfer.files);
        }
    });

    clearBtn.addEventListener('click', clearGallery);

    // Init
    loadFromStorage();
    renderGallery();
})();
