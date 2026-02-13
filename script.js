// ================================================
// CONFIGURATION
// ================================================

const CONFIG = {
    // Razorpay Test Keys - Replace with production keys when ready
    razorpay: {
        key: 'rzp_live_RZCoCRx6gL5tnp', // Replace with your Razorpay test key
        amount: 49900, // Amount in paise (99 INR)
        currency: 'INR',
        name: 'Valentine Surprise',
        description: 'Unlock Valentine Surprise',
        theme: {
            color: '#ff4081'
        }
    }
};

// ================================================
// DOM ELEMENTS
// ================================================

const elements = {
    // Pages
    landingPage: document.getElementById('landing-page'),
    valentinePage: document.getElementById('valentine-page'),
    yesPage: document.getElementById('yes-page'),

    // Landing Page
    nameInput: document.getElementById('name-input'),
    generateBtn: document.getElementById('generate-btn'),
    manageSection: document.getElementById('manage-section'),
    manageBtn: document.getElementById('manage-btn'),

    // Valentine Page
    displayName: document.getElementById('display-name'),
    yesBtn: document.getElementById('yes-btn'),
    noBtn: document.getElementById('no-btn'),
    noWrapper: document.getElementById('no-wrapper'),
    watermark: document.getElementById('watermark'),
    unlockSection: document.getElementById('unlock-section'),
    unlockBtn: document.getElementById('unlock-btn'),
    shareSection: document.getElementById('share-section'),
    shareLink: document.getElementById('share-link'),
    copyBtn: document.getElementById('copy-btn'),
    copyFeedback: document.getElementById('copy-feedback'),
    createAnotherBtn: document.getElementById('create-another-btn'),

    // Yes Page
    floatingHearts: document.getElementById('floating-hearts'),
    watermarkYes: document.getElementById('watermark-yes'),
    unlockSectionYes: document.getElementById('unlock-section-yes'),
    unlockBtnYes: document.getElementById('unlock-btn-yes'),
    shareSectionYes: document.getElementById('share-section-yes'),
    shareLinkYes: document.getElementById('share-link-yes'),
    copyBtnYes: document.getElementById('copy-btn-yes'),
    copyFeedbackYes: document.getElementById('copy-feedback-yes'),
    createAnotherBtnYes: document.getElementById('create-another-btn-yes'),

    // Manage Panel
    managePanel: document.getElementById('manage-panel'),
    manageList: document.getElementById('manage-list'),
    manageCloseBtn: document.getElementById('manage-close-btn'),
    manageCreateBtn: document.getElementById('manage-create-btn')
};

// ================================================
// STATE
// ================================================

let state = {
    name: '',
    isPaid: false,
    isPreview: true
};

// ================================================
// STORAGE HELPERS (per-name paid collection)
// ================================================

function getPaidValentines() {
    try {
        const data = localStorage.getItem('valentines');
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

function addPaidValentine(name, link) {
    const list = getPaidValentines();
    // Avoid duplicates (case-insensitive match)
    const exists = list.some(v => v.name.toLowerCase() === name.toLowerCase());
    if (!exists) {
        list.push({ name: name, link: link });
        localStorage.setItem('valentines', JSON.stringify(list));
    }
}

function isNamePaid(name) {
    const list = getPaidValentines();
    return list.some(v => v.name.toLowerCase() === name.toLowerCase());
}

function getLinkForName(name) {
    const list = getPaidValentines();
    const found = list.find(v => v.name.toLowerCase() === name.toLowerCase());
    return found ? found.link : null;
}

// ================================================
// UTILITY FUNCTIONS
// ================================================

function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        name: params.get('name'),
        paid: params.get('paid') === 'true',
        yes: params.get('yes') === 'true'
    };
}

function showPage(pageToShow) {
    [elements.landingPage, elements.valentinePage, elements.yesPage].forEach(page => {
        page.classList.add('hidden');
    });

    pageToShow.classList.remove('hidden');

    // Hide/show the No button (it may be on document.body as a fixed element)
    if (pageToShow === elements.valentinePage) {
        elements.noWrapper.style.display = '';
    } else {
        elements.noWrapper.style.display = 'none';
    }

    // ⏳ Allow layout to render, then animate
    setTimeout(() => {
        triggerAnimations(pageToShow);
    }, 100);
}

