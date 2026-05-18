// =============================================================================
// DOM Elements
// =============================================================================
const loader = document.getElementById('loader');
const categoryNav = document.getElementById('categoryNav');
const productGrid = document.getElementById('productGrid');
const currentCategoryTitle = document.getElementById('currentCategoryTitle');
const productCountEl = document.getElementById('productCount');
const langToggleBtn = document.getElementById('langToggle');
const langText = langToggleBtn.querySelector('.lang-text');
const themeToggleBtn = document.getElementById('themeToggle');
const themeDropdown = document.getElementById('themeDropdown');
const themeOptions = document.getElementById('themeOptions');
const modal = document.getElementById('productModal');
const modalBody = document.getElementById('modalBody');
const modalClose = document.querySelector('.modal-close');
const modalBackdrop = document.querySelector('.modal-backdrop');
const searchInput = document.getElementById('searchInput');
const scrollTopBtn = document.getElementById('scrollTopBtn');
const locationsToggle = document.getElementById('locationsToggle');
const locationsSection = document.getElementById('locationsSection');
const cartToggle = document.getElementById('cartToggle');
const cartBadge = document.getElementById('cartBadge');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartClose = document.getElementById('cartClose');
const cartItems = document.getElementById('cartItems');
const cartTotalAmount = document.getElementById('cartTotalAmount');
const checkoutBtn = document.getElementById('checkoutBtn');
const orderOverlay = document.getElementById('orderOverlay');
const orderClose = document.getElementById('orderClose');
const orderBody = document.getElementById('orderBody');
const orderDate = document.getElementById('orderDate');
const orderCustomerName = document.getElementById('orderCustomerName');
const orderTableWrapper = document.getElementById('orderTableWrapper');
const orderTotalLine = document.getElementById('orderTotalLine');
const orderCsvBtn = document.getElementById('orderCsvBtn');
const orderPrintBtn = document.getElementById('orderPrintBtn');

// =============================================================================
// State
// =============================================================================
let currentLang = 'ar';
let currentCategory = 'all';
let searchQuery = '';
const LS_THEME = 'atk_theme_preset';
const CART_KEY = 'atk_cart';
let cart = [];

// =============================================================================
// Initialize
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    loadThemePreset();
    applyTheme();
    applySiteContent();
    renderThemeSwitcher();
    loader.classList.add('hidden');
    loadCart();
    renderCategories();
    renderProducts();
    setupEventListeners();
    applyLanguage();
}

// =============================================================================
// Theme Presets
// =============================================================================
function loadThemePreset() {
    const saved = localStorage.getItem(LS_THEME);
    if (saved && db.themePresets) {
        const preset = db.themePresets.find(p => p.id === saved);
        if (preset) {
            Object.assign(db.theme, preset.theme);
            return;
        }
    }
    if (db.themePresets && db.themePresets.length > 0) {
        Object.assign(db.theme, db.themePresets[0].theme);
    }
}

function renderThemeSwitcher() {
    if (!db.themePresets || !themeOptions) return;
    const currentId = localStorage.getItem(LS_THEME) || db.themePresets[0]?.id;
    themeOptions.innerHTML = db.themePresets.map(p => `
        <button class="theme-option ${p.id === currentId ? 'active' : ''}" data-theme="${p.id}">
            <i class='bx ${p.icon}'></i>
            <span>${currentLang === 'en' ? p.name_en : p.name_ar}</span>
            ${p.id === currentId ? '<i class="bx bx-check"></i>' : ''}
        </button>
    `).join('');

    themeOptions.querySelectorAll('.theme-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.dataset.theme;
            const preset = db.themePresets.find(p => p.id === id);
            if (preset) {
                Object.assign(db.theme, preset.theme);
                applyTheme();
                localStorage.setItem(LS_THEME, id);
                renderThemeSwitcher();
            }
            themeDropdown.classList.remove('open');
        });
    });
}

