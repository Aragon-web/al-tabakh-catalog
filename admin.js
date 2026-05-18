const DEFAULT_PASSWORD = 'altabakh2026';
const LS_PASSWORD = 'atk_admin_pwd';
const LS_GH_TOKEN = 'atk_gh_token';
const LS_GH_USER = 'atk_gh_user';
const LS_GH_REPO = 'atk_gh_repo';
const LS_GH_BRANCH = 'atk_gh_branch';
const LS_LAST_SYNC = 'atk_last_sync';
const LS_GA_ID = 'atk_ga_id';
const LS_PREVIEW_DATA = 'atk_preview_data';

let adminDb = null;
let editingProductId = null;
let editingCatId = null;
let confirmCallback = null;
let selectedProductIds = new Set();

async function hashPassword(pwd) {
    if (window.crypto && window.crypto.subtle) {
        try {
            const enc = new TextEncoder().encode(pwd);
            const hash = await crypto.subtle.digest('SHA-256', enc);
            return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (e) {}
    }
    return btoa(pwd);
}

document.addEventListener('DOMContentLoaded', () => {
    initLogin();
    setupNavigation();
    setupSidebarToggle();
});

function initLogin() {
    const storedHash = localStorage.getItem(LS_PASSWORD);
    const loginBtn = document.getElementById('loginBtn');
    const pwdInput = document.getElementById('loginPassword');
    const errorEl = document.getElementById('loginError');

    async function tryLogin() {
        const entered = await hashPassword(pwdInput.value);
        if (!storedHash) {
            const defaultHash = await hashPassword(DEFAULT_PASSWORD);
            if (entered === defaultHash) {
                localStorage.setItem(LS_PASSWORD, defaultHash);
                document.getElementById('loginScreen').classList.add('hidden');
                document.getElementById('appShell').classList.add('active');
                initAdminApp();
            } else {
                errorEl.classList.add('show');
                pwdInput.value = '';
                pwdInput.focus();
            }
        } else if (entered === storedHash) {
            document.getElementById('loginScreen').classList.add('hidden');
            document.getElementById('appShell').classList.add('active');
            initAdminApp();
        } else {
            errorEl.classList.add('show');
            pwdInput.value = '';
            pwdInput.focus();
        }
    }

    loginBtn.addEventListener('click', tryLogin);
    pwdInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') tryLogin(); });
    setTimeout(() => pwdInput.focus(), 100);
}

document.getElementById('logoutBtn').addEventListener('click', () => {
    document.getElementById('appShell').classList.remove('active');
    document.getElementById('loginScreen').classList.remove('hidden');
    adminDb = null;
});

function setupNavigation() {
    document.querySelectorAll('.nav-item[data-panel]').forEach(btn => {
        btn.addEventListener('click', () => {
            const panelId = btn.dataset.panel;
            switchPanel(panelId);
            document.getElementById('sidebar').classList.remove('open');
        });
    });
}

function setupSidebarToggle() {
    const toggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
    if (window.innerWidth <= 768) toggle.style.display = 'flex';
    window.addEventListener('resize', () => {
        toggle.style.display = window.innerWidth <= 768 ? 'flex' : 'none';
    });
}

const panelTitles = {
    dashboard: 'Dashboard',
    products: 'Products',
    categories: 'Categories',
    locations: 'Locations',
    siteContent: 'Site Content',
    theme: 'Theme & Colors',
    translations: 'Translations',
    settings: 'Settings'
};

function switchPanel(panelId) {
    document.querySelectorAll('.page-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    const panel = document.getElementById(`panel-${panelId}`);
    if (panel) panel.classList.add('active');
    const navBtn = document.querySelector(`.nav-item[data-panel="${panelId}"]`);
    if (navBtn) navBtn.classList.add('active');
    document.getElementById('topbarTitle').textContent = panelTitles[panelId] || panelId;
}

function initAdminApp() {
    adminDb = JSON.parse(JSON.stringify(db));
    renderDashboard();
    renderProductsTable();
    renderCategoriesTable();
    loadSiteContentForm();
    loadThemeForm();
    loadTranslationsForm();
    loadSettingsForm();
    setupProductModal();
    setupCatModal();
    setupConfirm();
    setupSyncBtn();
    setupSiteContentSave();
    setupThemeSave();
    setupTranslationsSave();
    setupSettingsForms();
    setupPreviewBtn();
    loadLocationsForm();
    setupLocationForm();
    populateBatchCategorySelect();
    setupBatchActions();

    document.getElementById('csvImport').addEventListener('change', handleCsvImport);
    document.getElementById('productSearch').addEventListener('input', (e) => {
        selectedProductIds.clear();
        renderProductsTable(e.target.value);
    });
}

function renderDashboard() {
    const totalProducts = adminDb.products.length;
    const totalCats = adminDb.categories.filter(c => c.id !== 'all').length;
    const withImg = adminDb.products.filter(p => p.image_url && p.image_url.trim()).length;
    const lastSync = localStorage.getItem(LS_LAST_SYNC);

    document.getElementById('stat-products').textContent = totalProducts;
    document.getElementById('stat-categories').textContent = totalCats;
    document.getElementById('stat-withimg').textContent = withImg;
    document.getElementById('stat-sync').textContent = lastSync
        ? new Date(lastSync).toLocaleDateString()
        : 'Never';

    const recent = [...adminDb.products].slice(-5).reverse();
    const container = document.getElementById('recentProducts');
    if (recent.length === 0) {
        container.innerHTML = '<p class="text-muted" style="padding:1rem 0;">No products yet.</p>';
        return;
    }
    container.innerHTML = `
        <div class="table-wrapper">
            <table>
                <thead><tr><th>Name (EN)</th><th>Category</th><th>Weight</th><th>Image</th></tr></thead>
                <tbody>
                    ${recent.map(p => `
                        <tr>
                            <td>${p.name_en}</td>
                            <td><span class="badge-cat">${p.category_id}</span></td>
                            <td>${p.weight}</td>
                            <td>${p.image_url ? '✓' : '—'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderProductsTable(filter = '') {
    const q = filter.trim().toLowerCase();
    const list = q
        ? adminDb.products.filter(p =>
            p.name_en.toLowerCase().includes(q) ||
            p.name_ar.includes(q) ||
            p.category_id.includes(q) ||
            (p.weight && p.weight.toLowerCase().includes(q)))
        : adminDb.products;

    document.getElementById('productsCountLabel').textContent =
        `${list.length} of ${adminDb.products.length} products`;

    const tbody = document.getElementById('productsTableBody');
    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:2rem;color:var(--text-muted);">No products found.</td></tr>`;
        return;
    }

    tbody.innerHTML = list.map(p => {
        const imgHtml = p.image_url
            ? `<img src="${p.image_url}" class="td-img" onerror="this.style.display='none'" loading="lazy">`
            : `<div class="td-img-placeholder"><i class='bx bx-image'></i></div>`;
        const price = parseFloat(p.price) || 0;
        const checked = selectedProductIds.has(p.id) ? 'checked' : '';
        return `
            <tr>
                <td><input type="checkbox" class="product-checkbox" value="${p.id}" ${checked}></td>
                <td>${imgHtml}</td>
                <td class="truncate">${p.name_en}</td>
                <td class="truncate">${p.name_ar}</td>
                <td><span class="badge-cat">${p.category_id}</span></td>
                <td>${p.weight}</td>
                <td>${p.pieces_per_carton}</td>
                <td>$${price.toFixed(2)}</td>
                <td>
                    <div class="td-actions">
                        <button class="btn-icon-only" title="Edit" onclick="openEditProduct('${p.id}')">
                            <i class='bx bx-edit'></i>
                        </button>
                        <button class="btn-icon-only" style="color:#ef4444;" title="Delete" onclick="deleteProduct('${p.id}')">
                            <i class='bx bx-trash'></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    const selectAll = document.getElementById('selectAllCheckbox');
    const checkboxes = tbody.querySelectorAll('.product-checkbox');
    const allChecked = checkboxes.length > 0 && Array.from(checkboxes).every(cb => cb.checked);
    selectAll.checked = allChecked;

    checkboxes.forEach(cb => {
        cb.addEventListener('change', (e) => {
            if (e.target.checked) {
                selectedProductIds.add(e.target.value);
            } else {
                selectedProductIds.delete(e.target.value);
            }
            updateBatchBar();
        });
    });
}

function updateBatchBar() {
    const bar = document.getElementById('batchBar');
    const count = document.getElementById('selectedCount');
    const visibleCheckboxes = document.querySelectorAll('#productsTableBody .product-checkbox');
    const visibleSelected = Array.from(visibleCheckboxes).filter(cb => cb.checked).length;
    count.textContent = `${visibleSelected} selected`;
    if (visibleSelected > 0) {
        bar.classList.remove('hidden');
    } else {
        bar.classList.add('hidden');
    }
}

function setupBatchActions() {
    document.getElementById('selectAllCheckbox').addEventListener('change', (e) => {
        const checkboxes = document.querySelectorAll('#productsTableBody .product-checkbox');
        checkboxes.forEach(cb => {
            cb.checked = e.target.checked;
            if (e.target.checked) {
                selectedProductIds.add(cb.value);
            } else {
                selectedProductIds.delete(cb.value);
            }
        });
        updateBatchBar();
    });

    document.getElementById('batchClearBtn').addEventListener('click', () => {
        selectedProductIds.clear();
        document.getElementById('selectAllCheckbox').checked = false;
        document.querySelectorAll('#productsTableBody .product-checkbox').forEach(cb => cb.checked = false);
        updateBatchBar();
    });

    document.getElementById('batchApplyBtn').addEventListener('click', () => {
        const catId = document.getElementById('batchCategorySelect').value;
        if (!catId) {
            toast('Please select a category first.', 'warning');
            return;
        }
        const ids = Array.from(selectedProductIds);
        if (ids.length === 0) {
            toast('No products selected.', 'warning');
            return;
        }
        ids.forEach(id => {
            const prod = adminDb.products.find(p => p.id === id);
            if (prod) prod.category_id = catId;
        });
        const cat = adminDb.categories.find(c => c.id === catId);
        toast(`Assigned ${ids.length} product(s) to "${cat ? cat.name_en : catId}"`, 'success');
        selectedProductIds.clear();
        document.getElementById('selectAllCheckbox').checked = false;
        renderProductsTable(document.getElementById('productSearch').value);
        renderDashboard();
        renderCategoriesTable();
    });
}

function populateBatchCategorySelect() {
    const sel = document.getElementById('batchCategorySelect');
    sel.innerHTML = '<option value="">— Assign category —</option>' +
        adminDb.categories
            .filter(c => c.id !== 'all')
            .map(c => `<option value="${c.id}">${c.name_en}</option>`)
            .join('');
}

function setupProductModal() {
    document.getElementById('addProductBtn').addEventListener('click', () => openProductModal());
    document.getElementById('closeProductModal').addEventListener('click', closeProductModal);
    document.getElementById('cancelProductModal').addEventListener('click', closeProductModal);
    document.getElementById('saveProductBtn').addEventListener('click', saveProduct);

    document.getElementById('productModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('productModal')) closeProductModal();
    });
}

function populateCategorySelect() {
    const sel = document.getElementById('p-category_id');
    sel.innerHTML = adminDb.categories
        .filter(c => c.id !== 'all')
        .map(c => `<option value="${c.id}">${c.name_en}</option>`)
        .join('');
}

function openProductModal(product = null) {
    populateCategorySelect();
    editingProductId = product ? product.id : null;
    document.getElementById('productModalTitle').textContent = product ? 'Edit Product' : 'Add Product';
    document.getElementById('p-name_en').value = product?.name_en || '';
    document.getElementById('p-name_ar').value = product?.name_ar || '';
    document.getElementById('p-desc_en').value = product?.desc_en || '';
    document.getElementById('p-desc_ar').value = product?.desc_ar || '';
    document.getElementById('p-weight').value = product?.weight || '';
    document.getElementById('p-pieces_per_carton').value = product?.pieces_per_carton || '';
    document.getElementById('p-price').value = product?.price || '';
    document.getElementById('p-image_url').value = product?.image_url || '';
    if (product) document.getElementById('p-category_id').value = product.category_id;
    document.getElementById('productModal').classList.add('active');
}

function openEditProduct(id) {
    const product = adminDb.products.find(p => p.id === id);
    if (product) openProductModal(product);
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
    editingProductId = null;
}

function saveProduct() {
    const name_en = document.getElementById('p-name_en').value.trim();
    const name_ar = document.getElementById('p-name_ar').value.trim();
    if (!name_en || !name_ar) {
        toast('Product name (EN & AR) is required.', 'error');
        return;
    }
    if (name_en.length < 2 || name_ar.length < 2) {
        toast('Product names must be at least 2 characters.', 'error');
        return;
    }

    const weight = document.getElementById('p-weight').value.trim();
    if (!weight) {
        toast('Weight is required.', 'error');
        return;
    }

    const pieces = document.getElementById('p-pieces_per_carton').value.trim();
    if (pieces && !/^\d+$/.test(pieces)) {
        toast('Pieces per carton must be a number.', 'error');
        return;
    }

    const price = document.getElementById('p-price').value.trim();
    if (price && !/^\d+(\.\d{1,2})?$/.test(price)) {
        toast('Price must be a valid number (e.g. 2.50).', 'error');
        return;
    }

    const image_url = document.getElementById('p-image_url').value.trim();
    if (image_url && !/^https?:\/\/.+/.test(image_url)) {
        toast('Image URL must start with http:// or https://', 'error');
        return;
    }

    const productData = {
        id: editingProductId || String(Date.now()),
        category_id: document.getElementById('p-category_id').value,
        name_en,
        name_ar,
        desc_en: document.getElementById('p-desc_en').value.trim(),
        desc_ar: document.getElementById('p-desc_ar').value.trim(),
        weight,
        pieces_per_carton: pieces,
        price: price || '0',
        image_url
    };

    if (editingProductId) {
        const idx = adminDb.products.findIndex(p => p.id === editingProductId);
        if (idx !== -1) adminDb.products[idx] = productData;
        toast('Product updated successfully!', 'success');
    } else {
        if (adminDb.products.find(p => p.id === productData.id)) {
            toast('Duplicate product ID detected. Please try again.', 'error');
            return;
        }
        adminDb.products.push(productData);
        toast('Product added successfully!', 'success');
    }

    closeProductModal();
    renderProductsTable(document.getElementById('productSearch').value);
    renderDashboard();
}

function deleteProduct(id) {
    const product = adminDb.products.find(p => p.id === id);
    showConfirm(
        'Delete Product?',
        `Are you sure you want to delete "${product?.name_en}"? This cannot be undone.`,
        () => {
            adminDb.products = adminDb.products.filter(p => p.id !== id);
            selectedProductIds.delete(id);
            renderProductsTable(document.getElementById('productSearch').value);
            renderDashboard();
            toast('Product deleted.', 'info');
        }
    );
}

function renderCategoriesTable() {
    const tbody = document.getElementById('categoriesTableBody');
    const cats = adminDb.categories.filter(c => c.id !== 'all');

    tbody.innerHTML = cats.map(cat => {
        const count = adminDb.products.filter(p => p.category_id === cat.id).length;
        return `
            <tr>
                <td><i class='bx ${cat.icon}' style="font-size:1.3rem;"></i></td>
                <td><code style="font-size:0.8rem;background:var(--admin-surface-2);padding:2px 6px;border-radius:4px;">${cat.id}</code></td>
                <td>${cat.name_en}</td>
                <td style="direction:rtl;text-align:right;">${cat.name_ar}</td>
                <td><span class="badge-cat">${count}</span></td>
                <td>
                    <div class="td-actions">
                        <button class="btn-icon-only" title="Edit" onclick="openEditCat('${cat.id}')">
                            <i class='bx bx-edit'></i>
                        </button>
                        <button class="btn-icon-only" style="color:#ef4444;" title="Delete" onclick="deleteCat('${cat.id}')">
                            <i class='bx bx-trash'></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function setupCatModal() {
    document.getElementById('addCatBtn').addEventListener('click', () => openCatModal());
    document.getElementById('closeCatModal').addEventListener('click', closeCatModal);
    document.getElementById('cancelCatModal').addEventListener('click', closeCatModal);
    document.getElementById('saveCatBtn').addEventListener('click', saveCat);
    document.getElementById('catModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('catModal')) closeCatModal();
    });
}

function openCatModal(cat = null) {
    editingCatId = cat ? cat.id : null;
    document.getElementById('catModalTitle').textContent = cat ? 'Edit Category' : 'Add Category';
    document.getElementById('cat-id').value = cat?.id || '';
    document.getElementById('cat-icon').value = cat?.icon || '';
    document.getElementById('cat-name_en').value = cat?.name_en || '';
    document.getElementById('cat-name_ar').value = cat?.name_ar || '';
    document.getElementById('cat-id').disabled = !!cat;
    document.getElementById('catModal').classList.add('active');
}

function openEditCat(id) {
    const cat = adminDb.categories.find(c => c.id === id);
    if (cat) openCatModal(cat);
}

function closeCatModal() {
    document.getElementById('catModal').classList.remove('active');
    editingCatId = null;
}

function saveCat() {
    const id = document.getElementById('cat-id').value.trim().toLowerCase().replace(/\s+/g, '_');
    const name_en = document.getElementById('cat-name_en').value.trim();
    const name_ar = document.getElementById('cat-name_ar').value.trim();
    const icon = document.getElementById('cat-icon').value.trim() || 'bx-category';

    if (!id || !name_en || !name_ar) {
        toast('Category ID and names are required.', 'error');
        return;
    }
    if (!/^[a-z0-9_]+$/.test(id)) {
        toast('Category ID must be lowercase alphanumeric with underscores only.', 'error');
        return;
    }

    if (editingCatId) {
        const idx = adminDb.categories.findIndex(c => c.id === editingCatId);
        if (idx !== -1) adminDb.categories[idx] = { id: editingCatId, name_en, name_ar, icon };
        toast('Category updated!', 'success');
    } else {
        if (adminDb.categories.find(c => c.id === id)) {
            toast('Category ID already exists.', 'error');
            return;
        }
        adminDb.categories.push({ id, name_en, name_ar, icon });
        toast('Category added!', 'success');
    }

    closeCatModal();
    renderCategoriesTable();
    renderDashboard();
    populateBatchCategorySelect();
    populateCategorySelect();
}

function deleteCat(id) {
    const cat = adminDb.categories.find(c => c.id === id);
    showConfirm(
        'Delete Category?',
        `Delete "${cat?.name_en}"? Products in this category will remain (you'll need to reassign them).`,
        () => {
            adminDb.categories = adminDb.categories.filter(c => c.id !== id);
            renderCategoriesTable();
            toast('Category deleted.', 'info');
            populateBatchCategorySelect();
            populateCategorySelect();
        }
    );
}

function loadSiteContentForm() {
    const s = adminDb.siteContent;
    document.getElementById('sc-logoText').value = s.logoText || '';
    document.getElementById('sc-heroImage').value = s.heroImage || '';
    document.getElementById('sc-phone').value = s.phone || '';
    document.getElementById('sc-phoneRaw').value = s.phoneRaw || '';
    document.getElementById('sc-whatsapp').value = s.whatsapp || '';
    document.getElementById('sc-instagram').value = s.instagram || '';
    document.getElementById('sc-footerAbout_en').value = s.footerAbout_en || '';
    document.getElementById('sc-footerAbout_ar').value = s.footerAbout_ar || '';
    document.getElementById('sc-copyright_en').value = s.copyright_en || '';
    document.getElementById('sc-copyright_ar').value = s.copyright_ar || '';
}

function setupSiteContentSave() {
    document.getElementById('saveSiteContentBtn').addEventListener('click', () => {
        const heroImg = document.getElementById('sc-heroImage').value.trim();
        if (heroImg && !/^https?:\/\/.+/.test(heroImg)) {
            toast('Hero image URL must start with http:// or https://', 'error');
            return;
        }
        adminDb.siteContent.logoText = document.getElementById('sc-logoText').value.trim();
        adminDb.siteContent.heroImage = heroImg;
        adminDb.siteContent.phone = document.getElementById('sc-phone').value.trim();
        adminDb.siteContent.phoneRaw = document.getElementById('sc-phoneRaw').value.trim();
        adminDb.siteContent.whatsapp = document.getElementById('sc-whatsapp').value.trim();
        adminDb.siteContent.instagram = document.getElementById('sc-instagram').value.trim();
        adminDb.siteContent.footerAbout_en = document.getElementById('sc-footerAbout_en').value.trim();
        adminDb.siteContent.footerAbout_ar = document.getElementById('sc-footerAbout_ar').value.trim();
        adminDb.siteContent.copyright_en = document.getElementById('sc-copyright_en').value.trim();
        adminDb.siteContent.copyright_ar = document.getElementById('sc-copyright_ar').value.trim();
        toast('Site content saved! Click "Save & Sync" to publish.', 'success');
    });
}

function loadThemeForm() {
    const t = adminDb.theme;
    const fields = [
        'accentColor', 'accentColorLight', 'accentColorDark',
        'bgColor', 'surfaceColor', 'surface2Color', 'surface3Color', 'navbarColor',
        'textPrimary', 'borderColor'
    ];
    fields.forEach(key => {
        const colorPicker = document.getElementById(`th-${key}`);
        const hexInput = document.getElementById(`th-${key}-hex`);
        if (!colorPicker || !hexInput) return;
        const val = t[key];
        if (val && /^#[0-9A-Fa-f]{6}$/.test(val)) {
            colorPicker.value = val;
            hexInput.value = val;
        } else {
            hexInput.value = val || '';
            if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                colorPicker.value = val;
            } else {
                colorPicker.value = key === 'borderColor' ? '#ffffff' : '#f0f0f5';
            }
        }
        colorPicker.addEventListener('input', () => { hexInput.value = colorPicker.value; });
        hexInput.addEventListener('input', () => {
            if (/^#[0-9A-Fa-f]{6}$/.test(hexInput.value)) colorPicker.value = hexInput.value;
        });
    });
}

function setupThemeSave() {
    document.getElementById('saveThemeBtn').addEventListener('click', () => {
        const fields = [
            'accentColor', 'accentColorLight', 'accentColorDark',
            'bgColor', 'surfaceColor', 'surface2Color', 'surface3Color', 'navbarColor',
            'textPrimary', 'borderColor'
        ];
        let hasError = false;
        fields.forEach(key => {
            const hexInput = document.getElementById(`th-${key}-hex`);
            const val = hexInput ? hexInput.value : '';
            if (val && !/^#[0-9A-Fa-f]{6}$/.test(val)) {
                hasError = true;
                return;
            }
            if (hexInput && /^#[0-9A-Fa-f]{6}$/.test(hexInput.value)) {
                adminDb.theme[key] = hexInput.value;
            } else {
                const picker = document.getElementById(`th-${key}`);
                if (picker) adminDb.theme[key] = picker.value;
            }
        });
        if (hasError) {
            toast('Invalid hex color value detected.', 'error');
            return;
        }
        toast('Theme saved! Click "Save & Sync" to publish.', 'success');
    });
}

function loadTranslationsForm() {
    const container = document.getElementById('translationsContainer');
    const t_en = adminDb.translations.en;
    const t_ar = adminDb.translations.ar;
    const keys = Object.keys(t_en);

    container.innerHTML = `
        <div class="card">
            <div class="card-header"><span class="card-title">UI Strings</span></div>
            <div class="form-grid">
                ${keys.map(key => `
                    <div class="form-group">
                        <label>${key} (EN)</label>
                        <input type="text" class="form-control trans-input" data-key="${key}" data-lang="en" value="${(t_en[key] || '').replace(/"/g, '&quot;')}">
                    </div>
                    <div class="form-group">
                        <label>${key} (AR)</label>
                        <input type="text" class="form-control trans-input" data-key="${key}" data-lang="ar" value="${(t_ar[key] || '').replace(/"/g, '&quot;')}" style="direction:rtl;text-align:right;">
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function setupTranslationsSave() {
    document.getElementById('saveTranslationsBtn').addEventListener('click', () => {
        document.querySelectorAll('.trans-input').forEach(input => {
            const key = input.dataset.key;
            const lang = input.dataset.lang;
            if (!input.value.trim()) {
                toast(`Translation "${key}" (${lang}) cannot be empty.`, 'warning');
            }
            adminDb.translations[lang][key] = input.value;
        });
        toast('Translations saved! Click "Save & Sync" to publish.', 'success');
    });
}

function loadSettingsForm() {
    document.getElementById('gh-username').value = localStorage.getItem(LS_GH_USER) || '';
    document.getElementById('gh-repo').value = localStorage.getItem(LS_GH_REPO) || '';
    document.getElementById('gh-branch').value = localStorage.getItem(LS_GH_BRANCH) || 'main';
    document.getElementById('gh-token').value = localStorage.getItem(LS_GH_TOKEN) || '';
    document.getElementById('ga-id').value = localStorage.getItem(LS_GA_ID) || '';
}

function setupSettingsForms() {
    document.getElementById('saveGithubBtn').addEventListener('click', () => {
        const token = document.getElementById('gh-token').value.trim();
        if (token && token.length < 10) {
            toast('GitHub token looks too short. Please double-check.', 'warning');
            return;
        }
        localStorage.setItem(LS_GH_USER, document.getElementById('gh-username').value.trim());
        localStorage.setItem(LS_GH_REPO, document.getElementById('gh-repo').value.trim());
        localStorage.setItem(LS_GH_BRANCH, document.getElementById('gh-branch').value.trim() || 'main');
        localStorage.setItem(LS_GH_TOKEN, token);
        toast('GitHub settings saved!', 'success');
    });

    document.getElementById('testGithubBtn').addEventListener('click', async () => {
        const user = localStorage.getItem(LS_GH_USER);
        const repo = localStorage.getItem(LS_GH_REPO);
        const token = localStorage.getItem(LS_GH_TOKEN);
        if (!user || !repo || !token) {
            toast('Please save GitHub settings first.', 'warning');
            return;
        }
        toast('Testing connection...', 'info');
        try {
            const res = await fetch(`https://api.github.com/repos/${user}/${repo}`, {
                headers: { Authorization: `token ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                toast(`Connected! Repo: ${data.full_name}`, 'success');
            } else {
                toast(`Connection failed (${res.status}). Check token/repo name.`, 'error');
            }
        } catch (err) {
            toast('Network error. Check your internet connection.', 'error');
        }
    });

    document.getElementById('changePasswordBtn').addEventListener('click', async () => {
        const newPwd = document.getElementById('newPassword').value;
        const confirmPwd = document.getElementById('confirmPassword').value;
        if (!newPwd) { toast('Please enter a new password.', 'error'); return; }
        if (newPwd !== confirmPwd) { toast('Passwords do not match.', 'error'); return; }
        if (newPwd.length < 6) { toast('Password must be at least 6 characters.', 'error'); return; }
        localStorage.setItem(LS_PASSWORD, await hashPassword(newPwd));
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        toast('Password changed successfully! SHA-256 hash stored in browser.', 'success');
    });

    document.getElementById('saveGaBtn').addEventListener('click', () => {
        const gaId = document.getElementById('ga-id').value.trim();
        if (gaId && !/^G-[A-Z0-9]+$/i.test(gaId)) {
            toast('Invalid Google Analytics ID. Format: G-XXXXXXXXXX', 'error');
            return;
        }
        localStorage.setItem(LS_GA_ID, gaId);
        toast('Analytics setting saved! It will apply on next page load.', 'success');
    });
}

function setupSyncBtn() {
    document.getElementById('syncBtn').addEventListener('click', syncToGitHub);
}

async function syncToGitHub() {
    const user = localStorage.getItem(LS_GH_USER);
    const repo = localStorage.getItem(LS_GH_REPO);
    const branch = localStorage.getItem(LS_GH_BRANCH) || 'main';
    const token = localStorage.getItem(LS_GH_TOKEN);

    if (!user || !repo || !token) {
        toast('GitHub is not configured. Go to Settings first.', 'warning');
        switchPanel('settings');
        return;
    }

    const syncBtn = document.getElementById('syncBtn');
    syncBtn.disabled = true;
    syncBtn.innerHTML = `<i class='bx bx-loader-alt bx-spin'></i> Syncing...`;
    toast('Syncing to GitHub...', 'info');

    try {
        const newDataJs = generateDataJs();
        const filePath = 'data.js';
        const apiUrl = `https://api.github.com/repos/${user}/${repo}/contents/${filePath}`;
        const headers = {
            Authorization: `token ${token}`,
            'Content-Type': 'application/json'
        };

        const getRes = await fetch(`${apiUrl}?ref=${branch}`, { headers });
        const getJson = await getRes.json();
        const sha = getJson.sha;

        const pushRes = await fetch(apiUrl, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
                message: `Admin: update data.js [${new Date().toLocaleString()}]`,
                content: btoa(unescape(encodeURIComponent(newDataJs))),
                sha,
                branch
            })
        });

        if (pushRes.ok) {
            const now = new Date().toISOString();
            localStorage.setItem(LS_LAST_SYNC, now);
            document.getElementById('stat-sync').textContent = new Date(now).toLocaleDateString();
            toast('Synced successfully! Site will update in ~30 seconds.', 'success');
        } else {
            const err = await pushRes.json();
            toast(`Sync failed: ${err.message}`, 'error');
        }
    } catch (err) {
        toast(`Sync error: ${err.message}`, 'error');
    } finally {
        syncBtn.disabled = false;
        syncBtn.innerHTML = `<i class='bx bx-cloud-upload'></i> Save & Sync to GitHub`;
    }
}

function setupPreviewBtn() {
    document.getElementById('previewBtn').addEventListener('click', () => {
        const previewData = generateCompactDataJs();
        sessionStorage.setItem(LS_PREVIEW_DATA, previewData);
        sessionStorage.setItem('atk_preview_presets', JSON.stringify(db.themePresets));
        const w = window.open('preview.html', '_blank');
        if (!w) {
            toast('Popup blocked. Please allow popups for preview.', 'warning');
        }
    });

    document.getElementById('exportBtn').addEventListener('click', () => {
        const jsContent = generateDataJs();
        const blob = new Blob([jsContent], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.js';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast('data.js downloaded! Replace your local file.', 'success');
    });
}

function generateDataJs() {
    const d = adminDb;
    const escape = (str) => (str || '').replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${');

    const themeStr = `    theme: ${JSON.stringify(d.theme, null, 8)},`;
    const scStr = `    siteContent: ${JSON.stringify(d.siteContent, null, 8)},`;

    const catsStr = `    categories: [\n` +
        d.categories.map(c =>
            `        { id: '${c.id}', name_en: '${escape(c.name_en)}', name_ar: '${escape(c.name_ar)}', icon: '${c.icon}' }`
        ).join(',\n') +
        `\n    ],`;

    const prodsStr = `    products: [\n` +
        d.products.map(p =>
            `        { id: '${p.id}', category_id: '${p.category_id}', ` +
            `name_en: '${escape(p.name_en)}', name_ar: '${escape(p.name_ar)}', ` +
            `desc_en: '${escape(p.desc_en)}', desc_ar: '${escape(p.desc_ar)}', ` +
            `weight: '${escape(p.weight)}', pieces_per_carton: '${escape(p.pieces_per_carton)}', ` +
            `price: '${escape(p.price || '0')}', ` +
            `image_url: '${escape(p.image_url)}' }`
        ).join(',\n') +
        `\n    ],`;

    const locationsStr = `    locations: ${JSON.stringify(d.locations, null, 8)},`;

    const transStr = `    translations: ${JSON.stringify(d.translations, null, 8)}`;

    return `// =============================================================================
// Al-Tabakh Premium Catalog — Data Store
// Last updated: ${new Date().toLocaleString()}
// =============================================================================

const db = {

${themeStr}

${scStr}

${catsStr}

${prodsStr}

${locationsStr}

${transStr}

};
`;
}

function generateCompactDataJs() {
    return JSON.stringify(adminDb);
}

function handleCsvImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
        toast('Please select a CSV file.', 'error');
        e.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
        const lines = ev.target.result.split('\n').filter(l => l.trim());
        if (lines.length < 2) {
            toast('CSV file appears empty or has no data rows.', 'error');
            return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const requiredFields = ['name_en', 'name_ar'];
        const missingFields = requiredFields.filter(f => !headers.includes(f));
        if (missingFields.length > 0) {
            toast(`CSV missing required columns: ${missingFields.join(', ')}`, 'error');
            e.target.value = '';
            return;
        }

        let added = 0;
        let errors = 0;
        for (let i = 1; i < lines.length; i++) {
            const cols = parseCSVLine(lines[i]);
            if (cols.length < 2) { errors++; continue; }
            const row = {};
            headers.forEach((h, idx) => { row[h] = (cols[idx] || '').trim().replace(/^"|"$/g, ''); });
            if (!row.name_en && !row.name_ar) { errors++; continue; }

            const image_url = row.image_url || '';
            if (image_url && !/^https?:\/\/.+/.test(image_url)) {
                errors++;
                continue;
            }

            const prod = {
                id: row.id || String(Date.now() + i),
                category_id: row.category_id || 'food',
                name_en: row.name_en || '',
                name_ar: row.name_ar || '',
                desc_en: row.desc_en || '',
                desc_ar: row.desc_ar || '',
                weight: row.weight || '',
                pieces_per_carton: row.pieces_per_carton || '',
                price: row.price || '0',
                image_url
            };

            const idx = adminDb.products.findIndex(p => p.id === prod.id);
            if (idx !== -1) adminDb.products[idx] = prod;
            else { adminDb.products.push(prod); added++; }
        }

        renderProductsTable();
        renderDashboard();
        if (errors > 0) {
            toast(`Imported ${added} products (${errors} rows skipped due to validation errors).`, 'info');
        } else {
            toast(`Imported ${added} products from CSV!`, 'success');
        }
        e.target.value = '';
    };
    reader.readAsText(file);
}

function parseCSVLine(line) {
    const result = [];
    let inQuotes = false, current = '';
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') { inQuotes = !inQuotes; }
        else if (ch === ',' && !inQuotes) { result.push(current); current = ''; }
        else { current += ch; }
    }
    result.push(current);
    return result;
}

function setupConfirm() {
    document.getElementById('confirmCancel').addEventListener('click', () => {
        document.getElementById('confirmOverlay').classList.remove('active');
        confirmCallback = null;
    });
    document.getElementById('confirmOk').addEventListener('click', () => {
        document.getElementById('confirmOverlay').classList.remove('active');
        if (typeof confirmCallback === 'function') confirmCallback();
        confirmCallback = null;
    });
}

function showConfirm(title, message, callback) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    confirmCallback = callback;
    document.getElementById('confirmOverlay').classList.add('active');
}

// =============================================================================
// Locations Management
// =============================================================================
function loadLocationsForm() {
    const list = document.getElementById('locationsList');
    if (!list) return;
    const locs = adminDb.locations || [];
    if (locs.length === 0) {
        list.innerHTML = '<p style="color:var(--text-muted)">No locations added yet.</p>';
        return;
    }
    let html = '<table class="admin-table"><thead><tr><th>City (EN)</th><th>City (AR)</th><th>Lat</th><th>Lng</th><th>Main</th><th></th></tr></thead><tbody>';
    locs.forEach(loc => {
        html += `<tr>
            <td>${loc.name_en}</td>
            <td>${loc.name_ar}</td>
            <td>${loc.lat}</td>
            <td>${loc.lng}</td>
            <td>${loc.isMain ? '<i class="bx bxs-star" style="color:#e63946"></i>' : ''}</td>
            <td>
                <button class="btn-icon-only" onclick="editLocation('${loc.id}')" title="Edit"><i class="bx bx-edit"></i></button>
                <button class="btn-icon-only" onclick="deleteLocation('${loc.id}')" title="Delete" style="color:#e63946"><i class="bx bx-trash"></i></button>
            </td>
        </tr>`;
    });
    html += '</tbody></table>';
    list.innerHTML = html;
}

function editLocation(id) {
    const loc = adminDb.locations.find(l => l.id === id);
    if (!loc) return;
    document.getElementById('locEditId').value = id;
    document.getElementById('locNameEn').value = loc.name_en;
    document.getElementById('locNameAr').value = loc.name_ar;
    document.getElementById('locLat').value = loc.lat;
    document.getElementById('locLng').value = loc.lng;
    document.getElementById('locLabelEn').value = loc.label_en;
    document.getElementById('locLabelAr').value = loc.label_ar;
    document.getElementById('locIsMain').checked = loc.isMain;
}

function deleteLocation(id) {
    if (!confirm('Delete this location?')) return;
    adminDb.locations = adminDb.locations.filter(l => l.id !== id);
    loadLocationsForm();
    toast('Location deleted.', 'success');
}

function setupLocationForm() {
    document.getElementById('locSaveBtn').addEventListener('click', () => {
        const editId = document.getElementById('locEditId').value;
        const name_en = document.getElementById('locNameEn').value.trim();
        const name_ar = document.getElementById('locNameAr').value.trim();
        const lat = parseFloat(document.getElementById('locLat').value);
        const lng = parseFloat(document.getElementById('locLng').value);
        const label_en = document.getElementById('locLabelEn').value.trim();
        const label_ar = document.getElementById('locLabelAr').value.trim();
        const isMain = document.getElementById('locIsMain').checked;

        if (!name_en || !name_ar || isNaN(lat) || isNaN(lng)) {
            toast('Please fill all required fields (name EN, name AR, lat, lng).', 'error');
            return;
        }

        if (editId) {
            const loc = adminDb.locations.find(l => l.id === editId);
            if (loc) {
                loc.name_en = name_en;
                loc.name_ar = name_ar;
                loc.lat = lat;
                loc.lng = lng;
                loc.label_en = label_en || (isMain ? 'Main Sales Center' : 'Sales Center');
                loc.label_ar = label_ar || (isMain ? 'مركز المبيعات الرئيسي' : 'مركز مبيعات');
                loc.isMain = isMain;
            }
            toast('Location updated.', 'success');
        } else {
            const id = name_en.toLowerCase().replace(/[^a-z0-9]/g, '_');
            if (adminDb.locations.find(l => l.id === id)) {
                toast('Location with this ID already exists.', 'error');
                return;
            }
            adminDb.locations.push({
                id,
                lat,
                lng,
                name_en,
                name_ar,
                label_en: label_en || (isMain ? 'Main Sales Center' : 'Sales Center'),
                label_ar: label_ar || (isMain ? 'مركز المبيعات الرئيسي' : 'مركز مبيعات'),
                isMain
            });
            toast('Location added.', 'success');
        }

        document.getElementById('locEditId').value = '';
        document.getElementById('locNameEn').value = '';
        document.getElementById('locNameAr').value = '';
        document.getElementById('locLat').value = '';
        document.getElementById('locLng').value = '';
        document.getElementById('locLabelEn').value = '';
        document.getElementById('locLabelAr').value = '';
        document.getElementById('locIsMain').checked = false;
        loadLocationsForm();
    });

    document.getElementById('locCancelBtn').addEventListener('click', () => {
        document.getElementById('locEditId').value = '';
        document.getElementById('locNameEn').value = '';
        document.getElementById('locNameAr').value = '';
        document.getElementById('locLat').value = '';
        document.getElementById('locLng').value = '';
        document.getElementById('locLabelEn').value = '';
        document.getElementById('locLabelAr').value = '';
        document.getElementById('locIsMain').checked = false;
    });
}

function toast(message, type = 'info') {
    const icons = { success: 'bx-check-circle', error: 'bx-error-circle', info: 'bx-info-circle', warning: 'bx-error' };
    const container = document.getElementById('toastContainer');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<i class='bx ${icons[type] || icons.info}'></i> ${message}`;
    container.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateY(12px)'; el.style.transition = '0.3s'; setTimeout(() => el.remove(), 300); }, 3500);
}
