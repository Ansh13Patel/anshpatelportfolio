document.addEventListener('DOMContentLoaded', () => {
    // Custom Cursor Glow
    const cursorGlow = document.getElementById('cursor-glow');

    document.addEventListener('mousemove', (e) => {
        requestAnimationFrame(() => {
            cursorGlow.style.left = e.clientX + 'px';
            cursorGlow.style.top = e.clientY + 'px';
        });
    });

    // Translation System
    const langBtns = document.querySelectorAll('.lang-switch button');

    function setLanguage(lang) {
        // Update active button
        langBtns.forEach(btn => {
            if (btn.id === `lang-${lang}`) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Translate content
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                // If it's the glitch element, update the data-text attribute too
                if (el.classList.contains('glitch')) {
                    el.setAttribute('data-text', translations[lang][key]);
                }
                el.textContent = translations[lang][key];
            }
        });

        // Save preference
        localStorage.setItem('preferredLang', lang);
        document.documentElement.lang = lang;

        // Update CV link
        const cvLink = document.getElementById('cv-link');
        if (cvLink) {
            cvLink.href = lang === 'de' ? 'CV/Ansh_Patel_CV_DE.pdf' : 'CV/Ansh_Patel_CV_EN.pdf';
        }
    }

    // Add click events to language buttons
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));
    document.getElementById('lang-de').addEventListener('click', () => setLanguage('de'));

    // Check for saved language preference
    const savedLang = localStorage.getItem('preferredLang') || 'en';
    setLanguage(savedLang);

    // Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    mobileBtn.addEventListener('click', () => {
        if (navLinks.style.display === 'flex') {
            navLinks.style.display = 'none';
        } else {
            navLinks.style.display = 'flex';
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '100%';
            navLinks.style.left = '0';
            navLinks.style.width = '100%';
            navLinks.style.background = 'rgba(10, 10, 15, 0.95)';
            navLinks.style.padding = '2rem';
            navLinks.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
        }
    });

    // Reset mobile menu on resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            navLinks.style.display = 'flex';
            navLinks.style.flexDirection = 'row';
            navLinks.style.position = 'relative';
            navLinks.style.background = 'transparent';
            navLinks.style.padding = '0';
            navLinks.style.borderBottom = 'none';
        } else {
            navLinks.style.display = 'none';
        }
    });

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.padding = '1rem 5%';
            navbar.style.background = 'rgba(10, 10, 15, 0.95)';
        } else {
            navbar.style.padding = '1.5rem 5%';
            navbar.style.background = 'rgba(10, 10, 15, 0.8)';
        }
    });

    // Project Filtering & Show All
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    const showAllBtn = document.getElementById('show-all-projects-btn');
    const showAllBtnText = document.getElementById('show-all-btn-text');
    const projectsSection = document.getElementById('projects');
    let allProjectsVisible = false;

    function animateCardIn(card, delay = 0) {
        card.classList.remove('card-animate-in');
        // Force reflow so the animation restarts even if the class was already applied
        void card.offsetWidth;
        card.style.animationDelay = `${delay}ms`;
        card.classList.add('card-animate-in');
    }

    function applyFilter(filterValue) {
        allProjectsVisible = false;
        if (showAllBtn) {
            showAllBtn.classList.remove('expanded');
            showAllBtn.querySelector('i').className = 'fas fa-th-large';
        }

        let visibleCount = 0;
        let animIndex = 0;
        projectCards.forEach(card => {
            const categories = card.getAttribute('data-category');
            const matches = filterValue === 'all' || (categories && categories.includes(filterValue));

            if (matches) {
                visibleCount++;
                if (visibleCount <= 3) {
                    card.style.display = 'flex';
                    card.classList.remove('hidden-project');
                    animateCardIn(card, animIndex * 80);
                    animIndex++;
                } else {
                    card.style.display = 'none';
                    card.classList.add('hidden-project');
                    card.classList.remove('card-animate-in');
                }
            } else {
                card.style.display = 'none';
                card.classList.remove('hidden-project');
                card.classList.remove('card-animate-in');
            }
        });

        // Show/hide the "Show All" button
        if (showAllBtn) {
            showAllBtn.parentElement.style.display = visibleCount > 3 ? 'flex' : 'none';
        }

        // Update button text based on current language
        updateShowAllBtnText();
    }

    function updateShowAllBtnText() {
        if (!showAllBtnText) return;
        const lang = localStorage.getItem('preferredLang') || 'en';
        if (allProjectsVisible) {
            showAllBtnText.textContent = translations[lang] && translations[lang]['projects.showLess']
                ? translations[lang]['projects.showLess'] : 'Show Less';
        } else {
            showAllBtnText.textContent = translations[lang] && translations[lang]['projects.showAll']
                ? translations[lang]['projects.showAll'] : 'Show All Projects';
        }
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyFilter(btn.getAttribute('data-filter'));
        });
    });

    // Show All / Show Less button
    if (showAllBtn) {
        showAllBtn.addEventListener('click', () => {
            const activeFilter = document.querySelector('.filter-btn.active');
            const filterValue = activeFilter ? activeFilter.getAttribute('data-filter') : 'all';
            allProjectsVisible = !allProjectsVisible;

            if (allProjectsVisible) {
                showAllBtn.classList.add('expanded');
                showAllBtn.querySelector('i').className = 'fas fa-chevron-up';
                // Show all matching cards, animating in the ones that were previously hidden
                let animIndex = 0;
                projectCards.forEach(card => {
                    const categories = card.getAttribute('data-category');
                    if (filterValue === 'all' || (categories && categories.includes(filterValue))) {
                        const wasHidden = card.classList.contains('hidden-project');
                        card.style.display = 'flex';
                        card.classList.remove('hidden-project');
                        if (wasHidden) {
                            animateCardIn(card, animIndex * 80);
                            animIndex++;
                        }
                    }
                });
            } else {
                showAllBtn.classList.remove('expanded');
                showAllBtn.querySelector('i').className = 'fas fa-th-large';
                applyFilter(filterValue);

                // Pan back to the projects section so the collapse doesn't leave the view stranded
                if (projectsSection) {
                    projectsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
            updateShowAllBtnText();
        });
    }

    // Initialize with first 3 projects visible
    applyFilter('all');

    // Media Modal Logic (Video and Image)
    const videoModal = document.getElementById("video-modal");
    const videoModalContent = document.getElementById("expanded-video");
    const imageModalContent = document.getElementById("expanded-image");
    const closeVideoBtn = document.querySelector(".close-video-modal");
    const videoLinks = document.querySelectorAll(".video-link");
    const imageLinks = document.querySelectorAll(".image-link");

    if (videoModal && closeVideoBtn) {
        function openModal(isImage, src) {
            videoModal.style.display = "flex";
            if (isImage) {
                if (videoModalContent) {
                    videoModalContent.style.display = "none";
                    videoModalContent.src = "";
                }
                if (imageModalContent) {
                    imageModalContent.style.display = "block";
                    imageModalContent.src = src;
                }
            } else {
                if (imageModalContent) {
                    imageModalContent.style.display = "none";
                    imageModalContent.src = "";
                }
                if (videoModalContent) {
                    videoModalContent.style.display = "block";
                    videoModalContent.src = src;
                    videoModalContent.play();
                }
            }
        }

        function closeModal() {
            videoModal.style.display = "none";
            if (videoModalContent) {
                videoModalContent.pause();
                videoModalContent.src = "";
            }
            if (imageModalContent) {
                imageModalContent.src = "";
            }
        }

        videoLinks.forEach(link => {
            link.addEventListener("click", function (e) {
                e.preventDefault();
                openModal(false, this.getAttribute("href"));
            });
        });

        imageLinks.forEach(link => {
            link.addEventListener("click", function (e) {
                e.preventDefault();
                openModal(true, this.getAttribute("href"));
            });
        });

        closeVideoBtn.addEventListener("click", closeModal);

        videoModal.addEventListener("click", function (e) {
            if (e.target === videoModal) {
                closeModal();
            }
        });
    }

});