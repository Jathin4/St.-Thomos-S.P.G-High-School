// =============================================
// St. Thomas S.P.G High School - COMPLETE JAVASCRIPT
// =============================================



// =============================================
// 1. LOGIN / LOGOUT FLOW
// =============================================
document.addEventListener('DOMContentLoaded', function () {

    // Show website directly
    function showWebsite() {
        initScrollAnimations();
        initStatCounters();
    }
    showWebsite();

    // Welcome overlay - just remove it too
    const welcomeOverlay = document.getElementById('welcomeOverlay');
    if (welcomeOverlay) welcomeOverlay.style.display = 'none';

    // =============================================
    // 2. SMOOTH SCROLL
    // =============================================
    function smoothScrollTo(target) {
        const navHeight = document.getElementById('mainNav')?.offsetHeight || 70;
        const el = document.querySelector(target);
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY - navHeight - 10;
        window.scrollTo({ top, behavior: 'smooth' });
    }

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.length > 1 && href.startsWith('#')) {
                e.preventDefault();
                smoothScrollTo(href);
                document.getElementById('navLinks')?.classList.remove('open');
            }
        });
    });

    // =============================================
    // 3. ACTIVE NAV ON SCROLL
    // =============================================
    const sections = ['home', 'about', 'curriculum', 'facilities', 'activities', 'admissions', 'careers', 'contact'];

    function updateActiveNav() {
        const navHeight = document.getElementById('mainNav')?.offsetHeight || 70;
        let current = '';
        sections.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            if (window.scrollY + navHeight + 50 >= el.offsetTop) current = id;
        });
        document.querySelectorAll('.nav-links .nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) link.classList.add('active');
        });
    }
    window.addEventListener('scroll', updateActiveNav);

    // =============================================
    // 4. STICKY NAV SHADOW
    // =============================================
    window.addEventListener('scroll', function () {
        const nav = document.getElementById('mainNav');
        if (!nav) return;
        nav.style.boxShadow = window.scrollY > 50
            ? '0 4px 20px rgba(0,0,0,0.12)'
            : '0 2px 20px rgba(0,0,0,0.08)';
    });

    // =============================================
    // 5. HAMBURGER MENU
    // =============================================
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function () {
            navLinks.classList.toggle('open');
        });
    }

    // =============================================
    // 6. SCROLL REVEAL
    // =============================================
    function initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    setTimeout(() => entry.target.classList.add('visible'), i * 80);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }
    // if (savedLogin) initScrollAnimations();

    // =============================================
    // 7. STAT COUNTERS
    // =============================================
    function initStatCounters() {
        const statEls = document.querySelectorAll('.stat-num');
        if (!statEls.length) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target, parseInt(entry.target.getAttribute('data-target')));
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        statEls.forEach(el => observer.observe(el));
    }

    function animateCounter(el, target) {
        let current = 0;
        const steps = 60;
        const increment = target / steps;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) { current = target; clearInterval(timer); }
            el.textContent = Math.floor(current).toLocaleString();
        }, 1800 / steps);
    }

    // =============================================
    // 8. PHONE - DIGITS ONLY
    // =============================================
    const phoneInput = document.getElementById('parentPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function () {
            this.value = this.value.replace(/\D/g, '').slice(0, 10);
        });
    }

    // =============================================
    // 9. ADMISSION FORM → GOOGLE SHEETS
    // =============================================
    const admissionForm = document.getElementById('admissionForm');
    if (admissionForm) {
        admissionForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const student = document.getElementById('studentName').value.trim();
            const cls = document.getElementById('selectClass').value;
            const parent = document.getElementById('parentName').value.trim();
            const phone = document.getElementById('parentPhone').value.trim();

            if (!student || !cls || !parent || !phone) {
                showToast('Please fill all required fields.', 'error');
                return;
            }
            if (phone.length !== 10) {
                showToast('Enter a valid 10-digit phone number.', 'error');
                return;
            }

            fetch('https://sheetdb.io/api/v1/51k7xzz6psr18', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    data: {
                        Timestamp: new Date().toLocaleString(),
                        'Student Name': student,
                        'Select Class': cls,
                        'Parent Name': parent,
                        'Parent Phone': phone,
                        'Email Address': document.getElementById('admEmail').value,
                        City: document.getElementById('city').value,
                        Message: document.getElementById('admMessage').value
                    }
                })
            })
                .then(response => {
                    if (response.ok) {
                        showToast('✅ Enquiry submitted! We will contact you soon.', 'success');
                        admissionForm.reset();
                    } else {
                        showToast('❌ Something went wrong. Please try again.', 'error');
                    }
                })
                .catch(() => {
                    showToast('❌ Something went wrong. Please try again.', 'error');
                });
        });
    }

    // =============================================
    // 10. CONTACT FORM
    // =============================================
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = document.getElementById('contactName').value.trim();
            const email = document.getElementById('contactEmail').value.trim();
            const subject = document.getElementById('contactSubject').value.trim();
            const message = document.getElementById('contactMessage').value.trim();

            if (!name || !email) {
                showToast('Please fill all required fields.', 'error');
                return;
            }

            fetch('https://sheetdb.io/api/v1/n20vimh8twcmg', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    data: {
                        Timestamp: new Date().toLocaleString(),
                        'Your Name': name,
                        Email: email,
                        Subject: subject,
                        message: message
                    }
                })
            })
                .then(response => {
                    if (response.ok) {
                        showToast('✅ Message sent! We\'ll get back to you.', 'success');
                        contactForm.reset();
                    } else {
                        showToast('❌ Something went wrong. Please try again.', 'error');
                    }
                })
                .catch(() => {
                    showToast('❌ Something went wrong. Please try again.', 'error');
                });
        });
    }

    // =============================================
    // 11. TOAST
    // =============================================
    function showToast(message, type = 'success') {
        const toast = document.getElementById('toastMsg');
        if (!toast) return;
        toast.textContent = message;
        toast.className = 'toast-msg show ' + type;
        setTimeout(() => toast.classList.remove('show'), 3500);
    }

});