// js/news.js
(function () {
    document.addEventListener('DOMContentLoaded', () => {
        const listEl = document.getElementById('news-list');
        const emptyEl = document.getElementById('news-empty');
        if (!listEl) return;

        const filterButtons = document.querySelectorAll('[data-news-filter]');

        // Static sample articles – you can replace URLs/titles with real ones
        const articles = [
            {
                title: '8 Science-Backed Tips to Build Muscle Safely',
                source: 'Training',
                tag: 'training',
                summary: 'Learn how to progressively overload, recover properly, and structure your strength workouts for long-term gains.',
                url: 'https://www.menshealth.com/fitness/', // change to specific article if you want
                date: '2025-02-01'
            },
            {
                title: 'How Much Protein Do You Really Need Per Day?',
                source: 'Nutrition',
                tag: 'nutrition',
                summary: 'A registered dietitian breaks down protein needs for fat loss, muscle building, and maintenance.',
                url: 'https://www.healthline.com/nutrition/how-much-protein-per-day',
                date: '2025-01-25'
            },
            {
                title: 'Beginner’s Guide to Strength Training 3x per Week',
                source: 'Training',
                tag: 'training',
                summary: 'Full-body plan ideas and how to balance push, pull, and leg days without burning out.',
                url: 'https://www.verywellfit.com/strength-training-4157092',
                date: '2025-01-20'
            },
            {
                title: 'Sleep & Recovery: Why Your Gains Happen at Night',
                source: 'Recovery',
                tag: 'recovery',
                summary: 'Deep sleep, hormones, and what happens when you finally stop scrolling and go to bed.',
                url: 'https://www.sleepfoundation.org/physical-activity',
                date: '2025-01-15'
            },
            {
                title: 'Hydration Myths: Do You Really Need 3 Liters a Day?',
                source: 'General',
                tag: 'general',
                summary: 'A look at current research on fluid intake, performance, and how to know if you’re drinking enough.',
                url: 'https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/in-depth/water/art-20044256',
                date: '2025-01-10'
            },
            {
                title: 'Smart Warm-Ups: 5 Minutes to Protect Your Joints',
                source: 'Recovery',
                tag: 'recovery',
                summary: 'Dynamic movements that prep your body for lifting, running or HIIT without wasting time.',
                url: 'https://www.nasm.org/resources/warm-up-exercises',
                date: '2025-01-05'
            },
            {
                title: 'Cardio vs. Weights: What’s Better for Fat Loss?',
                source: 'General',
                tag: 'general',
                summary: 'Why the answer is usually “both” and how to mix them based on your goals.',
                url: 'https://www.medicalnewstoday.com/articles/cardio-vs-weights-for-weight-loss',
                date: '2024-12-28'
            },
            {
                title: 'Simple Meal Prep Ideas for Busy Lifters',
                source: 'Nutrition',
                tag: 'nutrition',
                summary: 'High-protein meal prep tips to keep you on track even when life is chaotic.',
                url: 'https://www.bodybuilding.com/content/meal-prep-ideas.html',
                date: '2024-12-20'
            }
        ];

        function renderArticles(filterTag) {
            listEl.innerHTML = '';

            const filtered = filterTag && filterTag !== 'all'
                ? articles.filter(a => a.tag === filterTag)
                : articles;

            if (!filtered.length) {
                emptyEl.style.display = 'block';
                return;
            } else {
                emptyEl.style.display = 'none';
            }

            filtered.forEach(article => {
                const col = document.createElement('div');
                col.className = 'col-md-6 col-xl-4';

                col.innerHTML = `
                    <div class="bg-dark rounded p-3 h-100 d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="badge bg-primary text-uppercase">${article.source}</span>
                            <small class="text-muted">${formatDate(article.date)}</small>
                        </div>
                        <h6 class="mb-2">${article.title}</h6>
                        <p class="flex-grow-1 mb-3 text-muted" style="font-size: 0.9rem;">
                            ${article.summary}
                        </p>
                        <a href="${article.url}" target="_blank" rel="noopener noreferrer"
                           class="btn btn-sm btn-outline-light mt-auto">
                            Read Article <i class="fa fa-external-link-alt ms-1"></i>
                        </a>
                    </div>
                `;

                listEl.appendChild(col);
            });
        }

        function formatDate(iso) {
            if (!iso) return '';
            const d = new Date(iso);
            if (isNaN(d.getTime())) return '';
            return d.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }

        // Filter button click handlers
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tag = btn.getAttribute('data-news-filter');

                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                renderArticles(tag);
            });
        });

        // Initial render
        renderArticles('all');
    });
})();
