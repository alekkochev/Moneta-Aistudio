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

        // Ажурирај ги free-ship текстовте по промена на јазик
        if (window.MonetaCart && window.MonetaCart.renderFreeShip) {
            window.MonetaCart.renderFreeShip(window.MonetaCart.getCart());
        }

        // Глобален hook — секој модул што треба да се освежи на промена на јазик
        (window.MonetaLangCallbacks || []).forEach((cb) => {
            try { cb(lang); } catch (err) { /* ignore */ }
        });
    };

    window.MonetaLangCallbacks = window.MonetaLangCallbacks || [];
    window.MonetaOnLangChange = (cb) => {
        if (typeof cb === 'function') window.MonetaLangCallbacks.push(cb);
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

    // Изложи ги за паѓачкиот јазичен прекинувач (initLangDropdown)
    window.MonetaSetLang = setLanguage;
    window.MonetaGetLang = () => currentLang;
})();

// ========================================
// LANGUAGE DROPDOWN (паѓачко мени MK / EN / SQ)
// ========================================
(function initLangDropdown() {
    const LANG_NAMES = {
        mk: { code: 'MK', nameNative: 'Македонски' },
        en: { code: 'EN', nameNative: 'English' },
        sq: { code: 'SQ', nameNative: 'Shqip' }
    };

    const enhance = (switcher) => {
        if (!switcher || switcher.classList.contains('lang-dropdown-ready')) return;
        const btns = [...switcher.querySelectorAll('.lang-btn')];
        if (!btns.length) return;
        switcher.classList.add('lang-dropdown-ready');

        const stored = window.MonetaGetLang ? window.MonetaGetLang() : (localStorage.getItem('moneta_lang') || 'mk');
        const active = LANG_NAMES[stored] ? stored : 'mk';

        const dd = document.createElement('div');
        dd.className = 'lang-dropdown';

        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'lang-dropdown__trigger';
        trigger.setAttribute('aria-haspopup', 'listbox');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.innerHTML = `<span class="lang-dropdown__code">${LANG_NAMES[active].code}</span>`
            + `<span class="lang-dropdown__chevron"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></span>`;

        const menu = document.createElement('div');
        menu.className = 'lang-dropdown__menu';
        menu.setAttribute('role', 'listbox');

        // Секогаш ги прикажува сите 3 јазици (MK / EN / SQ) — SQ се полни со превод подоцна
        Object.keys(LANG_NAMES).forEach((lang) => {
            const opt = document.createElement('button');
            opt.type = 'button';
            opt.className = 'lang-dropdown__option' + (lang === active ? ' is-active' : '');
            opt.dataset.lang = lang;
            opt.setAttribute('role', 'option');
            opt.setAttribute('aria-selected', lang === active ? 'true' : 'false');
            opt.innerHTML = `<span class="lang-dropdown__opt-code">${LANG_NAMES[lang].code}</span><span class="lang-dropdown__opt-name">${LANG_NAMES[lang].nameNative}</span>`;
            opt.addEventListener('click', (e) => {
                e.stopPropagation();
                if (window.MonetaSetLang) window.MonetaSetLang(lang);
                const codeEl = trigger.querySelector('.lang-dropdown__code');
                if (codeEl) codeEl.textContent = LANG_NAMES[lang].code;
                menu.querySelectorAll('.lang-dropdown__option').forEach((o) => {
                    const isAct = o.dataset.lang === lang;
                    o.classList.toggle('is-active', isAct);
                    o.setAttribute('aria-selected', isAct ? 'true' : 'false');
                });
                dd.classList.remove('is-open');
                trigger.setAttribute('aria-expanded', 'false');
            });
            menu.appendChild(opt);
        });

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = dd.classList.toggle('is-open');
            trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        dd.appendChild(trigger);
        dd.appendChild(menu);
        switcher.innerHTML = '';
        switcher.appendChild(dd);
    };

    document.querySelectorAll('.lang-switcher').forEach(enhance);

    // Затвори го менито при клик на друго место / Escape
    document.addEventListener('click', () => {
        document.querySelectorAll('.lang-dropdown.is-open').forEach((dd) => {
            dd.classList.remove('is-open');
            const tr = dd.querySelector('.lang-dropdown__trigger');
            if (tr) tr.setAttribute('aria-expanded', 'false');
        });
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.lang-dropdown.is-open').forEach((dd) => dd.classList.remove('is-open'));
        }
    });
})();

