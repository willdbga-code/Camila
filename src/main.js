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

// Dynamically assign hero and about photos using specific indices
function setupHeroAndAbout() {
    // We choose items:
    // Hero 1: index 0
    // Hero 2: index 3
    // Hero 3: index 6
    // About profile: index 9
    
    const hero1 = document.getElementById('hero-img-1');
    const hero2 = document.getElementById('hero-img-2');
    const hero3 = document.getElementById('hero-img-3');
    const aboutProfile = document.getElementById('about-img-profile');
    
    if (allImages.length > 10) {
        if (hero1) hero1.src = allImages[0].optimized_url;
        if (hero2) hero2.src = allImages[3].optimized_url;
        if (hero3) hero3.src = allImages[6].optimized_url;
        if (aboutProfile) aboutProfile.src = allImages[9].optimized_url;
    } else if (allImages.length > 0) {
        // Fallback
        if (hero1) hero1.src = allImages[0].optimized_url;
        if (hero2) hero2.src = allImages[0].optimized_url;
        if (hero3) hero3.src = allImages[0].optimized_url;
        if (aboutProfile) aboutProfile.src = allImages[0].optimized_url;
    }
}

// --- Gallery Layout and Logic ---
function setupGallery() {
    filterImages();
    renderGallery();
    setupFilters();
    setupLightbox();
}

function filterImages() {
    if (activeFilter === 'all') {
        filteredImages = allImages;
    } else {
        filteredImages = allImages.filter(img => img.category === activeFilter);
    }
    visibleCount = IMAGES_PER_PAGE;
}

function renderGallery() {
    if (!galleryGrid) return;
    
    // Clear loader or old content
    galleryGrid.innerHTML = '';
    
    const slice = filteredImages.slice(0, visibleCount);
    
    if (slice.length === 0) {
        galleryGrid.innerHTML = `
            <div class="gallery-loader">
                <p>Nenhuma imagem encontrada nesta categoria.</p>
            </div>
        `;
        btnLoadMore.style.display = 'none';
        return;
    }
    
    slice.forEach((img, idx) => {
        // Calculate asymmetric spans to build a gorgeous grid layout
        // Portrait photos fit beautifully in high columns (span-h2) or double sizes
        let spanClass = '';
        
        // Custom index-based aesthetic layout pattern
        const patternIdx = idx % 6;
        if (patternIdx === 1) {
            spanClass = 'span-h2'; // High tall image
        } else if (patternIdx === 3) {
            spanClass = 'span-w2'; // Double width
        } else if (patternIdx === 4) {
            spanClass = 'span-w2 span-h2'; // Large accent image
        }
        
        const item = document.createElement('div');
        item.className = `gallery-item ${spanClass}`;
        item.innerHTML = `
            <div class="gallery-img-wrapper">
                 <img src="${img.thumbnail_url}" alt="Penteado por Camila Ferraz" class="gallery-thumb" loading="lazy">
                <div class="img-overlay"></div>
                <div class="gallery-info">
                    <span class="gallery-cat">${img.category}</span>
                    <h4 class="gallery-title">Visual #${img.id}</h4>
                </div>
            </div>
        `;
        
        // Open Lightbox on Click
        item.addEventListener('click', () => {
            openLightbox(allImages.indexOf(img));
        });
        
        galleryGrid.appendChild(item);
        
        // Trigger entrance effect with micro-delay for staggered animation
        setTimeout(() => {
            item.classList.add('show');
        }, idx * 50);
    });
    
    // Show / Hide Load More
    if (visibleCount >= filteredImages.length) {
        btnLoadMore.style.display = 'none';
    } else {
        btnLoadMore.style.display = 'inline-block';
    }
    
    // Re-attach cursor hover logic for new elements
    if (cursor) {
        const newItems = galleryGrid.querySelectorAll('.gallery-item');
        newItems.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
        });
    }
}

function setupFilters() {
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            activeFilter = btn.getAttribute('data-filter');
            filterImages();
            
            // Fade grid effect
            galleryGrid.style.opacity = '0';
            setTimeout(() => {
                renderGallery();
                galleryGrid.style.opacity = '1';
            }, 300);
        });
    });
}

// Load More Click Handler
if (btnLoadMore) {
    btnLoadMore.addEventListener('click', () => {
        visibleCount += IMAGES_PER_PAGE;
        renderGallery();
    });
}

// --- Lightbox Implementation ---
function setupLightbox() {
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
    lightbox.querySelector('.lightbox-bg').addEventListener('click', closeLightbox);
}

function openLightbox(index) {
    currentIndex = index;
    const imgData = allImages[currentIndex];
    
    lightboxImg.src = ''; // Clear source to prevent flashing old image
    lightboxImg.src = imgData.optimized_url;
    lightboxCaption.textContent = `Visual #${imgData.id} • ${imgData.category.toUpperCase()}`;
    
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'auto';
}

function showPrevImage() {
    currentIndex = (currentIndex - 1 + allImages.length) % allImages.length;
    openLightbox(currentIndex);
}

function showNextImage() {
    currentIndex = (currentIndex + 1) % allImages.length;
    openLightbox(currentIndex);
}

// --- Contact Form Booking Simulation ---
if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const submitBtn = bookingForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Processando...';
        submitBtn.disabled = true;
        
        // Simulating booking process
        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            
            formStatus.className = 'form-status success';
             formStatus.textContent = 'Obrigado! Sua solicitação de reserva foi enviada. Camila Ferraz retornará em breve por WhatsApp.';
            bookingForm.reset();
            
            // Auto hide message after 6s
            setTimeout(() => {
                formStatus.style.display = 'none';
            }, 6000);
        }, 1500);
    });
}

// Start Project
document.addEventListener('DOMContentLoaded', init);
