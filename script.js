// ==========================================
// VARIABEL GLOBAL
// ==========================================
let cart = JSON.parse(sessionStorage.getItem('cartData')) || {};
let autoSlideTimer;

// ==========================================
// SAAT HALAMAN SELESAI DIMUAT (INISIALISASI)
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Logika Form Masuk
    const formMasuk = document.getElementById('formMasuk');
    if (formMasuk) {
        formMasuk.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const meja = document.getElementById('meja').value;
            sessionStorage.setItem('namaPelanggan', username);
            sessionStorage.setItem('nomorMeja', meja);
            window.location.href = "menu.html"; 
        });
    }

    // 2. Logika Slide Promo (Support Mouse Drag & Auto Slide)
    const slider = document.querySelector('.promo-slider');
    if (slider) {
        let slideIndex = 0;
        const totalSlides = document.querySelectorAll('.promo-slide').length;

        // Fungsi untuk menyalakan/mengulang auto-slide
        function mulaiAutoSlide() {
            clearInterval(autoSlideTimer); // Bersihkan timer lama
            autoSlideTimer = setInterval(() => {
                slideIndex++;
                if (slideIndex >= totalSlides) {
                    slideIndex = 0;
                }
                slider.scrollTo({
                    left: slider.clientWidth * slideIndex,
                    behavior: 'smooth'
                });
            }, 3000);
        }

        // Jalankan auto-slide pertama kali
        mulaiAutoSlide();

        // --- LOGIKA KHUSUS KLIK & TARIK MOUSE DI PC ---
        let isDragging = false;
        let startX;
        let scrollLeftPos;

        slider.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.pageX - slider.offsetLeft;
            scrollLeftPos = slider.scrollLeft;
            clearInterval(autoSlideTimer); // Hentikan auto-slide saat lagi ditarik
        });

        slider.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault(); 
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX); // Kecepatan tarik
            slider.scrollLeft = scrollLeftPos - walk;
        });

        slider.addEventListener('mouseup', () => {
            isDragging = false;
            // Evaluasi posisi slide sekarang setelah ditarik
            slideIndex = Math.round(slider.scrollLeft / slider.clientWidth);
            mulaiAutoSlide(); // Nyalakan lagi auto-slide
        });

        slider.addEventListener('mouseleave', () => {
            isDragging = false;
        });

        // Sinkronisasi untuk sentuhan HP (Touch screen)
        slider.addEventListener('scroll', () => {
            if(!isDragging) {
                slideIndex = Math.round(slider.scrollLeft / slider.clientWidth);
            }
        });
    }

    // 3. Load Keranjang
    if (document.getElementById('cart-badge')) {
        updateCartUI();
        if(typeof sinkronkanAngkaInput === "function") {
            sinkronkanAngkaInput();
        }
    }
});

// ==========================================
// FUNGSI PROMO & NAVIGASI
// ==========================================
function tutupPromo() {
    const promoScreen = document.getElementById('promo-screen');
    if(promoScreen) {
        promoScreen.classList.add('hidden');
        clearInterval(autoSlideTimer); // Matikan timer agar hemat memori
    }
}

// ==========================================
// FUNGSI KERANJANG BELANJA
// ==========================================
function updateQty(namaMenu, harga, perubahan) {
    let inputEl = document.getElementById('qty-' + namaMenu);
    let currentQty = parseInt(inputEl.value) || 0;
    let newQty = currentQty + perubahan;

    if (newQty < 0) return; 
    inputEl.value = newQty;

    if (newQty > 0) {
        cart[namaMenu] = { harga: harga, qty: newQty };
    } else {
        delete cart[namaMenu]; 
    }

    simpanKeranjang();
    updateCartUI();
}

function hapusItem(namaMenu) {
    delete cart[namaMenu];
    
    let inputEl = document.getElementById('qty-' + namaMenu);
    if(inputEl) inputEl.value = 0;

    simpanKeranjang();
    updateCartUI();
}

function simpanKeranjang() {
    sessionStorage.setItem('cartData', JSON.stringify(cart));
}

