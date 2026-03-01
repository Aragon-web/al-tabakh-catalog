// =============================================================================
// Configuration
// =============================================================================
const SHEET_ID = '1ZOIaNBSRH3SPqlihbb0vFiRj-BiCxryobtt3cMwBZOY';
const SHEET_NAME = 'Sheet1';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}`;

// WhatsApp number for inquiries (with country code, no + or spaces)
const WHATSAPP_NUMBER = '964770888388 9';
const WHATSAPP_BASE = 'https://wa.me/9647708888389';

// =============================================================================
// Google Drive image helper
// =============================================================================
function resolveImageUrl(value) {
    if (!value) return '';
    const trimmed = value.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        const driveMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (driveMatch) {
            return `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w800`;
        }
        return trimmed;
    }
    return `https://drive.google.com/thumbnail?id=${trimmed}&sz=w800`;
}

// =============================================================================
// Static data
// =============================================================================
const db = {
    categories: [
        { id: 'all', name_en: 'All Products', name_ar: 'جميع المنتجات', icon: 'bx-grid-alt' },
        { id: 'spices', name_en: 'Spices', name_ar: 'بهارات', icon: 'bxs-leaf' },
        { id: 'sauces', name_en: 'Sauces', name_ar: 'الصلصات', icon: 'bx-droplet' },
        { id: 'pastry', name_en: 'Pastry', name_ar: 'معجنات', icon: 'bx-cake' },
        { id: 'jelly', name_en: 'Jelly', name_ar: 'جيلي', icon: 'bx-bowl-hot' },
        { id: 'sweets', name_en: 'Sweets Powder', name_ar: 'مسحوق الحلويات', icon: 'bx-cookie' },
        { id: 'food', name_en: 'Food Stuffs', name_ar: 'مواد غذائية', icon: 'bx-package' }
    ],
    products: [],
    translations: {
        en: {
            heroTitle: 'Premium Ingredients for Perfect Meals',
            heroSubtitle: 'With Al-Tabakh, life has a different taste.',
            btnInquire: 'Inquire via WhatsApp',
            specWeight: 'Pack Weight',
            specCarton: 'Pieces / Carton',
            langToggle: 'العربية',
            loadError: 'Unable to load products. Please try again later.',
            searchPlaceholder: 'Search products...',
            productCount: 'products',
            footerAbout: 'Malek Al-Tabakh Company — Premium food manufacturing since establishment. We craft the finest spices, sauces, and food supplies.',
            footerQuickLinks: 'Quick Links',
            footerContact: 'Contact Us',
            footerRights: '© 2026 Malek Al-Tabakh Company. All rights reserved.',
            noResults: 'No products match your search.',
            allProducts: 'All Products',
            scrollTop: 'Back to top'
        },
        ar: {
            heroTitle: 'مكونات ممتازة لوجبات مثالية',
            heroSubtitle: 'مع الطباخ، للحياة طعم مختلف.',
            btnInquire: 'استفسر عبر واتساب',
            specWeight: 'وزن العبوة',
            specCarton: 'قطعة / كارتون',
            langToggle: 'English',
            loadError: 'تعذر تحميل المنتجات. يرجى المحاولة مرة أخرى.',
            searchPlaceholder: 'ابحث عن المنتجات...',
            productCount: 'منتج',
            footerAbout: 'شركة ملك الطباخ — تصنيع غذائي متميز منذ التأسيس. نصنع أفضل البهارات والصلصات والمواد الغذائية.',
            footerQuickLinks: 'روابط سريعة',
            footerContact: 'اتصل بنا',
            footerRights: '© 2026 شركة ملك الطباخ. جميع الحقوق محفوظة.',
            noResults: 'لا توجد منتجات تطابق بحثك.',
            allProducts: 'جميع المنتجات',
            scrollTop: 'العودة للأعلى'
        }
    }
};