// =============================================================================
// Theme — Apply db.theme as CSS custom properties
// =============================================================================
function applyTheme() {
    const t = db.theme;
    const root = document.documentElement;
    root.style.setProperty('--clr-brand-red', t.accentColor);
    root.style.setProperty('--clr-brand-red-light', t.accentColorLight);
    root.style.setProperty('--clr-brand-red-dark', t.accentColorDark);
    root.style.setProperty('--clr-dark-base', t.bgColor);
    root.style.setProperty('--clr-dark-surface', t.surfaceColor);
    root.style.setProperty('--clr-dark-surface-2', t.surface2Color);
    root.style.setProperty('--clr-dark-surface-3', t.surface3Color);
    root.style.setProperty('--clr-navbar-bg', t.navbarColor || t.surfaceColor);
    root.style.setProperty('--clr-text-primary', t.textPrimary || '#F0F0F5');
    root.style.setProperty('--clr-text-secondary', t.textSecondary || 'rgba(240, 240, 245, 0.70)');
    root.style.setProperty('--clr-text-muted', t.textMuted || 'rgba(240, 240, 245, 0.45)');
    root.style.setProperty('--clr-dark-border', t.borderColor || 'rgba(255, 255, 255, 0.10)');
}

// =============================================================================
// Site Content — Hero, footer, contact info
// =============================================================================
function applySiteContent() {
    const s = db.siteContent;

    // Logo
    document.querySelectorAll('.logo-text, .footer-logo .logo-text').forEach(el => {
        el.textContent = s.logoText;
    });

    // Hero image
    const hero = document.querySelector('.hero');
    if (hero) {
        if (s.heroImage) {
            hero.style.backgroundImage = `url('${s.heroImage}')`;
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = s.heroImage;
            document.head.appendChild(link);
        } else {
            hero.style.backgroundImage = 'linear-gradient(135deg, var(--clr-dark-base) 0%, var(--clr-dark-surface-2) 100%)';
        }
    }

    // Contact badges / links (phone + instagram)
    const phoneLinks = document.querySelectorAll('[data-contact="phone"]');
    phoneLinks.forEach(el => {
        el.href = `tel:${s.phoneRaw}`;
        const span = el.querySelector('.contact-label');
        if (span) span.textContent = s.phone;
        else el.innerHTML = `<i class='bx bxs-phone'></i> ${s.phone}`;
    });

    const igLinks = document.querySelectorAll('[data-contact="instagram"]');
    igLinks.forEach(el => {
        el.href = `https://www.instagram.com/${s.instagram}`;
        el.innerHTML = `<i class='bx bxl-instagram'></i> @${s.instagram}`;
    });

    const waLinks = document.querySelectorAll('[data-contact="whatsapp"]');
    waLinks.forEach(el => {
        el.href = `https://wa.me/${s.whatsapp}`;
    });

    // Footer about & copyright — updated via applyLanguage
}

// =============================================================================
// Renderers
// =============================================================================
function renderCategories() {
    categoryNav.innerHTML = '';
    const counts = {};
    db.products.forEach(p => {
        counts[p.category_id] = (counts[p.category_id] || 0) + 1;
    });
    db.categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `cat-btn ${cat.id === currentCategory ? 'active' : ''}`;
        btn.dataset.id = cat.id;

        const icon = document.createElement('i');
        icon.className = `bx ${cat.icon}`;
        btn.appendChild(icon);

        const text = document.createTextNode(' ' + (currentLang === 'en' ? cat.name_en : cat.name_ar));
        btn.appendChild(text);

        const count = counts[cat.id] || 0;
        if (count > 0) {
            const badge = document.createElement('span');
            badge.className = 'cat-count-badge';
            badge.textContent = count;
            btn.appendChild(badge);
        }

        btn.addEventListener('click', () => {
            document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = cat.id;
            currentCategoryTitle.textContent = currentLang === 'en' ? cat.name_en : cat.name_ar;
            searchQuery = '';
            searchInput.value = '';
            document.querySelector('.products-section').scrollIntoView({ behavior: 'smooth' });
            renderProducts();
        });

        categoryNav.appendChild(btn);
    });
}