function updateCartUI() {
    let totalItems = 0;
    let totalPrice = 0;
    let cartHTML = '';

    for (let menu in cart) {
        let item = cart[menu];
        totalItems += item.qty;
        let subtotal = item.harga * item.qty;
        totalPrice += subtotal;

        cartHTML += `
            <div class="cart-item">
                <div>
                    <h4>${menu}</h4>
                    <small>${item.qty} x Rp ${item.harga.toLocaleString('id-ID')}</small>
                </div>
                <div style="text-align: right;">
                    <p style="font-weight: bold; margin-bottom: 5px;">Rp ${subtotal.toLocaleString('id-ID')}</p>
                    <button class="btn-remove" onclick="hapusItem('${menu}')">Hapus</button>
                </div>
            </div>
        `;
    }

    const badge = document.getElementById('cart-badge');
    if(badge) badge.innerText = totalItems;

    const container = document.getElementById('cart-items-container');
    if(container) {
        if (totalItems === 0) {
            container.innerHTML = '<p class="empty-cart-msg">Keranjang masih kosong</p>';
        } else {
            container.innerHTML = cartHTML;
        }
    }

    const totalEl = document.getElementById('cart-total');
    if(totalEl) totalEl.innerText = 'Rp ' + totalPrice.toLocaleString('id-ID');
}

function toggleCart() {
    const overlay = document.getElementById('cart-overlay');
    const drawer = document.getElementById('cart-drawer');
    
    overlay.classList.toggle('active');
    drawer.classList.toggle('open');
}

function prosesPembayaran() {
    if (Object.keys(cart).length === 0) {
        alert("Keranjang masih kosong!");
        return;
    }
    window.location.href = "pembayaran.html";
}

function sinkronkanAngkaInput() {
    for (let menuName in cart) {
        let inputEl = document.getElementById('qty-' + menuName);
        if (inputEl) {
            inputEl.value = cart[menuName].qty;
        }
    }
}