function generateShareableLink(name) {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?name=${encodeURIComponent(name)}&paid=true`;
}

function populateWatermark(container) {
    if (!container) return;
    container.innerHTML = '';
    const lineCount = 20;
    const text = 'SAMPLE   \u2022   '.repeat(12);
    for (let i = 0; i < lineCount; i++) {
        const line = document.createElement('div');
        line.className = 'wm-line';
        line.textContent = text;
        container.appendChild(line);
    }
}

// ================================================
// UI HELPERS
// ================================================

// Hide watermarks on both pages
function hideWatermarks() {
    if (elements.watermark) elements.watermark.classList.add('hidden');
    if (elements.watermarkYes) elements.watermarkYes.classList.add('hidden');
}

// Show watermarks on both pages
function showWatermarks() {
    if (elements.watermark) elements.watermark.classList.remove('hidden');
    if (elements.watermarkYes) elements.watermarkYes.classList.remove('hidden');
}

// Hide unlock buttons on both pages
function hideUnlockUI() {
    if (elements.unlockSection) elements.unlockSection.classList.add('hidden');
    if (elements.unlockSectionYes) elements.unlockSectionYes.classList.add('hidden');
}

// Show unlock buttons on both pages
function showUnlockUI() {
    if (elements.unlockSection) elements.unlockSection.classList.remove('hidden');
    if (elements.unlockSectionYes) elements.unlockSectionYes.classList.remove('hidden');
}

// Hide share section
function hideShareUI() {
    if (elements.shareSection) elements.shareSection.classList.add('hidden');
    if (elements.shareSectionYes) elements.shareSectionYes.classList.add('hidden');
}

// Show share section with generated link
function showShareSection(name) {
    const link = generateShareableLink(name);
    if (elements.shareLink) elements.shareLink.value = link;
    if (elements.shareLinkYes) elements.shareLinkYes.value = link;

    if (elements.shareSection) elements.shareSection.classList.remove('hidden');
    if (elements.shareSectionYes) elements.shareSectionYes.classList.remove('hidden');
}

// Show/hide manage button on landing page
function updateManageVisibility() {
    const list = getPaidValentines();
    if (list.length > 0) {
        elements.manageSection.classList.remove('hidden');
    } else {
        elements.manageSection.classList.add('hidden');
    }
}

// ================================================
// MANAGE PANEL
// ================================================

function openManagePanel() {
    renderManageList();
    elements.managePanel.classList.remove('hidden');
}

function closeManagePanel() {
    elements.managePanel.classList.add('hidden');
}

function renderManageList() {
    const list = getPaidValentines();
    elements.manageList.innerHTML = '';

    if (list.length === 0) {
        const empty = document.createElement('p');
        empty.textContent = 'No surprises created yet.';
        empty.style.textAlign = 'center';
        empty.style.color = '#999';
        empty.style.fontFamily = "'Poppins', sans-serif";
        elements.manageList.appendChild(empty);
        return;
    }

    list.forEach(valentine => {
        const item = document.createElement('div');
        item.className = 'manage-item';
        item.addEventListener('click', () => {
            closeManagePanel();
            loadValentine(valentine.name);
        });

        const nameSpan = document.createElement('span');
        nameSpan.className = 'manage-item-name';
        nameSpan.textContent = valentine.name + ' 💕';

        const copyBtn = document.createElement('button');
        copyBtn.className = 'manage-item-copy';
        copyBtn.textContent = 'Copy Link 🔗';
        copyBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Don't trigger the item's click event
            copyToClipboard(valentine.link, copyBtn);
        });

        item.appendChild(nameSpan);
        item.appendChild(copyBtn);
        elements.manageList.appendChild(item);
    });
}

function copyToClipboard(text, buttonEl) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showButtonCopied(buttonEl);
        }).catch(() => {
            fallbackCopyText(text, buttonEl);
        });
    } else {
        fallbackCopyText(text, buttonEl);
    }
}

function fallbackCopyText(text, buttonEl) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showButtonCopied(buttonEl);
}

function showButtonCopied(buttonEl) {
    const original = buttonEl.textContent;
    buttonEl.textContent = 'Copied! ✓';
    buttonEl.classList.add('copied');
    setTimeout(() => {
        buttonEl.textContent = original;
        buttonEl.classList.remove('copied');
    }, 1500);
}

// ================================================
// NO BUTTON ESCAPE LOGIC
// ================================================

function getRandomPosition() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const buttonRect = elements.noWrapper.getBoundingClientRect();
    const yesBtnRect = elements.yesBtn.getBoundingClientRect();

    // Safe margins from edges
    const margin = 20;
    const buttonWidth = buttonRect.width || 100;
    const buttonHeight = buttonRect.height || 60;

    // Calculate YES button center for distance checking
    const yesBtnCenter = {
        x: yesBtnRect.left + yesBtnRect.width / 2,
        y: yesBtnRect.top + yesBtnRect.height / 2
    };

    // Strict viewport boundaries - button MUST stay within visible area
    const minX = margin;
    const maxX = viewportWidth - buttonWidth - margin;
    const minY = margin;
    const maxY = viewportHeight - buttonHeight - margin - 60; // Account for watermark

    let newX, newY;
    let attempts = 0;
    const maxAttempts = 50;

    do {
        // Generate random position strictly within viewport
        newX = minX + Math.random() * Math.max(0, maxX - minX);
        newY = minY + Math.random() * Math.max(0, maxY - minY);

        // Check distance from YES button
        const distance = Math.sqrt(
            Math.pow(newX + buttonWidth / 2 - yesBtnCenter.x, 2) +
            Math.pow(newY + buttonHeight / 2 - yesBtnCenter.y, 2)
        );

        attempts++;

        // Ensure minimum distance from YES button (100px)
        if (distance > 100) break;

    } while (attempts < maxAttempts);

    // Final safety clamp to ensure button is always visible
    newX = Math.max(margin, Math.min(newX, viewportWidth - buttonWidth - margin));
    newY = Math.max(margin, Math.min(newY, viewportHeight - buttonHeight - margin - 60));

    return { x: newX, y: newY };
}

function escapeNoButton() {
    const isFirstEscape = elements.noWrapper.parentElement !== document.body;

    if (isFirstEscape) {
        // Capture where the button currently is on screen
        const currentRect = elements.noWrapper.getBoundingClientRect();

        // Disable transition so the reparenting doesn't flash
        elements.noWrapper.style.transition = 'none';

        // Move to body to avoid CSS transform containment issues
        document.body.appendChild(elements.noWrapper);

        // Set fixed position at current visual location (no visible change)
        elements.noWrapper.style.position = 'fixed';
        elements.noWrapper.style.left = `${currentRect.left}px`;
        elements.noWrapper.style.top = `${currentRect.top}px`;
        elements.noWrapper.style.margin = '0';
        elements.noWrapper.style.zIndex = '50';

        // Force layout so the browser registers the starting position
        elements.noWrapper.offsetHeight;

        // Re-enable transition
        elements.noWrapper.style.transition = '';

        // Now animate to the new random position
        const pos = getRandomPosition();
        requestAnimationFrame(() => {
            elements.noWrapper.style.left = `${pos.x}px`;
            elements.noWrapper.style.top = `${pos.y}px`;
        });
    } else {
        // Already fixed-positioned — just animate to new spot
        const pos = getRandomPosition();
        elements.noWrapper.style.left = `${pos.x}px`;
        elements.noWrapper.style.top = `${pos.y}px`;
    }
}

// ================================================
// FLOATING HEARTS ANIMATION
// ================================================

function createFloatingHeart() {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.innerHTML = ['💕', '💗', '💖', '💝', '❤️', '💘'][Math.floor(Math.random() * 6)];
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.fontSize = `${16 + Math.random() * 20}px`;
    heart.style.animationDuration = `${6 + Math.random() * 6}s`;
    heart.style.animationDelay = `${Math.random() * 2}s`;

    elements.floatingHearts.appendChild(heart);

    // Remove heart after animation
    setTimeout(() => {
        heart.remove();
    }, 14000);
}

function startFloatingHearts() {
    // Create initial hearts
    for (let i = 0; i < 8; i++) {
        setTimeout(() => createFloatingHeart(), i * 400);
    }

    // Continue creating hearts
    setInterval(createFloatingHeart, 1500);
}

// ================================================
// RAZORPAY PAYMENT
// ================================================

function initiatePayment() {
    const options = {
        key: CONFIG.razorpay.key,
        amount: CONFIG.razorpay.amount,
        currency: CONFIG.razorpay.currency,
        name: CONFIG.razorpay.name,
        description: CONFIG.razorpay.description,
        handler: function (response) {
            // Payment successful
            onPaymentSuccess(response);
        },
        prefill: {
            email: '',
            contact: ''
        },
        theme: CONFIG.razorpay.theme,
        modal: {
            ondismiss: function () {
                console.log('Payment cancelled');
            }
        }
    };

    const razorpay = new Razorpay(options);
    razorpay.open();
}

function onPaymentSuccess(response) {
    console.log('Payment successful:', response);

    // Generate link and persist this valentine
    const link = generateShareableLink(state.name);
    addPaidValentine(state.name, link);

    // Update state
    state.isPaid = true;
    state.isPreview = false;

    // Sender post-payment: hide watermarks + unlock, show share
    hideWatermarks();
    hideUnlockUI();
    showShareSection(state.name);
}

// ================================================
// EVENT HANDLERS
// ================================================

function loadValentine(name) {
    // Reset No button if it was moved to body (from a previous proposal)
    if (elements.noWrapper.parentElement === document.body) {
        const buttonsContainer = document.querySelector('.buttons-container.horizontal');
        if (buttonsContainer) {
            buttonsContainer.appendChild(elements.noWrapper);
            elements.noWrapper.style.position = '';
            elements.noWrapper.style.left = '';
            elements.noWrapper.style.top = '';
            elements.noWrapper.style.margin = '';
            elements.noWrapper.style.zIndex = '';
            elements.noWrapper.style.transition = 'none';
            // Force reflow
            elements.noWrapper.offsetHeight;
            elements.noWrapper.style.transition = '';
        }
    }

    // Navigate to valentine page with name
    const newUrl = `${window.location.pathname}?name=${encodeURIComponent(name)}`;
    window.history.pushState({ page: 'valentine', name: name }, '', newUrl);

    // Update state
    state.name = name;

    // Set display name
    elements.displayName.textContent = name + ',';

    // Check if this specific name has already been paid for
    if (isNamePaid(name)) {
        // ── RETURNING SENDER for this name ──
        state.isPaid = true;
        state.isPreview = false;

        hideWatermarks();
        hideUnlockUI();
        showShareSection(name);
    } else {
        // ── UNPAID / PREVIEW for this name ──
        state.isPaid = false;
        state.isPreview = true;

        const unlockText = `Make it special for ${name} — remove watermark & share 💝`;
        if (elements.unlockBtn) {
            elements.unlockBtn.textContent = unlockText;
        }
        if (elements.unlockBtnYes) {
            elements.unlockBtnYes.textContent = unlockText;
        }
        // Re-show watermarks & unlock (may have been hidden for a previous paid name)
        showWatermarks();
        showUnlockUI();
        populateWatermark(elements.watermark);
        populateWatermark(elements.watermarkYes);
        hideShareUI();
    }

    showPage(elements.valentinePage);
}

function handleGenerateSurprise() {
    const name = elements.nameInput.value.trim();

    if (!name) {
        elements.nameInput.focus();
        elements.nameInput.style.borderColor = '#ff4081';
        setTimeout(() => {
            elements.nameInput.style.borderColor = '';
        }, 2000);
        return;
    }

    loadValentine(name);
}

function handleYesClick() {
    // Hide the No button (it may have been moved to body)
    elements.noWrapper.style.display = 'none';

    // Push state so back button returns to valentine page
    const yesUrl = `${window.location.pathname}?name=${encodeURIComponent(state.name)}&yes=true`;
    window.history.pushState({ page: 'yes', name: state.name }, '', yesUrl);

    // If already paid (sender mode), show share section on celebration page
    if (isNamePaid(state.name)) {
        showShareSection(state.name);
    }

    showPage(elements.yesPage);
    startFloatingHearts();
}

function handleCopyLink(isYesPage = false) {
    const input = isYesPage ? elements.shareLinkYes : elements.shareLink;
    const feedback = isYesPage ? elements.copyFeedbackYes : elements.copyFeedback;
    const linkText = input.value;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(linkText).then(() => {
            showCopyFeedback(feedback);
        }).catch(() => {
            fallbackCopy(input, feedback);
        });
    } else {
        fallbackCopy(input, feedback);
    }
}

function fallbackCopy(input, feedback) {
    input.select();
    input.setSelectionRange(0, 99999);
    document.execCommand('copy');
    showCopyFeedback(feedback);
}

function showCopyFeedback(feedbackEl) {
    feedbackEl.classList.remove('hidden');
    setTimeout(() => {
        feedbackEl.classList.add('hidden');
    }, 2000);
}

function handleCreateAnother() {
    // Go back to landing page
    window.history.pushState({ page: 'landing' }, '', window.location.pathname);
    elements.nameInput.value = '';
    updateManageVisibility();
    showPage(elements.landingPage);
}

// Handle browser back/forward button
function navigateByUrl() {
    const params = getUrlParams();

    if (params.name) {
        state.name = params.name;
        elements.displayName.textContent = state.name + ',';

        if (params.paid) {
            state.isPaid = true;
            state.isPreview = false;
            hideWatermarks();
            hideUnlockUI();
            hideShareUI();
        } else if (isNamePaid(state.name)) {
            state.isPaid = true;
            state.isPreview = false;
            hideWatermarks();
            hideUnlockUI();
            showShareSection(state.name);
        } else {
            state.isPaid = false;
            state.isPreview = true;
            const unlockText = `Make it special for ${state.name} \u2014 remove watermark & share \ud83d\udc9d`;
            if (elements.unlockBtn) elements.unlockBtn.textContent = unlockText;
            if (elements.unlockBtnYes) elements.unlockBtnYes.textContent = unlockText;
            showWatermarks();
            showUnlockUI();
            populateWatermark(elements.watermark);
            populateWatermark(elements.watermarkYes);
            hideShareUI();
        }

        // Check if we're on the yes/celebration page
        if (params.yes) {
            showPage(elements.yesPage);
            return;
        }

        // Show no button again if going back to valentine page
        elements.noWrapper.style.display = '';

        showPage(elements.valentinePage);
    } else {
        updateManageVisibility();
        showPage(elements.landingPage);
    }
}

// ================================================
// INITIALIZATION
// ================================================

function init() {
    const params = getUrlParams();

    // Check if name is in URL
    if (params.name) {
        state.name = params.name;

        // Set display name
        elements.displayName.textContent = state.name + ',';

        if (params.paid) {
            // ── RECIPIENT MODE ──
            // URL contains paid=true → clean experience, no payment UI
            state.isPaid = true;
            state.isPreview = false;

            hideWatermarks();
            hideUnlockUI();
            hideShareUI();

        } else if (isNamePaid(state.name)) {
            // ── RETURNING SENDER for this name ──
            // This name was previously paid → show share, no watermark/unlock
            state.isPaid = true;
            state.isPreview = false;

            hideWatermarks();
            hideUnlockUI();
            showShareSection(state.name);

        } else {
            // ── PREVIEW / UNPAID for this name ──
            // Show watermark + unlock, hide share
            state.isPaid = false;
            state.isPreview = true;

            const unlockText = `Make it special for ${state.name} — remove watermark & share 💝`;
            if (elements.unlockBtn) {
                elements.unlockBtn.textContent = unlockText;
            }
            if (elements.unlockBtnYes) {
                elements.unlockBtnYes.textContent = unlockText;
            }
            populateWatermark(elements.watermark);
            populateWatermark(elements.watermarkYes);
            hideShareUI();
        }

        // Show appropriate page (Valentine or Celebration)
        if (params.yes) {
            if (state.isPaid && !params.paid) {
                showShareSection(state.name);
            }
            showPage(elements.yesPage);
            startFloatingHearts();
        } else {
            showPage(elements.valentinePage);
        }
    } else {
        // Show landing page
        updateManageVisibility();
        showPage(elements.landingPage);
    }

    // Attach event listeners
    attachEventListeners();
}

function attachEventListeners() {
    // Landing page
    elements.generateBtn.addEventListener('click', handleGenerateSurprise);
    elements.nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleGenerateSurprise();
        }
    });

    // Manage surprises
    elements.manageBtn.addEventListener('click', openManagePanel);
    elements.manageCloseBtn.addEventListener('click', closeManagePanel);
    elements.manageCreateBtn.addEventListener('click', () => {
        closeManagePanel();
        elements.nameInput.value = '';
        elements.nameInput.focus();
    });

    // Close manage panel on backdrop click
    elements.managePanel.addEventListener('click', (e) => {
        if (e.target === elements.managePanel) {
            closeManagePanel();
        }
    });

    // Valentine page
    elements.yesBtn.addEventListener('click', handleYesClick);

    // No button escape - desktop hover
    elements.noBtn.addEventListener('mouseenter', escapeNoButton);

    // No button escape - desktop click
    elements.noBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        escapeNoButton();
    });

    // No button escape - mobile touch
    elements.noBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        escapeNoButton();
    }, { passive: false });

    // Unlock buttons (both pages)
    elements.unlockBtn.addEventListener('click', initiatePayment);
    if (elements.unlockBtnYes) {
        elements.unlockBtnYes.addEventListener('click', initiatePayment);
    }

    // Copy buttons
    elements.copyBtn.addEventListener('click', () => handleCopyLink(false));
    if (elements.copyBtnYes) {
        elements.copyBtnYes.addEventListener('click', () => handleCopyLink(true));
    }

    // Create another surprise
    if (elements.createAnotherBtn) {
        elements.createAnotherBtn.addEventListener('click', handleCreateAnother);
    }
    if (elements.createAnotherBtnYes) {
        elements.createAnotherBtnYes.addEventListener('click', handleCreateAnother);
    }

    // Handle window resize for no button
    window.addEventListener('resize', () => {
        if (elements.noWrapper.style.position === 'fixed') {
            const rect = elements.noWrapper.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            // Reset if button is outside viewport after resize
            if (rect.left < 0 || rect.right > viewportWidth ||
                rect.top < 0 || rect.bottom > viewportHeight) {
                escapeNoButton();
            }
        }
    });

    // Handle browser back/forward button
    window.addEventListener('popstate', () => {
        navigateByUrl();
    });
}

// Start the app
document.addEventListener('DOMContentLoaded', init);

(function () {
    const delays = [0, 500, 1000];

    const runAnimations = () => {
        const items = document.querySelectorAll('.ag-animate:not(.ag-show)');
        items.forEach((el, index) => {
            const delay = delays[index] || 0;
            setTimeout(() => {
                el.classList.add('ag-show');
            }, delay);
        });
    };

    // Observe DOM changes (Antigravity renders late)
    const observer = new MutationObserver(() => {
        runAnimations();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Initial run
    runAnimations();
})();

function triggerAnimations(container) {
    const items = container.querySelectorAll('.ag-animate');

    items.forEach((el, index) => {
        el.classList.remove('ag-show'); // reset

        const delay = index * 500; // 0.5s stagger
        setTimeout(() => {
            el.classList.add('ag-show');
        }, delay);
    });
}