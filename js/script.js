/* 
    Avenir de Thiawlene - General UI Scripts
*/

document.addEventListener('DOMContentLoaded', () => {
    // --- Modern Animation System (Intersection Observer) ---
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        };

        const appearanceObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (entry.target.classList.contains('stagger-reveal')) {
                        const parent = entry.target.parentElement;
                        const siblings = Array.from(parent.querySelectorAll('.stagger-reveal'));
                        const index = siblings.indexOf(entry.target);
                        
                        setTimeout(() => {
                            entry.target.classList.add('active');
                        }, index * 150);
                    } else {
                        entry.target.classList.add('active');
                    }
                    appearanceObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Initial observation
        const observeElements = (container = document) => {
            container.querySelectorAll('.reveal, .stagger-reveal').forEach(el => {
                appearanceObserver.observe(el);
            });
        };

        observeElements();

        // Support for dynamic content (MutationObserver)
        const mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // ELEMENT_NODE
                        if (node.classList.contains('reveal') || node.classList.contains('stagger-reveal')) {
                            appearanceObserver.observe(node);
                        }
                        // Also check within the added node
                        node.querySelectorAll('.reveal, .stagger-reveal').forEach(el => {
                            appearanceObserver.observe(el);
                        });
                    }
                });
            });
        });

        mutationObserver.observe(document.body, { childList: true, subtree: true });
    }

    // --- Hero Slider Logic ---
    function initHeroSlider() {
        const slides = document.querySelectorAll('.hero-slide');
        if (slides.length === 0) return;

        let currentSlide = 0;
        const slideInterval = 5000; // 5 seconds per slide

        // Ensure the first slide is visible immediately
        slides[0].classList.add('active');

        function nextSlide() {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }

        setInterval(nextSlide, slideInterval);
    }

    // --- Parallax Effect ---
    document.addEventListener('mousemove', (e) => {
        const parallaxElements = document.querySelectorAll('.parallax');
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        parallaxElements.forEach(el => {
            const speed = el.getAttribute('data-speed') || 0.05;
            const x = (window.innerWidth - mouseX * speed) / 100;
            const y = (window.innerHeight - mouseY * speed) / 100;
            el.style.transform = `translateX(${x}px) translateY(${y}px)`;
        });
    });

    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    // Navbar Scroll Effect
    window.addEventListener("scroll", () => {
        const nav = document.querySelector('nav');
        if (nav) {
            if (window.pageYOffset > 50) {
                nav.style.background = "rgba(255, 255, 255, 0.95)";
                nav.style.boxShadow = "var(--shadow-md)";
            } else {
                nav.style.background = "rgba(255, 255, 255, 0.8)";
                nav.style.boxShadow = "none";
            }
        }
    });

    // --- Launch ---
    initScrollAnimations();
    initHeroSlider();
});