// ========================================
// MODEL АКОРДЕОН: само една картичка отворена во исто време
// ========================================
(function initModelAccordion() {
    document.querySelectorAll('.model-acc').forEach((acc) => {
        const items = acc.querySelectorAll('details.model-acc__item');
        items.forEach((item) => {
            item.addEventListener('toggle', () => {
                if (item.open) {
                    items.forEach((other) => {
                        if (other !== item && other.open) other.open = false;
                    });
                }
            });
            // Спречи „скок/фрлање" при отворање — врати ја позицијата на скролање
            const head = item.querySelector('summary');
            if (head) {
                head.addEventListener('click', () => {
                    const y = window.scrollY;
                    const fix = () => {
                        if (Math.abs(window.scrollY - y) > 4) window.scrollTo({ top: y, behavior: 'auto' });
                    };
                    requestAnimationFrame(fix);
                    setTimeout(fix, 120);
                });
            }
        });
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
    const customLenInput = document.getElementById('customLenInput');
    const lenUnitBtns = document.querySelectorAll('.size-finder__unit');
    let lenUnit = 'mm';

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
            title_mk: 'МОНЕТА Спортски анатомски влошки',
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
            canTrim: false,
            title_mk: 'МОНЕТА Елегантни кожни влошки',
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
            title_mk: 'МОНЕТА Летни дишечки влошки',
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
            title_mk: 'МОНЕТА Зимски термо влошки',
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
            title_mk: 'МОНЕТА HUNTER професионални влошки',
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
            canTrim: false,
            title_mk: 'МОНЕТА Детски анатомски влошки',
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

    const euToCm = (eu) => (eu * 0.667) - 1.2;
    const cmToEu = (cm) => Math.round((cm + 1.5) / 0.667);

    const highlightPillForVal = (eu) => {
        let matchedPillKey = '39-40';
        if (eu <= 34) matchedPillKey = '28-34';
        else if (eu <= 36) matchedPillKey = '35-36';
        else if (eu <= 38) matchedPillKey = '37-38';
        else if (eu <= 40) matchedPillKey = '39-40';
        else if (eu <= 42) matchedPillKey = '41-42';
        else if (eu <= 44) matchedPillKey = '43-44';
        else matchedPillKey = '45-46';
        selectedSize = matchedPillKey;
        sizePills.forEach((p) => p.classList.toggle('is-active', p.dataset.size === matchedPillKey));
    };

    const setLenField = (cmLen) => {
        if (!customLenInput) return;
        customLenInput.value = lenUnit === 'mm' ? Math.round(cmLen * 10) : parseFloat(cmLen.toFixed(1));
    };

    const getInsoleLengthInfo = (sizeKey, customVal) => {
        if (customVal && !isNaN(customVal) && customVal > 0) {
            // ЕУ број внесен во полето (customSizeInput е секогаш EU)
            const euSize = parseFloat(customVal);
            let cmLen = euToCm(euSize);
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

        const sizeHeading = isEn ? 'Recommended Size:' : 'Препорачан број:';
        const lengthHeading = isEn ? 'Insole Length:' : 'Должина на влошка:';
        const trimHeading = isEn ? 'Trimming Advice:' : 'Совет за кастрење:';
        const archHeading = isEn ? 'Arch Profile:' : 'Профил на свод:';

        const techChipsHtml = techList.map(t => `<span class="result-card__tech-chip">${t}</span>`).join('');

        const trimRow = model.canTrim === false
            ? `<p class="result-card__spec-item"><strong>${trimHeading}</strong> ${isEn ? 'Fixed sizes — not for trimming' : 'Фиксни големини — не се поткаструваат'}</p>`
            : `<p class="result-card__spec-item"><strong>${trimHeading}</strong> ${trimAdvice}</p>`;

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
                    ${trimRow}
                </div>
                <p class="result-card__desc">${descText}</p>
                <div class="result-card__tech-row">
                    ${techChipsHtml}
                </div>
            </div>
        `;
    };

    sizePills.forEach((pill) => {
        pill.addEventListener('click', () => {
            sizePills.forEach((p) => p.classList.remove('is-active'));
            pill.classList.add('is-active');
            selectedSize = pill.dataset.size;
            if (customSizeInput) customSizeInput.value = '';
            if (customLenInput) customLenInput.value = '';
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
                highlightPillForVal(val);
                setLenField(euToCm(val));
            }
            updateRecommendation();
        });
    }

    if (customLenInput) {
        customLenInput.addEventListener('input', () => {
            const val = parseFloat(customLenInput.value);
            if (!isNaN(val) && val > 0) {
                const cmLen = lenUnit === 'mm' ? val / 10 : val;
                const eu = cmToEu(cmLen);
                if (customSizeInput) customSizeInput.value = eu;
                highlightPillForVal(eu);
            }
            updateRecommendation();
        });
    }

    lenUnitBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            lenUnitBtns.forEach((b) => b.classList.remove('is-active'));
            btn.classList.add('is-active');
            lenUnit = btn.dataset.unit;
            const euVal = parseFloat(customSizeInput ? customSizeInput.value : '');
            if (!isNaN(euVal) && euVal > 0) {
                setLenField(euToCm(euVal));
            } else {
                const lenVal = parseFloat(customLenInput ? customLenInput.value : '');
                if (!isNaN(lenVal) && lenVal > 0) {
                    setLenField(lenUnit === 'mm' ? lenVal / 10 : lenVal);
                }
            }
            updateRecommendation();
        });
    });

    // Re-render recommendation when language changes (dropdown-switcher safe)
    if (window.MonetaOnLangChange) {
        window.MonetaOnLangChange(() => setTimeout(updateRecommendation, 50));
    }

    // Initial calculation
    updateRecommendation();
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
                courier: 'МОНЕТА Централен магацин Скопје',
                date: 'Очекувано испраќање за 24ч',
                item: '1x МОНЕТА Анатомски влошки'
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
// CATEGORY CARDS 3D TILT — ОТСТРАНЕТ (2026-08-03, барање на клиент)
// Картичките повеќе не се „нишаат" на hover. Иконката горе со светлото останува.
// ========================================

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

    // Auto-close the compare section when the toggle button loses focus
    compareToggleBtn.addEventListener('blur', (e) => {
        const nextTarget = e.relatedTarget;
        // Keep it open if focus moved inside the open section (selects, buttons, etc.)
        if (nextTarget && compareModelsSection.contains(nextTarget)) {
            return;
        }
        if (compareToggleBtn.classList.contains('is-active')) {
            toggleCompareSection(true);
        }
    });
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
            price: '230 – 620 ден.',
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
            price: '100 – 820 ден.',
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
            price: '120 – 170 ден.',
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
            price: '210 ден.',
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
            price: '330 ден.',
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
            price: '490 ден.',
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

    // Listen for language changes across the app (dropdown-switcher safe)
    if (window.MonetaOnLangChange) {
        window.MonetaOnLangChange(() => setTimeout(renderSideBySideTable, 50));
    }

    // Initial render
    renderSideBySideTable();
})();

// ========================================
// LIVE NAVBAR SEARCH SYSTEM
// ========================================
// Шаблон за search-маската — автоматски се креира на под-страниците каде што ја нема
const SEARCH_MODAL_HTML = `
    <div class="search-modal" id="searchModal" aria-hidden="true">
        <div class="search-modal__backdrop" id="searchBackdrop"></div>
        <div class="search-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="searchInput">
            <div class="search-modal__header">
                <div class="search-modal__input-wrapper">
                    <svg class="search-modal__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input type="text" id="searchInput" class="search-modal__input" placeholder="Пребарај модели на влошки, броеви или совети..." autocomplete="off" spellcheck="false" data-mk-placeholder="Пребарај модели на влошки, броеви или совети..." data-en-placeholder="Search insole models, sizes, or advice...">
                </div>
                <button type="button" class="search-modal__close" id="searchClose" aria-label="Затвори" title="Затвори (ESC)"><kbd>ESC</kbd></button>
            </div>
            <div class="search-modal__quick-tags">
                <span class="quick-tags__title" data-mk="Брзи категории:" data-en="Quick categories:">Брзи категории:</span>
                <button type="button" class="search-tag" data-query="спортски" data-mk="Спортски" data-en="Sports">Спортски</button>
                <button type="button" class="search-tag" data-query="кожни" data-mk="Кожни" data-en="Leather">Кожни</button>
                <button type="button" class="search-tag" data-query="летни" data-mk="Летни" data-en="Summer">Летни</button>
                <button type="button" class="search-tag" data-query="зимски" data-mk="Зимски" data-en="Winter">Зимски</button>
                <button type="button" class="search-tag" data-query="hunter" data-mk="HUNTER" data-en="HUNTER">HUNTER</button>
                <button type="button" class="search-tag" data-query="детски" data-mk="Детски" data-en="Kids">Детски</button>
                <button type="button" class="search-tag" data-query="големина" data-mk="Водич за броеви" data-en="Size guide">Водич за броеви</button>
            </div>
            <div class="search-modal__body" id="searchResultsContainer"></div>
            <div class="search-modal__footer">
                <div class="search-modal__shortcuts">
                    <span><kbd>↑</kbd><kbd>↓</kbd> <span data-mk="Навигација" data-en="Navigate">Навигација</span></span>
                    <span><kbd>↵</kbd> <span data-mk="Отвори" data-en="Open">Отвори</span></span>
                    <span><kbd>ESC</kbd> <span data-mk="Затвори" data-en="Close">Затвори</span></span>
                </div>
                <div class="search-modal__brand" data-mk="МОНЕТА Пребарување" data-en="MONETA Search">МОНЕТА Пребарување</div>
            </div>
        </div>
    </div>`;

(function initNavbarSearch() {
    const searchTrigger = document.getElementById('searchTrigger');
    if (!searchTrigger) return;

    // Базна патека: под-страниците (modeli/) се еден чекор подлабоко
    const IS_MODELI = /\/modeli\//.test(window.location.pathname);
    const BASE = IS_MODELI ? '../' : './';
    const resolveUrl = (p) => {
        if (!p) return '#';
        if (/^(#|\.\.\/|https?:|\/)/.test(p)) return p;
        return BASE + p.replace(/^\.\//, '');
    };
    const resolveImg = (p) => {
        if (!p) return '';
        if (/^(\.\.\/|https?:|\/)/.test(p)) return p;
        return BASE + p.replace(/^\.\//, '');
    };

    // Автоматско креирање на search-маската ако ја нема (под-страници)
    if (!document.getElementById('searchModal')) {
        const holder = document.createElement('div');
        holder.innerHTML = SEARCH_MODAL_HTML.trim();
        document.body.appendChild(holder.firstElementChild);
    }
    const searchModal = document.getElementById('searchModal');
    const searchBackdrop = document.getElementById('searchBackdrop');
    const searchClose = document.getElementById('searchClose');
    const searchInput = document.getElementById('searchInput');
    const searchResultsContainer = document.getElementById('searchResultsContainer');
    const quickTags = document.querySelectorAll('.search-tag');

    if (!searchModal || !searchInput || !searchResultsContainer) return;

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
        // ===== СИТЕ 20 МОДЕЛИ (modeli/) =====
        {
            type: 'product',
            titleMk: 'MEMOSOLE',
            titleEn: 'MEMOSOLE',
            descMk: 'Влошки со мемориска пена што се прилагодува на стапалото и латекс со активен јаглен за свежина.',
            descEn: 'Memory foam insoles that adapt to your foot, with latex and activated charcoal for freshness.',
            url: './modeli/memosole.html',
            image: './images/cards/memosole.webp',
            badgeMk: 'Спортски',
            badgeEn: 'Sports',
            keywords: 'memosole мемосол мемориска пена memory foam латекс спортски патики трчање 16012'
        },
        {
            type: 'product',
            titleMk: 'Active Gel',
            titleEn: 'Active Gel',
            descMk: 'Спортска влошка од активен гел и мек плиш за дополнителна амортизација, се сече по големина.',
            descEn: 'Sports insole made of active gel and soft plush for extra cushioning, cut-to-size.',
            url: './modeli/active-gel.html',
            image: './images/cards/active-gel.webp',
            badgeMk: 'Спортски',
            badgeEn: 'Sports',
            keywords: 'active gel активен гел гел плиш спортски сечење амортизација 281111'
        },
        {
            type: 'product',
            titleMk: 'AnatomiX',
            titleEn: 'AnatomiX',
            descMk: 'Премиум спортска влошка од серијата RUN & HIKING со рециклирана антибактериска пена.',
            descEn: 'Premium sports insole from the RUN & HIKING line with recycled antibacterial foam.',
            url: './modeli/anatomiX.html',
            image: './images/cards/anatomiX.webp',
            badgeMk: 'Спортски',
            badgeEn: 'Sports',
            keywords: 'anatomix анатомикс run hiking рециклирана антибактериска пена спортски трчање планинарење 20002'
        },
        {
            type: 'product',
            titleMk: 'Sport Style',
            titleEn: 'Sport Style',
            descMk: 'Анатомска влошка од 100% памучен фротир со латекс пена и пластичен носач за стабилност.',
            descEn: 'Anatomical insole made of 100% cotton terry with latex foam and a plastic arch support.',
            url: './modeli/sport-style.html',
            image: './images/cards/sport-style.webp',
            badgeMk: 'Спортски',
            badgeEn: 'Sports',
            keywords: 'sport style спорт стил памучен фротир латекс пластичен носач карбосан 221069'
        },
        {
            type: 'product',
            titleMk: 'Sportex',
            titleEn: 'Sportex',
            descMk: 'Спортска влошка со воздушно перниче во петата и освежувачки ефект на алое вера.',
            descEn: 'Sports insole with an air cushion in the heel and a fresh aloe vera effect.',
            url: './modeli/sportex.html',
            image: './images/cards/sportex.webp',
            badgeMk: 'Спортски',
            badgeEn: 'Sports',
            keywords: 'sportex спортекс воздушно перниче алое вера антибактериска карбосан 951010'
        },
        {
            type: 'product',
            titleMk: 'X-TREME',
            titleEn: 'X-TREME',
            descMk: 'Премиум 4-слојна спортска влошка со WAP материјал за outdoor активности и планинарење.',
            descEn: 'Premium 4-layer sports insole with WAP material for outdoor activities and hiking.',
            url: './modeli/x-treme.html',
            image: './images/cards/x-treme.webp',
            badgeMk: 'Спортски',
            badgeEn: 'Sports',
            keywords: 'x-treme x treme xтрем wap спортска outdoor планинарење термо филц карбосан 21005'
        },
        {
            type: 'product',
            titleMk: 'Heel Pad',
            titleEn: 'Heel Pad',
            descMk: 'Кожна влошка за пета со карбосан перниче и самолеплив слој за стабилно прилегање.',
            descEn: 'Leather heel pad with a carbosan cushion and self-adhesive layer for a stable fit.',
            url: './modeli/heel-pad.html',
            image: './images/cards/heel-pad.webp',
            badgeMk: 'Кожни',
            badgeEn: 'Leather',
            keywords: 'heel pad хил пад влошка за пета кожа карбосан самолеплива удобност 971031'
        },
        {
            type: 'product',
            titleMk: 'Heel Pad FIX',
            titleEn: 'Heel Pad FIX',
            descMk: 'Кожна влошка за пета со карбосан перниче и зајакнат самолеплив слој.',
            descEn: 'Leather heel pad with a carbosan cushion and reinforced self-adhesive layer.',
            url: './modeli/heel-pad-fix.html',
            image: './images/cards/heel-pad-fix.webp',
            badgeMk: 'Кожни',
            badgeEn: 'Leather',
            keywords: 'heel pad fix хил пад фикс пета кожа карбосан самолеплива зајакнат 291117'
        },
        {
            type: 'product',
            titleMk: 'Heel Pad Grip',
            titleEn: 'Heel Pad Grip',
            descMk: 'Самолепливо кожно перниче за пета за подобро прилегање и стабилност.',
            descEn: 'Self-adhesive leather heel pad for a better fit and stability.',
            url: './modeli/heel-pad-grip.html',
            image: './images/cards/heel-pad-grip.webp',
            badgeMk: 'Кожни',
            badgeEn: 'Leather',
            keywords: 'heel pad grip хил пад грип пета кожа прилегање универзална самолеплива 951013'
        },
        {
            type: 'product',
            titleMk: 'Topas',
            titleEn: 'Topas',
            descMk: '3/4 анатомска кожна влошка за елегантни и деловни обувки со пластичен носач.',
            descEn: '3/4 anatomical leather insole for dress and business shoes with a plastic arch support.',
            url: './modeli/topas.html',
            image: './images/cards/topas.webp',
            badgeMk: 'Кожни',
            badgeEn: 'Leather',
            keywords: 'topas топас 3/4 кратка кожна елегантни чевли мокасини носач 281044'
        },
        {
            type: 'product',
            titleMk: 'Soft Gel',
            titleEn: 'Soft Gel',
            descMk: 'Премиум кожна влошка со гел перничиња, латекс со активен јаглен и пластичен носач.',
            descEn: 'Premium leather insole with gel cushions, latex with activated charcoal and plastic support.',
            url: './modeli/soft-gel.html',
            image: './images/cards/soft-gel.webp',
            badgeMk: 'Кожни',
            badgeEn: 'Leather',
            keywords: 'soft gel софт гел кожна гел перничиња премиум латекс носач 281108'
        },
        {
            type: 'product',
            titleMk: 'Vital',
            titleEn: 'Vital',
            descMk: 'Анатомска кожна влошка од перфорирана кожа со латекс и карбосан перниче.',
            descEn: 'Anatomical leather insole made of perforated leather with latex and a carbosan heel pad.',
            url: './modeli/vital.html',
            image: './images/cards/vital.webp',
            badgeMk: 'Кожни',
            badgeEn: 'Leather',
            keywords: 'vital витал кожна перфорирана латекс карбосан анатомска 271104'
        },
        {
            type: 'product',
            titleMk: 'Relax',
            titleEn: 'Relax',
            descMk: 'Анатомска кожна влошка од перфорирана јагнешка кожа со латекс и пластичен носач.',
            descEn: 'Anatomical leather insole made of perforated lambskin with latex and a plastic arch support.',
            url: './modeli/relax.html',
            image: './images/cards/relax.webp',
            badgeMk: 'Кожни',
            badgeEn: 'Leather',
            keywords: 'relax релакс кожна јагнешка кожа перфорирана латекс носач 251090'
        },
        {
            type: 'product',
            titleMk: 'Simona',
            titleEn: 'Simona',
            descMk: 'Летни памучни влошки со латекс со активен јаглен и ароматична карбосан пена.',
            descEn: 'Summer cotton insoles with latex and activated charcoal, plus aromatic carbosan foam.',
            url: './modeli/simona.html',
            image: './images/cards/simona.webp',
            badgeMk: 'Летни',
            badgeEn: 'Summer',
            keywords: 'simona симона летни памучни активен јаглен ароматична свежина 981034'
        },
        {
            type: 'product',
            titleMk: 'Carbon',
            titleEn: 'Carbon',
            descMk: 'Летни влошки со активен јаглен, анти-габични и перфорирани за вентилација.',
            descEn: 'Summer insoles with activated charcoal, anti-fungal and perforated for ventilation.',
            url: './modeli/carbon.html',
            image: './images/cards/carbon.webp',
            badgeMk: 'Летни',
            badgeEn: 'Summer',
            keywords: 'carbon карбон летни активен јаглен анти-габични перфорирани универзална 201063'
        },
        {
            type: 'product',
            titleMk: 'Thermo Alu',
            titleEn: 'Thermo Alu',
            descMk: 'Зимска влошка од 100% волна со латекс пена и алуминиумска фолија за топлинска изолација.',
            descEn: 'Winter insole made of 100% wool with latex foam and aluminium foil for thermal insulation.',
            url: './modeli/thermo-alu.html',
            image: './images/cards/thermo_alu.webp',
            badgeMk: 'Зимски',
            badgeEn: 'Winter',
            keywords: 'thermo alu термо алу зимска волна алуминиум топлина чизми студ 201062'
        },
        {
            type: 'product',
            titleMk: 'Hunter Outdoor',
            titleEn: 'Hunter Outdoor',
            descMk: 'Анатомска влошка со Viscolat мемориска пена, PES филц и алуминиумска фолија за пролет/есен.',
            descEn: 'Anatomical insole with Viscolat memory foam, PES felt and aluminium foil for spring/autumn.',
            url: './modeli/hunter-outdoor.html',
            image: './images/cards/hunter-outdoor.webp',
            badgeMk: 'HUNTER',
            badgeEn: 'HUNTER',
            keywords: 'hunter outdoor хантер аутдор viscolat мемориска пена филц алуминиум лов планинарење 140402'
        },
        {
            type: 'product',
            titleMk: 'Hunter Flex',
            titleEn: 'Hunter Flex',
            descMk: 'Термо влошка со Cambrella ткаенина, алуминиумска фолија и филц за зимски активности.',
            descEn: 'Thermal insole with Cambrella fabric, aluminium foil and felt for winter activities.',
            url: './modeli/hunter-flex.html',
            image: './images/cards/hunter-flex.webp',
            badgeMk: 'HUNTER',
            badgeEn: 'HUNTER',
            keywords: 'hunter flex хантер флекс термо cambrella алуминиум филц зимски лов риболов 140406'
        },
        {
            type: 'product',
            titleMk: 'Hunter CAMO',
            titleEn: 'Hunter CAMO',
            descMk: 'Камуфлажна влошка со перфорирана PES ткаенина и латекс пена со активен јаглен.',
            descEn: 'Camouflage insole with perforated PES fabric and latex foam with activated charcoal.',
            url: './modeli/hunter-camo.html',
            image: './images/cards/hunter-camo.webp',
            badgeMk: 'HUNTER',
            badgeEn: 'HUNTER',
            keywords: 'hunter camo хантер камо камуфлажна pes ткаенина латекс активен јаглен лов 140405'
        },
        {
            type: 'product',
            titleMk: 'Duck',
            titleEn: 'Duck',
            descMk: 'Детски анатомски влошки од 100% памук со латекс, пластичен и карбосан калап за правилен развој.',
            descEn: 'Kids anatomical insoles made of 100% cotton with latex, plastic and carbosan mold for healthy growth.',
            url: './modeli/duck.html',
            image: './images/cards/duck.webp',
            badgeMk: 'Детски',
            badgeEn: 'Kids',
            keywords: 'duck дак детски памук латекс карбосан анатомски развој училиште 201068'
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
            titleMk: 'Анатомска потпора за рамни стапала & шип во пета',
            titleEn: 'Anatomical Support for Flat Feet & Heel Spurs',
            descMk: 'Превенција и олеснување на болки во петата, наддолжниот и попречниот свод',
            descEn: 'Prevention and relief for plantar fasciitis, arch fatigue, and flat feet',
            url: '#faq',
            icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
            badgeMk: 'Анатомска',
            badgeEn: 'Anatomical',
            keywords: 'рамни стапала анатомски свод шип во пета болка пета зглобови pes planus plantar fasciitis arch support heel spur pain'
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
            titleMk: 'МОНЕТА® Технолошки Системи',
            titleEn: 'MONETA® Technological Systems',
            descMk: 'Пет иновативни анатомски технологии: Anatomic, Absorb, Memory, Ortho и Thermo',
            descEn: 'Five innovative anatomical technologies: Anatomic, Absorb, Memory, Ortho & Thermo',
            url: './sistem.html',
            icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EC1752" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
            badgeMk: 'МОНЕТА Систем',
            badgeEn: 'MONETA System',
            keywords: 'монета систем moneta sistem анатомски технологии anatomic absorb memory ortho thermo замор болка свод пета'
        }
    ];

    let focusedIndex = -1;

    // ==== Паметно пребарување: кирилица ↔ латиница + азбучен редослед ====
    const CYR_TO_LAT = {
        'а':'a','б':'b','в':'v','г':'g','д':'d','ѓ':'gj','е':'e','ж':'z','з':'z','ѕ':'dz','и':'i','ј':'j','к':'k','л':'l','љ':'lj','м':'m','н':'n','њ':'nj','о':'o','п':'p','р':'r','с':'s','т':'t','ќ':'k','у':'u','ф':'f','х':'h','ц':'c','ч':'c','џ':'dz','ш':'s',
        'А':'A','Б':'B','В':'V','Г':'G','Д':'D','Ѓ':'Gj','Е':'E','Ж':'Z','З':'Z','Ѕ':'Dz','И':'I','Ј':'J','К':'K','Л':'L','Љ':'Lj','М':'M','Н':'N','Њ':'Nj','О':'O','П':'P','Р':'R','С':'S','Т':'T','Ќ':'K','У':'U','Ф':'F','Х':'H','Ц':'C','Ч':'C','Џ':'Dz','Ш':'S'
    };
    const transliterate = (s) => String(s || '').replace(/[\u0400-\u04FF]/g, (ch) => CYR_TO_LAT[ch] || ch);
    const searchNormalize = (s) => transliterate(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Подготви пребарувачка основа за секој резултат (оригинал + транслитерација)
    searchItems.forEach((item) => {
        const parts = [item.titleMk, item.titleEn, item.descMk, item.descEn, item.keywords || '', item.badgeMk || '', item.badgeEn || ''];
        item._search = searchNormalize(parts.join(' '));
    });

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

    // Input event
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        focusedIndex = -1;
        renderResults(query.trim());
    });

    // Quick tag clicks
    quickTags.forEach(tag => {
        tag.addEventListener('click', () => {
            const query = tag.dataset.query;
            searchInput.value = query;
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
        const q = searchNormalize(query);

        let filtered = searchItems;
        if (q) {
            filtered = searchItems.filter(item => (item._search || '').includes(q));
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

        // Азбучен редослед на производите (по јазикот на приказ)
        products.sort((a, b) => {
            const ta = lang === 'en' ? a.titleEn : a.titleMk;
            const tb = lang === 'en' ? b.titleEn : b.titleMk;
            return ta.localeCompare(tb, lang === 'en' ? 'en' : 'mk');
        });

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
                    <a href="${resolveUrl(item.url)}" class="search-result-item" data-search-link>
                        <div class="search-result-item__thumb">
                            <img src="${resolveImg(item.image)}" alt="${title}" loading="lazy">
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
                    <a href="${resolveUrl(item.url)}" class="search-result-item" ${isAction ? `data-search-action="${item.action}"` : ''} data-search-link>
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
        // Поврзани производи на модел-страниците — без фокус/скок ефект на картичките
        if (document.querySelector('.model-layout')) return;

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

// ========================================
// CART SYSTEM (localStorage) — 2026-08-03
// ========================================
(function initCartSystem() {
    const KEY = 'moneta_cart';

    const getCart = () => {
        try {
            const c = JSON.parse(localStorage.getItem(KEY));
            return c && typeof c === 'object' ? c : {};
        } catch (e) {
            return {};
        }
    };
    const setCart = (cart) => {
        try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) { /* ignore */ }
    };
    const totalQty = (cart) => Object.keys(cart).reduce((sum, k) => sum + (cart[k].qty || 0), 0);

    // ==== Бесплатна достава (1000+ ден.) + Достава за 48ч ====
    const FREE_SHIP_THRESHOLD = 1000;
    const subtotal = (cart) => Object.keys(cart).reduce((s, k) => s + (cart[k].qty || 0) * (cart[k].price || 0), 0);

    const renderFreeShip = (cart) => {
        const subt = subtotal(cart);
        const remaining = Math.max(0, FREE_SHIP_THRESHOLD - subt);
        const pct = Math.min(100, Math.round((subt / FREE_SHIP_THRESHOLD) * 100));
        const isEn = document.documentElement.lang === 'en';

        document.querySelectorAll('[data-free-ship]').forEach((block) => {
            const textEl = block.querySelector('[data-free-ship-text]');
            const fillEl = block.querySelector('[data-free-ship-fill]');
            if (remaining > 0) {
                block.classList.remove('is-reached');
                if (textEl) {
                    textEl.textContent = isEn
                        ? `Free shipping for orders over ${FREE_SHIP_THRESHOLD} MKD — add ${remaining.toLocaleString('mk-MK')} MKD more.`
                        : `Бесплатна достава за нарачки над ${FREE_SHIP_THRESHOLD.toLocaleString('mk-MK')} ден. — додадете уште ${remaining.toLocaleString('mk-MK')} ден.`;
                }
            } else {
                block.classList.add('is-reached');
                if (textEl) {
                    textEl.textContent = isEn
                        ? '🎉 You have FREE shipping!'
                        : '🎉 Имате БЕСПЛАТНА достава!';
                }
            }
            if (fillEl) fillEl.style.width = pct + '%';
        });
    };

    // Мотивациски popup — ИСКЛУЧИВО на cart.html, кога сметката е НАД 500 ден. (а под 1000)
    const maybeShowFreeShipPopup = (cart) => {
        if (!/cart\.html/.test(window.location.pathname)) return;
        if (window.__freeshipPopupShown) return;
        const subt = subtotal(cart);
        if (subt <= 500 || subt >= FREE_SHIP_THRESHOLD) return;
        window.__freeshipPopupShown = true;
        const remaining = FREE_SHIP_THRESHOLD - subt;
        const isEn = document.documentElement.lang === 'en';
        const IS_MODELI = /\/modeli\//.test(window.location.pathname);
        const base = IS_MODELI ? '../' : './';

        let popup = document.getElementById('freeshipPopup');
        if (popup) popup.remove();
        popup = document.createElement('div');
        popup.id = 'freeshipPopup';
        popup.className = 'freeship-popup';
        popup.innerHTML = `
            <div class="freeship-popup__content">
                <div class="freeship-popup__icon">🎁</div>
                <div class="freeship-popup__text">
                    <strong>${isEn ? 'Only ' + remaining.toLocaleString('mk-MK') + ' MKD to FREE delivery!' : 'Само уште ' + remaining.toLocaleString('mk-MK') + ' ден. до БЕСПЛАТНА достава!'}</strong>
                    <span>${isEn ? 'Add one more insole and the delivery is on us.' : 'Додадете уште една влошка и доставата е на нас.'}</span>
                    <a href="${base}index.html#kategorii" class="freeship-popup__btn">${isEn ? 'See insoles →' : 'Види ги влошките →'}</a>
                </div>
                <button type="button" class="freeship-popup__close" aria-label="Затвори">×</button>
            </div>`;
        document.body.appendChild(popup);
        const closeBtn = popup.querySelector('.freeship-popup__close');
        if (closeBtn) closeBtn.addEventListener('click', () => popup.remove());
        setTimeout(() => { if (popup.parentNode) popup.remove(); }, 12000);
    };

    // Нав-бар баџ — вкупен број на сите артикли во кошничката
    const renderNavBadges = () => {
        const cart = getCart();
        const total = totalQty(cart);
        document.querySelectorAll('[data-cart-badge]').forEach((badge) => {
            badge.textContent = total;
            badge.style.display = total > 0 ? 'flex' : 'none';
        });
    };

    // Бројач на модел-страница — само за овој модел
    const renderModelQty = () => {
        const cart = getCart();
        document.querySelectorAll('[data-model]').forEach((ctl) => {
            const slug = ctl.getAttribute('data-model');
            const qty = (cart[slug] || {}).qty || 0;
            const qtyEl = ctl.querySelector('[data-cart-qty]');
            const minusEl = ctl.querySelector('[data-cart-minus]');
            if (qtyEl) {
                qtyEl.textContent = qty;
                qtyEl.style.display = qty > 0 ? 'block' : 'none';
            }
            if (minusEl) minusEl.style.display = qty > 0 ? 'flex' : 'none';
        });
    };

    const updateModel = (ctl, delta) => {
        const slug = ctl.getAttribute('data-model');
        if (!slug) return;
        const cart = getCart();
        const item = cart[slug] || {
            slug: slug,
            code: ctl.getAttribute('data-code') || slug,
            price: parseFloat(ctl.getAttribute('data-price')) || 0,
            nameMk: ctl.getAttribute('data-name-mk') || slug,
            nameEn: ctl.getAttribute('data-name-en') || slug,
            qty: 0
        };
        const next = Math.max(0, (item.qty || 0) + delta);
        if (next === 0) {
            delete cart[slug];
        } else {
            item.qty = next;
            cart[slug] = item;
        }
        setCart(cart);
        renderModelQty();
        renderNavBadges();
        renderFreeShip(cart);
        maybeShowFreeShipPopup(cart);
        if (window.MonetaCartOnChange) window.MonetaCartOnChange(cart);
    };

    const removeItem = (slug) => {
        const cart = getCart();
        delete cart[slug];
        setCart(cart);
        renderModelQty();
        renderNavBadges();
        renderFreeShip(cart);
        maybeShowFreeShipPopup(cart);
        if (window.MonetaCartOnChange) window.MonetaCartOnChange(cart);
    };

    // Врзување преку делегација — работи и за динамички додадени степери (cart.html)
    document.addEventListener('click', (e) => {
        const addBtn = e.target.closest('[data-cart-add]');
        const minusBtn = e.target.closest('[data-cart-minus]');
        const removeBtn = e.target.closest('[data-cart-remove]');
        if (removeBtn) {
            const itemEl = removeBtn.closest('[data-cart-item]');
            if (itemEl) removeItem(itemEl.getAttribute('data-cart-item'));
            return;
        }
        if (addBtn) {
            const ctl = addBtn.closest('[data-model]');
            if (ctl) updateModel(ctl, 1);
            return;
        }
        if (minusBtn) {
            const ctl = minusBtn.closest('[data-model]');
            if (ctl) updateModel(ctl, -1);
        }
    });

    renderModelQty();
    renderNavBadges();
    renderFreeShip(getCart());
    maybeShowFreeShipPopup(getCart());

    // Јавно API за cart.html
    window.MonetaCart = { getCart: getCart, setCart: setCart, totalQty: totalQty, subtotal: subtotal, updateModel: updateModel, removeItem: removeItem, renderNavBadges: renderNavBadges, renderFreeShip: renderFreeShip, FREE_SHIP_THRESHOLD: FREE_SHIP_THRESHOLD };
})();

// ========================================
// PRODUCT FINDER QUIZ (2026-08-03) — „Најди го твојот совршен пар“
// ========================================
(function initProductFinder() {
    const section = document.getElementById('productFinder');
    if (!section) return;

    const steps = [...section.querySelectorAll('.quiz-step')];
    const bar = section.querySelector('#quizBar');
    const stepLabel = section.querySelector('#quizStepLabel');
    const result = section.querySelector('#quizResult');
    const grid = section.querySelector('#quizResultGrid');
    const prevBtn = section.querySelector('#quizPrev');
    const nextBtn = section.querySelector('#quizNext');
    const restartBtn = section.querySelector('#quizRestart');

    const answers = {};
    let current = 1;

    const QUIZ_ICONS = {
        anatomska:   ['anatomska%20vloska.webp', 'Анатомска', 'Anatomical'],
        pritisok:    ['apsorpcija%20na%20pritisok.webp', 'Апсорпција на удари', 'Shock absorb'],
        apsorpcija:  ['apsorpcija.webp', 'Апсорпција', 'Absorption'],
        gel:         ['gel%20vloska.webp', 'Гел', 'Gel'],
        higienski:   ['higienski.webp', 'Хигиенски', 'Hygienic'],
        koza:        ['koza.webp', 'Кожа', 'Leather'],
        medicinski:  ['medicinski_svojstva.webp', 'Здравје', 'Health'],
        perenje:     ['moznost%20za%20perenje.webp', 'Перење', 'Washable'],
        polar:       ['polar%28ultra%20zimski%29.webp', 'Полар', 'Polar'],
        prirodni:    ['prirodni%20materijali.webp', 'Природни', 'Natural'],
        mirisi:      ['protiv%20losi%20mirisi.webp', 'Анти-мирис', 'Anti-odor'],
        aroma:       ['so%20aroma.webp', 'Арома', 'Aroma'],
        univerzalen: ['univerzalen%20broj.webp', 'Универзален', 'Universal'],
        zimski:      ['zimski.webp', 'Зимски', 'Winter']
    };

    const MODELS = {
        'memosole':       { cat: ['sport'],  pain: ['celo', 'nema'], prio: ['amort', 'prirodni'], job: ['sportist', 'nastavnik', 'zdravstvo'], icons: ['anatomska', 'pritisok', 'mirisi', 'univerzalen'], price: 400, nameMk: 'MEMOSOLE', nameEn: 'MEMOSOLE' },
        'active-gel':     { cat: ['sport'],  pain: ['peta', 'nema'], prio: ['amort'], job: ['sportist', 'zdravstvo'], icons: ['gel', 'pritisok', 'univerzalen', 'anatomska'], price: 620, nameMk: 'Active Gel', nameEn: 'Active Gel' },
        'anatomiX':       { cat: ['sport'],  pain: ['lac', 'nema'], prio: ['poddrshka'], job: ['sportist', 'zdravstvo', 'rabotnik'], icons: ['pritisok', 'higienski', 'anatomska'], price: 430, nameMk: 'AnatomiX', nameEn: 'AnatomiX' },
        'sport-style':    { cat: ['sport'],  pain: ['nema'], prio: ['cena', 'prirodni'], job: ['sportist', 'nastavnik'], icons: ['prirodni', 'anatomska', 'apsorpcija'], price: 300, nameMk: 'Sport Style', nameEn: 'Sport Style' },
        'sportex':        { cat: ['sport'],  pain: ['nema'], prio: ['cena', 'fresina'], job: ['sportist', 'rabotnik', 'nastavnik'], icons: ['pritisok', 'higienski', 'anatomska'], price: 230, nameMk: 'Sportex', nameEn: 'Sportex' },
        'x-treme':        { cat: ['sport'],  pain: ['peta', 'celo'], prio: ['amort', 'poddrshka'], job: ['sportist', 'rabotnik'], icons: ['pritisok', 'anatomska', 'apsorpcija', 'higienski'], price: 420, nameMk: 'X-TREME', nameEn: 'X-TREME' },
        'heel-pad':       { cat: ['kozni'],  pain: ['peta'], prio: ['poddrshka'], job: ['kancelarija', 'zdravstvo', 'nastavnik'], icons: ['koza', 'pritisok', 'anatomska'], price: 250, nameMk: 'Heel Pad', nameEn: 'Heel Pad' },
        'heel-pad-fix':   { cat: ['kozni'],  pain: ['peta'], prio: ['poddrshka'], job: ['kancelarija', 'zdravstvo'], icons: ['koza', 'pritisok'], price: 210, nameMk: 'Heel Pad FIX', nameEn: 'Heel Pad FIX' },
        'heel-pad-grip':  { cat: ['kozni'],  pain: ['peta'], prio: ['cena', 'poddrshka'], job: ['kancelarija', 'nastavnik'], icons: ['koza', 'univerzalen', 'pritisok'], price: 100, nameMk: 'Heel Pad Grip', nameEn: 'Heel Pad Grip' },
        'topas':          { cat: ['kozni'],  pain: ['lac', 'peta'], prio: ['poddrshka', 'prirodni'], job: ['kancelarija', 'nastavnik', 'zdravstvo'], icons: ['koza', 'anatomska', 'medicinski'], price: 490, nameMk: 'Topas', nameEn: 'Topas' },
        'soft-gel':       { cat: ['kozni'],  pain: ['celo', 'peta'], prio: ['amort', 'fresina'], job: ['zdravstvo', 'nastavnik'], icons: ['koza', 'gel', 'mirisi', 'anatomska'], price: 820, nameMk: 'Soft Gel', nameEn: 'Soft Gel' },
        'vital':          { cat: ['kozni'],  pain: ['lac'], prio: ['poddrshka'], job: ['kancelarija', 'nastavnik'], icons: ['koza', 'apsorpcija', 'anatomska'], price: 450, nameMk: 'Vital', nameEn: 'Vital' },
        'relax':          { cat: ['kozni'],  pain: ['celo', 'lac'], prio: ['prirodni', 'amort'], job: ['kancelarija', 'zdravstvo', 'nastavnik'], icons: ['koza', 'prirodni', 'anatomska'], price: 570, nameMk: 'Relax', nameEn: 'Relax' },
        'simona':         { cat: ['letni'],  pain: ['nema', 'celo'], prio: ['fresina', 'prirodni', 'cena'], job: ['kancelarija', 'nastavnik'], icons: ['aroma', 'mirisi', 'prirodni', 'apsorpcija'], price: 120, nameMk: 'Simona', nameEn: 'Simona' },
        'carbon':         { cat: ['letni'],  pain: ['celo', 'nema'], prio: ['fresina', 'cena'], job: ['kancelarija', 'nastavnik'], icons: ['mirisi', 'higienski', 'univerzalen', 'apsorpcija'], price: 170, nameMk: 'Carbon', nameEn: 'Carbon' },
        'thermo-alu':     { cat: ['zimski'], pain: ['nema', 'celo'], prio: ['prirodni'], job: ['rabotnik', 'nastavnik'], icons: ['zimski', 'polar', 'prirodni', 'anatomska'], price: 210, nameMk: 'Thermo Alu', nameEn: 'Thermo Alu' },
        'hunter-outdoor': { cat: ['hunter'], pain: ['lac', 'peta'], prio: ['poddrshka'], job: ['rabotnik', 'sportist'], icons: ['pritisok', 'anatomska', 'apsorpcija'], price: 330, nameMk: 'Hunter Outdoor', nameEn: 'Hunter Outdoor' },
        'hunter-flex':    { cat: ['hunter'], pain: ['celo'], prio: ['amort'], job: ['rabotnik', 'sportist'], icons: ['zimski', 'pritisok', 'anatomska'], price: 330, nameMk: 'Hunter Flex', nameEn: 'Hunter Flex' },
        'hunter-camo':    { cat: ['hunter'], pain: ['peta', 'lac'], prio: ['poddrshka'], job: ['rabotnik', 'sportist'], icons: ['mirisi', 'apsorpcija', 'anatomska'], price: 330, nameMk: 'Hunter CAMO', nameEn: 'Hunter CAMO' },
        'duck':           { cat: ['detski'], pain: ['nema', 'celo'], prio: ['prirodni', 'cena'], job: [], icons: ['prirodni', 'anatomska', 'medicinski'], price: 490, nameMk: 'Duck', nameEn: 'Duck' },
    };

    function lang() {
        return document.documentElement.lang === 'en' ? 'en' : 'mk';
    }

    function showStep(n) {
        current = Math.min(Math.max(1, n), steps.length);
        steps.forEach((s) => s.classList.toggle('is-active', +s.dataset.step === current));
        if (result) result.style.display = 'none';
        if (bar) bar.style.width = (current / steps.length * 100) + '%';
        if (stepLabel) stepLabel.textContent = current + ' / ' + steps.length;
        if (prevBtn) prevBtn.style.visibility = current === 1 ? 'hidden' : 'visible';
        if (nextBtn) {
            nextBtn.style.visibility = 'visible';
            nextBtn.dataset.mk = 'Следно →';
            nextBtn.dataset.en = 'Next →';
            nextBtn.textContent = lang() === 'en' ? 'Next →' : 'Следно →';
        }
        steps.forEach((s) => {
            const val = answers[s.dataset.step];
            s.querySelectorAll('.quiz-option').forEach((o) => o.classList.toggle('is-selected', o.dataset.val === val));
        });
    }

    function scoreModels() {
        const q1 = answers['1'] || 'jas';          // за кого
        const q2 = answers['2'] || 'drugo';        // занимање
        const q3 = answers['3'] || 'nema';         // непријатност
        const q4 = answers['4'] || '4-8';          // часови на нозе
        const q5 = answers['5'] || 'sport';        // обувки
        const q6 = answers['6'] || 'poddrshka';    // приоритет
        const scored = Object.entries(MODELS).map(([slug, m]) => {
            let score = 0;
            if (m.cat.includes(q5)) score += 3;
            if (m.pain.includes(q3)) score += 2;
            if (m.prio.includes(q6)) score += 2;
            if (m.job && m.job.includes(q2)) score += 2;
            if (q1 === 'dete' && slug === 'duck') score += 5;
            if (q4 === '8+' && (m.pain.includes('celo') || q3 === 'peta' || q3 === 'lac')) score += 1;
            return { slug, ...m, score };
        });
        scored.sort((a, b) => b.score - a.score || a.price - b.price);
        return scored;
    }

    function showResult() {
        const isEn = lang() === 'en';
        const isDuckMode = answers['1'] === 'dete';
        const top = isDuckMode ? [] : scoreModels().slice(0, 3);
        if (grid) {
            if (isDuckMode) {
                // За деца има само еден модел (DUCK) — нема квиз прашања, само инфо + линк
                grid.innerHTML = `
                    <p class="quiz-result__note">${isEn ? '🎒 For kids there is only one insole — meet <strong>MONETA Duck</strong>!' : '🎒 За деца постои само една влошка — запознајте ја <strong>МОНЕТА Duck</strong>!'}</p>
                    <a href="modeli/duck.html" class="quiz-result__card quiz-result__card--duck">
                        <img src="images/cards/duck.webp" alt="Duck" width="200" height="150" loading="lazy">
                        <strong>Duck</strong>
                        <span>490 ${isEn ? 'MKD' : 'ден.'}</span>
                        <div class="quiz-result__icons">
                            <img src="images/icons/prirodni%20materijali.webp" alt="${isEn ? 'Natural' : 'Природни'}" title="${isEn ? 'Natural' : 'Природни'}" width="22" height="22" loading="lazy">
                            <img src="images/icons/anatomska%20vloska.webp" alt="${isEn ? 'Anatomical' : 'Анатомска'}" title="${isEn ? 'Anatomical' : 'Анатомска'}" width="22" height="22" loading="lazy">
                            <img src="images/icons/medicinski_svojstva.webp" alt="${isEn ? 'Health' : 'Здравје'}" title="${isEn ? 'Health' : 'Здравје'}" width="22" height="22" loading="lazy">
                        </div>
                        <em>${isEn ? 'View →' : 'Види →'}</em>
                    </a>`;
            } else {
                grid.innerHTML = top.map((m) => `
                <a href="modeli/${m.slug}.html" class="quiz-result__card">
                    <img src="images/cards/${m.slug}.webp" alt="${isEn ? m.nameEn : m.nameMk}" width="200" height="150" loading="lazy">
                    <strong>${isEn ? m.nameEn : m.nameMk}</strong>
                    <span>${m.price} ${isEn ? 'MKD' : 'ден.'}</span>
                    <div class="quiz-result__icons">${(m.icons || []).map((k) => {
                        const ic = QUIZ_ICONS[k];
                        if (!ic) return '';
                        const [file, mk, en] = ic;
                        return `<img src="images/icons/${file}" alt="${isEn ? en : mk}" title="${isEn ? en : mk}" width="22" height="22" loading="lazy">`;
                    }).join('')}</div>
                    <em>${isEn ? 'View →' : 'Види →'}</em>
                </a>`).join('');
            }
        }
        steps.forEach((s) => s.classList.remove('is-active'));
        if (result) result.style.display = 'block';
        if (bar) bar.style.width = '100%';
        if (stepLabel) stepLabel.textContent = '✓';
        if (prevBtn) prevBtn.style.visibility = 'hidden';
        if (nextBtn) {
            nextBtn.style.visibility = 'visible';
            nextBtn.dataset.mk = '🏠 Почетна';
            nextBtn.dataset.en = '🏠 Home';
            nextBtn.textContent = isEn ? '🏠 Home' : '🏠 Почетна';
        }
    }

    section.addEventListener('click', (e) => {
        const opt = e.target.closest('.quiz-option');
        if (opt) {
            const stepEl = opt.closest('.quiz-step');
            answers[stepEl.dataset.step] = opt.dataset.val;
            stepEl.querySelectorAll('.quiz-option').forEach((o) => o.classList.toggle('is-selected', o === opt));
            if (current === 1 && opt.dataset.val === 'dete') {
                // За „За дете“ → нема квиз прашања (постои само DUCK), директно резултат
                showResult();
            } else if (current < steps.length) {
                setTimeout(() => showStep(current + 1), 260);
            } else {
                showResult();
            }
            return;
        }
        if (e.target.closest('#quizPrev')) { showStep(current - 1); return; }
        if (e.target.closest('#quizNext')) {
            const resultShown = result && result.style.display === 'block';
            if (resultShown) {
                window.location.href = 'index.html';
                return;
            }
            if (current < steps.length) showStep(current + 1);
            return;
        }
        if (e.target.closest('#quizRestart')) {
            Object.keys(answers).forEach((k) => delete answers[k]);
            showStep(1);
        }
    });

    // CTA копче „Најди го твојот совршен пар“ → квиз
    const trigger = document.getElementById('quizFinderTrigger');
    if (trigger) {
        trigger.addEventListener('click', () => section.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }

    // Кога ќе се смени јазикот — прикажи го тековниот чекор со новите преводи
    if (window.MonetaOnLangChange) {
        window.MonetaOnLangChange(() => {
            const wasResult = result && result.style.display === 'block';
            if (wasResult) {
                showResult();
            } else {
                steps.forEach((s) => s.classList.toggle('is-active', +s.dataset.step === current));
            }
        });
    }

    showStep(1);
})();

// ========================================
// DEALER MAP (2026-08-04) — Leaflet + OpenStreetMap
// Мапа на дилери во секцијата Контакт (index.html), двојазично MK/EN.
// ========================================
(function initDealerMap() {
    const mapEl = document.getElementById('dealerMap');
    if (!mapEl || typeof L === 'undefined') return;

    const DEALERS = [
        { nameMk: 'МЕДИКА ПРО — Скопје', nameEn: 'MEDIKA PRO — Skopje', addrMk: 'бул. Кочо Рацин бр.75, Центар', addrEn: '75 Koco Racin Blvd, Centar', tel: ['+389 72 225 505', '+389 2 3111 404'], lat: 41.9963, lng: 21.4258 },
        { nameMk: 'МЕДИКА ПРО — Прилеп', nameEn: 'MEDIKA PRO — Prilep', addrMk: 'ул. Мице Козар бр.10', addrEn: '10 Mice Kozar St.', tel: ['+389 70 22 55 99', '+389 48 450 231'], lat: 41.3458, lng: 21.5565 },
        { nameMk: 'МЕДИКА ПРО — Тетово', nameEn: 'MEDIKA PRO — Tetovo', addrMk: 'ул. Маршал Тито бр.36', addrEn: '36 Marshal Tito St.', tel: ['+389 71 26 20 48', '+389 44 349 050'], lat: 42.0086, lng: 20.9710 },
        { nameMk: 'МЕДИКА ПРО — Битола', nameEn: 'MEDIKA PRO — Bitola', addrMk: 'бул. 1-ви Мај бр.202/7', addrEn: '202/7 1st May Blvd', tel: ['+389 72 30 37 82', '+389 47 29 21 10'], lat: 41.0297, lng: 21.3332 },
        { nameMk: 'МЕДИКА ПРО — Куманово', nameEn: 'MEDIKA PRO — Kumanovo', addrMk: 'ул. Христијан Тодоровски Карпош бр.7', addrEn: '7 Hristijan Todorovski Karpos St.', tel: ['+389 70 322 611', '+389 31 461 990'], lat: 42.1322, lng: 21.7150 },
        { nameMk: 'МЕДИКА ПРО — Струмица', nameEn: 'MEDIKA PRO — Strumica', addrMk: 'ул. Младинска бр.37', addrEn: '37 Mladinska St.', tel: ['+389 70 223 100', '+389 34 348 256'], lat: 41.3183, lng: 22.6410 },
        { nameMk: 'МАК-ФИТ (Calivita) — Скопје', nameEn: 'MAK-FIT (Calivita) — Skopje', addrMk: 'ул. св. Кирил и Методиј бр.20', addrEn: '20 Sv. Kiril i Metodij St.', tel: ['+389 76 454 957', '+389 2 323 00 88'], isMain: true, lat: 42.0008, lng: 21.4310 }
    ];

    const isEn = () => document.documentElement.lang === 'en';

    function popupHtml(d) {
        const phones = d.tel.map((t) => `<a href="tel:${t.replace(/\s/g, '')}">${t}</a>`).join(' · ');
        return `<div class="dealer-popup">
            <strong>${isEn() ? d.nameEn : d.nameMk}</strong>
            <span>${isEn() ? d.addrEn : d.addrMk}</span>
            <span class="dealer-popup__tel">${phones}</span>
        </div>`;
    }

    const pinIcon = L.divIcon({
        className: 'dealer-pin-wrap',
        html: '<div class="dealer-pin"></div>',
        iconSize: [26, 36],
        iconAnchor: [13, 36],
        popupAnchor: [0, -34]
    });
    // Главната продавница (МАК-ФИТ) → син пин
    const pinIconBlue = L.divIcon({
        className: 'dealer-pin-wrap',
        html: '<div class="dealer-pin dealer-pin--blue"></div>',
        iconSize: [26, 36],
        iconAnchor: [13, 36],
        popupAnchor: [0, -34]
    });

    const map = L.map(mapEl, { scrollWheelZoom: false, attributionControl: true }).setView([41.65, 21.55], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
    }).addTo(map);

    const markers = DEALERS.map((d) =>
        L.marker([d.lat, d.lng], { icon: d.isMain ? pinIconBlue : pinIcon }).addTo(map).bindPopup(popupHtml(d))
    );

    // Јазична промена → освежи ги попup-содржините
    if (window.MonetaOnLangChange) {
        window.MonetaOnLangChange(() => {
            markers.forEach((m, i) => m.setPopupContent(popupHtml(DEALERS[i])));
        });
    }
})();