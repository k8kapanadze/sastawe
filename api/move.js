<!DOCTYPE html>
<html lang="ka">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>სასტაWE - Admin</title>
    <script src="https://upload-widget.cloudinary.com/global/all.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { font-family: -apple-system, sans-serif; background: #000; color: #fff; margin: 0; overflow: hidden; }
        .grid-view { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
        .ios-blur { background: rgba(0, 0, 0, 0.9); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
        .selected-img { border: 4px solid #3b82f6; position: relative; opacity: 0.6; transform: scale(0.92); transition: 0.2s; }
        .selected-img::after { 
            content: "✓"; position: absolute; top: 10px; right: 10px;
            background: #3b82f6; color: white; border-radius: 50%; width: 22px; height: 22px; 
            display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; 
        }
        #viewer { display: none; position: fixed; inset: 0; background: #000; z-index: 1000; touch-action: none; }
        #viewer-slider { display: flex; height: 100%; transition: transform 0.3s cubic-bezier(0.15, 0.3, 0.25, 1); will-change: transform; width: 100%; }
        .slide { min-width: 100vw; width: 100vw; height: 100%; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
        .slide img { max-width: 100%; max-height: 100%; object-fit: contain; pointer-events: none; -webkit-user-drag: none; }
        #move-modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 2000; align-items: center; justify-content: center; padding: 20px; }
        .loading-bar { height: 3px; background: #3b82f6; width: 0%; transition: width 0.3s; position: fixed; top: 0; left: 0; z-index: 9999; }
    </style>
</head>
<body onload="checkAutoLogin()">

    <div id="loading-progress" class="loading-bar"></div>

    <div id="auth-screen" class="fixed inset-0 bg-black z-[3000] flex flex-col items-center justify-center p-6 text-center">
        <h2 class="text-4xl font-black italic mb-10 tracking-tighter uppercase">სასტაWE</h2>
        <input type="password" id="pin-input" placeholder="••••" class="w-full max-w-xs text-center text-3xl bg-zinc-900 p-4 rounded-2xl mb-4 focus:outline-none border border-zinc-800 text-white">
        <button onclick="checkAuth()" class="bg-white text-black w-full max-w-xs p-4 rounded-2xl font-bold uppercase active:scale-95 transition">შესვლა</button>
    </div>

    <div id="app-content" class="hidden h-screen flex flex-col">
        <header class="ios-blur p-5 flex justify-between items-center border-b border-zinc-900 sticky top-0 z-50">
            <div onclick="logout()" class="active:opacity-50 cursor-pointer">
                <h1 id="header-title" class="text-xl font-black italic uppercase tracking-tighter">სასტაWE</h1>
                <p id="selection-count" class="hidden text-[10px] text-blue-500 font-bold uppercase mt-1">0 მონიშნული</p>
                <p class="text-[8px] text-zinc-500 font-bold uppercase">გამოსვლა</p>
            </div>
            <div class="flex gap-4 items-center">
                <button id="select-mode-btn" onclick="toggleSelectMode()" class="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">მონიშვნა</button>
                <button onclick="openUploadWidget()" class="bg-blue-600 text-white w-8 h-8 rounded-full font-bold text-lg flex items-center justify-center active:scale-90 transition">+</button>
            </div>
        </header>

        <div id="action-bar" class="hidden fixed bottom-24 left-4 right-4 h-16 ios-blur border border-zinc-800 rounded-2xl z-[100] flex items-center justify-around px-2 shadow-2xl">
            <button onclick="selectAll()" class="text-zinc-400 text-[9px] font-bold uppercase">ყველა</button>
            <div class="h-6 w-[1px] bg-zinc-800"></div>
            <button onclick="downloadSelected()" class="text-green-500 text-[9px] font-bold uppercase">ჩამოტვირთვა</button>
            <div class="h-6 w-[1px] bg-zinc-800"></div>
            <button onclick="openMoveModal()" class="text-blue-500 text-[9px] font-bold uppercase">გადატანა</button>
            <div class="h-6 w-[1px] bg-zinc-800"></div>
            <button onclick="deleteSelected()" class="text-red-500 text-[9px] font-bold uppercase">წაშლა</button>
        </div>

        <main id="main-scroll" class="flex-1 overflow-y-auto pb-32">
            <div id="view-library" class="grid-view"></div>
            <div id="view-albums" class="hidden p-4">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xs font-bold text-zinc-500 uppercase tracking-widest">ალბომები</h2>
                    <button onclick="addNewAlbum()" class="text-[10px] bg-zinc-900 text-white px-3 py-1.5 rounded-lg active:scale-95 transition">+ ახალი</button>
                </div>
                <div id="albums-grid" class="grid grid-cols-2 gap-3"></div>
            </div>
        </main>

        <nav class="ios-blur fixed bottom-0 left-0 right-0 h-20 border-t border-zinc-900 flex justify-around items-center z-50">
            <button onclick="switchTab('library')" id="nav-lib" class="flex-1 flex flex-col items-center gap-1 text-white">
                <span class="text-[10px] font-bold uppercase tracking-widest">გალერეა</span>
            </button>
            <button onclick="switchTab('albums')" id="nav-alb" class="flex-1 flex flex-col items-center gap-1 text-zinc-600">
                <span class="text-[10px] font-bold uppercase tracking-widest">ალბომები</span>
            </button>
        </nav>
    </div>

    <div id="move-modal">
        <div class="bg-zinc-900 w-full max-w-sm rounded-3xl overflow-hidden border border-zinc-800">
            <div class="p-5 border-b border-zinc-800 flex justify-between items-center">
                <span class="text-xs font-bold uppercase tracking-widest text-zinc-400">გადატანა</span>
                <button onclick="closeMoveModal()" class="text-zinc-500 text-xl">✕</button>
            </div>
            <div id="move-albums-list" class="max-h-[350px] overflow-y-auto p-2"></div>
        </div>
    </div>

    <div id="viewer">
        <div class="absolute top-12 left-5 z-[1100] bg-black/40 backdrop-blur-md px-5 py-2 rounded-full text-[10px] font-bold uppercase" onclick="closeViewer()">← უკან</div>
        <div id="viewer-slider"></div>
    </div>

    <script>
        const CLOUD_NAME = "djdz4uygc";
        const UPLOAD_PRESET = "sastawe";
        const PASS = "გიჟურად";
        
        let CURRENT_TAG = "shared_vault";
        let allPhotos = [];
        let selectedPhotos = new Set();
        let isSelectMode = false;
        let albums = JSON.parse(localStorage.getItem('vault_albums')) || ["shared_vault", "party", "trip"];

        // --- AUTH ---
        function checkAutoLogin() {
            if (localStorage.getItem('isAuth') === 'true') {
                document.getElementById('auth-screen').style.display = 'none';
                document.getElementById('app-content').classList.remove('hidden');
                loadGallery(CURRENT_TAG);
            }
        }

        function checkAuth() {
            if(document.getElementById('pin-input').value === PASS) {
                localStorage.setItem('isAuth', 'true');
                location.reload();
            } else { alert("არასწორი პაროლი!"); }
        }

        function logout() {
            if(confirm("ნამდვილად გსურთ გამოსვლა?")) {
                localStorage.removeItem('isAuth');
                location.reload();
            }
        }

        // --- CORE ---
        async function loadGallery(tag) {
            CURRENT_TAG = tag;
            document.getElementById('header-title').innerText = (tag === "shared_vault") ? "სასტაWE" : tag.replace(/_/g, ' ');
            const grid = document.getElementById('view-library');
            grid.innerHTML = '<div class="col-span-3 text-center p-20 text-zinc-600 text-[10px] uppercase italic">იტვირთება...</div>';
            
            try {
                const res = await fetch(`https://res.cloudinary.com/${CLOUD_NAME}/image/list/v${Date.now()}/${tag}.json`);
                const data = await res.json();
                allPhotos = data.resources.map(img => ({
                    id: img.public_id,
                    src: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/v${img.version}/${img.public_id}.${img.format}`
                }));
                renderGrid();
            } catch (e) {
                grid.innerHTML = '<div class="col-span-3 text-center p-20 text-zinc-800 text-[10px] uppercase">ცარიელია</div>'; 
            }
        }

        function renderGrid() {
            const grid = document.getElementById('view-library');
            grid.innerHTML = allPhotos.map((img, i) => `
                <div id="img-${i}" class="aspect-square bg-zinc-900 overflow-hidden relative" onclick="handleImgClick(${i})">
                    <img src="${img.src.replace('/upload/', '/upload/w_400,c_fill,q_auto,f_auto/')}" class="w-full h-full object-cover">
                </div>
            `).join('');
        }

        function handleImgClick(index) {
            if (isSelectMode) {
                const el = document.getElementById(`img-${index}`);
                selectedPhotos.has(index) ? selectedPhotos.delete(index) : selectedPhotos.add(index);
                el.classList.toggle('selected-img');
                updateSelectionCount();
            } else { openViewer(index); }
        }

        function toggleSelectMode() {
            isSelectMode = !isSelectMode;
            selectedPhotos.clear();
            document.getElementById('select-mode-btn').innerText = isSelectMode ? "გაუქმება" : "მონიშვნა";
            document.getElementById('action-bar').classList.toggle('hidden', !isSelectMode);
            updateSelectionCount();
            if (!isSelectMode) renderGrid();
        }

        function updateSelectionCount() {
            const countEl = document.getElementById('selection-count');
            countEl.innerText = `${selectedPhotos.size} მონიშნული`;
            countEl.classList.toggle('hidden', selectedPhotos.size === 0);
        }

        function selectAll() {
            allPhotos.forEach((_, i) => {
                selectedPhotos.add(i);
                document.getElementById(`img-${i}`).classList.add('selected-img');
            });
            updateSelectionCount();
        }

        // --- ACTIONS (GitHub API Connect) ---
        async function deleteSelected() {
            if (!confirm(`წავშალოთ ${selectedPhotos.size} ფოტო?`)) return;
            const loader = document.getElementById('loading-progress');
            const items = Array.from(selectedPhotos);
            
            for (let i = 0; i < items.length; i++) {
                const photo = allPhotos[items[i]];
                await fetch('/api/delete', { 
                    method: 'POST', 
                    body: JSON.stringify({ public_id: photo.id }) 
                });
                loader.style.width = `${((i + 1) / items.length) * 100}%`;
            }
            
            setTimeout(() => { loader.style.width = "0%"; loadGallery(CURRENT_TAG); toggleSelectMode(); }, 500);
        }

        async function executeMove(targetTag) {
            closeMoveModal();
            const loader = document.getElementById('loading-progress');
            const items = Array.from(selectedPhotos);
            
            for (let i = 0; i < items.length; i++) {
                const photo = allPhotos[items[i]];
                await fetch('/api/move', { 
                    method: 'POST', 
                    body: JSON.stringify({ 
                        public_id: photo.id, 
                        target_tag: targetTag, 
                        cloud_name: CLOUD_NAME 
                    }) 
                });
                loader.style.width = `${((i + 1) / items.length) * 100}%`;
            }
            
            setTimeout(() => { loader.style.width = "0%"; loadGallery(CURRENT_TAG); toggleSelectMode(); }, 500);
        }

        async function downloadSelected() {
            const loader = document.getElementById('loading-progress');
            const items = Array.from(selectedPhotos);
            for (let i = 0; i < items.length; i++) {
                const photo = allPhotos[items[i]];
                const response = await fetch(photo.src);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `sastawe_${i}.jpg`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                loader.style.width = `${((i + 1) / items.length) * 100}%`;
                await new Promise(r => setTimeout(r, 400));
            }
            loader.style.width = "0%";
        }

        // --- VIEWER & SWIPE ---
        let vIdx = 0;
        let sX = 0, currX = 0;
        const slider = document.getElementById('viewer-slider');

        function openViewer(i) {
            vIdx = i;
            document.getElementById('viewer').style.display = 'block';
            slider.innerHTML = allPhotos.map(p => `
                <div class="slide">
                    <img src="${p.src.replace('/upload/', '/upload/q_auto,f_auto,w_1200/')}" loading="lazy">
                </div>
            `).join('');
            updateSlider(false);
        }

        function closeViewer() { 
            document.getElementById('viewer').style.display = 'none'; 
            slider.innerHTML = ''; 
        }

        function updateSlider(animate = true) { 
            slider.style.transition = animate ? 'transform 0.3s cubic-bezier(0.15, 0.3, 0.25, 1)' : 'none';
            slider.style.transform = `translateX(${-vIdx * window.innerWidth}px)`; 
        }

        slider.addEventListener('touchstart', e => { 
            sX = e.touches[0].clientX; 
            slider.style.transition = 'none'; 
        }, {passive: true});

        slider.addEventListener('touchmove', e => {
            currX = e.touches[0].clientX - sX;
            slider.style.transform = `translateX(${-vIdx * window.innerWidth + currX}px)`;
        }, {passive: true});

        slider.addEventListener('touchend', () => {
            const threshold = window.innerWidth * 0.15;
            if (Math.abs(currX) > threshold) {
                if (currX > 0 && vIdx > 0) vIdx--;
                else if (currX < 0 && vIdx < allPhotos.length - 1) vIdx++;
            }
            updateSlider(true);
            currX = 0;
        });

        // --- UI & TABS ---
        function switchTab(tab) {
            document.getElementById('view-library').classList.toggle('hidden', tab !== 'library');
            document.getElementById('view-albums').classList.toggle('hidden', tab !== 'albums');
            document.getElementById('nav-lib').style.color = tab === 'library' ? '#fff' : '#52525b';
            document.getElementById('nav-alb').style.color = tab === 'albums' ? '#fff' : '#52525b';
            if(tab === 'albums') renderAlbums();
        }

        function renderAlbums() {
            const grid = document.getElementById('albums-grid');
            grid.innerHTML = albums.map(alb => `
                <div class="relative">
                    <div onclick="loadGallery('${alb}'); switchTab('library')" class="bg-zinc-900 rounded-2xl aspect-square flex flex-col items-center justify-center border border-zinc-800 active:scale-95 transition">
                        <span class="text-2xl mb-2">📂</span>
                        <span class="text-[9px] font-bold uppercase px-2 text-center">${alb.replace(/_/g, ' ')}</span>
                    </div>
                </div>
            `).join('');
        }

        function addNewAlbum() {
            const n = prompt("ალბომის სახელი:");
            if (n) {
                const slug = n.toLowerCase().trim().replace(/\s+/g, '_');
                if(!albums.includes(slug)) {
                    albums.push(slug);
                    localStorage.setItem('vault_albums', JSON.stringify(albums));
                    renderAlbums();
                }
            }
        }

        function openMoveModal() {
            const list = document.getElementById('move-albums-list');
            list.innerHTML = albums.map(alb => `
                <div onclick="executeMove('${alb}')" class="p-4 border-b border-zinc-800 active:bg-zinc-800 text-[11px] uppercase tracking-widest font-bold">
                    ${alb.replace(/_/g, ' ')}
                </div>
            `).join('');
            document.getElementById('move-modal').style.display = 'flex';
        }
        function closeMoveModal() { document.getElementById('move-modal').style.display = 'none'; }

        function openUploadWidget() {
            cloudinary.openUploadWidget({ cloudName: CLOUD_NAME, uploadPreset: UPLOAD_PRESET, tags: [CURRENT_TAG] }, 
            (err, res) => { if (res?.event === "success") setTimeout(() => loadGallery(CURRENT_TAG), 1000); });
        }
    </script>
</body>
</html>
