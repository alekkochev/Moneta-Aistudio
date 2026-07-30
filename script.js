// ========================================
// AOS INIT & FAILSAFE FALLBACK
// ========================================
function revealAllAosElements() {
    document.querySelectorAll('[data-aos]').forEach(el => {
        el.classList.add('aos-animate');
        el.style.opacity = '1';
        el.style.transform = 'none';
    });
}

function initAOS() {
    if (window.AOS) {
        AOS.init({
            duration: 700,
            once: true,
            offset: 40,
            easing: 'ease-out-cubic'
        });
    } else {
        revealAllAosElements();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAOS, { passive: true });
} else {
    initAOS();
}
window.addEventListener('load', initAOS, { passive: true });
// Failsafe timeout to guarantee elements are visible even if CDN fails
setTimeout(() => {
    if (!window.AOS) revealAllAosElements();
}, 500);

// ========================================
// MOBILE MENU
// ========================================
const toggle = document.getElementById('navToggle');
const nav = document.getElementById('navLinks');

toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.classList.toggle('is-active');
    toggle.setAttribute('aria-expanded', open);
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.navbar__inner') && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        toggle.classList.remove('is-active');
        toggle.setAttribute('aria-expanded', 'false');
    }
});

// ========================================
// LANGUAGE SWITCHER (MK <-> EN)
// ========================================
(function() {
    const langBtns = document.querySelectorAll('.lang-btn');
    if (!langBtns.length) return;

    let currentLang = localStorage.getItem('moneta_lang') || 'mk';

    const setLanguage = (lang) => {
        currentLang = lang;
        localStorage.setItem('moneta_lang', lang);

        langBtns.forEach((btn) => {
            const btnLang = btn.dataset.lang;
            if (btnLang === lang) {
                btn.classList.add('is-active');
                btn.setAttribute('aria-pressed', 'true');
            } else {
                btn.classList.remove('is-active');
                btn.setAttribute('aria-pressed', 'false');
            }
        });

        document.documentElement.lang = lang;

        // Update elements with textContent translation
        const translatableElements = document.querySelectorAll('[data-mk][data-en]');
        translatableElements.forEach((el) => {
            const text = el.getAttribute(`data-${lang}`);
            if (text) {
                if (el.hasAttribute('data-lang-html')) {
                    el.innerHTML = text;
                } else {
                    el.textContent = text;
                }
            }
        });

        // Update input placeholders
        const placeholderElements = document.querySelectorAll('[data-mk-placeholder][data-en-placeholder]');
        placeholderElements.forEach((el) => {
            const phText = el.getAttribute(`data-${lang}-placeholder`);
            if (phText) {
                el.placeholder = phText;
            }
        });

        // Update aria-labels and titles
        const ariaElements = document.querySelectorAll('[data-mk-aria][data-en-aria]');
        ariaElements.forEach((el) => {
            const ariaText = el.getAttribute(`data-${lang}-aria`);
            if (ariaText) {
                el.setAttribute('aria-label', ariaText);
                if (el.hasAttribute('title')) {
                    el.setAttribute('title', ariaText);
                }
            }
        });
    };

    langBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const targetLang = btn.dataset.lang;
            if (targetLang && targetLang !== currentLang) {
                setLanguage(targetLang);
            }
        });
    });

    if (currentLang !== 'mk') {
        setLanguage(currentLang);
    }
})();

// ========================================
// PRODUCT CARD SOCIAL SHARE POPOVER
// ========================================
(function() {
    const shareTriggers = document.querySelectorAll('.card__share-trigger');
    const shareBtns = document.querySelectorAll('.share-btn');

    if (!shareTriggers.length) return;

    // Toast Notification helper (Bottom-Right)
    const showShareToast = (message) => {
        let toast = document.getElementById('shareToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'shareToast';
            toast.className = 'share-toast';
            toast.setAttribute('role', 'status');
            toast.setAttribute('aria-live', 'polite');
            document.body.appendChild(toast);
        }

        toast.innerHTML = `
            <svg class="share-toast__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>${message}</span>
        `;

        // Force reflow for smooth animation trigger if newly added
        void toast.offsetWidth;

        toast.classList.add('is-visible');

        clearTimeout(toast.timer);
        toast.timer = setTimeout(() => {
            toast.classList.remove('is-visible');
        }, 3000);
    };

    const closeAllSharePopovers = () => {
        document.querySelectorAll('.card__share-popover').forEach(pop => {
            pop.classList.remove('is-open');
            pop.setAttribute('aria-hidden', 'true');
        });
        document.querySelectorAll('.card__share-trigger').forEach(btn => {
            btn.classList.remove('is-active');
        });
    };

    shareTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const card = trigger.closest('.card');
            const popover = card ? card.querySelector('.card__share-popover') : null;

            if (!popover) return;

            const isOpen = popover.classList.contains('is-open');

            closeAllSharePopovers();

            if (!isOpen) {
                popover.classList.add('is-open');
                popover.setAttribute('aria-hidden', 'false');
                trigger.classList.add('is-active');
            }
        });
    });

    shareBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const platform = btn.dataset.platform;
            const modelName = btn.dataset.modelName || 'MONETA Анатомски влошки';
            const modelUrl = btn.dataset.modelUrl || '#kategorii';

            const basePageUrl = window.location.href.split('#')[0];
            const fullUrl = modelUrl.startsWith('#')
                ? basePageUrl + modelUrl
                : (modelUrl.startsWith('http') ? modelUrl : basePageUrl + '#' + modelUrl);
            const currentLang = document.documentElement.lang || 'mk';

            if (platform === 'facebook') {
                const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`;
                window.open(fbShareUrl, '_blank', 'width=620,height=440,resizable=yes,scrollbars=yes');
                closeAllSharePopovers();
            } else if (platform === 'twitter') {
                const shareText = currentLang === 'en'
                    ? `${modelName} — Premium anatomical insoles for all-day comfort!`
                    : `${modelName} — Анатомски влошки за долготрајна удобност и стабилност!`;
                const twShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(fullUrl)}`;
                window.open(twShareUrl, '_blank', 'width=620,height=440,resizable=yes,scrollbars=yes');
                closeAllSharePopovers();
            } else if (platform === 'copy') {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(fullUrl).then(() => {
                        handleCopySuccess(btn, currentLang);
                    }).catch(() => {
                        fallbackCopyTextToClipboard(fullUrl, btn, currentLang);
                    });
                } else {
                    fallbackCopyTextToClipboard(fullUrl, btn, currentLang);
                }
            }
        });
    });

    function handleCopySuccess(btn, lang) {
        const textSpan = btn.querySelector('.copy-btn-text');
        const origText = textSpan ? textSpan.textContent : '';

        if (textSpan) {
            textSpan.textContent = lang === 'en' ? 'Copied! ✓' : 'Копирано! ✓';
        }

        const toastMsg = lang === 'en'
            ? 'Model link copied to clipboard!'
            : 'Линкот за споделување е копиран!';
        showShareToast(toastMsg);

        setTimeout(() => {
            if (textSpan) {
                textSpan.textContent = origText;
            }
            closeAllSharePopovers();
        }, 1800);
    }

    function fallbackCopyTextToClipboard(text, btn, lang) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.position = 'fixed';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            handleCopySuccess(btn, lang);
        } catch (err) {
            showShareToast(lang === 'en' ? 'Failed to copy link' : 'Грешка при копирање');
        }
        document.body.removeChild(textArea);
    }

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.card__share-trigger') && !e.target.closest('.card__share-popover')) {
            closeAllSharePopovers();
        }
    });
})();

// ========================================
// GSAP INIT (DEFERRED FOR NON-BLOCKING INITIAL PAINT)
// ========================================
function initGSAP() {
    if (window.gsap && window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);

        // Category Cards GSAP Stagger Animation
        const categoryCards = document.querySelectorAll('.categories__grid .card');
        if (categoryCards.length > 0) {
            gsap.from(categoryCards, {
                scrollTrigger: {
                    trigger: '.categories__grid',
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                opacity: 0,
                y: 35,
                duration: 0.7,
                stagger: 0.1,
                ease: 'power2.out',
                clearProps: 'transform,opacity'
            });
        }
    }
}

if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(initGSAP, { timeout: 2000 });
} else {
    window.addEventListener('load', () => setTimeout(initGSAP, 200), { passive: true });
}

// ========================================
// KONTAKT FORMA HANDLER (LAZY EMAILJS)
// ========================================
let emailjsPromise = null;
function loadEmailJS() {
    if (window.emailjs) return Promise.resolve(window.emailjs);
    if (emailjsPromise) return emailjsPromise;
    emailjsPromise = new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
        script.async = true;
        script.onload = () => {
            try {
                if (window.emailjs) window.emailjs.init("KTMO1pZn_2I0wSyZf");
            } catch (err) {}
            resolve(window.emailjs || null);
        };
        script.onerror = () => resolve(null);
        document.head.appendChild(script);
    });
    return emailjsPromise;
}

const kontaktForm = document.getElementById('kontaktForm');
const kontaktFeedback = document.getElementById('kontaktFeedback');

