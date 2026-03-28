/* 
    Avenir de Thiawlene - General UI Scripts
*/

document.addEventListener('DOMContentLoaded', () => {
    // Scroll Reveal Animation
    function reveal() {
        const reveals = document.querySelectorAll(".reveal");
        reveals.forEach(el => {
            const windowHeight = window.innerHeight;
            const elementTop = el.getBoundingClientRect().top;
            const elementVisible = 150;
            if (elementTop < windowHeight - elementVisible) {
                el.classList.add("active");
            }
        });
    }

    // Staggered Reveal Animation
    function staggerReveal() {
        const reveals = document.querySelectorAll(".stagger-reveal");
        reveals.forEach((el, index) => {
            const windowHeight = window.innerHeight;
            const elementTop = el.getBoundingClientRect().top;
            const elementVisible = 100;
            if (elementTop < windowHeight - elementVisible) {
                setTimeout(() => {
                    el.classList.add("active");
                }, index * 200); // 200ms delay per element
            }
        });
    }

    // Parallax Effect
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

        // Close menu when clicking on a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    window.addEventListener("scroll", () => {
        reveal();
        staggerReveal();
        
        // Navbar Scroll Effect
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
    
    reveal(); // Initial check
    staggerReveal(); // Initial check
});
