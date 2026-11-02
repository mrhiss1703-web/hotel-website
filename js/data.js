/**
 * De Hotel - Shared Data & LocalStorage Management
 */

const DEFAULT_ROOMS = [
    {
        id: "room-101",
        name: "Deluxe Ocean View",
        category: "deluxe",
        categoryName: "Deluxe",
        price: 2500000, // VND / night
        size: "45m²",
        capacity: 2,
        bed: "1 Giường King Size",
        view: "Hướng Biển",
        rating: 4.9,
        reviewsCount: 128,
        image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
        description: "Phòng Deluxe Hướng Biển với ban công riêng ngắm toàn cảnh hoàng hôn đại dương. Trang bị nội thất gỗ tự nhiên cao cấp và bồn tắm ngâm hiện đại.",
        amenities: ["Wifi miễn phí", "Ban công biển", "Bồn tắm cao cấp", "Điều hòa 2 chiều", "TV 55 inch", "Minibar", "Bữa sáng miễn phí"],
        featured: true,
        available: true
    },
    {
        id: "room-102",
        name: "Executive Suite",
        category: "suite",
        categoryName: "Suite",
        price: 4800000,
        size: "75m²",
        capacity: 3,
        bed: "1 Giường Super King",
        view: "Toàn cảnh Thành phố & Biển",
        rating: 5.0,
        reviewsCount: 96,
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
        description: "Không gian sang trọng chuẩn thượng lưu với phòng khách riêng biệt, minibar cao cấp và dịch vụ butler phục vụ 24/7.",
        amenities: ["Dịch vụ Butler 24/7", "Phòng khách riêng", "Máy pha Coffee Espresso", "Bồn tắm Jacuzzi", "Wifi tốc độ cao", "Bữa sáng tại phòng"],
        featured: true,
        available: true
    },
    {
        id: "room-103",
        name: "Presidential Suite",
        category: "suite",
        categoryName: "SuiteThượng Lưu",
        price: 12000000,
        size: "150m²",
        capacity: 4,
        bed: "2 Giường King Size",
        view: "Panorima 360 Hướng Biển",
        rating: 5.0,
        reviewsCount: 42,
        image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80",
        description: "Căn hộ Suite Tổng Thống đẳng cấp bậc nhất với hồ bơi vô cực riêng trên ban công, phòng ăn 8 người và hệ thống âm thanh Bang & Olufsen cao cấp.",
        amenities: ["Hồ bơi vô cực riêng", "Đưa đón phi trường bằng xe xa xỉ", "Rượu Champagne chào mừng", "Phòng xông hơi Sauna", "Bếp trưởng riêng"],
        featured: true,
        available: true
    },
    {
        id: "room-104",
        name: "Superior Garden View",
        category: "superior",
        categoryName: "Superior",
        price: 1800000,
        size: "38m²",
        capacity: 2,
        bed: "1 Giường đôi hoặc 2 Giường đơn",
        view: "Vườn Nhiệt Đới",
        rating: 4.7,
        reviewsCount: 84,
        image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
        description: "Phòng Superior ngập tràn ánh sáng tự nhiên, nhìn ra khu vườn nhiệt đới xanh mát ngát hương. Lý tưởng cho kỳ nghỉ thư thái nhẹ nhàng.",
        amenities: ["Wifi miễn phí", "Hướng sân vườn", "Vòi tắm hoa sen", "Két an toàn", "Máy sấy tóc", "Trà & Cafe miễn phí"],
        featured: false,
        available: true
    },
    {
        id: "room-105",
        name: "Luxury Family Suite",
        category: "family",
        categoryName: "Gia Đình",
        price: 5500000,
        size: "90m²",
        capacity: 5,
        bed: "2 Giường King + 1 Giường Đơn",
        view: "Hướng Biển & Hồ Bơi",
        rating: 4.9,
        reviewsCount: 110,
        image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
        description: "Thiết kế ấm cúng hoàn hảo cho gia đình với 2 phòng ngủ kết nối, khu vui chơi cho trẻ em và khu sinh hoạt chung rộng rãi.",
        amenities: ["2 Phòng ngủ riêng", "Khu vui chơi trẻ em", "Tủ lạnh gia đình", "Loa Bluetooth smart", "Bữa sáng buffet cho 5 người"],
        featured: true,
        available: true
    },
    {
        id: "room-106",
        name: "Grand Penthouse Ocean",
        category: "penthouse",
        categoryName: "Penthouse",
        price: 18000000,
        size: "220m²",
        capacity: 6,
        bed: "3 Giường King Super",
        view: "Đỉnh Tầng Cao Hướng Biển",
        rating: 5.0,
        reviewsCount: 18,
        image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80",
        description: "Tuyệt tác không gian đỉnh cao tọa lạc tại tầng cao nhất của De Hotel. Sở hữu sân thượng riêng rộng lớn, Jacuzzi ngoài trời và bãi đáp trực thăng.",
        amenities: ["Sân thượng private", "Outdoor Jacuzzi", "Quầy bar riêng", "Dịch vụ Spa tại chỗ", "Quản gia riêng biệt 24/7"],
        featured: false,
        available: true
    }
];

