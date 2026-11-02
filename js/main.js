/**
 * De Hotel - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initMobileMenu();
    initFeaturedRooms();
    initSearchForm();
});

// Header scroll effect
function initHeader() {
    const header = document.querySelector('.header');
    if (!header) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Mobile navigation drawer toggle
function initMobileMenu() {
    const toggleBtn = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (toggleBtn && navLinks) {
        toggleBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = toggleBtn.querySelector('i');
            if (icon) {
                if (navLinks.classList.contains('active')) {
                    icon.className = 'fas fa-times';
                } else {
                    icon.className = 'fas fa-bars';
                }
            }
        });
    }
}

// Toast notification display
function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const iconClass = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    toast.innerHTML = `
        <i class="fas ${iconClass}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Render Featured Rooms on Homepage
function initFeaturedRooms() {
    const featuredContainer = document.getElementById('featured-rooms-grid');
    if (!featuredContainer) return;

    const rooms = DataStore.getRooms().filter(room => room.featured);
    featuredContainer.innerHTML = rooms.map(room => createRoomCardHtml(room)).join('');
}

// Create HTML markup for room card
function createRoomCardHtml(room) {
    return `
        <div class="room-card">
            <div class="room-img-wrapper">
                <img src="${room.image}" alt="${room.name}" loading="lazy">
                <span class="room-category-badge">${room.categoryName}</span>
                <div class="room-price-badge">
                    <span class="amount">${formatCurrency(room.price)}</span>
                    <span class="unit">/ đêm</span>
                </div>
            </div>
            <div class="room-content">
                <div class="room-header">
                    <h3 class="room-title">${room.name}</h3>
                    <div class="room-rating">
                        <i class="fas fa-star"></i>
                        <span>${room.rating}</span>
                    </div>
                </div>
                <div class="room-features">
                    <span><i class="fas fa-vector-square"></i> ${room.size}</span>
                    <span><i class="fas fa-user-friends"></i> ${room.capacity} Khách</span>
                    <span><i class="fas fa-bed"></i> ${room.bed}</span>
                </div>
                <p class="room-desc">${room.description}</p>
                <div class="room-actions">
                    <button class="btn btn-outline-gold btn-sm" onclick="openRoomDetailModal('${room.id}')">
                        <i class="fas fa-eye"></i> Chi tiết
                    </button>
                    <a href="booking.html?roomId=${room.id}" class="btn btn-gold btn-sm">
                        <i class="fas fa-calendar-check"></i> Đặt phòng
                    </a>
                </div>
            </div>
        </div>
    `;
}

// Handle Homepage Quick Search Form
function initSearchForm() {
    const searchForm = document.getElementById('home-search-form');
    if (!searchForm) return;

    // Set default check-in to today, check-out to tomorrow
    const checkInInput = searchForm.querySelector('#search-checkin');
    const checkOutInput = searchForm.querySelector('#search-checkout');

    if (checkInInput && checkOutInput) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 2);

        checkInInput.value = today.toISOString().split('T')[0];
        checkOutInput.value = tomorrow.toISOString().split('T')[0];

        checkInInput.min = today.toISOString().split('T')[0];
        checkInInput.addEventListener('change', () => {
            checkOutInput.min = checkInInput.value;
            if (checkOutInput.value <= checkInInput.value) {
                const nextDay = new Date(checkInInput.value);
                nextDay.setDate(nextDay.getDate() + 1);
                checkOutInput.value = nextDay.toISOString().split('T')[0];
            }
        });
    }

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const category = searchForm.querySelector('#search-category')?.value || 'all';
        const checkin = checkInInput?.value || '';
        const checkout = checkOutInput?.value || '';
        const guests = searchForm.querySelector('#search-guests')?.value || '2';

        window.location.href = `rooms.html?category=${category}&checkin=${checkin}&checkout=${checkout}&guests=${guests}`;
    });
}

// Room Detail Modal Handler
function openRoomDetailModal(roomId) {
    const room = DataStore.getRoomById(roomId);
    if (!room) return;

    let modal = document.getElementById('room-detail-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'room-detail-modal';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="modal-content">
            <span class="modal-close" onclick="closeModal('room-detail-modal')">&times;</span>
            <div style="height: 280px; border-radius: 12px; overflow: hidden; margin-bottom: 20px;">
                <img src="${room.image}" alt="${room.name}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <h2 style="font-family: var(--font-heading); font-size: 1.8rem;">${room.name}</h2>
                <div style="font-size: 1.3rem; color: var(--gold-dark); font-weight: 700;">
                    ${formatCurrency(room.price)} <span style="font-size: 0.8rem; color: var(--text-muted);">/ đêm</span>
                </div>
            </div>
            <div style="display: flex; gap: 20px; margin-bottom: 16px; font-size: 0.9rem; color: var(--text-secondary);">
                <span><i class="fas fa-vector-square" style="color: var(--gold);"></i> Diện tích: ${room.size}</span>
                <span><i class="fas fa-user-friends" style="color: var(--gold);"></i> Sức chứa: ${room.capacity} Khách</span>
                <span><i class="fas fa-eye" style="color: var(--gold);"></i> Tầm nhìn: ${room.view}</span>
            </div>
            <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 20px;">${room.description}</p>
            <h4 style="margin-bottom: 12px; color: var(--primary);">Tiện ích phòng cao cấp:</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 24px;">
                ${room.amenities.map(a => `<div style="font-size: 0.9rem;"><i class="fas fa-check-circle" style="color: var(--gold); margin-right: 8px;"></i>${a}</div>`).join('')}
            </div>
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button class="btn btn-outline-gold" onclick="closeModal('room-detail-modal')">Đóng</button>
                <a href="booking.html?roomId=${room.id}" class="btn btn-gold">Đặt phòng ngay</a>
            </div>
        </div>
    `;

    modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}
