// ==========================================
// 1. SUPABASE (Kosongan, ubah saat siap)
// ==========================================
const supabaseUrl = 'https://bxwvagtuyerqjmqkkmta.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4d3ZhZ3R1eWVycWptcWtrbXRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4MjIxMTAsImV4cCI6MjEwNDM5ODExMH0.jkJAEQ9Hvj-_LgF8g0XYEOs7ScVySlG8aYqT1K-UC1A';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// ==========================================
// 2. STATE & DATA (Mockup Database)
// ponytail: Karena ga ada backend sementara, kita pakai state array untuk mendemonstrasikan
// ==========================================
let currentUser = null;
let chats = [{ sender: 'Sistem', text: 'Selamat datang di E-Kantin' }];
let menus = [
    { id: 1, nama: 'Es Teh', harga: 5000, varian: ['Manis', 'Tawar'], stok: 15 }
];

// Load Tema dari LocalStorage
const savedTheme = localStorage.getItem('ekantin_theme');
if (savedTheme) ubahTema(savedTheme);

function ubahTema(color) {
    document.documentElement.style.setProperty('--primary', color);
    document.getElementById('theme-color').value = color;
    localStorage.setItem('ekantin_theme', color);
}

// ==========================================
// 3. AUTENTIKASI SATU PINTU (Tanpa Email)
// ==========================================
function login() {
    const username = document.getElementById('login-user').value.trim().toLowerCase();
    const pass = document.getElementById('login-pass').value;

    if (!username || !pass) return alert('Isi username dan password!');

    // Penentuan Role otomatis berdasarkan nama user
    let role = 'pembeli';
    if (username === 'admin') role = 'admin';
    else if (username.includes('kantin')) role = 'kantin';

    currentUser = { username, role };

    document.getElementById('login-view').classList.add('hidden');
    
    // Tampilkan interface sesuai role
    if (role === 'pembeli') {
        document.getElementById('pembeli-name').innerText = `Halo, ${username}!`;
        document.getElementById('pembeli-pfp').src = `https://ui-avatars.com/api/?name=${username}`;
        document.getElementById('pembeli-view').classList.remove('hidden');
        renderMenu();
    } else if (role === 'kantin') {
        document.getElementById('kantin-view').classList.remove('hidden');
        renderStok();
    } else {
        document.getElementById('admin-view').classList.remove('hidden');
    }

    renderChat();
}

function logout() {
    currentUser = null;
    document.querySelectorAll('.container').forEach(el => el.classList.add('hidden'));
    document.getElementById('login-view').classList.remove('hidden');
}

// ==========================================
// 4. FITUR KANTIN: STOK & MENU
// ==========================================
function tambahMenu() {
    const nama = document.getElementById('input-nama').value;
    const harga = document.getElementById('input-harga').value;
    const varian = document.getElementById('input-varian').value.split(',').map(v => v.trim());
    const stok = parseInt(document.getElementById('input-stok').value);

    if (!nama || !harga || !stok) return alert('Lengkapi data!');

    menus.push({ id: Date.now(), nama, harga, varian, stok });
    alert('Menu ditambahkan!');
    
    // Reset input
    document.querySelectorAll('#kantin-view input[type="text"], #kantin-view input[type="number"]').forEach(i => i.value = '');
    renderStok();
}

function ubahStok(id, jumlah) {
    const menu = menus.find(m => m.id === id);
    if (menu) {
        menu.stok += jumlah;
        if (menu.stok < 0) menu.stok = 0;
        renderStok();
        renderMenu(); // Update tampilan pembeli jika mereka sedang lihat
    }
}

function renderStok() {
    const container = document.getElementById('list-stok');
    container.innerHTML = menus.map(m => `
        <div class="stok-item">
            <span><b>${m.nama}</b> (Stok: ${m.stok})</span>
            <div>
                <button class="btn-alt" onclick="ubahStok(${m.id}, -1)" style="color: black; border-color: #ccc;">-</button>
                <button class="btn-alt" onclick="ubahStok(${m.id}, 1)" style="color: black; border-color: #ccc;">+</button>
            </div>
        </div>
    `).join('');
}

function ubahBanner(event) {
    if(!event.target.files[0]) return;
    const url = URL.createObjectURL(event.target.files[0]);
    document.getElementById('kantin-banner').style.backgroundImage = `url('${url}')`;
}

// ==========================================
// 5. FITUR PEMBELI: PESAN & PFP
// ==========================================
function renderMenu() {
    const container = document.getElementById('katalog-menu');
    container.innerHTML = menus.map(m => `
        <div class="menu-item">
            <div class="header-flex">
                <h4>${m.nama} <small style="color: var(--primary)">Rp ${m.harga}</small></h4>
                <small>Sisa Stok: <b>${m.stok}</b></small>
            </div>
            <div class="flex" style="margin-top: 10px;">
                <select id="var-${m.id}">
                    ${m.varian.map(v => `<option value="${v}">${v}</option>`).join('')}
                </select>
                <input type="text" id="catatan-${m.id}" placeholder="Catatan (opsional)" style="margin-bottom:0;">
                <button onclick="pesanMakanan(${m.id})" style="margin-bottom:0; width: 100px;">Pesan</button>
            </div>
        </div>
    `).join('');
}

function pesanMakanan(id) {
    const menu = menus.find(m => m.id === id);
    if (menu.stok <= 0) return alert('Maaf, stok habis!');
    
    const varian = document.getElementById(`var-${id}`).value;
    const catatan = document.getElementById(`catatan-${id}`).value || 'Tidak ada catatan';
    
    // Supabase insert logic here...
    menu.stok -= 1;
    alert(`Pesanan Berhasil!\nMenu: ${menu.nama} (${varian})\nCatatan: ${catatan}`);
    
    renderMenu();
    renderStok();
}

function ubahPfp(event) {
    if(!event.target.files[0]) return;
    const url = URL.createObjectURL(event.target.files[0]);
    document.getElementById('pembeli-pfp').src = url;
}

// ==========================================
// 6. FITUR GLOBAL: CHAT REALTIME (Mockup)
// ==========================================
function kirimChat(role) {
    const inputEl = document.getElementById(`chat-input-${role}`);
    if (!inputEl.value.trim()) return;

    // Supabase insert logic here...
    chats.push({ sender: currentUser.username, text: inputEl.value });
    inputEl.value = '';
    renderChat();
}

function renderChat() {
    const html = chats.map(c => `<div class="chat-msg"><b>${c.sender}:</b> ${c.text}</div>`).join('');
    
    const boxPembeli = document.getElementById('chat-pembeli');
    const boxKantin = document.getElementById('chat-kantin');
    
    if (boxPembeli) { boxPembeli.innerHTML = html; boxPembeli.scrollTop = boxPembeli.scrollHeight; }
    if (boxKantin) { boxKantin.innerHTML = html; boxKantin.scrollTop = boxKantin.scrollHeight; }
}