function renderProducts() {
    productGrid.innerHTML = '';

    let filtered = db.products;

    if (currentCategory !== 'all') {
        filtered = filtered.filter(p => p.category_id === currentCategory);
    }

    if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        filtered = filtered.filter(p =>
            p.name_en.toLowerCase().includes(q) ||
            p.name_ar.includes(q) ||
            p.desc_en.toLowerCase().includes(q) ||
            p.desc_ar.includes(q) ||
            (p.weight && p.weight.toLowerCase().includes(q))
        );
    }

    // Sort
    const sorted = [...filtered];
    const sortLocale = currentLang === 'en' ? 'en' : 'ar';
    switch (sortBy) {
        case 'name_asc':
            sorted.sort((a, b) => (currentLang === 'en' ? a.name_en : a.name_ar).localeCompare(currentLang === 'en' ? b.name_en : b.name_ar, sortLocale));
            break;
        case 'name_desc':
            sorted.sort((a, b) => (currentLang === 'en' ? b.name_en : b.name_ar).localeCompare(currentLang === 'en' ? a.name_en : a.name_ar, sortLocale));
            break;
        case 'price_asc':
            sorted.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
            break;
        case 'price_desc':
            sorted.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
            break;
        case 'weight_asc':
            sorted.sort((a, b) => {
                const wa = parseFloat(a.weight) || 0;
                const wb = parseFloat(b.weight) || 0;
                return wa - wb;
            });
            break;
        case 'weight_desc':
            sorted.sort((a, b) => {
                const wa = parseFloat(a.weight) || 0;
                const wb = parseFloat(b.weight) || 0;
                return wb - wa;
            });
            break;
    }

    const t = db.translations[currentLang];
    productCountEl.textContent = `${sorted.length} ${t.productCount}`;

    if (sorted.length === 0) {
        productGrid.innerHTML = `
            <div class="empty-state">
                <i class='bx bx-search-alt'></i>
                <p>${t.noResults}</p>
            </div>
        `;
        return;
    }

    const newThreshold = parseInt(db.products[Math.min(20, db.products.length - 1)].id) || 9000;

    sorted.forEach((product, index) => {
        const card = document.createElement('div');
        card.className = 'product-card fade-in';
        card.style.animationDelay = `${index * 0.04}s`;

        const title = currentLang === 'en' ? product.name_en : product.name_ar;
        const imgSrc = product.image_url || '';
        const hasImg = imgSrc.length > 0;

        const price = parseFloat(product.price) || 0;
        const isNew = parseInt(product.id) > newThreshold;

        const waMsg = currentLang === 'en'
            ? `Hello! I'm interested in: ${product.name_en}${product.weight ? ' (' + product.weight + ')' : ''}. Could you provide more details?`
            : `مرحباً! أنا مهتم بـ: ${product.name_ar}${product.weight ? ' (' + product.weight + ')' : ''}. هل يمكنكم تقديم مزيد من التفاصيل؟`;
        const waUrl = `https://wa.me/${db.siteContent.whatsapp}?text=${encodeURIComponent(waMsg)}`;

        card.innerHTML = `
            <div class="product-image-container">
                ${hasImg
                ? `<img src="${imgSrc}" alt="${title}" class="product-image" loading="lazy"
                           onerror="this.parentElement.innerHTML='<div class=\\'product-placeholder\\'><i class=\\'bx bx-image\\'></i></div>'">`
                : `<div class="product-placeholder"><i class='bx bx-image'></i></div>`
            }
                ${isNew ? '<span class="product-badge-new">' + (currentLang === 'en' ? 'NEW' : 'جديد') + '</span>' : ''}
                <div class="product-hover-overlay">
                    <div class="product-hover-actions">
                        <button class="hover-btn hover-btn-quickview" title="${t.btnInquire || 'Quick View'}">
                            <i class='bx bx-show'></i>
                        </button>
                        <a href="${waUrl}" target="_blank" rel="noopener" class="hover-btn hover-btn-whatsapp" title="WhatsApp">
                            <i class='bx bxl-whatsapp'></i>
                        </a>
                    </div>
                </div>
            </div>
            <div class="product-info">
                <h3 class="product-title">${title}</h3>
                <div class="product-meta">
                    <span class="product-weight">
                        <i class='bx bx-archive'></i> ${product.weight}
                    </span>
                    <span class="product-price-badge">$${price.toFixed(2)}</span>
                    <span class="product-arrow"><i class='bx bx-right-arrow-alt'></i></span>
                </div>
            </div>
        `;

        const quickviewBtn = card.querySelector('.hover-btn-quickview');
        if (quickviewBtn) {
            quickviewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openModal(product);
            });
        }

        card.addEventListener('click', () => openModal(product));
        productGrid.appendChild(card);
    });
}