// ==========================================
// DATABASE MENU CUSTOM (DYNAMIC RENDERING)
// ==========================================
const dataMenuCustom = {
    "ayam-geprek": {
        namaUtama: "Nasi Ayam Geprek",
        hargaDasar: 15000,
        piringKosong: "img/katalog-2.png", // Gambar awal (polos)
        prefixGambar: "img/geprek", // Awalan nama file untuk gambar kombinasi
        pilihanBahan: [
            { id: "keju", nama: "Keju", gambar: "img/keju.png" },
            { id: "telur", nama: "Telur", gambar: "img/telur.png" },
            { id: "cabai", nama: "Cabai", gambar: "img/cabai.png" }
        ]
    },
    "ayam-goreng": {
        namaUtama: "Nasi Ayam Goreng",
        hargaDasar: 14000,
        piringKosong: "img/nasi-ayam-polos.png", 
        prefixGambar: "img/ayam-goreng",
        pilihanBahan: [
            { id: "sosis", nama: "Sosis", gambar: "img/sosis.png" },
            { id: "telur", nama: "Telur", gambar: "img/telur.png" },
            { id: "kornet", nama: "Kornet", gambar: "img/kornet.png" }
        ]
    },
    "ayam-balado": {
        namaUtama: "Nasi Ayam Balado",
        hargaDasar: 14000,
        piringKosong: "img/nasi-ayam-balado.png", 
        prefixGambar: "img/ayam-balado",
        pilihanBahan: [
            { id: "sosis", nama: "Sosis", gambar: "img/sosis.png" },
            { id: "telur", nama: "Telur", gambar: "img/telur.png" },
            { id: "kornet", nama: "Kornet", gambar: "img/kornet.png" }
        ]
    },
    "mie-goreng": {
        namaUtama: "Mie Goreng",
        hargaDasar: 7000,
        piringKosong: "img/mie-polos.png", 
        prefixGambar: "img/mie-goreng",
        pilihanBahan: [
            // Tambahkan parameter harga dan max (batas tarikan)
            { id: "mie", nama: "Ekstra Mie", gambar: "img/mie-ekstra.png", harga: 1500, max: 2 },
            { id: "telur", nama: "Telur", gambar: "img/telur.png", harga: 3000, max: 2 },
            { id: "sayur", nama: "Sayur", gambar: "img/sayur.png", harga: 0, max: 1 } 
        ]
    },
    "mie-kuah": {
        namaUtama: "Mie Kuah",
        hargaDasar: 7000,
        piringKosong: "img/mie-polos.png", 
        prefixGambar: "img/mie-kuah",
        pilihanBahan: [
            // Tambahkan parameter harga dan max (batas tarikan)
            { id: "mie", nama: "Ekstra Mie", gambar: "img/mie-ekstra.png", harga: 1500, max: 2 },
            { id: "telur", nama: "Telur", gambar: "img/telur.png", harga: 3000, max: 2 },
            { id: "sayur", nama: "Sayur", gambar: "img/sayur.png", harga: 0, max: 1 } 
        ]
    },
    "mie-nyemek": {
        namaUtama: "Mie Nyemek",
        hargaDasar: 8000,
        piringKosong: "img/mie-polos.png", 
        prefixGambar: "img/mie-kuah",
        pilihanBahan: [
            // Tambahkan parameter harga dan max (batas tarikan)
            { id: "mie", nama: "Ekstra Mie", gambar: "img/mie-ekstra.png", harga: 1500, max: 2 },
            { id: "telur", nama: "Telur", gambar: "img/telur.png", harga: 3000, max: 2 },
            { id: "sayur", nama: "Sayur", gambar: "img/sayur.png", harga: 0, max: 1 } 
        ]
    },
    "nasi-telur-sayur-ceplok": {
        namaUtama: "Nasi Telur Sayur Ceplok",
        hargaDasar: 10000,
        piringKosong: "img/nasi-telur-ceplok.png", 
        prefixGambar: "img/sayur-ceplok",
        pilihanBahan: [
            { id: "kangkung", nama: "Kangkung", gambar: "img/kangkung.png", harga: 0, max: 1 },
            { id: "labu", nama: "Sayur Labu", gambar: "img/labu.png", harga: 0, max: 1 },
            { id: "tempe", nama: "Tempe Orak Arik", gambar: "img/tempe.png", harga: 0, max: 1 },
            { id: "terong", nama: "Terong Pedas", gambar: "img/terong.png", harga: 0, max: 1 },
            { id: "toge", nama: "Sayur Toge", gambar: "img/toge.png", harga: 0, max: 1 }
        ]
    },
    "nasi-telur-sayur-dadar": {
        namaUtama: "Nasi Telur Sayur Dadar",
        hargaDasar: 10000,
        piringKosong: "img/nasi-telur-dadar.png", 
        prefixGambar: "img/sayur-dadar",
        pilihanBahan: [
            { id: "kangkung", nama: "Kangkung", gambar: "img/kangkung.png", harga: 0, max: 1 },
            { id: "labu", nama: "Sayur Labu", gambar: "img/labu.png", harga: 0, max: 1 },
            { id: "tempe", nama: "Tempe Orak Arik", gambar: "img/tempe.png", harga: 0, max: 1 },
            { id: "terong", nama: "Terong Pedas", gambar: "img/terong.png", harga: 0, max: 1 },
            { id: "toge", nama: "Sayur Toge", gambar: "img/toge.png", harga: 0, max: 1 }
        ]
    },
    "aneka-nutrisari": {
        namaUtama: "Es Nutrisari",
        hargaDasar: 5000,
        piringKosong: "img/gelas-es.png", // Gambar gelas kosong isi es batu
        prefixGambar: "img/nutrisari",
        mode: "single", // KUNCI UTAMA UNTUK MINUMAN!
        pilihanBahan: [
            // Harga 0 karena sudah termasuk harga dasar Rp 5.000
            { id: "jeruk", nama: "Rasa Jeruk Sweet", gambar: "img/sachet-jeruk.png", harga: 0, max: 1 },
            { id: "melon", nama: "Rasa Melon", gambar: "img/sachet-melon.png", harga: 0, max: 1 },
            { id: "mangga", nama: "Rasa Mangga", gambar: "img/sachet-mangga.png", harga: 0, max: 1 },
            { id: "anggur", nama: "Rasa Anggur", gambar: "img/sachet-anggur.png", harga: 0, max: 1 }
        ]
    }
    // Kamu bisa tambah menu lain di sini tanpa perlu bikin file HTML baru!
};

// Fungsi memicu perpindahan ke halaman Bikin Sendiri
function bukaCustom(idMenu) {
    sessionStorage.setItem('menuAktif', idMenu);
    window.location.href = 'bikin-sendiri.html';
}