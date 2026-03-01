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
const modal = document.getElementById('productModal');
const modalBody = document.getElementById('modalBody');
const modalClose = document.querySelector('.modal-close');
const modalBackdrop = document.querySelector('.modal-backdrop');
const searchInput = document.getElementById('searchInput');
const scrollTopBtn = document.getElementById('scrollTopBtn');

// =============================================================================
// State
// =============================================================================
let currentLang = 'en';
let currentCategory = 'all';
let searchQuery = '';

// =============================================================================
// Initialize
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    try {
        db.products = await fetchProducts();
        loader.classList.add('hidden');
        renderCategories();
        renderProducts();
        setupEventListeners();
        applyLanguage();
    } catch (error) {
        console.error('Failed to load products:', error);
        // Use fallback
        db.products = FALLBACK_PRODUCTS;
        loader.classList.add('hidden');
        renderCategories();
        renderProducts();
        setupEventListeners();
        applyLanguage();
    }
}

// =============================================================================
// Renderers
// =============================================================================
function renderCategories() {
    categoryNav.innerHTML = '';
    db.categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `cat-btn ${cat.id === currentCategory ? 'active' : ''}`;
        btn.dataset.id = cat.id;

        const icon = document.createElement('i');
        icon.className = `bx ${cat.icon}`;
        btn.appendChild(icon);

        const text = document.createTextNode(' ' + (currentLang === 'en' ? cat.name_en : cat.name_ar));
        btn.appendChild(text);

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

    let filteredProducts = db.products;

    // Filter by category
    if (currentCategory !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category_id === currentCategory);
    }

    // Filter by search
    if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        filteredProducts = filteredProducts.filter(p =>
            p.name_en.toLowerCase().includes(q) ||
            p.name_ar.includes(q) ||
            p.desc_en.toLowerCase().includes(q) ||
            p.desc_ar.includes(q) ||
            p.weight.toLowerCase().includes(q)
        );
    }

    // Update product count
    const t = db.translations[currentLang];
    productCountEl.textContent = `${filteredProducts.length} ${t.productCount}`;

    if (filteredProducts.length === 0) {
        productGrid.innerHTML = `
            <div class="empty-state">
                <i class='bx bx-search-alt'></i>
                <p>${searchQuery ? t.noResults : t.noResults}</p>
            </div>
        `;
        return;
    }

    filteredProducts.forEach((product, index) => {
        const card = document.createElement('div');
        card.className = 'product-card fade-in';
        card.style.animationDelay = `${index * 0.04}s`;

        const title = currentLang === 'en' ? product.name_en : product.name_ar;
        const imgSrc = product.image_url || '';
        const hasImage = imgSrc.length > 0;

        card.innerHTML = `
            <div class="product-image-container">
                ${hasImage
                ? `<img src="${imgSrc}" alt="${title}" class="product-image" loading="lazy"
                           onerror="this.parentElement.innerHTML='<div class=\\'product-placeholder\\'><i class=\\'bx bx-image\\' ></i></div>'">`
                : `<div class="product-placeholder"><i class='bx bx-image'></i></div>`
            }
                <div class="product-overlay"></div>
            </div>
            <div class="product-info">
                <h3 class="product-title">${title}</h3>
                <div class="product-meta">
                    <span class="product-weight">
                        <i class='bx bx-archive'></i> ${product.weight}
                    </span>
                    <span class="product-arrow"><i class='bx bx-right-arrow-alt'></i></span>
                </div>
            </div>
        `;

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
    const hasImage = imgSrc.length > 0;

    // Build WhatsApp message
    const waMsg = currentLang === 'en'
        ? `Hello! I'm interested in: ${product.name_en} (${product.weight}). Could you provide more details?`
        : `مرحباً! أنا مهتم بـ: ${product.name_ar} (${product.weight}). هل يمكنكم تقديم مزيد من التفاصيل؟`;
    const waUrl = `${WHATSAPP_BASE}?text=${encodeURIComponent(waMsg)}`;

    modalBody.innerHTML = `
        <div class="modal-img-container">
            ${hasImage
            ? `<img src="${imgSrc}" alt="${title}" class="modal-img"
                       onerror="this.parentElement.innerHTML='<div class=\\'modal-placeholder\\'><i class=\\'bx bx-image\\' ></i></div>'">`
            : `<div class="modal-placeholder"><i class='bx bx-image'></i></div>`
        }
        </div>
        <div class="modal-details">
            <div class="modal-category">${catName}</div>
            <h2 class="modal-title">${title}</h2>
            <p class="modal-desc">${desc}</p>
            
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
                <a href="${waUrl}" target="_blank" rel="noopener" class="btn-primary btn-whatsapp">
                    <i class='bx bxl-whatsapp'></i> ${t.btnInquire}
                </a>
            </div>
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// =============================================================================
// Events
// =============================================================================
function setupEventListeners() {
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
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
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

    // Navbar scroll effect + scroll-to-top button
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Show/hide scroll-to-top
        if (window.scrollY > 600) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });

    // Scroll to top button
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// =============================================================================
// Language
// =============================================================================
function applyLanguage() {
    document.body.className = `theme-dark lang-${currentLang}`;
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';

    const t = db.translations[currentLang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.textContent = t[key];
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (t[key]) el.placeholder = t[key];
    });

    langText.textContent = t.langToggle;
}