if (kontaktForm) {
    kontaktForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');
        const messageInput = document.getElementById('message');

        const name = nameInput ? nameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const phone = phoneInput ? phoneInput.value.trim() : '';
        const message = messageInput ? messageInput.value.trim() : '';

        if (!name || !email || !message || !email.includes('@') || !email.includes('.')) {
            if (kontaktFeedback) {
                kontaktFeedback.className = 'form__feedback is-error';
                kontaktFeedback.innerHTML = `
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <span>Ве молиме пополнете ги задолжителните полиња (име, валидна е-пошта и порака).</span>
                `;
            }
            return;
        }

        if (kontaktFeedback) {
            kontaktFeedback.className = 'form__feedback is-success';
            kontaktFeedback.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
                <span>Се испраќа вашата порака...</span>
            `;
        }

        const showSuccess = () => {
            if (kontaktFeedback) {
                kontaktFeedback.className = 'form__feedback is-success';
                kontaktFeedback.innerHTML = `
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>Ви благодариме ${name}! Вашата порака е успешно испратена. Ќе ве контактираме на ${email} во најкраток рок.</span>
                `;
            }
            kontaktForm.reset();
        };

        const emailjsInstance = await loadEmailJS();
        if (emailjsInstance) {
            emailjsInstance.send(
                "service_4ymilao",
                "template_r5ysad8",
                {
                    name: name,
                    email: email,
                    phone: phone,
                    message: message,
                    title: "Контакт од веб"
                }
            )
            .then(function() {
                showSuccess();
            })
            .catch(function(error) {
                console.warn('EmailJS sending error:', error);
                showSuccess();
            });
        } else {
            showSuccess();
        }
    });
}

// ========================================
// BACK TO TOP BUTTON
// ========================================
const backToTopBtn = document.getElementById('backToTop');
const heroSection = document.querySelector('.hero');

if (backToTopBtn) {
    const handleScroll = () => {
        const triggerPoint = heroSection ? heroSection.offsetHeight : 300;
        if (window.scrollY > triggerPoint) {
            backToTopBtn.classList.add('is-visible');
        } else {
            backToTopBtn.classList.remove('is-visible');
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ========================================
// FAQ ACCORDION INTERACTION WITH GSAP ANIMATION
// ========================================
const faqAccordion = document.getElementById('faqAccordion');
if (faqAccordion) {
    const faqItems = faqAccordion.querySelectorAll('.faq__item');

    faqItems.forEach((item) => {
        const questionBtn = item.querySelector('.faq__question');
        const answer = item.querySelector('.faq__answer');
        const answerContent = item.querySelector('.faq__answer-content');
        if (!questionBtn || !answer) return;

        const isCurrentlyOpen = item.classList.contains('is-open');
        if (typeof gsap !== 'undefined') {
            gsap.set(answer, {
                height: isCurrentlyOpen ? 'auto' : 0,
                opacity: isCurrentlyOpen ? 1 : 0,
                display: isCurrentlyOpen ? 'block' : 'none'
            });
            if (answerContent) {
                gsap.set(answerContent, {
                    opacity: isCurrentlyOpen ? 1 : 0,
                    y: isCurrentlyOpen ? 0 : -10
                });
            }
        }

        questionBtn.addEventListener('click', () => {
            const isOpen = item.classList.contains('is-open');

            // Close all items first for a clean single-open accordion experience
            faqItems.forEach((otherItem) => {
                const otherBtn = otherItem.querySelector('.faq__question');
                const otherAnswer = otherItem.querySelector('.faq__answer');
                const otherContent = otherItem.querySelector('.faq__answer-content');

                if (otherItem.classList.contains('is-open')) {
                    if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');

                    if (typeof gsap !== 'undefined' && otherAnswer) {
                        gsap.killTweensOf([otherAnswer, otherContent]);
                        if (otherContent) {
                            gsap.to(otherContent, {
                                opacity: 0,
                                y: -10,
                                duration: 0.25,
                                ease: 'power2.in'
                            });
                        }
                        gsap.to(otherAnswer, {
                            height: 0,
                            opacity: 0,
                            duration: 0.35,
                            ease: 'power2.inOut',
                            onComplete: () => {
                                otherItem.classList.remove('is-open');
                                gsap.set(otherAnswer, { display: 'none' });
                            }
                        });
                    } else {
                        otherItem.classList.remove('is-open');
                    }
                }
            });

            // Toggle clicked item if it wasn't open
            if (!isOpen) {
                item.classList.add('is-open');
                questionBtn.setAttribute('aria-expanded', 'true');

                if (typeof gsap !== 'undefined' && answer) {
                    gsap.killTweensOf([answer, answerContent]);
                    gsap.set(answer, { display: 'block' });

                    gsap.fromTo(answer,
                        { height: 0, opacity: 0 },
                        { height: 'auto', opacity: 1, duration: 0.38, ease: 'power2.out' }
                    );

                    if (answerContent) {
                        gsap.fromTo(answerContent,
                            { opacity: 0, y: -12 },
                            { opacity: 1, y: 0, duration: 0.35, delay: 0.05, ease: 'power2.out' }
                        );
                    }
                }
            }
        });
    });
}

// ========================================
// REVIEWS CAROUSEL SCROLL
// ========================================
const reviewsCarousel = document.getElementById('reviewsCarousel');
const reviewsPrev = document.getElementById('reviewsPrev');
const reviewsNext = document.getElementById('reviewsNext');

if (reviewsCarousel && reviewsPrev && reviewsNext) {
    const getScrollAmount = () => {
        const firstCard = reviewsCarousel.querySelector('.review-card');
        return firstCard ? firstCard.offsetWidth + 24 : 350;
    };

    reviewsPrev.addEventListener('click', () => {
        reviewsCarousel.scrollBy({
            left: -getScrollAmount(),
            behavior: 'smooth'
        });
    });

    reviewsNext.addEventListener('click', () => {
        reviewsCarousel.scrollBy({
            left: getScrollAmount(),
            behavior: 'smooth'
        });
    });
}

// ========================================
// SIZE FINDER MODAL & RECOMMENDATION LOGIC
// ========================================
const sizeModal = document.getElementById('sizeModal');
const openModalTriggers = document.querySelectorAll('[data-open-size-modal]');
const closeModalTriggers = document.querySelectorAll('[data-close-modal]');

if (sizeModal) {
    const openModal = () => {
        sizeModal.classList.add('is-open');
        sizeModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        sizeModal.classList.remove('is-open');
        sizeModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    openModalTriggers.forEach((trigger) => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
    });

    closeModalTriggers.forEach((trigger) => {
        trigger.addEventListener('click', closeModal);
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sizeModal.classList.contains('is-open')) {
            closeModal();
        }
    });

    // Recommendation Engine & Dynamic Size Calculator
    const sizePills = document.querySelectorAll('#sizePills .size-pill');
    const activityPills = document.querySelectorAll('#activityOptions .activity-pill');
    const resultContainer = document.getElementById('sizeResult');
    const customSizeInput = document.getElementById('customSizeInput');
    const customSizeBadge = document.getElementById('customSizeBadge');

    const sizeRangeMap = {
        '28-34': { minCm: 18.0, maxCm: 22.0, defaultCm: 20.0, labelMk: 'Детска големина 28-34 EU', labelEn: 'Kids Size 28-34 EU', trimLineMk: 'Подсечете по означената линија за соодветниот детски број', trimLineEn: 'Trim along marked line for child size' },
        '35-36': { minCm: 22.5, maxCm: 23.5, defaultCm: 23.0, labelMk: 'Број EU 35 - 36', labelEn: 'Shoe Size EU 35 - 36', trimLineMk: 'Подсечете по линијата за број 35 или 36', trimLineEn: 'Trim along guide line for size 35 or 36' },
        '37-38': { minCm: 23.8, maxCm: 24.8, defaultCm: 24.3, labelMk: 'Број EU 37 - 38', labelEn: 'Shoe Size EU 37 - 38', trimLineMk: 'Подсечете по линијата за број 37 или 38', trimLineEn: 'Trim along guide line for size 37 or 38' },
        '39-40': { minCm: 25.0, maxCm: 26.0, defaultCm: 25.5, labelMk: 'Број EU 39 - 40', labelEn: 'Shoe Size EU 39 - 40', trimLineMk: 'Подсечете по линијата за број 39 или 40', trimLineEn: 'Trim along guide line for size 39 or 40' },
        '41-42': { minCm: 26.3, maxCm: 27.3, defaultCm: 26.8, labelMk: 'Број EU 41 - 42', labelEn: 'Shoe Size EU 41 - 42', trimLineMk: 'Подсечете по линијата за број 41 или 42', trimLineEn: 'Trim along guide line for size 41 or 42' },
        '43-44': { minCm: 27.5, maxCm: 28.5, defaultCm: 28.0, labelMk: 'Број EU 43 - 44', labelEn: 'Shoe Size EU 43 - 44', trimLineMk: 'Подсечете по линијата за број 43 или 44', trimLineEn: 'Trim along guide line for size 43 or 44' },
        '45-46': { minCm: 28.8, maxCm: 29.8, defaultCm: 29.3, labelMk: 'Број EU 45 - 46', labelEn: 'Shoe Size EU 45 - 46', trimLineMk: 'Подсечете по линијата за број 45 или 46', trimLineEn: 'Trim along guide line for size 45 or 46' }
    };

    const insoleModels = {
        sport: {
            title_mk: 'MONETA Спортски анатомски влошки',
            title_en: 'MONETA Sports Anatomical Insoles',
            tag_mk: '98% Совпаѓање • Спорт & Трчање',
            tag_en: '98% Match • Sports & Running',
            image: './images/cards/Sportski.webp',
            link: '#kategorii',
            desc_mk: 'Напредна амортизација со ергономски силиконски гел перничиња на петицата за ублажување на удари и редукција на замор при трчање и спорт.',
            desc_en: 'Advanced cushioning with ergonomic silicone gel heel pads, engineered for impact absorption and fatigue reduction during athletic activities.',
            arch_mk: 'Ергономски 3D свод (Висока поддршка)',
            arch_en: 'Ergonomic 3D Arch (High Support)',
            tech_mk: ['Силиконски гел', 'Absorb & Breathable', 'Шок амортизација'],
            tech_en: ['Silicone Gel', 'Absorb & Breathable', 'Shock Cushioning']
        },
        leather: {
            title_mk: 'MONETA Елегантни кожни влошки',
            title_en: 'MONETA Elegant Leather Insoles',
            tag_mk: '96% Совпаѓање • Деловни & Кожни чевли',
            tag_en: '96% Match • Leather & Dress Shoes',
            image: './images/cards/Kozni.webp',
            link: '#kategorii',
            desc_mk: 'Ултра-тенка изработка од 100% природна кожа со вграден слој од активен јаглен кој овозможува непрекинато свежина и спречува непријатни мириси.',
            desc_en: 'Ultra-slim 100% genuine leather construction with active charcoal layer continuously keeping feet fresh and odor-free.',
            arch_mk: 'Анатомски тенок профил',
            arch_en: 'Anatomic Slim Profile',
            tech_mk: ['100% Природна кожа', 'Активен јаглен', 'Антибактериски'],
            tech_en: ['100% Genuine Leather', 'Active Charcoal', 'Antibacterial']
        },
        summer: {
            title_mk: 'MONETA Летни дишечки влошки',
            title_en: 'MONETA Summer Breathable Insoles',
            tag_mk: '97% Совпаѓање • Топло време & Свежина',
            tag_en: '97% Match • Warm Weather & Airflow',
            image: './images/cards/Letni.webp',
            link: '#kategorii',
            desc_mk: 'Микро-перфорирана олеснивачка структура што овозможува максимален проток на воздух, одржувајќи ги стапалата суви и свежи во тек на целиот ден.',
            desc_en: 'Micro-perforated lightweight structure providing maximum airflow to keep your feet dry and cool all day long.',
            arch_mk: 'Анатомски дишечки свод',
            arch_en: 'Anatomic Airflow Arch',
            tech_mk: ['Микро-перфорација', 'Анти-влага систем', 'Лесен флекс'],
            tech_en: ['Micro-perforated', 'Anti-moisture System', 'Lightweight Flex']
        },
        winter: {
            title_mk: 'MONETA Зимски термо влошки',
            title_en: 'MONETA Winter Thermo Insoles',
            tag_mk: '99% Совпаѓање • Термо заштита & Зима',
            tag_en: '99% Match • Thermal Shield & Winter',
            image: './images/cards/thermo_alu.webp',
            link: '#kategorii',
            desc_mk: 'Специјален трислоен термо систем со топлотна алуминиумска фолија и волнена површина кои ја задржуваат топлината и го рефлектираат студот.',
            desc_en: 'Special 3-layer thermal system with cold-reflecting aluminum foil barrier and natural wool layer for extreme warmth.',
            arch_mk: 'Термо-изолациски свод',
            arch_en: 'Thermo-Insulating Arch',
            tech_mk: ['Алуминиумска фолија', 'Топла волна', 'Мраз бариера'],
            tech_en: ['Aluminum Shield', 'Warm Wool', 'Frost Barrier']
        },
        hunter: {
            title_mk: 'MONETA HUNTER професионални влошки',
            title_en: 'MONETA HUNTER Heavy-Duty Insoles',
            tag_mk: '99% Совпаѓање • Терен & Работни чевли',
            tag_en: '99% Match • Extreme Field & Heavy Duty',
            image: './images/cards/hunter_vloski.webp',
            link: '#kategorii',
            desc_mk: 'Индустриски зајакната конструкција наменета за екстремни оптоварувања, лов, планинарење и тешки работни обувки.',
            desc_en: 'Industrial-grade reinforced structure designed for heavy-duty loads, hunting, trekking, and safety work boots.',
            arch_mk: 'Heavy-Duty Ortho поддршка',
            arch_en: 'Heavy-Duty Ortho Support',
            tech_mk: ['Ortho-Stabilizer', 'Екстремна издржливост', 'Анти-вибрација'],
            tech_en: ['Ortho-Stabilizer', 'Extreme Durability', 'Anti-Vibration']
        },
        kids: {
            title_mk: 'MONETA Детски анатомски влошки',
            title_en: 'MONETA Kids Anatomical Insoles',
            tag_mk: '100% Совпаѓање • Правилен детски развој',
            tag_en: '100% Match • Healthy Growth Support',
            image: './images/cards/detski.webp',
            link: '#kategorii',
            desc_mk: 'Ергономски обликувани влошки за мека поддршка на правилниот развој на стапалата и превенција од рамни стапала кај деца.',
            desc_en: 'Ergonomically contoured insoles providing gentle support for healthy foot arch development and play comfort.',
            arch_mk: 'Нежен детски анатомски профил',
            arch_en: 'Gentle Pediatric Anatomic Profile',
            tech_mk: ['Превенција рамни стапала', 'Мека поддршка', 'Хипоалергени'],
            tech_en: ['Flat Foot Prevention', 'Gentle Support', 'Hypoallergenic']
        }
    };

    let selectedSize = '39-40';
    let selectedActivity = 'sport';

    const getInsoleLengthInfo = (sizeKey, customVal) => {
        if (customVal && !isNaN(customVal) && customVal > 0) {
            // If user typed custom size (e.g. 40 or 25.5 cm)
            let euSize = customVal;
            let cmLen = 0;
            if (customVal <= 30 && customVal >= 15) {
                // Foot length entered in cm (e.g. 25.5 cm)
                cmLen = parseFloat(customVal);
                euSize = Math.round((cmLen + 1.5) / 0.667);
            } else {
                // EU size entered (e.g. 40)
                euSize = parseFloat(customVal);
                cmLen = (euSize * 0.667) - 1.2;
            }
            cmLen = Math.max(16, Math.min(32, cmLen));
            const mmLen = Math.round(cmLen * 10);
            return {
                cmText: `~ ${cmLen.toFixed(1)} cm (${mmLen} mm)`,
                sizeLabelMk: `Точен број EU ${euSize} (${cmLen.toFixed(1)} cm)`,
                sizeLabelEn: `Exact EU ${euSize} (${cmLen.toFixed(1)} cm)`,
                trimLineMk: `Прилагодете со ножици по ознаката за EU ${Math.round(euSize)}`,
                trimLineEn: `Trim with scissors along line for EU ${Math.round(euSize)}`
            };
        }

        const info = sizeRangeMap[sizeKey] || sizeRangeMap['39-40'];
        const mmMin = Math.round(info.minCm * 10);
        const mmMax = Math.round(info.maxCm * 10);
        return {
            cmText: `${info.minCm.toFixed(1)} cm - ${info.maxCm.toFixed(1)} cm (${mmMin}-${mmMax} mm)`,
            sizeLabelMk: info.labelMk,
            sizeLabelEn: info.labelEn,
            trimLineMk: info.trimLineMk,
            trimLineEn: info.trimLineEn
        };
    };

    const updateRecommendation = () => {
        if (!resultContainer) return;
        const currentLang = document.documentElement.lang || localStorage.getItem('moneta_lang') || 'mk';
        const isEn = currentLang === 'en';

        // Auto-select kids activity if kids size selected
        if (selectedSize === '28-34') {
            selectedActivity = 'kids';
            activityPills.forEach((p) => {
                p.classList.toggle('is-active', p.dataset.activity === 'kids');
            });
        } else if (selectedActivity === 'kids' && selectedSize !== '28-34') {
            selectedActivity = 'sport';
            activityPills.forEach((p) => {
                p.classList.toggle('is-active', p.dataset.activity === 'sport');
            });
        }

        const model = insoleModels[selectedActivity] || insoleModels.sport;
        const customVal = customSizeInput ? parseFloat(customSizeInput.value) : NaN;
        const lengthInfo = getInsoleLengthInfo(selectedSize, customVal);

        // Update badge text if custom size input exists
        if (customSizeBadge) {
            customSizeBadge.textContent = lengthInfo.cmText;
        }

        const titleText = isEn ? model.title_en : model.title_mk;
        const tagText = isEn ? model.tag_en : model.tag_mk;
        const descText = isEn ? model.desc_en : model.desc_mk;
        const archText = isEn ? model.arch_en : model.arch_mk;
        const sizeLabel = isEn ? lengthInfo.sizeLabelEn : lengthInfo.sizeLabelMk;
        const trimAdvice = isEn ? lengthInfo.trimLineEn : lengthInfo.trimLineMk;
        const techList = isEn ? model.tech_en : model.tech_mk;

        const ctaText = isEn ? 'Explore model details →' : 'Погледни ги сите детали за овој модел →';
        const sizeHeading = isEn ? 'Recommended Size:' : 'Препорачан број:';
        const lengthHeading = isEn ? 'Insole Length:' : 'Должина на влошка:';
        const trimHeading = isEn ? 'Trimming Advice:' : 'Совет за кастрење:';
        const archHeading = isEn ? 'Arch Profile:' : 'Профил на свод:';

        const techChipsHtml = techList.map(t => `<span class="result-card__tech-chip">${t}</span>`).join('');

        resultContainer.innerHTML = `
            <div class="result-card__image">
                <img src="${model.image}" alt="${titleText}" width="400" height="300" loading="lazy" decoding="async">
            </div>
            <div class="result-card__content">
                <div class="result-card__header-row">
                    <span class="result-card__tag">${tagText}</span>
                    <span class="result-card__cm-pill">${lengthInfo.cmText.split(' ')[0]} ${lengthInfo.cmText.split(' ')[1] || 'cm'}</span>
                </div>
                <h4 class="result-card__title">${titleText}</h4>
                <div class="result-card__specs-grid">
                    <p class="result-card__spec-item">
                        <strong>${sizeHeading}</strong> ${sizeLabel}
                    </p>
                    <p class="result-card__spec-item">
                        <strong>${lengthHeading}</strong> ${lengthInfo.cmText}
                    </p>
                    <p class="result-card__spec-item">
                        <strong>${archHeading}</strong> ${archText}
                    </p>
                    <p class="result-card__spec-item">
                        <strong>${trimHeading}</strong> ${trimAdvice}
                    </p>
                </div>
                <p class="result-card__desc">${descText}</p>
                <div class="result-card__tech-row">
                    ${techChipsHtml}
                </div>
                <a href="${model.link}" class="result-card__cta" data-close-modal>
                    ${ctaText}
                </a>
            </div>
        `;
    };

    sizePills.forEach((pill) => {
        pill.addEventListener('click', () => {
            sizePills.forEach((p) => p.classList.remove('is-active'));
            pill.classList.add('is-active');
            selectedSize = pill.dataset.size;
            if (customSizeInput) customSizeInput.value = '';
            updateRecommendation();
        });
    });

    activityPills.forEach((pill) => {
        pill.addEventListener('click', () => {
            activityPills.forEach((p) => p.classList.remove('is-active'));
            pill.classList.add('is-active');
            selectedActivity = pill.dataset.activity;
            updateRecommendation();
        });
    });

    if (customSizeInput) {
        customSizeInput.addEventListener('input', () => {
            const val = parseFloat(customSizeInput.value);
            if (!isNaN(val) && val > 0) {
                // Highlight closest pill range
                let matchedPillKey = '39-40';
                if (val <= 34 || val <= 22) matchedPillKey = '28-34';
                else if (val <= 36 || val <= 23.5) matchedPillKey = '35-36';
                else if (val <= 38 || val <= 24.8) matchedPillKey = '37-38';
                else if (val <= 40 || val <= 26.0) matchedPillKey = '39-40';
                else if (val <= 42 || val <= 27.3) matchedPillKey = '41-42';
                else if (val <= 44 || val <= 28.5) matchedPillKey = '43-44';
                else matchedPillKey = '45-46';

                selectedSize = matchedPillKey;
                sizePills.forEach((p) => {
                    p.classList.toggle('is-active', p.dataset.size === matchedPillKey);
                });
            }
            updateRecommendation();
        });
    }

    // Re-render recommendation when language buttons are clicked
    document.querySelectorAll('.navbar__lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setTimeout(updateRecommendation, 50);
        });
    });

    // Initial calculation
    updateRecommendation();
}
}

// ========================================
// ORDER TRACKER LOGIC
// ========================================
const orderTrackerForm = document.getElementById('orderTrackerForm');
const orderIdInput = document.getElementById('orderIdInput');
const orderStatusResult = document.getElementById('orderStatusResult');
const sampleChips = document.querySelectorAll('.order-sample-chip');

if (orderTrackerForm && orderIdInput && orderStatusResult) {
    const knownOrders = {
        'MN-8492': {
            id: 'MN-8492',
            statusText: 'Во достава од курир',
            badgeClass: 'order-result__badge--delivering',
            currentStep: 3, // Step 3 active
            courier: 'Карго Експрес МК',
            date: 'Денес, до 15:30 ч.',
            item: '1x Спортски анатомски влошки (41-42)'
        },
        'MN-3021': {
            id: 'MN-3021',
            statusText: 'Испратена од централен магацин',
            badgeClass: 'order-result__badge--shipped',
            currentStep: 2,
            courier: 'Брза Пошта МК',
            date: 'Очекувана достава утре',
            item: '2x Кожни елегантни влошки (39-40)'
        },
        'MN-1094': {
            id: 'MN-1094',
            statusText: 'Успешно испорачана',
            badgeClass: 'order-result__badge--delivered',
            currentStep: 4,
            courier: 'Врачено на примач',
            date: 'Испорачано на 27 Илунденска бр. 12',
            item: '1x Зимски термо влошки (43-44)'
        }
    };

    const trackOrder = (queryId) => {
        const cleanId = queryId.trim().toUpperCase();
        if (!cleanId) return;

        let orderData = knownOrders[cleanId];

        // Fallback generator for custom inputs (e.g., MN-5512)
        if (!orderData) {
            const formattedId = cleanId.startsWith('MN-') ? cleanId : `MN-${cleanId}`;
            orderData = {
                id: formattedId,
                statusText: 'Се подготвува за пакување',
                badgeClass: 'order-result__badge--processing',
                currentStep: 1,
                courier: 'MONETA Централен магацин Скопје',
                date: 'Очекувано испраќање за 24ч',
                item: '1x MONETA Анатомски влошки'
            };
        }

        const steps = [
            { num: 1, label: 'Примена' },
            { num: 2, label: 'Испратена' },
            { num: 3, label: 'Во достава' },
            { num: 4, label: 'Испорачана' }
        ];

        const timelineHtml = steps.map((s) => {
            let stateClass = '';
            let iconText = s.num;

            if (s.num < orderData.currentStep) {
                stateClass = 'is-done';
                iconText = '✓';
            } else if (s.num === orderData.currentStep) {
                stateClass = orderData.currentStep === 4 ? 'is-done' : 'is-active';
                if (orderData.currentStep === 4) iconText = '✓';
            }

            return `
                <div class="timeline-step ${stateClass}">
                    <div class="timeline-step__dot">${iconText}</div>
                    <span class="timeline-step__label">${s.label}</span>
                </div>
            `;
        }).join('');

        orderStatusResult.style.display = 'block';
        orderStatusResult.innerHTML = `
            <div class="order-result__header">
                <div class="order-result__id">
                    <span>Пратка #${orderData.id}</span>
                </div>
                <span class="order-result__badge ${orderData.badgeClass}">${orderData.statusText}</span>
            </div>

            <div class="order-result__timeline">
                ${timelineHtml}
            </div>

            <div class="order-result__details">
                <div class="order-detail-item">
                    <span>Курирска служба:</span>
                    <strong>${orderData.courier}</strong>
                </div>
                <div class="order-detail-item">
                    <span>Статус / Време:</span>
                    <strong>${orderData.date}</strong>
                </div>
                <div class="order-detail-item">
                    <span>Содржина на пакет:</span>
                    <strong>${orderData.item}</strong>
                </div>
            </div>
        `;
    };

    orderTrackerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        trackOrder(orderIdInput.value);
    });

    sampleChips.forEach((chip) => {
        chip.addEventListener('click', () => {
            const sampleId = chip.dataset.sample;
            if (sampleId) {
                orderIdInput.value = sampleId;
                trackOrder(sampleId);
            }
        });
    });
}

// ========================================
// NEWSLETTER SUBSCRIPTION LOGIC
// ========================================
const newsletterForm = document.getElementById('newsletterForm');
const newsletterEmailInput = document.getElementById('newsletterEmailInput');
const newsletterFeedback = document.getElementById('newsletterFeedback');

if (newsletterForm && newsletterEmailInput && newsletterFeedback) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const validateEmail = (email) => {
        if (!email) return { valid: false, reason: 'empty' };
        if (!emailRegex.test(email)) return { valid: false, reason: 'format' };
        return { valid: true };
    };

    const clearValidationState = () => {
        newsletterEmailInput.classList.remove('is-invalid');
        newsletterFeedback.className = 'newsletter__feedback';
        newsletterFeedback.innerHTML = '';
    };

    newsletterEmailInput.addEventListener('input', () => {
        if (newsletterEmailInput.classList.contains('is-invalid')) {
            const result = validateEmail(newsletterEmailInput.value.trim());
            if (result.valid) {
                clearValidationState();
            }
        }
    });

    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = newsletterEmailInput.value.trim();
        const lang = document.documentElement.lang === 'en' ? 'en' : 'mk';
        const validation = validateEmail(email);

        if (!validation.valid) {
            newsletterEmailInput.classList.add('is-invalid');
            newsletterFeedback.className = 'newsletter__feedback is-error';

            let errorMsg = '';
            if (validation.reason === 'empty') {
                errorMsg = lang === 'en' 
                    ? 'Please enter your email address.' 
                    : 'Ве молиме внесете ја вашата е-пошта адреса.';
            } else {
                errorMsg = lang === 'en' 
                    ? 'Please enter a valid email address (e.g., name@domain.com).' 
                    : 'Ве молиме внесете валиден формат на е-пошта (на пр. ime@domen.mk).';
            }

            newsletterFeedback.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>${errorMsg}</span>
            `;
            newsletterEmailInput.focus();
            return;
        }

        newsletterEmailInput.classList.remove('is-invalid');
        newsletterFeedback.className = 'newsletter__feedback is-success';
        const successMsg = lang === 'en'
            ? 'Thank you! You have successfully subscribed to our foot health newsletter.'
            : 'Ви благодариме! Успешно се пријавивте за нашиот билтен со совети за здравје на стапалата.';

        newsletterFeedback.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span>${successMsg}</span>
        `;
        newsletterEmailInput.value = '';
    });
}

// ========================================
// GSAP CATEGORY CARDS 3D TILT EFFECT
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    const categoryCards = document.querySelectorAll('.categories__grid .card');
    const isHoverCapable = window.matchMedia('(hover: hover)').matches;

    if (categoryCards.length > 0 && typeof gsap !== 'undefined' && isHoverCapable) {
        categoryCards.forEach((card) => {
            const icon = card.querySelector('.card__icon');
            const title = card.querySelector('h4');
            const link = card.querySelector('.card__link');

            gsap.set(card, {
                transformPerspective: 1000,
                transformStyle: 'preserve-3d'
            });

            card.addEventListener('mouseenter', () => {
                gsap.to(card, {
                    scale: 1.03,
                    duration: 0.3,
                    ease: 'power2.out',
                    overwrite: 'auto'
                });
            });

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                // Max tilt 12 degrees
                const rotateX = -((y - centerY) / centerY) * 12;
                const rotateY = ((x - centerX) / centerX) * 12;

                gsap.to(card, {
                    rotationX: rotateX,
                    rotationY: rotateY,
                    duration: 0.35,
                    ease: 'power2.out',
                    overwrite: 'auto'
                });

                // Subtle parallax depth for internal elements
                if (icon) {
                    gsap.to(icon, {
                        x: ((x - centerX) / centerX) * 8,
                        y: ((y - centerY) / centerY) * 8,
                        z: 25,
                        duration: 0.35,
                        ease: 'power2.out',
                        overwrite: 'auto'
                    });
                }
                if (title) {
                    gsap.to(title, {
                        x: ((x - centerX) / centerX) * 4,
                        y: ((y - centerY) / centerY) * 4,
                        z: 15,
                        duration: 0.35,
                        ease: 'power2.out',
                        overwrite: 'auto'
                    });
                }
                if (link) {
                    gsap.to(link, {
                        x: ((x - centerX) / centerX) * 6,
                        y: ((y - centerY) / centerY) * 6,
                        z: 20,
                        duration: 0.35,
                        ease: 'power2.out',
                        overwrite: 'auto'
                    });
                }
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    rotationX: 0,
                    rotationY: 0,
                    scale: 1,
                    duration: 0.5,
                    ease: 'power3.out',
                    overwrite: 'auto'
                });

                if (icon) {
                    gsap.to(icon, {
                        x: 0,
                        y: 0,
                        z: 0,
                        duration: 0.5,
                        ease: 'power3.out',
                        overwrite: 'auto'
                    });
                }
                if (title) {
                    gsap.to(title, {
                        x: 0,
                        y: 0,
                        z: 0,
                        duration: 0.5,
                        ease: 'power3.out',
                        overwrite: 'auto'
                    });
                }
                if (link) {
                    gsap.to(link, {
                        x: 0,
                        y: 0,
                        z: 0,
                        duration: 0.5,
                        ease: 'power3.out',
                        overwrite: 'auto'
                    });
                }
            });
        });
    }
});

// ========================================
// COMPARE MODELS TOGGLE INTERACTION
// ========================================
const compareToggleBtn = document.getElementById('compareToggleBtn');
const compareCloseBtn = document.getElementById('compareCloseBtn');
const compareModelsSection = document.getElementById('compareModelsSection');

if (compareToggleBtn && compareModelsSection) {
    const compareCard = compareModelsSection.querySelector('.compare-models__card');

    const toggleCompareSection = (forceClose = false) => {
        const isOpen = compareToggleBtn.classList.contains('is-active');
        const shouldClose = forceClose || isOpen;

        if (shouldClose) {
            compareToggleBtn.classList.remove('is-active');
            compareToggleBtn.setAttribute('aria-expanded', 'false');
            compareModelsSection.setAttribute('aria-hidden', 'true');

            if (typeof gsap !== 'undefined') {
                gsap.to(compareCard, {
                    opacity: 0,
                    y: -20,
                    duration: 0.25,
                    ease: 'power2.in'
                });
                gsap.to(compareModelsSection, {
                    height: 0,
                    duration: 0.4,
                    ease: 'power2.inOut',
                    onComplete: () => {
                        gsap.set(compareModelsSection, { display: 'none' });
                    }
                });
            } else {
                compareModelsSection.style.display = 'none';
            }
        } else {
            compareToggleBtn.classList.add('is-active');
            compareToggleBtn.setAttribute('aria-expanded', 'true');
            compareModelsSection.setAttribute('aria-hidden', 'false');

            if (typeof gsap !== 'undefined') {
                gsap.set(compareModelsSection, { display: 'block', height: 0 });
                gsap.set(compareCard, { opacity: 0, y: -20 });

                gsap.to(compareModelsSection, {
                    height: 'auto',
                    duration: 0.45,
                    ease: 'power2.out'
                });
                gsap.to(compareCard, {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    delay: 0.08,
                    ease: 'power2.out',
                    onComplete: () => {
                        compareModelsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                });
            } else {
                compareModelsSection.style.display = 'block';
            }
        }
    };

    compareToggleBtn.addEventListener('click', () => toggleCompareSection());
    if (compareCloseBtn) {
        compareCloseBtn.addEventListener('click', () => toggleCompareSection(true));
    }
}

// ========================================
// INTERACTIVE 1:1 MODEL COMPARISON TOOL ENGINE
// ========================================
(function initInteractiveCompareTool() {
    const compareSelect1 = document.getElementById('compareSelect1');
    const compareSelect2 = document.getElementById('compareSelect2');
    const compareSwapBtn = document.getElementById('compareSwapBtn');
    const compareDiffOnlyToggle = document.getElementById('compareDiffOnlyToggle');
    const compareDiffCountBadge = document.getElementById('compareDiffCountBadge');
    const compareInteractiveContainer = document.getElementById('compareInteractiveContainer');
    const compareTabInteractive = document.getElementById('compareTabInteractive');
    const compareTabOverview = document.getElementById('compareTabOverview');
    const compareInteractiveView = document.getElementById('compareInteractiveView');
    const compareOverviewView = document.getElementById('compareOverviewView');
    const presetChips = document.querySelectorAll('.compare-preset-chip');

    if (!compareSelect1 || !compareSelect2 || !compareInteractiveContainer) return;

    // Full Specs Data Matrix
    const COMPARE_PRODUCTS = {
        sportski: {
            id: 'sportski',
            name: { mk: 'Спортски влошки', en: 'Sports Insoles' },
            shortName: { mk: 'Спортски', en: 'Sports' },
            image: './images/cards/Sportski.webp',
            link: './index.html#kategorii',
            price: '890 ден.',
            specs: {
                material: { mk: 'EVA пена & Gel перничиња', en: 'EVA foam & Gel cushioning' },
                purpose: { mk: 'Спорт, трчање, активно вежбање', en: 'Sports, running, active workouts' },
                archSupport: { mk: 'Висока', en: 'High', levelPercent: 85, badgeClass: 'compare-badge--high' },
                shockAbsorption: { stars: '★★★★★', score: '5/5', mk: 'Максимална (5/5)', en: 'Maximum (5/5)' },
                thickness: { mk: '4 - 6 mm', en: '4 - 6 mm' },
                keyFeature: { mk: 'Гел амортизација за пета и шок-апсорпција', en: 'Gel heel cushioning & high shock absorption' },
                footwear: { mk: 'Спортски патики, тренинг и активни обувки', en: 'Athletic sneakers, running & workout shoes' },
                odorControl: { mk: 'Перфорирана дишлива EVA пена', en: 'Perforated breathable EVA foam' },
                care: { mk: 'Рачно миење со блага сапуница и млака вода', en: 'Hand wash with mild soap and warm water' },
                fatigue: { mk: 'Намалува притисок во зглобовите до 95%', en: 'Reduces joint pressure by up to 95%' }
            }
        },
        kozhni: {
            id: 'kozhni',
            name: { mk: 'Кожни влошки', en: 'Leather Insoles' },
            shortName: { mk: 'Кожни', en: 'Leather' },
            image: './images/cards/Kozni.webp',
            link: './index.html#kategorii',
            price: '890 ден.',
            specs: {
                material: { mk: '100% природна кожа & мек латекс', en: '100% genuine leather & soft latex' },
                purpose: { mk: 'Елегантни, деловни и секојдневни обувки', en: 'Elegant, business & everyday shoes' },
                archSupport: { mk: 'Средна', en: 'Medium', levelPercent: 65, badgeClass: 'compare-badge--medium' },
                shockAbsorption: { stars: '★★★☆☆', score: '3/5', mk: 'Умерена (3/5)', en: 'Moderate (3/5)' },
                thickness: { mk: '3 - 4 mm', en: '3 - 4 mm' },
                keyFeature: { mk: 'Природна кожа која абсорбира влага и мирис', en: 'Natural leather moisture & odor absorption' },
                footwear: { mk: 'Деловни чевли, чизми и суви обувки', en: 'Dress shoes, leather boots & formal shoes' },
                odorControl: { mk: 'Природни макропори против потење', en: 'Natural pores resisting sweat' },
                care: { mk: 'Бришење со влажна/сува памучна крпа', en: 'Wipe clean with damp or dry cloth' },
                fatigue: { mk: 'Спречува лизгање и дава елегантна удобност', en: 'Prevents slippage with elegant comfort' }
            }
        },
        letni: {
            id: 'letni',
            name: { mk: 'Летни влошки', en: 'Summer Insoles' },
            shortName: { mk: 'Летни', en: 'Summer' },
            image: './images/cards/Letni.webp',
            link: './index.html#kategorii',
            price: '790 ден.',
            specs: {
                material: { mk: 'Памук / Лен со активен јаглен', en: 'Cotton / Linen with activated carbon' },
                purpose: { mk: 'Летни обувки, носење на босо стапало', en: 'Summer footwear, barefoot wear' },
                archSupport: { mk: 'Лесна', en: 'Light', levelPercent: 40, badgeClass: 'compare-badge--light' },
                shockAbsorption: { stars: '★★☆☆☆', score: '2/5', mk: 'Лесна (2/5)', en: 'Light (2/5)' },
                thickness: { mk: '2 - 3 mm', en: '2 - 3 mm' },
                keyFeature: { mk: 'Фитер од активен јаглен против непријатни мириси', en: 'Activated carbon filter neutralizing odors' },
                footwear: { mk: 'Мокасини, еспадрили, патики и летни чевли', en: 'Loafers, espadrilles, sneakers & summer shoes' },
                odorControl: { mk: 'Максимална заштита со активен јаглен', en: 'Maximum active carbon odor protection' },
                care: { mk: 'Рачно перење на температура до 30°C', en: 'Hand wash at temperatures up to 30°C' },
                fatigue: { mk: 'Свежина и чувство на сувост во топли денови', en: 'Freshness and dryness on hot days' }
            }
        },
        zimski: {
            id: 'zimski',
            name: { mk: 'Зимски влошки', en: 'Winter Insoles' },
            shortName: { mk: 'Зимски', en: 'Winter' },
            image: './images/cards/thermo_alu.webp',
            link: './index.html#kategorii',
            price: '890 ден.',
            specs: {
                material: { mk: '100% природна волна & алуминиумски слој', en: '100% natural wool & aluminium barrier' },
                purpose: { mk: 'Зимски чизми, топлотна изолација во студ', en: 'Winter boots, cold weather isolation' },
                archSupport: { mk: 'Средна', en: 'Medium', levelPercent: 60, badgeClass: 'compare-badge--medium' },
                shockAbsorption: { stars: '★★★★☆', score: '4/5', mk: 'Висока (4/5)', en: 'High (4/5)' },
                thickness: { mk: '5 - 7 mm', en: '5 - 7 mm' },
                keyFeature: { mk: 'Термо-алуминиумска заштита од ладен под', en: 'Thermo-aluminium cold ground barrier' },
                footwear: { mk: 'Зимски чизми, спортски чизми за снег', en: 'Winter boots, snow boots, heavy shoes' },
                odorControl: { mk: 'Природна волнена саморегулација', en: 'Natural self-regulating wool' },
                care: { mk: 'Нежно четкање со сува четка', en: 'Gentle dry brushing' },
                fatigue: { mk: 'Ги одржува стапалата топли во екстремен студ', en: 'Keeps feet warm in extreme cold conditions' }
            }
        },
        hunter: {
            id: 'hunter',
            name: { mk: 'HUNTER влошки', en: 'HUNTER Insoles' },
            shortName: { mk: 'HUNTER', en: 'HUNTER' },
            image: './images/cards/hunter_vloski.webp',
            link: './index.html#kategorii',
            price: '990 ден.',
            specs: {
                material: { mk: 'Гумена база & мемори пена за екстремни услови', en: 'Heavy rubber base & high-density memory foam' },
                purpose: { mk: 'Лов, планинарење, теренска работа', en: 'Hunting, hiking, extreme outdoor duty' },
                archSupport: { mk: 'Максимална', en: 'Maximum', levelPercent: 100, badgeClass: 'compare-badge--max' },
                shockAbsorption: { stars: '★★★★★', score: '5/5', mk: 'Максимална (5/5)', en: 'Maximum (5/5)' },
                thickness: { mk: '6 - 8 mm', en: '6 - 8 mm' },
                keyFeature: { mk: 'Водоотпорна гумена чашка и длабоко фиксирање', en: 'Waterproof rubber base & deep heel cup' },
                footwear: { mk: 'Ловечки чизми, планински и работни обувки', en: 'Hunting boots, hiking boots, work boots' },
                odorControl: { mk: 'Хидрофобна антибактериска површина', en: 'Hydrophobic antibacterial layer' },
                care: { mk: 'Директно миење под млаз вода со сапун', en: 'Direct rinse with water and soap' },
                fatigue: { mk: 'Спречува извиткување на глуждот на нерамен терен', en: 'Prevents ankle rolls on rugged terrain' }
            }
        },
        detski: {
            id: 'detski',
            name: { mk: 'Детски влошки', en: 'Kids Insoles' },
            shortName: { mk: 'Детски', en: 'Kids' },
            image: './images/cards/detski.webp',
            link: './index.html#kategorii',
            price: '690 ден.',
            specs: {
                material: { mk: 'Хипоалергенска мека анатомична пена', en: 'Hypoallergenic soft anatomical foam' },
                purpose: { mk: 'Детски обувки, училиште & спорт', en: 'Children shoes, school & playtime' },
                archSupport: { mk: 'Деликатна', en: 'Gentle', levelPercent: 50, badgeClass: 'compare-badge--gentle' },
                shockAbsorption: { stars: '★★★☆☆', score: '3/5', mk: 'Средна (3/5)', en: 'Medium (3/5)' },
                thickness: { mk: '3 - 4 mm', en: '3 - 4 mm' },
                keyFeature: { mk: 'Анатомски обликувана за правилен раст на стапалото', en: 'Anatomically molded for healthy foot growth' },
                footwear: { mk: 'Детски патики, училишни чевли', en: 'Kids sneakers, school shoes, boots' },
                odorControl: { mk: 'Благ антибактериски слој за детска кожа', en: 'Gentle antibacterial layer for young skin' },
                care: { mk: 'Брзо сушење по рачно миење', en: 'Quick drying after hand wash' },
                fatigue: { mk: 'Поддржува правилно држење на детското тело', en: 'Supports healthy posture during development' }
            }
        }
    };

    const SPEC_DEFINITIONS = [
        { key: 'material', label: { mk: 'Материјал и Состав', en: 'Material & Composition' } },
        { key: 'purpose', label: { mk: 'Главна намена', en: 'Primary Use' } },
        { key: 'archSupport', label: { mk: 'Поддршка за свод', en: 'Arch Support' }, type: 'arch' },
        { key: 'shockAbsorption', label: { mk: 'Апсорпција на шок', en: 'Shock Absorption' }, type: 'stars' },
        { key: 'thickness', label: { mk: 'Дебелина', en: 'Thickness' } },
        { key: 'keyFeature', label: { mk: 'Клучна одлика', en: 'Key Advantage' } },
        { key: 'footwear', label: { mk: 'Препорачани обувки', en: 'Recommended Footwear' } },
        { key: 'odorControl', label: { mk: 'Заштита од мириси', en: 'Odor & Sweat Protection' } },
        { key: 'care', label: { mk: 'Одржување и миење', en: 'Care & Cleaning' } },
        { key: 'fatigue', label: { mk: 'Редукција на замор', en: 'Fatigue Benefit' } }
    ];

    const getLang = () => document.documentElement.lang === 'en' ? 'en' : 'mk';

    const renderSideBySideTable = () => {
        const lang = getLang();
        const p1Id = compareSelect1.value;
        const p2Id = compareSelect2.value;
        const p1 = COMPARE_PRODUCTS[p1Id] || COMPARE_PRODUCTS.sportski;
        const p2 = COMPARE_PRODUCTS[p2Id] || COMPARE_PRODUCTS.kozhni;

        const showDiffOnly = compareDiffOnlyToggle ? compareDiffOnlyToggle.checked : false;
        let totalDiffs = 0;

        let html = '';

        // Product Header Grid
        html += `
            <div class="compare-product-header-grid">
                <div class="compare-header-label-cell">
                    <span>${lang === 'en' ? 'SPECIFICATIONS' : 'СПЕЦИФИКАЦИИ'}</span>
                </div>
                <div class="compare-product-card-head">
                    <img src="${p1.image}" alt="${p1.name[lang]}" class="compare-phead-img">
                    <div class="compare-phead-info">
                        <h4 class="compare-phead-title">${p1.name[lang]}</h4>
                        <span class="compare-phead-price">${p1.price}</span>
                        <a href="${p1.link}" class="compare-phead-link">${lang === 'en' ? 'View Details →' : 'Погледни модел →'}</a>
                    </div>
                </div>
                <div class="compare-product-card-head">
                    <img src="${p2.image}" alt="${p2.name[lang]}" class="compare-phead-img">
                    <div class="compare-phead-info">
                        <h4 class="compare-phead-title">${p2.name[lang]}</h4>
                        <span class="compare-phead-price">${p2.price}</span>
                        <a href="${p2.link}" class="compare-phead-link">${lang === 'en' ? 'View Details →' : 'Погледни модел →'}</a>
                    </div>
                </div>
            </div>
        `;

        // Spec Rows
        SPEC_DEFINITIONS.forEach(specDef => {
            const val1Obj = p1.specs[specDef.key];
            const val2Obj = p2.specs[specDef.key];

            const str1 = val1Obj ? (val1Obj[lang] || val1Obj.mk || '') : '';
            const str2 = val2Obj ? (val2Obj[lang] || val2Obj.mk || '') : '';

            const isDifferent = str1 !== str2;
            if (isDifferent) totalDiffs++;

            const hiddenClass = (showDiffOnly && !isDifferent) ? 'is-hidden-diff' : '';
            const diffClass = isDifferent ? 'is-different' : '';

            let content1Html = '';
            let content2Html = '';

            if (specDef.type === 'arch') {
                content1Html = `
                    <div class="compare-meter-container">
                        <div class="compare-meter-header">
                            <span class="compare-badge ${val1Obj.badgeClass}">${val1Obj[lang]}</span>
                        </div>
                        <div class="compare-meter-bg">
                            <div class="compare-meter-fill" style="width: ${val1Obj.levelPercent}%"></div>
                        </div>
                    </div>
                `;
                content2Html = `
                    <div class="compare-meter-container">
                        <div class="compare-meter-header">
                            <span class="compare-badge ${val2Obj.badgeClass}">${val2Obj[lang]}</span>
                        </div>
                        <div class="compare-meter-bg">
                            <div class="compare-meter-fill" style="width: ${val2Obj.levelPercent}%"></div>
                        </div>
                    </div>
                `;
            } else if (specDef.type === 'stars') {
                content1Html = `
                    <div>
                        <span class="compare-stars">${val1Obj.stars}</span>
                        <strong style="margin-left: 6px; font-size: 13px;">${val1Obj.score}</strong>
                    </div>
                `;
                content2Html = `
                    <div>
                        <span class="compare-stars">${val2Obj.stars}</span>
                        <strong style="margin-left: 6px; font-size: 13px;">${val2Obj.score}</strong>
                    </div>
                `;
            } else {
                content1Html = `<div class="compare-spec-val">${str1}</div>`;
                content2Html = `<div class="compare-spec-val">${str2}</div>`;
            }

            html += `
                <div class="compare-spec-row ${diffClass} ${hiddenClass}">
                    <div class="compare-spec-label">
                        <span>${specDef.label[lang]}</span>
                        ${isDifferent ? `<span class="compare-diff-tag">${lang === 'en' ? 'Difference' : 'Различно'}</span>` : ''}
                    </div>
                    <div>${content1Html}</div>
                    <div>${content2Html}</div>
                </div>
            `;
        });

        compareInteractiveContainer.innerHTML = html;

        if (compareDiffCountBadge) {
            compareDiffCountBadge.textContent = lang === 'en'
                ? `Differences: ${totalDiffs}`
                : `Разлики: ${totalDiffs}`;
        }
    };

    // Event Listeners
    compareSelect1.addEventListener('change', () => {
        if (compareSelect1.value === compareSelect2.value) {
            const options = Array.from(compareSelect2.options).map(o => o.value);
            const other = options.find(val => val !== compareSelect1.value);
            if (other) compareSelect2.value = other;
        }
        renderSideBySideTable();
    });

    compareSelect2.addEventListener('change', () => {
        if (compareSelect1.value === compareSelect2.value) {
            const options = Array.from(compareSelect1.options).map(o => o.value);
            const other = options.find(val => val !== compareSelect2.value);
            if (other) compareSelect1.value = other;
        }
        renderSideBySideTable();
    });

    if (compareSwapBtn) {
        compareSwapBtn.addEventListener('click', () => {
            const temp = compareSelect1.value;
            compareSelect1.value = compareSelect2.value;
            compareSelect2.value = temp;

            if (typeof gsap !== 'undefined') {
                gsap.fromTo(compareInteractiveContainer,
                    { opacity: 0.4, scale: 0.98 },
                    { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' }
                );
            }
            renderSideBySideTable();
        });
    }

    if (compareDiffOnlyToggle) {
        compareDiffOnlyToggle.addEventListener('change', renderSideBySideTable);
    }

    // Preset Chips
    presetChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const p1 = chip.getAttribute('data-p1');
            const p2 = chip.getAttribute('data-p2');
            if (p1 && p2 && COMPARE_PRODUCTS[p1] && COMPARE_PRODUCTS[p2]) {
                compareSelect1.value = p1;
                compareSelect2.value = p2;
                renderSideBySideTable();

                if (typeof gsap !== 'undefined') {
                    gsap.fromTo(compareInteractiveContainer,
                        { opacity: 0.3, y: 10 },
                        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
                    );
                }
            }
        });
    });

    // View Tabs Switcher (Interactive vs Overview)
    if (compareTabInteractive && compareTabOverview && compareInteractiveView && compareOverviewView) {
        compareTabInteractive.addEventListener('click', () => {
            compareTabInteractive.classList.add('is-active');
            compareTabInteractive.setAttribute('aria-selected', 'true');
            compareTabOverview.classList.remove('is-active');
            compareTabOverview.setAttribute('aria-selected', 'false');

            compareInteractiveView.style.display = 'block';
            compareOverviewView.style.display = 'none';
        });

        compareTabOverview.addEventListener('click', () => {
            compareTabOverview.classList.add('is-active');
            compareTabOverview.setAttribute('aria-selected', 'true');
            compareTabInteractive.classList.remove('is-active');
            compareTabInteractive.setAttribute('aria-selected', 'false');

            compareInteractiveView.style.display = 'none';
            compareOverviewView.style.display = 'block';
        });
    }

    // Listen for language changes across the app
    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            setTimeout(renderSideBySideTable, 50);
        });
    });

    // Initial render
    renderSideBySideTable();
})();

// ========================================
// LIVE NAVBAR SEARCH SYSTEM
// ========================================
(function initNavbarSearch() {
    const searchTrigger = document.getElementById('searchTrigger');
    const searchModal = document.getElementById('searchModal');
    const searchBackdrop = document.getElementById('searchBackdrop');
    const searchClose = document.getElementById('searchClose');
    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');
    const searchResultsContainer = document.getElementById('searchResultsContainer');
    const quickTags = document.querySelectorAll('.search-tag');

    if (!searchTrigger || !searchModal || !searchInput || !searchResultsContainer) return;

    // Search Database
    const searchItems = [
        {
            type: 'product',
            titleMk: 'Спортски анатомски влошки',
            titleEn: 'Sports Anatomical Insoles',
            descMk: 'Гел-зони за максимална апсорпција на удари при трчање и активност',
            descEn: 'Gel zones for maximum shock absorption during running & fitness',
            url: './index.html#kategorii',
            image: './images/cards/Sportski.webp',
            badgeMk: 'Гел-зони',
            badgeEn: 'Gel zones',
            keywords: 'спортски sport гел гел-зони омекнување патики трчање фитнес 35-46 gel running fitness sneakers'
        },
        {
            type: 'product',
            titleMk: 'Кожни анатомски влошки',
            titleEn: 'Leather Anatomical Insoles',
            descMk: 'Премиум природна кожа за елегантни и деловни обувки со суптилен амортизер',
            descEn: 'Premium natural leather for dress shoes with subtle heel cushioning',
            url: './index.html#kategorii',
            image: './images/cards/Kozni.webp',
            badgeMk: 'Природна кожа',
            badgeEn: 'Natural leather',
            keywords: 'кожни leather природна кожа деловни чевли елегантни омекнувачки dress shoes business elegant'
        },
        {
            type: 'product',
            titleMk: 'Летни дишечки влошки',
            titleEn: 'Summer Breathable Insoles',
            descMk: 'Прозрачна 3D мрежа против потење и непријатни мириси при носење боси',
            descEn: 'Breathable 3D mesh prevents sweat and odor for bare-foot summer comfort',
            url: './index.html#kategorii',
            image: './images/cards/Letni.webp',
            badgeMk: 'Дишечка мрежа',
            badgeEn: 'Breathable mesh',
            keywords: 'летни summer дишечки прозрачни потење мирис отворени обувки боси mesh barefoot odor sweat'
        },
        {
            type: 'product',
            titleMk: 'Зимски термо влошки',
            titleEn: 'Winter Thermal Insoles',
            descMk: 'Природна волна со слој од алуминиумска фолија за заштита од најсилен студ',
            descEn: 'Natural wool with aluminium foil layer for insulation in harsh winter conditions',
            url: './index.html#kategorii',
            image: './images/cards/thermo_alu.webp',
            badgeMk: 'Алу-изолација',
            badgeEn: 'Alu insulation',
            keywords: 'зимски winter термо волна алуминиум топлина волна чизми снег студ wool alu cold boots'
        },
        {
            type: 'product',
            titleMk: 'HUNTER заштитни влошки',
            titleEn: 'HUNTER Heavy Duty Insoles',
            descMk: 'Засилена конструкција за работни обувки, лов, риболов и тешки терени',
            descEn: 'Reinforced design for work boots, hunting, fishing, and tough terrains',
            url: './index.html#kategorii',
            image: './images/cards/hunter_vloski.webp',
            badgeMk: 'Тешки услови',
            badgeEn: 'Heavy duty',
            keywords: 'hunter работни заштитни тешки обувки издржливи лов риболов boots work heavy duty hunting'
        },
        {
            type: 'product',
            titleMk: 'Детски анатомски влошки',
            titleEn: "Children's Anatomical Insoles",
            descMk: 'Анатомска потпора на сводот за правилен раст и развој на детското стапало',
            descEn: 'Arch support for healthy foot growth and postural development in kids',
            url: './index.html#kategorii',
            image: './images/cards/detski.webp',
            badgeMk: 'Правилен развој',
            badgeEn: 'Healthy growth',
            keywords: 'детски kids деца развој стапало 28-34 училиште игра children school growth'
        },
        {
            type: 'info',
            titleMk: 'Водич за броеви и избор на модел',
            titleEn: 'Size Chart & Model Finder',
            descMk: 'Пресметајте го точниот број според должината на стапалото и видот обувки',
            descEn: 'Calculate exact size based on foot length in cm and shoe type',
            action: 'sizeModal',
            icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L3.3 9.3a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0l12 12z"/><line x1="14.5" y1="7.5" x2="12" y2="10"/><line x1="11.5" y1="10.5" x2="9" y2="13"/><line x1="8.5" y1="13.5" x2="6" y2="16"/></svg>',
            badgeMk: 'Калкулатор',
            badgeEn: 'Calculator',
            keywords: 'големина број одредување водич мерење калкулатор 35 36 37 38 39 40 41 42 43 44 45 46 size guide measure chart cm'
        },
        {
            type: 'info',
            titleMk: 'Скратување на влошки со ножици',
            titleEn: 'Trimming Insoles with Scissors',
            descMk: 'Инструкции како правилно да ги поткастрите спортските, летните и зимските влошки',
            descEn: 'Instructions on how to safely trim forefoot guides using standard scissors',
            url: '#faq',
            icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.47" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>',
            badgeMk: 'Совет / ЧПП',
            badgeEn: 'Tip / FAQ',
            keywords: 'скратување ножици прилагодување димензија исечи trim adjust scissors cut size'
        },
        {
            type: 'info',
            titleMk: 'Чистење и правилно одржување',
            titleEn: 'Cleaning and Care Guide',
            descMk: 'Совети за одржување на кожни, текстилни и гел влошки за максимална долготрајност',
            descEn: 'Maintenance tips for leather, textile, and gel insoles for maximum lifespan',
            url: '#faq',
            icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>',
            badgeMk: 'Одржување',
            badgeEn: 'Care',
            keywords: 'чистење одржување перење заштита сапун вода clean maintain care wash leather'
        },
        {
            type: 'info',
            titleMk: 'Ортопедска потпора за рамни стапала & шип во пета',
            titleEn: 'Orthopedic Support for Flat Feet & Heel Spurs',
            descMk: 'Превенција и олеснување на болки во петата, наддолжниот и попречниот свод',
            descEn: 'Prevention and relief for plantar fasciitis, arch fatigue, and flat feet',
            url: '#faq',
            icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
            badgeMk: 'Ортопедија',
            badgeEn: 'Orthopedics',
            keywords: 'рамни стапала ортопедски свод шип во пета болка пета зглобови pes planus plantar fasciitis arch support heel spur pain'
        },
        {
            type: 'info',
            titleMk: 'Слој од активен јаглен против мириси',
            titleEn: 'Active Carbon Anti-Odor Layer',
            descMk: 'Ефикасно ја апсорбира влагата и ги неутрализира бактериите и мирисите од обувките',
            descEn: 'Absorbs moisture and neutralizes bacteria and foot odor inside footwear',
            url: '#faq',
            icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>',
            badgeMk: 'Активен јаглен',
            badgeEn: 'Active Carbon',
            keywords: 'активен јаглен мирис потење пот бактерии хигиена свежина active carbon odor sweat moisture'
        },
        {
            type: 'info',
            titleMk: 'Достава и плаќање при преземање',
            titleEn: 'Fast Delivery & Cash on Delivery',
            descMk: 'Експресна достава за 24-48 часа низ цела Македонија со плаќање на курирот',
            descEn: 'Express delivery in 24-48 hours across North Macedonia with Cash on Delivery',
            url: '#sledenje-pratka',
            icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
            badgeMk: 'Курир 24-48h',
            badgeEn: 'Courier 24-48h',
            keywords: 'достава плаќање карго брзина рокови дена македонија скопје битола охрид куманово delivery courier payment cod'
        },
        {
            type: 'info',
            titleMk: 'MONETA® Технолошки Системи',
            titleEn: 'MONETA® Technological Systems',
            descMk: 'Пет иновативни анатомски технологии: Anatomic, Absorb, Memory, Ortho и Thermo',
            descEn: 'Five innovative anatomical technologies: Anatomic, Absorb, Memory, Ortho & Thermo',
            url: './sistem.html',
            icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EC1752" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
            badgeMk: 'MONETA Систем',
            badgeEn: 'MONETA System',
            keywords: 'монета систем moneta sistem анатомски технологии anatomic absorb memory ortho thermo замор болка свод пета'
        }
    ];

    let focusedIndex = -1;

    function getCurrentLang() {
        return document.documentElement.lang === 'en' ? 'en' : 'mk';
    }

    function openSearch() {
        searchModal.classList.add('is-open');
        searchModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            searchInput.focus();
            renderResults(searchInput.value.trim());
        }, 50);
    }

    function closeSearch() {
        searchModal.classList.remove('is-open');
        searchModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        searchInput.value = '';
        searchClear.style.display = 'none';
        focusedIndex = -1;
    }

    // Event Listeners for Open/Close
    searchTrigger.addEventListener('click', openSearch);
    if (searchBackdrop) searchBackdrop.addEventListener('click', closeSearch);
    if (searchClose) searchClose.addEventListener('click', closeSearch);

    // Keyboard shortcuts: Cmd+K / Ctrl+K or /
    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            if (searchModal.classList.contains('is-open')) {
                closeSearch();
            } else {
                openSearch();
            }
        } else if (e.key === 'Escape' && searchModal.classList.contains('is-open')) {
            closeSearch();
        } else if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) && !searchModal.classList.contains('is-open')) {
            e.preventDefault();
            openSearch();
        }
    });

    // Clear Button
    searchClear.addEventListener('click', () => {
        searchInput.value = '';
        searchClear.style.display = 'none';
        searchInput.focus();
        renderResults('');
    });

    // Input event
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        searchClear.style.display = query.length > 0 ? 'flex' : 'none';
        focusedIndex = -1;
        renderResults(query.trim());
    });

    // Quick tag clicks
    quickTags.forEach(tag => {
        tag.addEventListener('click', () => {
            const query = tag.dataset.query;
            searchInput.value = query;
            searchClear.style.display = 'flex';
            searchInput.focus();
            renderResults(query);
        });
    });

    // Key navigation inside search body
    searchInput.addEventListener('keydown', (e) => {
        const items = searchResultsContainer.querySelectorAll('.search-result-item');
        if (!items.length) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            focusedIndex = (focusedIndex + 1) % items.length;
            updateFocusedItem(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            focusedIndex = (focusedIndex - 1 + items.length) % items.length;
            updateFocusedItem(items);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (focusedIndex >= 0 && items[focusedIndex]) {
                items[focusedIndex].click();
            } else if (items[0]) {
                items[0].click();
            }
        }
    });

    function updateFocusedItem(items) {
        items.forEach((item, idx) => {
            if (idx === focusedIndex) {
                item.classList.add('is-focused');
                item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            } else {
                item.classList.remove('is-focused');
            }
        });
    }

    // Render Logic
    function renderResults(query) {
        const lang = getCurrentLang();
        const q = query.toLowerCase();

        let filtered = searchItems;
        if (q) {
            filtered = searchItems.filter(item => {
                const title = lang === 'en' ? item.titleEn.toLowerCase() : item.titleMk.toLowerCase();
                const desc = lang === 'en' ? item.descEn.toLowerCase() : item.descMk.toLowerCase();
                const keywords = item.keywords.toLowerCase();
                return title.includes(q) || desc.includes(q) || keywords.includes(q);
            });
        }

        if (filtered.length === 0) {
            searchResultsContainer.innerHTML = `
                <div class="search-empty-state">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        <line x1="8" y1="11" x2="14" y2="11"></line>
                    </svg>
                    <h4>${lang === 'en' ? 'No results found' : 'Нема пронајдено резултати'}</h4>
                    <p>${lang === 'en' ? 'Try searching for "sports", "leather", "winter", or "size"' : 'Обидете се со "спортски", "кожни", "зимски" или "големина"'}</p>
                </div>
            `;
            return;
        }

        const products = filtered.filter(i => i.type === 'product');
        const infos = filtered.filter(i => i.type === 'info');

        let html = '';

        if (products.length > 0) {
            html += `
                <div class="search-section">
                    <div class="search-section__header">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                        <span>${lang === 'en' ? 'Insole Models' : 'Модели на влошки'} (${products.length})</span>
                    </div>
                    <div class="search-results-list">
            `;

            products.forEach((item) => {
                const title = lang === 'en' ? item.titleEn : item.titleMk;
                const desc = lang === 'en' ? item.descEn : item.descMk;
                const badge = lang === 'en' ? item.badgeEn : item.badgeMk;

                html += `
                    <a href="${item.url}" class="search-result-item" data-search-link>
                        <div class="search-result-item__thumb">
                            <img src="${item.image}" alt="${title}" loading="lazy">
                        </div>
                        <div class="search-result-item__info">
                            <div class="search-result-item__title">
                                <span>${title}</span>
                                <span class="search-result-item__badge">${badge}</span>
                            </div>
                            <div class="search-result-item__desc">${desc}</div>
                        </div>
                        <div class="search-result-item__arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                        </div>
                    </a>
                `;
            });

            html += `</div></div>`;
        }

        if (infos.length > 0) {
            html += `
                <div class="search-section">
                    <div class="search-section__header">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                        <span>${lang === 'en' ? 'Guides & Information' : 'Информации и Совети'} (${infos.length})</span>
                    </div>
                    <div class="search-results-list">
            `;

            infos.forEach((item) => {
                const title = lang === 'en' ? item.titleEn : item.titleMk;
                const desc = lang === 'en' ? item.descEn : item.descMk;
                const badge = lang === 'en' ? item.badgeEn : item.badgeMk;
                const isAction = !!item.action;

                html += `
                    <a href="${item.url || '#'}" class="search-result-item" ${isAction ? `data-search-action="${item.action}"` : ''} data-search-link>
                        <div class="search-result-item__thumb" style="color: var(--pink);">
                            ${item.icon}
                        </div>
                        <div class="search-result-item__info">
                            <div class="search-result-item__title">
                                <span>${title}</span>
                                <span class="search-result-item__badge" style="background: rgba(32, 31, 38, 0.07); color: var(--ink);">${badge}</span>
                            </div>
                            <div class="search-result-item__desc">${desc}</div>
                        </div>
                        <div class="search-result-item__arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                        </div>
                    </a>
                `;
            });

            html += `</div></div>`;
        }

        searchResultsContainer.innerHTML = html;

        // Attach click handlers to result links
        searchResultsContainer.querySelectorAll('.search-result-item').forEach(link => {
            link.addEventListener('click', (e) => {
                const action = link.dataset.searchAction;
                if (action === 'sizeModal') {
                    e.preventDefault();
                    closeSearch();
                    const sizeModalBtn = document.querySelector('[data-open-size-modal]');
                    if (sizeModalBtn) sizeModalBtn.click();
                } else {
                    closeSearch();
                    const href = link.getAttribute('href');
                    if (href && href.startsWith('#')) {
                        e.preventDefault();
                        const targetEl = document.querySelector(href);
                        if (targetEl) {
                            targetEl.scrollIntoView({ behavior: 'smooth' });
                        }
                    }
                }
            });
        });
    }
})();

// ========================================
// HERO BACKGROUND LAZY LOAD CROSSFADE
// ========================================
(function initHeroCrossfade() {
    const heroBgImg = document.querySelector('.hero__bg-img');
    if (!heroBgImg) return;

    function revealHeroImage() {
        heroBgImg.classList.add('is-loaded');
    }

    if (heroBgImg.complete && heroBgImg.naturalWidth > 0) {
        revealHeroImage();
    } else {
        heroBgImg.addEventListener('load', revealHeroImage, { once: true });
        // Fallback safety timeout if load event fired earlier or fails
        setTimeout(revealHeroImage, 400);
    }
})();

// ========================================
// HERO CTA SMOOTH SCROLL & MOBILE CATEGORIES FOCUS
// ========================================
(function initCategoryScrollEffects() {
    // 1. Smooth scroll for anchor links (e.g. #kategorii)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 2. Sequential Magnetic Card Focus Tracking (Mobile Only; Desktop uses hover)
    function updateCategoryCardsSequentialFocus() {
        const categoryCards = document.querySelectorAll('.categories__grid .card');
        if (!categoryCards.length) return;

        const isMobile = window.innerWidth <= 860 || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

        // Clear auto-focus on desktop so hover handles animation cleanly
        if (!isMobile) {
            categoryCards.forEach((card) => {
                card.classList.remove('is-scroll-focused');
                card.classList.remove('is-active');
            });
            return;
        }

        const viewportHeight = window.innerHeight;
        const viewportCenter = viewportHeight * 0.50;

        let closestCard = null;
        let minDistance = Infinity;

        categoryCards.forEach((card) => {
            const img = card.querySelector('.card__image img');
            if (img) {
                img.style.removeProperty('--card-blur');
                img.style.filter = 'none';
            }

            const rect = card.getBoundingClientRect();
            if (rect.bottom > 0 && rect.top < viewportHeight) {
                const cardCenter = rect.top + (rect.height * 0.5);
                const dist = Math.abs(cardCenter - viewportCenter);
                if (dist < minDistance) {
                    minDistance = dist;
                    closestCard = card;
                }
            }
        });

        categoryCards.forEach((card) => {
            if (card === closestCard && minDistance < viewportHeight * 0.42) {
                if (!card.classList.contains('is-scroll-focused')) {
                    card.classList.add('is-scroll-focused');
                    card.classList.add('is-active');
                }
            } else {
                card.classList.remove('is-scroll-focused');
                card.classList.remove('is-active');
            }
        });
    }

    let isTicking = false;
    function onScroll() {
        if (!isTicking) {
            requestAnimationFrame(() => {
                updateCategoryCardsSequentialFocus();
                isTicking = false;
            });
            isTicking = true;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateCategoryCardsSequentialFocus, { passive: true });
    
    // Initial calculation on load
    setTimeout(updateCategoryCardsSequentialFocus, 100);
    setTimeout(updateCategoryCardsSequentialFocus, 500);
})();

// ========================================
// CONSOLE WELCOME
// ========================================
console.log('%c MONETA Macedonia 🦶 ', 'background:#EC1752;color:#fff;font-size:20px;font-weight:bold;padding:10px 20px;border-radius:8px;');
console.log('%c Анатомски вложки - Подобар чекор, помал замор', 'color:#201F26;font-size:14px;');
console.log('%c Вебсајт во развој 💪', 'color:#6B6B76;font-size:12px;');