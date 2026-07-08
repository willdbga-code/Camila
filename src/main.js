// --- Import and setup state ---
let allImages = [];
let filteredImages = [];
let currentIndex = 0; // For lightbox
const IMAGES_PER_PAGE = 12;
let visibleCount = IMAGES_PER_PAGE;
let activeFilter = 'all';

// --- DOM Elements ---
const header = document.getElementById('main-header');
const menuToggle = document.getElementById('menu-toggle');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const cursor = document.getElementById('custom-cursor');
const galleryGrid = document.getElementById('gallery-grid');
const btnLoadMore = document.getElementById('btn-load-more');
const filterBtns = document.querySelectorAll('.filter-btn');

// Lightbox Elements
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev = document.getElementById('lightbox-prev');
const lightboxNext = document.getElementById('lightbox-next');

// Booking Form
const bookingForm = document.getElementById('booking-form');
const formStatus = document.getElementById('form-status');

// --- Custom Cursor Logic ---
if (cursor) {
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    // Add hover state class
    const hoverElements = document.querySelectorAll('a, button, select, input, textarea, .gallery-item');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
    });
}

// --- Mobile Navigation Menu ---
if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : 'auto';
    });
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });
}

// --- Sticky Header on Scroll ---
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    // Active navigation state highlight based on viewport
    const scrollPosition = window.scrollY + 200;
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');
        
        if (scrollPosition >= top && scrollPosition < top + height) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${id}`) {
                    link.classList.add('active');
                }
            });
        }
    });
});

// --- Scroll Reveal Animation ---
const revealElements = document.querySelectorAll('.reveal-item');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('reveal-active');
            revealObserver.unobserve(entry.target); // Reveal once
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

// --- Fetch and Setup Portfolio Images ---
async function init() {
    try {
        const response = await fetch('./images.json');
        if (!response.ok) throw new Error('Falha ao carregar imagens.');
        allImages = await response.json();
        
        setupHeroAndAbout();
        setupGallery();
    } catch (error) {
        console.error('Error fetching image metadata:', error);
        // Fallback or error display inside grid
        if (galleryGrid) {
            galleryGrid.innerHTML = `
                <div class="gallery-loader">
                    <p style="color: var(--bronze);">Ops! Não foi possível carregar as imagens do portfolio.</p>
                </div>
            `;
        }
    }
}

function setupHeroAndAbout() {
    const hero1 = document.getElementById('hero-img-1');
    const hero2 = document.getElementById('hero-img-2');
    const hero3 = document.getElementById('hero-img-3');
    const aboutProfile = document.getElementById('about-img-profile');
    
    if (hero1) hero1.src = './images/optimized/Camila-1_of_18.webp';
    if (hero2) hero2.src = './images/optimized/Camila-12_of_18.webp';
    if (hero3) hero3.src = './images/optimized/Camila-15_of_18.webp';
    if (aboutProfile) aboutProfile.src = './images/optimized/Camila-18_of_18.webp';
}

// --- Gallery Layout and Logic ---
function setupGallery() {
    renderGallery();
    setupLightbox();
}

function renderGallery() {
    if (!galleryGrid) return;
    
    galleryGrid.innerHTML = '';
    galleryGrid.classList.add('categories-view');
    
    const categories = [
        {
            id: 'noivas',
            title: 'Noivas (Bridal)',
            tag: 'BRIDAL',
            desc: 'Penteados exclusivos e de alta durabilidade para o seu grande dia.',
            coverImg: './images/optimized/portfolio_1.webp',
            count: allImages.filter(img => img.category === 'noivas').length
        },
        {
            id: 'editorial',
            title: 'Editorial & Eventos',
            tag: 'SOCIAL & EDITORIAL',
            desc: 'Estilo contemporâneo para madrinhas, convidadas, formandas e campanhas.',
            coverImg: './images/optimized/portfolio_2.webp',
            count: allImages.filter(img => img.category === 'editorial').length
        },
        {
            id: 'classicos',
            title: 'Clássicos Atemporais',
            tag: 'CLASSICS',
            desc: 'Coques refinados e técnicas clássicas de extrema elegância.',
            coverImg: './images/optimized/portfolio_3.webp',
            count: allImages.filter(img => img.category === 'classicos').length
        }
    ];
    
    categories.forEach(cat => {
        const card = document.createElement('div');
        card.className = 'category-card';
        card.innerHTML = `
            <div class="category-img-wrapper">
                <img src="${cat.coverImg}" alt="${cat.title}" class="category-cover-img" loading="lazy">
                <div class="category-overlay"></div>
                <div class="category-content">
                    <span class="category-tag">${cat.tag}</span>
                    <h3 class="category-title">${cat.title}</h3>
                    <p class="category-desc">${cat.desc}</p>
                    <span class="category-action">Ver Galeria (${cat.count} criações) &rarr;</span>
                </div>
            </div>
        `;
        
        // Add custom cursor hover logic to category card
        if (cursor) {
            card.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
            card.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
        }
        
        card.addEventListener('click', () => {
            openLightbox(cat.id, 0);
        });
        
        galleryGrid.appendChild(card);
    });
    
    if (btnLoadMore) {
        btnLoadMore.style.display = 'none';
    }
}

// --- Lightbox Implementation with Carousel/Swipe Slider ---
let lightboxImages = [];
let lightboxCurrentIdx = 0;

function setupLightbox() {
    if (!lightbox) return;
    
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', showPrevImage);
    lightboxNext.addEventListener('click', showNextImage);
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') showPrevImage();
        if (e.key === 'ArrowRight') showNextImage();
    });
    
    // Close on background click
    const bg = lightbox.querySelector('.lightbox-bg');
    if (bg) bg.addEventListener('click', closeLightbox);
    
    // Touch Swipe Slider Support
    let touchstartX = 0;
    let touchendX = 0;
    
    lightbox.addEventListener('touchstart', e => {
        touchstartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    lightbox.addEventListener('touchend', e => {
        touchendX = e.changedTouches[0].screenX;
        const diffX = touchendX - touchstartX;
        if (Math.abs(diffX) > 50) {
            if (diffX < 0) {
                showNextImage();
            } else {
                showPrevImage();
            }
        }
    }, { passive: true });
}

function openLightbox(category, startIndex = 0) {
    lightboxImages = allImages.filter(img => img.category === category);
    lightboxCurrentIdx = startIndex;
    
    // Create dot indicators dynamically
    const dotsContainer = document.getElementById('lightbox-dots-container');
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        lightboxImages.forEach((_, idx) => {
            const dot = document.createElement('button');
            dot.className = 'lightbox-dot';
            dot.setAttribute('aria-label', `Ir para imagem ${idx + 1}`);
            dot.addEventListener('click', () => {
                lightboxCurrentIdx = idx;
                updateLightboxContent();
            });
            dotsContainer.appendChild(dot);
        });
    }
    
    updateLightboxContent();
    
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function updateLightboxContent() {
    if (lightboxImages.length === 0) return;
    const imgData = lightboxImages[lightboxCurrentIdx];
    
    lightboxImg.src = ''; 
    lightboxImg.src = imgData.optimized_url;
    
    let catTitle = imgData.category.toUpperCase();
    if (imgData.category === 'noivas') catTitle = 'NOIVAS';
    if (imgData.category === 'editorial') catTitle = 'SOCIAL & EDITORIAL';
    if (imgData.category === 'classicos') catTitle = 'CLÁSSICOS ATEMPORAIS';
    
    lightboxCaption.textContent = `${catTitle} • #${imgData.id} (${lightboxCurrentIdx + 1} de ${lightboxImages.length})`;
    
    // Update progress bar
    const progressBar = document.getElementById('lightbox-progress-bar');
    if (progressBar) {
        const percentage = ((lightboxCurrentIdx + 1) / lightboxImages.length) * 100;
        progressBar.style.width = `${percentage}%`;
    }
    
    // Update active dot class
    const dots = document.querySelectorAll('.lightbox-dot');
    dots.forEach((dot, idx) => {
        if (idx === lightboxCurrentIdx) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

function closeLightbox() {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'auto';
}

function showPrevImage() {
    if (lightboxImages.length === 0) return;
    lightboxCurrentIdx = (lightboxCurrentIdx - 1 + lightboxImages.length) % lightboxImages.length;
    updateLightboxContent();
}

function showNextImage() {
    if (lightboxImages.length === 0) return;
    lightboxCurrentIdx = (lightboxCurrentIdx + 1) % lightboxImages.length;
    updateLightboxContent();
}

// --- Contact Form Booking Simulation ---
if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('form-name').value;
        const email = document.getElementById('form-email').value;
        const phone = document.getElementById('form-phone').value;
        const serviceSelect = document.getElementById('form-service');
        const service = serviceSelect.options[serviceSelect.selectedIndex].text;
        const date = document.getElementById('form-date').value;
        const msg = document.getElementById('form-msg').value;
        
        const submitBtn = bookingForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Direcionando...';
        submitBtn.disabled = true;
        
        // Format WhatsApp message
        let waText = `Olá Camila! Gostaria de solicitar um orçamento:\n\n`;
        waText += `*Nome:* ${name}\n`;
        waText += `*E-mail:* ${email}\n`;
        waText += `*WhatsApp:* ${phone}\n`;
        waText += `*Serviço:* ${service}\n`;
        if (date) {
            const formattedDate = date.split('-').reverse().join('/');
            waText += `*Data Estimada:* ${formattedDate}\n`;
        }
        waText += `*Detalhes:* ${msg}`;
        
        const encodedText = encodeURIComponent(waText);
        const waUrl = `https://wa.me/5512991132214?text=${encodedText}`;
        
        // Simulating booking process
        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            
            formStatus.className = 'form-status success';
            formStatus.textContent = 'Obrigado! Redirecionando para o WhatsApp...';
            
            // Redirect to WhatsApp
            window.open(waUrl, '_blank');
            bookingForm.reset();
            
            // Auto hide message after 6s
            setTimeout(() => {
                formStatus.style.display = 'none';
            }, 6000);
        }, 1200);
    });
}

// Start Project
document.addEventListener('DOMContentLoaded', init);
