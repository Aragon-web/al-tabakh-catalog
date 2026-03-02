// =============================================================================
// Al-Tabakh Premium Catalog — Data Store
// Last updated: 02/03/2026, 10:26:36
// =============================================================================

const db = {

    theme: {
        "accentColor": "#D11D1D",
        "accentColorLight": "#E93C3C",
        "accentColorDark": "#A51414",
        "bgColor": "#FFFFFF",
        "surfaceColor": "#F5F5F7",
        "surface2Color": "#EBEBEF",
        "surface3Color": "#DDDDE3",
        "navbarColor": "rgba(245, 245, 247, 0.75)"
},

    siteContent: {
        "logoText": "AL-TABAKH",
        "phone": "+964 770 888 8389",
        "phoneRaw": "+9647708888389",
        "whatsapp": "9647708888389",
        "instagram": "altabakhfactory",
        "heroImage": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=2070&auto=format&fit=crop",
        "footerAbout_en": "Malek Al-Tabakh Company — Premium food manufacturing since establishment. We craft the finest spices, sauces, and food supplies.",
        "footerAbout_ar": "شركة ملك الطباخ — تصنيع غذائي متميز منذ التأسيس. نصنع أفضل البهارات والصلصات والمواد الغذائية.",
        "copyright_en": "© 2026 Malek Al-Tabakh Company. All rights reserved.",
        "copyright_ar": "© 2026 شركة ملك الطباخ. جميع الحقوق محفوظة."
},

    categories: [
        { id: 'all', name_en: 'All Products', name_ar: 'جميع المنتجات', icon: 'bx-grid-alt' },
        { id: 'spices', name_en: 'Spices', name_ar: 'بهارات', icon: 'bxs-leaf' },
        { id: 'sauces', name_en: 'Sauces', name_ar: 'الصلصات', icon: 'bx-droplet' },
        { id: 'pastry', name_en: 'Pastry', name_ar: 'معجنات', icon: 'bx-cake' },
        { id: 'jelly', name_en: 'Jelly', name_ar: 'جيلي', icon: 'bx-bowl-hot' },
        { id: 'sweets', name_en: 'Sweets Powder', name_ar: 'مسحوق الحلويات', icon: 'bx-cookie' },
        { id: 'food', name_en: 'Food Stuffs', name_ar: 'مواد غذائية', icon: 'bx-package' }
    ],

    products: [
        { id: '1', category_id: 'spices', name_en: 'Brown Biryani Seasoning', name_ar: 'بهارات برياني بني', desc_en: 'A premium blend of aromatic spices perfect for crafting authentic, flavorful Biryani dishes.', desc_ar: 'مزيج ممتاز من البهارات العطرية مثالي لتحضير أطباق برياني أصيلة ولذيذة.', weight: '40g', pieces_per_carton: '60', image_url: '' },
        { id: '2', category_id: 'spices', name_en: 'Chicken Seasoning Mix', name_ar: 'بهارات دجاج', desc_en: 'Specially crafted mix to enhance the flavor of roasted, grilled or fried chicken.', desc_ar: 'مزيج معد خصيصًا لتعزيز نكهة الدجاج المحمص أو المشوي أو المقلي.', weight: '40g', pieces_per_carton: '60', image_url: '' },
        { id: '3', category_id: 'sauces', name_en: 'Pomegranate Syrup', name_ar: 'دبس الرمان', desc_en: 'Rich, tangy, and sweet pomegranate molasses, ideal for salads and marinades.', desc_ar: 'دبس رمان غني وحامض وحلو، مثالي للسلطات والتتبيلات.', weight: '675ml', pieces_per_carton: '12', image_url: '' },
        { id: '4', category_id: 'sauces', name_en: 'Lemon Alternative Sauce', name_ar: 'بديل الليمون', desc_en: 'A perfect cooking companion offering the tartness of fresh lemons.', desc_ar: 'رفيق طبخ مثالي يقدم حموضة الليمون الطازج.', weight: '350ml', pieces_per_carton: '24', image_url: '' },
        { id: '5', category_id: 'food', name_en: 'Sella Basmati Rice', name_ar: 'رز بسمتي سيلا', desc_en: 'Premium long-grain Sella Basmati rice, perfect for large gatherings and professional kitchens.', desc_ar: 'رز بسمتي سيلا ممتاز طويل الحبة، مثالي للتجمعات الكبيرة والمطابخ الاحترافية.', weight: '10kg', pieces_per_carton: '1', image_url: '' },
        { id: '6', category_id: 'jelly', name_en: 'Strawberry Jelly Powder', name_ar: 'مسحوق جلي الفراولة', desc_en: 'Sweet and fruity strawberry jelly, easy to prepare and loved by all.', desc_ar: 'جلي فراولة حلو ومليء بالفاكهة، سهل التحضير ومحبوب من الجميع.', weight: '80g', pieces_per_carton: '48', image_url: '' },
        { id: '7', category_id: 'pastry', name_en: 'Premium Baking Powder', name_ar: 'بيكنج باودر ممتاز', desc_en: 'Ensure perfect rises for all your cakes and pastries with our premium leavening agent.', desc_ar: 'اضمن ارتفاعًا مثاليًا لجميع الكعك والمعجنات باستخدام عامل التخمير الممتاز لدينا.', weight: '100g', pieces_per_carton: '72', image_url: '' },
        { id: '8', category_id: 'sweets', name_en: 'Chocolate Pudding Mix', name_ar: 'مسحوق بودينغ الشوكولاتة', desc_en: 'Rich and creamy chocolate pudding mix for a quick, decadent dessert.', desc_ar: 'مسحوق بودينغ الشوكولاتة الغني والكريمي لحلوى سريعة ولذيذة.', weight: '150g', pieces_per_carton: '36', image_url: '' }
    ],

    translations: {
        "en": {
                "heroTitle": "Premium Ingredients for Perfect Meals",
                "heroSubtitle": "With Al-Tabakh, life has a different taste.",
                "btnInquire": "Inquire via WhatsApp",
                "specWeight": "Pack Weight",
                "specCarton": "Pieces / Carton",
                "langToggle": "العربية",
                "searchPlaceholder": "Search products...",
                "productCount": "products",
                "footerContact": "Contact Us",
                "noResults": "No products match your search.",
                "allProducts": "All Products",
                "scrollTop": "Back to top"
        },
        "ar": {
                "heroTitle": "مكونات ممتازة لوجبات مثالية",
                "heroSubtitle": "مع الطباخ، للحياة طعم مختلف.",
                "btnInquire": "استفسر عبر واتساب",
                "specWeight": "وزن العبوة",
                "specCarton": "قطعة / كارتون",
                "langToggle": "English",
                "searchPlaceholder": "ابحث عن المنتجات...",
                "productCount": "منتج",
                "footerContact": "اتصل بنا",
                "noResults": "لا توجد منتجات تطابق بحثك.",
                "allProducts": "جميع المنتجات",
                "scrollTop": "العودة للأعلى"
        }
}
};
