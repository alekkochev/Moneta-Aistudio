// ========================================
// AOS INIT
// ========================================
AOS.init({
    duration: 800,
    once: true,
    offset: 100,
    easing: 'ease-out-cubic'
});

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

    // Toast Notification helper
    const showShareToast = (message) => {
        let toast = document.getElementById('shareToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'shareToast';
            toast.style.cssText = `
                position: fixed;
                bottom: 24px;
                left: 50%;
                transform: translateX(-50%) translateY(30px);
                background: rgba(18, 19, 26, 0.95);
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
                color: #ffffff;
                border: 1px solid rgba(236, 23, 82, 0.4);
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
                padding: 12px 24px;
                border-radius: 50px;
                font-size: 14px;
                font-weight: 600;
                z-index: 9999;
                opacity: 0;
                pointer-events: none;
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                display: flex;
                align-items: center;
                gap: 8px;
            `;
            document.body.appendChild(toast);
        }

        toast.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EC1752" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>${message}</span>
        `;

        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';

        clearTimeout(toast.timer);
        toast.timer = setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(30px)';
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
            const modelUrl = btn.dataset.modelUrl || window.location.pathname;

            const fullUrl = window.location.origin + modelUrl;
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
// GSAP INIT
// ========================================
if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    gsap.from('.hero__inner', {
        opacity: 0,
        y: 40,
        duration: 1.1,
        ease: 'power3.out',
        delay: 0.2
    });

    gsap.from('.hero__trust-item', {
        opacity: 0,
        y: 20,
        stagger: 0.12,
        duration: 0.8,
        delay: 0.6,
        ease: 'power3.out'
    });

    gsap.from('.hero__cta', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.9,
        ease: 'power3.out'
    });

    gsap.from('.navbar__links a', {
        opacity: 0,
        y: -10,
        stagger: 0.08,
        duration: 0.7,
        ease: 'power3.out',
        delay: 0.3
    });

    // Category Cards GSAP Stagger Animation
    const categoryCards = document.querySelectorAll('.categories__grid .card');
    if (categoryCards.length > 0) {
        gsap.from(categoryCards, {
            scrollTrigger: {
                trigger: '.categories__grid',
                start: 'top 80%',
                toggleActions: 'play none none none'
            },
            opacity: 0,
            y: 50,
            scale: 0.94,
            duration: 0.85,
            stagger: 0.12,
            ease: 'power3.out',
            clearProps: 'transform'
        });

        categoryCards.forEach((card) => {
            ScrollTrigger.create({
                trigger: card,
                start: 'top 65%',
                end: 'bottom 35%',
                toggleClass: { targets: card, className: 'is-active' },
                scrub: false
            });
        });
    }
}

// ========================================
// KONTAKT FORMA HANDLER
// ========================================

(function() {
    if (window.emailjs) {
        try {
            emailjs.init("KTMO1pZn_2I0wSyZf");
        } catch (err) {
            console.warn('EmailJS init failed:', err);
        }
    }
})();

const kontaktForm = document.getElementById('kontaktForm');
const kontaktFeedback = document.getElementById('kontaktFeedback');

if (kontaktForm) {
    kontaktForm.addEventListener('submit', function(e) {
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

        if (window.emailjs) {
            emailjs.send(
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

    // Recommendation Engine
    const sizePills = document.querySelectorAll('#sizePills .size-pill');
    const activityPills = document.querySelectorAll('#activityOptions .activity-pill');
    const resultContainer = document.getElementById('sizeResult');

    const insoleModels = {
        sport: {
            title: 'Спортски анатомски влошки',
            tag: 'Препорака за спорт & патики',
            image: 'images/cards/Sportski.webp',
            link: '/produkti/sportski/',
            desc: 'Максимална амортизација со гел зони на петицата за ублажување на удари при трчање и активност.'
        },
        leather: {
            title: 'Кожни елегантни влошки',
            tag: 'Препорака за деловни & кожни чевли',
            image: 'images/cards/Kozni.webp',
            link: '/produkti/kozhni/',
            desc: 'Танки, изработени од природна кожа со активен јаглен кој спречува непријатни мириси.'
        },
        summer: {
            title: 'Летни дишечки влошки',
            tag: 'Препорака за топло време & одобливи обувки',
            image: 'images/cards/Letni.webp',
            link: '/produkti/letni/',
            desc: 'Перфорирана лесна структура што овозможува максимална циркулација на воздух и свежина.'
        },
        winter: {
            title: 'Зимски термо влошки',
            tag: 'Препорака за ладни денови & чизми',
            image: 'images/cards/thermo_alu.webp',
            link: '/produkti/zimski/',
            desc: 'Алуминиумска топлотна изолација и волнена површина кои ја задржуваат топлината во чизмите.'
        },
        hunter: {
            title: 'HUNTER професионални влошки',
            tag: 'Препорака за терен & работни чевли',
            image: 'images/cards/HUNTER vloski.webp',
            link: '/produkti/hunter/',
            desc: 'Специјална зајакната конструкција за екстремни оптоварувања, лов, планинарење и работна обувка.'
        },
        kids: {
            title: 'Детски анатомски влошки',
            tag: 'Препорака за правилен детски развој',
            image: 'images/cards/detski.webp',
            link: '/produkti/detski/',
            desc: 'Нежна поддршка за правилно формирање на детскиот свод на стапалата во развој.'
        }
    };

    let selectedSize = '39-40';
    let selectedActivity = 'sport';

    const updateRecommendation = () => {
        if (!resultContainer) return;
        
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
        const sizeText = selectedSize === '28-34' ? 'Детска големина (28-34 EU)' : `Број EU ${selectedSize}`;

        resultContainer.innerHTML = `
            <div class="result-card__image">
                <img src="${model.image}" alt="${model.title}">
            </div>
            <div class="result-card__content">
                <span class="result-card__tag">${model.tag}</span>
                <h4 class="result-card__title">${model.title}</h4>
                <p class="result-card__specs">
                    <strong>Препорачан број:</strong> ${sizeText}<br>
                    ${model.desc}
                </p>
                <a href="${model.link}" class="result-card__cta">
                    Погледни ги сите детали за овој модел →
                </a>
            </div>
        `;
    };

    sizePills.forEach((pill) => {
        pill.addEventListener('click', () => {
            sizePills.forEach((p) => p.classList.remove('is-active'));
            pill.classList.add('is-active');
            selectedSize = pill.dataset.size;
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
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = newsletterEmailInput.value.trim();
        
        if (!email || !email.includes('@') || !email.includes('.')) {
            newsletterFeedback.className = 'newsletter__feedback is-error';
            newsletterFeedback.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>Ве молиме внесете валидна е-пошта адреса.</span>
            `;
            return;
        }

        newsletterFeedback.className = 'newsletter__feedback is-success';
        newsletterFeedback.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span>Ви благодариме! Успешно се пријавивте за нашиот билтен со совети за здравје на стапалата.</span>
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
            url: '/produkti/sportski/',
            image: 'images/cards/Sportski.webp',
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
            url: '/produkti/kozhni/',
            image: 'images/cards/Kozni.webp',
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
            url: '/produkti/letni/',
            image: 'images/cards/Letni.webp',
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
            url: '/produkti/zimski/',
            image: 'images/cards/thermo_alu.webp',
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
            url: '/produkti/hunter/',
            image: 'images/cards/HUNTER vloski.webp',
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
            url: '/produkti/detski/',
            image: 'images/cards/detski.webp',
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
// HERO CTA SMOOTH SCROLL & MOBILE CATEGORIES FOCUS BLUR
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

    // 2. Mobile Progressive Scroll Blur for Category Cards
    function updateCategoryCardsScrollBlur() {
        const categoryCards = document.querySelectorAll('.card--sport, .card--image');
        if (!categoryCards.length) return;

        const isMobile = window.innerWidth <= 860 || ('ontouchstart' in window);
        const viewportHeight = window.innerHeight;
        const viewportCenter = viewportHeight * 0.5;
        const maxDist = viewportHeight * 0.42;

        categoryCards.forEach((card) => {
            const img = card.querySelector('.card__image img');
            if (!img) return;

            if (!isMobile) {
                img.style.removeProperty('--card-blur');
                img.style.removeProperty('--card-brightness');
                img.style.removeProperty('--card-scale');
                card.classList.remove('is-scroll-focused');
                return;
            }

            const rect = card.getBoundingClientRect();
            const cardCenter = rect.top + (rect.height * 0.5);
            const distFromCenter = Math.abs(cardCenter - viewportCenter);

            // Progressive focus factor t from 0 (off-screen / edge) to 1 (center focus)
            let t = 1 - Math.min(distFromCenter / maxDist, 1);
            // Smooth curve
            t = Math.pow(t, 1.2);

            const blurVal = (1 - t) * 22; // 0px in center to 22px at edges
            const brightnessVal = 0.55 + (t * 0.33); // 0.55 to 0.88
            const scaleVal = 1.0 + (t * 0.04); // 1.0 to 1.04

            img.style.setProperty('--card-blur', `${blurVal.toFixed(1)}px`);
            img.style.setProperty('--card-brightness', brightnessVal.toFixed(2));
            img.style.setProperty('--card-scale', scaleVal.toFixed(2));

            if (t > 0.6) {
                card.classList.add('is-scroll-focused');
                card.classList.add('is-active');
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
                updateCategoryCardsScrollBlur();
                isTicking = false;
            });
            isTicking = true;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateCategoryCardsScrollBlur, { passive: true });
    
    // Initial calculation on load
    setTimeout(updateCategoryCardsScrollBlur, 100);
    setTimeout(updateCategoryCardsScrollBlur, 500);
})();

// ========================================
// CONSOLE WELCOME
// ========================================
console.log('%c MONETA Macedonia 🦶 ', 'background:#EC1752;color:#fff;font-size:20px;font-weight:bold;padding:10px 20px;border-radius:8px;');
console.log('%c Анатомски вложки - Подобар чекор, помал замор', 'color:#201F26;font-size:14px;');
console.log('%c Вебсајт во развој 💪', 'color:#6B6B76;font-size:12px;');