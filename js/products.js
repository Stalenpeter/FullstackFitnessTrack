// js/products.js
(function () {
    document.addEventListener('DOMContentLoaded', () => {
        const listEl   = document.getElementById('products-list');
        const emptyEl  = document.getElementById('products-empty');
        const buttons  = document.querySelectorAll('[data-product-filter]');
        if (!listEl) return;

        // ---- Holiday Hustle products (from the flyer) ----
        const products = [
            {
                name: 'Whey-Free Beef Protein (25 Servings)',
                brand: 'ALT',
                category: 'protein',
                tagline: 'Whey-free beef protein to promote recovery and increase lean muscle.',
                price: 59.99,
                originalPrice: null,        // set a number if you want a strikethrough "before" price
                onSale: true,
                size: '25 servings',
                url: 'https://supplementking.ca/', // swap to exact product link later
                image: 'img/holiday-beef-protein.jpg'
            },
            {
                name: 'Intermediate Mild Caffeine Pre-Workout (40 Servings)',
                brand: 'ALT',
                category: 'preworkout',
                tagline: 'Intermediate pre-workout with mild caffeine for energy, focus & endurance.',
                price: 54.99,
                originalPrice: null,
                onSale: true,
                size: '40 servings',
                url: 'https://supplementking.ca/',
                image: 'img/holiday-preworkout.jpg'
            },
            {
                name: 'Sinfit Pancake & Waffle Mix + Free Syrup',
                brand: 'Sinfit Nutrition',
                category: 'functional',
                tagline: 'High-protein functional food to satisfy cravings – includes free syrup.',
                price: 29.99,
                originalPrice: null,
                onSale: true,
                size: '13 servings',
                url: 'https://supplementking.ca/',
                image: 'img/holiday-sinfit-pancake.jpg'
            },
            {
                name: 'Creatine Gummies (120 Gummies)',
                brand: 'ANS Performance',
                category: 'creatine',
                tagline: 'Creatine monohydrate gummies to increase strength, endurance & recovery.',
                price: 39.99,
                originalPrice: null,
                onSale: true,
                size: '30 servings / 120 gummies',
                url: 'https://supplementking.ca/',
                image: 'img/holiday-creatine-gummies.jpg'
            }
        ];

        function prettyCategory(cat) {
            switch (cat) {
                case 'protein':     return 'Protein';
                case 'preworkout':  return 'Pre-Workout';
                case 'functional':  return 'Functional Food';
                case 'creatine':    return 'Creatine';
                default:            return 'Other';
            }
        }

        function formatPrice(value) {
            return `$${value.toFixed(2)}`;
        }

        function renderProducts(filterCat) {
            listEl.innerHTML = '';

            const filtered = (filterCat && filterCat !== 'all')
                ? products.filter(p => p.category === filterCat)
                : products;

            if (!filtered.length) {
                if (emptyEl) emptyEl.style.display = 'block';
                return;
            } else if (emptyEl) {
                emptyEl.style.display = 'none';
            }

            filtered.forEach(product => {
                const col = document.createElement('div');
                col.className = 'col-md-6 col-xl-3';

                const imgSrc = product.image || 'img/product-placeholder.jpg';

                let priceHtml = '';
                if (product.originalPrice && product.originalPrice > product.price) {
                    priceHtml = `
                        <div class="d-flex align-items-baseline gap-2">
                            <span class="text-danger fw-bold">${formatPrice(product.price)}</span>
                            <small class="text-muted text-decoration-line-through">
                                ${formatPrice(product.originalPrice)}
                            </small>
                        </div>
                    `;
                } else {
                    priceHtml = `
                        <div class="d-flex align-items-baseline gap-2">
                            <span class="fw-bold">${formatPrice(product.price)}</span>
                        </div>
                    `;
                }

                const saleBadge = product.onSale
                    ? '<span class="badge bg-danger ms-2">Holiday Offer</span>'
                    : '';

                col.innerHTML = `
                    <div class="bg-dark rounded h-100 overflow-hidden d-flex flex-column">
                        <div class="position-relative" style="height: 160px; background:#111;">
                            <img src="${imgSrc}" alt="${product.name}"
                                 class="w-100 h-100" style="object-fit: cover;">
                            <div class="position-absolute top-0 start-0 m-2">
                                <span class="badge bg-primary">${product.brand}</span>
                                ${saleBadge}
                            </div>
                        </div>

                        <div class="p-3 d-flex flex-column flex-grow-1">
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                <h6 class="mb-0">${product.name}</h6>
                                <small class="text-muted">${product.size}</small>
                            </div>

                            <small class="text-uppercase text-muted mb-2" style="font-size: 0.75rem;">
                                ${prettyCategory(product.category)}
                            </small>

                            <p class="text-muted mb-3" style="font-size: 0.9rem;">
                                ${product.tagline}
                            </p>

                            <div class="d-flex justify-content-between align-items-center mt-auto">
                                ${priceHtml}
                                <a href="${product.url}" target="_blank" rel="noopener noreferrer"
                                   class="btn btn-sm btn-outline-light">
                                    View <i class="fa fa-external-link-alt ms-1"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                `;

                listEl.appendChild(col);
            });
        }

        // Filter button behaviour
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const cat = btn.getAttribute('data-product-filter');

                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                renderProducts(cat);
            });
        });

        // Initial render
        renderProducts('all');
    });
})();