// =============================================================================
// Fallback sample data (used when Google Sheet is not reachable)
// =============================================================================
const FALLBACK_PRODUCTS = [
    { id: '1', category_id: 'spices', name_en: 'Brown Biryani Seasoning', name_ar: 'بهارات برياني بني', desc_en: 'A premium blend of aromatic spices perfect for crafting authentic, flavorful Biryani dishes.', desc_ar: 'مزيج ممتاز من البهارات العطرية مثالي لتحضير أطباق برياني أصيلة ولذيذة.', weight: '40g', pieces_per_carton: '60', image_url: '' },
    { id: '2', category_id: 'spices', name_en: 'Chicken Seasoning Mix', name_ar: 'بهارات دجاج', desc_en: 'Specially crafted mix to enhance the flavor of roasted, grilled or fried chicken.', desc_ar: 'مزيج معد خصيصًا لتعزيز نكهة الدجاج المحمص أو المشوي أو المقلي.', weight: '40g', pieces_per_carton: '60', image_url: '' },
    { id: '3', category_id: 'sauces', name_en: 'Pomegranate Syrup (Molasses)', name_ar: 'دبس الرمان', desc_en: 'Rich, tangy, and sweet pomegranate molasses, ideal for salads and marinades.', desc_ar: 'دبس رمان غني وحامض وحلو، مثالي للسلطات والتتبيلات.', weight: '675ml', pieces_per_carton: '12', image_url: '' },
    { id: '4', category_id: 'sauces', name_en: 'Lemon Alternative Sauce', name_ar: 'بديل الليمون', desc_en: 'A perfect cooking companion offering the tartness of fresh lemons.', desc_ar: 'رفيق طبخ مثالي يقدم حموضة الليمون الطازج.', weight: '350ml', pieces_per_carton: '24', image_url: '' },
    { id: '5', category_id: 'food', name_en: 'Sella Basmati Rice', name_ar: 'رز بسمتي سيلا', desc_en: 'Premium long-grain Sella Basmati rice, perfect for large gatherings and professional kitchens.', desc_ar: 'رز بسمتي سيلا ممتاز طويل الحبة، مثالي للتجمعات الكبيرة والمطابخ الاحترافية.', weight: '10kg', pieces_per_carton: '1', image_url: '' },
    { id: '6', category_id: 'jelly', name_en: 'Strawberry Jelly Powder', name_ar: 'مسحوق جلي الفراولة', desc_en: 'Sweet and fruity strawberry jelly, easy to prepare and loved by all.', desc_ar: 'جلي فراولة حلو ومليء بالفاكهة، سهل التحضير ومحبوب من الجميع.', weight: '80g', pieces_per_carton: '48', image_url: '' },
    { id: '7', category_id: 'pastry', name_en: 'Premium Baking Powder', name_ar: 'بيكنج باودر ممتاز', desc_en: 'Ensure perfect rises for all your cakes and pastries with our premium leavening agent.', desc_ar: 'اضمن ارتفاعًا مثاليًا لجميع الكعك والمعجنات باستخدام عامل التخمير الممتاز لدينا.', weight: '100g', pieces_per_carton: '72', image_url: '' },
    { id: '8', category_id: 'sweets', name_en: 'Chocolate Pudding Mix', name_ar: 'مسحوق بودينغ الشوكولاتة', desc_en: 'Rich and creamy chocolate pudding mix for a quick, decadent dessert.', desc_ar: 'مسحوق بودينغ الشوكولاتة الغني والكريمي لحلوى سريعة ولذيذة.', weight: '150g', pieces_per_carton: '36', image_url: '' }
];

// =============================================================================
// Fetch products from Google Sheets
// =============================================================================
async function fetchProducts() {
    try {
        const response = await fetch(SHEET_URL);
        const text = await response.text();

        const jsonString = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?/);
        if (!jsonString || !jsonString[1]) {
            throw new Error('Invalid response from Google Sheets');
        }

        const json = JSON.parse(jsonString[1]);
        const rows = json.table.rows;
        const cols = json.table.cols;

        // Build column index map from header labels
        const colMap = {};
        cols.forEach((col, i) => {
            const label = (col.label || '').trim().toLowerCase().replace(/\s+/g, '_');
            if (label) colMap[label] = i;
        });

        const products = rows.map(row => {
            const get = (key) => {
                const idx = colMap[key];
                if (idx === undefined || !row.c[idx]) return '';
                return row.c[idx].v != null ? String(row.c[idx].v) : '';
            };

            return {
                id: get('id'),
                category_id: get('category_id'),
                name_en: get('name_en'),
                name_ar: get('name_ar'),
                desc_en: get('desc_en'),
                desc_ar: get('desc_ar'),
                weight: get('weight'),
                pieces_per_carton: get('pieces_per_carton'),
                image_url: resolveImageUrl(get('image_url'))
            };
        }).filter(p => p.id && p.category_id);

        // If sheet returned no products, use fallback
        if (products.length === 0) {
            console.warn('Google Sheet returned 0 products, using fallback data.');
            return FALLBACK_PRODUCTS;
        }

        return products;
    } catch (err) {
        console.warn('Failed to fetch from Google Sheets, using fallback data:', err.message);
        return FALLBACK_PRODUCTS;
    }
}