// =============================================================================
// Modal
// =============================================================================
function openModal(product) {
    const title = currentLang === 'en' ? product.name_en : product.name_ar;
    const desc = currentLang === 'en' ? product.desc_en : product.desc_ar;
    const cat = db.categories.find(c => c.id === product.category_id);
    const catName = cat ? (currentLang === 'en' ? cat.name_en : cat.name_ar) : '';
    const t = db.translations[currentLang];
    const imgSrc = product.image_url || '';
    const hasImg = imgSrc.length > 0;

    const s = db.siteContent;
    const waWeight = product.weight ? ` (${product.weight})` : '';
    const waMsg = currentLang === 'en'
        ? `Hello! I'm interested in: ${product.name_en}${waWeight}. Could you provide more details?`
        : `مرحباً! أنا مهتم بـ: ${product.name_ar}${waWeight}. هل يمكنكم تقديم مزيد من التفاصيل؟`;
    const waUrl = `https://wa.me/${s.whatsapp}?text=${encodeURIComponent(waMsg)}`;

    const price = parseFloat(product.price) || 0;
    const inCart = cart.find(i => i.id === product.id);
    const cartQty = inCart ? inCart.qty : 0;

    modalBody.innerHTML = `
        <div class="modal-img-container">
            ${hasImg
            ? `<img src="${imgSrc}" alt="${title}" class="modal-img"
                       onerror="this.parentElement.innerHTML='<div class=\\'modal-placeholder\\'><i class=\\'bx bx-image\\'></i></div>'">`
            : `<div class="modal-placeholder"><i class='bx bx-image'></i></div>`
        }
        </div>
        <div class="modal-details">
            <div class="modal-category">${catName}</div>
            <h2 class="modal-title">${title}</h2>
            <p class="modal-desc">${desc}</p>
            <div class="modal-price-row">
                <span class="modal-price">$${price.toFixed(2)}</span>
            </div>
            <div class="spec-grid">
                <div class="spec-item">
                    <span class="spec-label">${t.specWeight}</span>
                    <span class="spec-val">${product.weight}</span>
                </div>
                <div class="spec-item">
                    <span class="spec-label">${t.specCarton}</span>
                    <span class="spec-val">${product.pieces_per_carton}</span>
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn-primary btn-add-cart" data-id="${product.id}">
                    <i class='bx bx-cart-add'></i> ${t.addToCart} ${cartQty > 0 ? `(${cartQty})` : ''}
                </button>
                <a href="${waUrl}" target="_blank" rel="noopener" class="btn-primary btn-whatsapp">
                    <i class='bx bxl-whatsapp'></i>
                </a>
            </div>
        </div>
    `;

    const addBtn = modalBody.querySelector('.btn-add-cart');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            addToCart(product.id);
            closeModal();
        });
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// =============================================================================
// Cart
// =============================================================================
function loadCart() {
    try {
        const saved = localStorage.getItem(CART_KEY);
        cart = saved ? JSON.parse(saved) : [];
    } catch(e) { cart = []; }
}

