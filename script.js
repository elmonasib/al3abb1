// --- 1. إعدادات المتجر ---
const myPhoneNumber = "212631743274"; 
const placeholder = "https://via.placeholder.com/300x250?text=No+Image";

const container = document.getElementById('products-container');
const modal = document.getElementById('payment-modal');
const detailArea = document.getElementById('product-detail-area');
const policyModal = document.getElementById('policy-modal');
const policyTextArea = document.getElementById('policy-text-area');
const whatsappBtn = document.getElementById('whatsapp-btn');

let selectedProduct = null;

// --- 2. بيانات السياسات ومن نحن ومعلومات الشحن ---
const policies = {
    privacy: {
        title: "سياسة الخصوصية",
        content: "نحن في متجر العاب نلتزم بحماية بياناتك. المعلومات التي تقدمها تُستخدم فقط لغرض التوصيل ولا يتم مشاركتها أبداً."
    },
    exchange: {
        title: "سياسة التبديل والضمان",
        content: "يمكن استبدال المنتج خلال 24 ساعة في حال وجود خلل فني غير موضح في وصف المنتج."
    },
    about: {
        title: "من نحن",
        content: "متجر العاب وجهتك الأولى في المغرب للألعاب الكلاسيكية والقطع النادرة. نعيد لك ذكريات الزمن الجميل بقطع منتقاة بعناية."
    },
    shipping: {
        title: "معلومات الشحن والتوصيل",
        content: `
            <div style="text-align: right; line-height: 1.8;">
                <p>نشحن إلى <strong>جميع مدن المملكة المغربية</strong>.</p>
                <ul style="margin-top: 10px; list-style: none; padding-right: 0;">
                    <li><i class="fas fa-truck" style="color:var(--primary-orange)"></i> التوصيل لجميع المدن دون استثناء.</li>
                    <li><i class="fas fa-wallet" style="color:var(--primary-orange)"></i> مصاريف الشحن على عاتق الزبون.</li>
                    <li><i class="fas fa-clock" style="color:var(--primary-orange)"></i> مدة التوصيل من 2 إلى 4 أيام عمل.</li>
                </ul>
            </div>
        `
    }
};

// --- 3. وظائف المساعدة والعرض ---
function isNewProduct(dateStr) {
    const addedDate = new Date(dateStr);
    const today = new Date();
    const diffDays = Math.ceil(Math.abs(today - addedDate) / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
}

function render(items) {
    if (!container) return;
    container.innerHTML = "";
    items.forEach((p) => {
        const card = document.createElement('div');
        card.className = 'card';
        const isNew = isNewProduct(p.dateAdded);
        const displayImg = (p.images && p.images.length > 0) ? p.images[0] : placeholder;
        const hasDiscount = p.oldPrice ? true : false;

        card.innerHTML = `
            <div class="card-img-container">
                ${isNew ? '<span class="badge-new">جديد</span>' : ''}
                ${hasDiscount ? '<span class="badge-discount" style="position: absolute; top: 10px; left: 10px; background: #e74c3c; color: white; padding: 5px 10px; font-size: 0.8rem; border-radius: 5px; font-weight: bold; z-index: 2;">عرض خاص</span>' : ''}
                <img src="${displayImg}" onerror="this.src='${placeholder}'">
            </div>
            <div class="card-info">
                <h3>${p.name}</h3>
                <div class="product-specs">
                    <span><i class="fas fa-ruler-vertical"></i> ${p.length || '--'}</span>
                    <span> | </span>
                    <span><i class="fas fa-tag"></i> ${p.status || 'مستعمل'}</span>
                </div>
                
                <div class="price-section">
                    <div class="price-row">
                        <span class="price" style="color: var(--primary-orange); font-weight: bold;">${p.price}</span>
                        ${hasDiscount ? `<span class="old-price" style="text-decoration: line-through; color: #888;">${p.oldPrice}</span>` : ''}
                        <span class="availability-tag"><i class="fas fa-check-circle"></i> متوفر</span>
                    </div>
                    
                    <div class="payment-row">
                        <span class="cod-tag"><i class="fas fa-hand-holding-usd"></i> الدفع عند الاستلام بالمغرب</span>
                    </div>
                </div>
            </div>
        `;
        card.onclick = () => openModal(p);
        container.appendChild(card);
    });
}

// --- 4. التحكم في القائمة (الثلاث شرطات) ---
function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) navLinks.classList.toggle('active');
}