const DEFAULT_BOOKINGS = [
    {
        id: "BK-8921",
        roomId: "room-102",
        roomName: "Executive Suite",
        customerName: "Nguyễn Văn An",
        email: "an.nguyen@example.com",
        phone: "0901234567",
        checkIn: "2026-11-10",
        checkOut: "2026-11-13",
        nights: 3,
        guests: 2,
        totalAmount: 14400000,
        status: "Confirmed", // Confirmed, Pending, Cancelled
        createdAt: "2026-11-01T10:30:00.000Z",
        note: "Yêu cầu phòng tầng cao, kỷ niệm ngày cưới"
    },
    {
        id: "BK-8922",
        roomId: "room-101",
        roomName: "Deluxe Ocean View",
        customerName: "Trần Thị Mai",
        email: "mai.tran@example.com",
        phone: "0987654321",
        checkIn: "2026-11-15",
        checkOut: "2026-11-17",
        nights: 2,
        guests: 2,
        totalAmount: 5000000,
        status: "Pending",
        createdAt: "2026-11-02T08:15:00.000Z",
        note: "Đưa đón tại sân bay"
    },
    {
        id: "BK-8923",
        roomId: "room-105",
        roomName: "Luxury Family Suite",
        customerName: "Lê Hoàng Nam",
        email: "nam.le@example.com",
        phone: "0912345678",
        checkIn: "2026-11-20",
        checkOut: "2026-11-23",
        nights: 3,
        guests: 4,
        totalAmount: 16500000,
        status: "Confirmed",
        createdAt: "2026-11-02T11:00:00.000Z",
        note: "Có 2 trẻ em, bổ sung nôi em bé"
    }
];

// LocalStorage Keys
const STORAGE_KEYS = {
    ROOMS: 'de_hotel_rooms',
    BOOKINGS: 'de_hotel_bookings'
};

// Data Store Manager
const DataStore = {
    getRooms() {
        const stored = localStorage.getItem(STORAGE_KEYS.ROOMS);
        if (!stored) {
            localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(DEFAULT_ROOMS));
            return DEFAULT_ROOMS;
        }
        return JSON.parse(stored);
    },

    saveRooms(rooms) {
        localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
    },

    getRoomById(id) {
        const rooms = this.getRooms();
        return rooms.find(r => r.id === id);
    },

    getBookings() {
        const stored = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
        if (!stored) {
            localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(DEFAULT_BOOKINGS));
            return DEFAULT_BOOKINGS;
        }
        return JSON.parse(stored);
    },

    saveBookings(bookings) {
        localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    },

    addBooking(bookingData) {
        const bookings = this.getBookings();
        const newBooking = {
            id: 'BK-' + Math.floor(1000 + Math.random() * 9000),
            createdAt: new Date().toISOString(),
            status: 'Pending',
            ...bookingData
        };
        bookings.unshift(newBooking);
        this.saveBookings(bookings);
        return newBooking;
    },

    updateBookingStatus(bookingId, newStatus) {
        const bookings = this.getBookings();
        const index = bookings.findIndex(b => b.id === bookingId);
        if (index !== -1) {
            bookings[index].status = newStatus;
            this.saveBookings(bookings);
            return bookings[index];
        }
        return null;
    },

    deleteBooking(bookingId) {
        let bookings = this.getBookings();
        bookings = bookings.filter(b => b.id !== bookingId);
        this.saveBookings(bookings);
    },

    addRoom(roomData) {
        const rooms = this.getRooms();
        const newRoom = {
            id: 'room-' + (rooms.length + 101),
            rating: 5.0,
            reviewsCount: 0,
            available: true,
            ...roomData
        };
        rooms.push(newRoom);
        this.saveRooms(rooms);
        return newRoom;
    },

    toggleRoomAvailability(roomId) {
        const rooms = this.getRooms();
        const room = rooms.find(r => r.id === roomId);
        if (room) {
            room.available = !room.available;
            this.saveRooms(rooms);
            return room;
        }
        return null;
    }
};

// Utilities
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function calculateNights(checkIn, checkOut) {
    if (!checkIn || !checkOut) return 1;
    const date1 = new Date(checkIn);
    const date2 = new Date(checkOut);
    const diffTime = date2.getTime() - date1.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
    return diffDays > 0 ? diffDays : 1;
}