function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    const count = cart.reduce((s, i) => s + i.qty, 0);
    cartBadge.textContent = count;
    cartBadge.style.display = count > 0 ? 'flex' : 'none';

    const t = db.translations[currentLang];
    if (cart.length === 0) {
        cartItems.innerHTML = `<div class="cart-empty">${t.cartEmpty}</div>`;
        cartTotalAmount.textContent = '$0.00';
        return;
    }

    let total = 0;
    cartItems.innerHTML = cart.map((item, idx) => {
        const prod = db.products.find(p => p.id === item.id);
        if (!prod) return '';
        const name = currentLang === 'en' ? prod.name_en : prod.name_ar;
        const price = parseFloat(prod.price) || 0;
        const subtotal = price * item.qty;
        total += subtotal;
        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${name}</div>
                    <div class="cart-item-weight">${prod.weight}</div>
                    <div class="cart-item-price">$${price.toFixed(2)}</div>
                </div>
                <div class="cart-item-qty">
                    <button class="cart-qty-btn" data-index="${idx}" data-action="dec">−</button>
                    <span class="cart-qty-val">${item.qty}</span>
                    <button class="cart-qty-btn" data-index="${idx}" data-action="inc">+</button>
                </div>
                <button class="cart-item-remove" data-index="${idx}" data-action="remove"><i class='bx bx-trash'></i></button>
            </div>
        `;
    }).join('');

    cartTotalAmount.textContent = `$${total.toFixed(2)}`;

    cartItems.querySelectorAll('.cart-qty-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(btn.dataset.index);
            const action = btn.dataset.action;
            if (action === 'inc') {
                cart[idx].qty++;
            } else if (action === 'dec') {
                cart[idx].qty--;
                if (cart[idx].qty <= 0) cart.splice(idx, 1);
            }
            saveCart();
        });
    });
    cartItems.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(btn.dataset.index);
            cart.splice(idx, 1);
            saveCart();
        });
    });
}

function addToCart(productId) {
    const existing = cart.find(i => i.id === productId);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ id: productId, qty: 1 });
    }
    saveCart();
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
}

// =============================================================================
// Order Generation
// =============================================================================
function openOrder() {
    if (cart.length === 0) return;
    const t = db.translations[currentLang];
    orderDate.textContent = new Date().toLocaleDateString();
    orderCustomerName.value = '';

    let html = `<table class="order-table">
        <thead><tr>
            <th>#</th>
            <th>${t.orderProduct}</th>
            <th>${t.orderWeight}</th>
            <th>${t.orderPrice}</th>
            <th>${t.orderQty}</th>
            <th>${t.orderSubtotal}</th>
        </tr></thead><tbody>`;

    let grandTotal = 0;
    cart.forEach((item, idx) => {
        const prod = db.products.find(p => p.id === item.id);
        if (!prod) return;
        const name = currentLang === 'en' ? prod.name_en : prod.name_ar;
        const price = parseFloat(prod.price) || 0;
        const subtotal = price * item.qty;
        grandTotal += subtotal;
        html += `<tr>
            <td>${idx + 1}</td>
            <td>${name}</td>
            <td>${prod.weight}</td>
            <td>$${price.toFixed(2)}</td>
            <td>${item.qty}</td>
            <td>$${subtotal.toFixed(2)}</td>
        </tr>`;
    });

    html += `</tbody></table>`;
    orderTableWrapper.innerHTML = html;
    orderTotalLine.innerHTML = `<strong>${t.orderTotal}: $${grandTotal.toFixed(2)}</strong>`;

    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
    orderOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeOrder() {
    orderOverlay.classList.remove('open');
    document.body.style.overflow = '';
}

function generateOrderCsv() {
    const t = db.translations[currentLang];
    const customer = orderCustomerName.value.trim() || 'Customer';
    const date = new Date().toLocaleDateString();
    let csv = `Purchase Order,${date}\nCustomer,${customer}\n\n`;
    csv += `${t.orderProduct},${t.orderWeight},${t.orderPrice},${t.orderQty},${t.orderSubtotal}\n`;

    let total = 0;
    cart.forEach(item => {
        const prod = db.products.find(p => p.id === item.id);
        if (!prod) return;
        const name = currentLang === 'en' ? prod.name_en : prod.name_ar;
        const price = parseFloat(prod.price) || 0;
        const subtotal = price * item.qty;
        total += subtotal;
        csv += `"${name}",${prod.weight},${price},${item.qty},${subtotal.toFixed(2)}\n`;
    });
    csv += `\n${t.orderTotal},,,,${total.toFixed(2)}`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function printOrder() {
    const t = db.translations[currentLang];
    const customer = orderCustomerName.value.trim() || 'Customer';
    const date = new Date().toLocaleDateString();
    const title = currentLang === 'en' ? 'AL-TABAKH - Purchase Order' : 'الطباخ - أمر شراء';

    const printWin = window.open('', '_blank');
    let html = `<!DOCTYPE html><html><head><title>${title}</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1a1a2e; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #D11D1D; padding-bottom: 15px; }
            .header h1 { color: #D11D1D; font-size: 24px; letter-spacing: 2px; }
            .info { margin-bottom: 20px; display: flex; justify-content: space-between; }
            .info div { font-size: 14px; color: #555; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background: #D11D1D; color: white; padding: 10px 12px; text-align: left; font-size: 13px; }
            td { padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 13px; }
            tr:nth-child(even) td { background: #fafafa; }
            .total { text-align: right; font-size: 18px; font-weight: 700; margin-top: 10px; padding-top: 10px; border-top: 2px solid #D11D1D; }
            .note { margin-top: 30px; font-size: 12px; color: #888; text-align: center; }
            .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #aaa; }
    `;
    if (currentLang === 'ar') {
        html += `body { direction: rtl; text-align: right; } th, td { text-align: right; } .total { text-align: left; }`;
    }
    html += `</style></head><body>
        <div class="header"><h1>AL-TABAKH</h1><p style="color:#888;font-size:13px;margin-top:4px;">${t.orderTitle}</p></div>
        <div class="info"><div><strong>${t.orderDate}:</strong> ${date}</div><div><strong>${t.orderCustomer}:</strong> ${customer}</div></div>
        <table><thead><tr><th>#</th><th>${t.orderProduct}</th><th>${t.orderWeight}</th><th>${t.orderPrice}</th><th>${t.orderQty}</th><th>${t.orderSubtotal}</th></tr></thead><tbody>`;

    let total = 0;
    cart.forEach((item, idx) => {
        const prod = db.products.find(p => p.id === item.id);
        if (!prod) return;
        const name = currentLang === 'en' ? prod.name_en : prod.name_ar;
        const price = parseFloat(prod.price) || 0;
        const subtotal = price * item.qty;
        total += subtotal;
        html += `<tr><td>${idx + 1}</td><td>${name}</td><td>${prod.weight}</td><td>$${price.toFixed(2)}</td><td>${item.qty}</td><td>$${subtotal.toFixed(2)}</td></tr>`;
    });

    html += `</tbody></table>
        <div class="total">${t.orderTotal}: $${total.toFixed(2)}</div>
        <p class="note">${t.orderNote}</p>
        <div class="footer">Malek Al-Tabakh Company &bull; ${date}</div>
    </body></html>`;

    printWin.document.write(html);
    printWin.document.close();
    setTimeout(() => printWin.print(), 500);
}

// =============================================================================
// Locations Map
// =============================================================================
let sortBy = 'default';
let mapInstance = null;

function initMap() {
    if (typeof L === 'undefined' || !document.getElementById('map')) return;

    if (mapInstance) {
        mapInstance.invalidateSize();
        return;
    }

    mapInstance = L.map('map', { zoomControl: true }).setView([33.5, 43.5], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(mapInstance);

    renderMapMarkers();
    setTimeout(() => mapInstance.invalidateSize(), 300);
}

function renderMapMarkers() {
    if (!mapInstance || !db.locations) return;

    const mainIcon = L.divIcon({
        html: '<div class="map-marker-main"><i class="bx bxs-map-pin"></i></div>',
        className: 'map-marker-icon',
        iconSize: [36, 36],
        iconAnchor: [18, 36]
    });

    const defaultIcon = L.divIcon({
        html: '<div class="map-marker-default"><i class="bx bxs-map-pin"></i></div>',
        className: 'map-marker-icon',
        iconSize: [30, 30],
        iconAnchor: [15, 30]
    });

    db.locations.forEach(loc => {
        const name = currentLang === 'en' ? loc.name_en : loc.name_ar;
        const label = currentLang === 'en' ? loc.label_en : loc.label_ar;
        const icon = loc.isMain ? mainIcon : defaultIcon;

        const marker = L.marker([loc.lat, loc.lng], { icon }).addTo(mapInstance);
        marker.bindPopup(`
            <div class="map-popup">
                <strong>${name}</strong>
                <span>${label}</span>
            </div>
        `);
    });
}

// =============================================================================
// Events
// =============================================================================
function setupEventListeners() {
    // Theme switcher dropdown
    themeToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        themeDropdown.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
        if (!themeToggleBtn.contains(e.target) && !themeDropdown.contains(e.target)) {
            themeDropdown.classList.remove('open');
        }
    });

    // Cart toggle
    cartToggle.addEventListener('click', () => {
        cartDrawer.classList.toggle('open');
        cartOverlay.classList.toggle('open');
    });
    cartClose.addEventListener('click', () => {
        cartDrawer.classList.remove('open');
        cartOverlay.classList.remove('open');
    });
    cartOverlay.addEventListener('click', () => {
        cartDrawer.classList.remove('open');
        cartOverlay.classList.remove('open');
    });

    // Checkout
    checkoutBtn.addEventListener('click', openOrder);

    // Order modal
    orderClose.addEventListener('click', closeOrder);
    orderOverlay.addEventListener('click', (e) => {
        if (e.target === orderOverlay) closeOrder();
    });
    orderCsvBtn.addEventListener('click', generateOrderCsv);
    orderPrintBtn.addEventListener('click', printOrder);

    // Language toggle
    langToggleBtn.addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'ar' : 'en';
        applyLanguage();
        renderCategories();
        const currentCatObj = db.categories.find(c => c.id === currentCategory);
        currentCategoryTitle.textContent = currentLang === 'en' ? currentCatObj.name_en : currentCatObj.name_ar;
        renderProducts();
    });

    // Modal close
    modalClose.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });

    // Search — debounced
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchQuery = e.target.value;
            renderProducts();
        }, 250);
    });

    // Navbar scroll effect + scroll-to-top
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.navbar');
        if (window.scrollY > 50) header.classList.add('scrolled');
        else header.classList.remove('scrolled');

        if (window.scrollY > 600) scrollTopBtn.classList.add('visible');
        else scrollTopBtn.classList.remove('visible');
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    locationsToggle.addEventListener('click', () => {
        if (!mapInstance) initMap();
        locationsSection.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
            if (mapInstance) mapInstance.invalidateSize();
        }, 500);
    });

    // Sort
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            sortBy = e.target.value;
            renderProducts();
        });
    }
}

// =============================================================================
// Language
// =============================================================================
function applyLanguage() {
    document.body.className = `theme-dark lang-${currentLang}`;
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';

    const t = db.translations[currentLang];
    const s = db.siteContent;

    // i18n text elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key] !== undefined) el.textContent = t[key];
    });

    // Placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (t[key]) el.placeholder = t[key];
    });

    // Footer about
    const footerAboutEl = document.querySelector('[data-i18n="footerAbout"]');
    if (footerAboutEl) {
        footerAboutEl.textContent = currentLang === 'en' ? s.footerAbout_en : s.footerAbout_ar;
    }

    // Copyright
    const copyrightEl = document.querySelector('[data-i18n="footerRights"]');
    if (copyrightEl) {
        copyrightEl.textContent = currentLang === 'en' ? s.copyright_en : s.copyright_ar;
    }

    // Lang toggle button text
    langText.textContent = t.langToggle;

    // Sort select options
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.querySelectorAll('option').forEach(opt => {
            const key = opt.getAttribute('data-i18n-opt');
            if (key && t[key]) opt.textContent = t[key];
        });
    }
}