// --- 5. وظائف الروابط والسياسات ---
function filterByCategory(category, btn) {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) navLinks.classList.remove('active'); 

    if (category === 'latest') {
        const latest = [...allProducts].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
        render(latest);
    } else if (category === 'special') {
        render(allProducts.filter(p => p.oldPrice));
    } else {
        render(category === 'all' ? allProducts : allProducts.filter(p => p.cat === category));
    }
}

function showPolicy(type) {
    const policy = policies[type];
    if (policy) {
        policyTextArea.innerHTML = `<h2>${policy.title}</h2><div>${policy.content}</div>`;
        policyModal.style.display = 'flex';
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) navLinks.classList.remove('active');
    }
}

function showAbout() { showPolicy('about'); }

// --- 6. النافذة المنبثقة والمعرض ---
function openModal(p) {
    selectedProduct = p;
    const productImages = (p.images && p.images.length > 0) ? p.images : [placeholder];
    
    let modalThumbsHtml = '';
    if (productImages.length > 1) {
        modalThumbsHtml = `<div class="modal-thumbnails" style="display: flex; justify-content: center; gap: 8px; margin-top: 10px; flex-wrap: wrap;">`;
        productImages.forEach((img, idx) => {
            modalThumbsHtml += `<img src="${img}" class="modal-thumb ${idx === 0 ? 'active' : ''}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px; cursor: pointer; border: 2px solid #333;" onclick="changeModalImage(this)">`;
        });
        modalThumbsHtml += `</div>`;
    }

    detailArea.innerHTML = `
        <div class="modal-image-section">
            <img id="main-modal-img" src="${productImages[0]}" class="main-modal-img" style="width: 100%; max-height: 300px; object-fit: contain; border-radius: 10px; background: #111;" onerror="this.src='${placeholder}'">
            ${modalThumbsHtml}
        </div>
        <div class="modal-info-section" style="text-align: center; padding-top: 15px;">
            <h2 style="margin-bottom: 10px;">${p.name}</h2>
            
            <p class="modal-description" style="color: #67756a; line-height: 1.6; margin-bottom: 15px; font-size: 0.95rem;">
                ${p.description || 'لا يوجد وصف متاح لهذا المنتج.'}
            </p>

            <div style="display: flex; justify-content: center; gap: 15px; margin-bottom: 15px; color: #000000;">
                <span><strong>الحالة:</strong> ${p.status || 'مستعمل'}</span>
                <span><strong>الطول:</strong> ${p.length || '--'}</span>
            </div>

            <p class="modal-price-tag" style="font-weight:bold; font-size:1.8rem; color:var(--primary-orange); margin-bottom: 10px;">${p.price}</p>
            <p style="color: #27ae60; margin: 20px; font-size: 0.9rem;"><i class="fas fa-truck"></i> التوصيل لكل المدن - الدفع عند الاستلام</p>
        </div>
    `;
    modal.style.display = 'flex';
}
function changeModalImage(thumb) {
    const mainImg = document.getElementById('main-modal-img');
    if (mainImg) {
        mainImg.src = thumb.src;
        thumb.parentElement.querySelectorAll('.modal-thumb').forEach(t => {
            t.style.borderColor = "#333";
            t.classList.remove('active');
        });
        thumb.style.borderColor = "var(--primary-orange)";
        thumb.classList.add('active');
    }
}

function closeModal() { modal.style.display = 'none'; }
function closePolicyModal() { policyModal.style.display = 'none'; }

function sendWhatsApp() {
    if (!selectedProduct) return;
    const text = `السلام عليكم، أريد الاستفسار عن: ${selectedProduct.name} (السعر: ${selectedProduct.price})`;
    window.open(`https://wa.me/${myPhoneNumber}?text=${encodeURIComponent(text)}`, '_blank');
}

// --- 7. إدارة النقرات ---
window.onclick = (e) => {
    if (e.target == modal) closeModal();
    if (e.target == policyModal) closePolicyModal();
    
    const navLinks = document.querySelector('.nav-links');
    const menuToggle = document.querySelector('.menu-toggle');
    if (navLinks && navLinks.classList.contains('active')) {
        if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
            navLinks.classList.remove('active');
        }
    }
};

// --- 8. وظيفة البحث ---
function handleSearch(query) {
    const term = query.toLowerCase().trim();
    if (term === "") {
        render(allProducts);
        return;
    }
    const filtered = allProducts.filter(p => 
        p.name.toLowerCase().includes(term) || 
        (p.cat && p.cat.toLowerCase().includes(term))
    );
    render(filtered);
}

if(whatsappBtn) whatsappBtn.onclick = sendWhatsApp;
document.addEventListener('DOMContentLoaded', () => render(allProducts));