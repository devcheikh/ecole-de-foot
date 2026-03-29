/* 
    Avenir de Thiawlene - Dashboard management
    Refactored for Simple & Premium UI + Edit Capabilities
*/

document.addEventListener('DOMContentLoaded', async () => {
    // Global storage for details view and editing
    let playersCache = [];
    let matchesCache = [];

    // Auth Session Check
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
        window.location.href = 'login.html';
        return;
    }

    // Tab synchronization with Title
    const tabTitles = {
        'overview': 'Tableau de Bord',
        'players': 'Gestion des Joueurs',
        'matches': 'Gestion des Matchs',
        'gallery': 'Galerie Photo',
        'quiz': 'Gestion du Quiz'
    };

    // Tab Management
    window.switchTab = function(tabId) {
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.sidebar-link').forEach(link => link.classList.remove('active'));
        
        const activeTab = document.getElementById(`tab-${tabId}`);
        if (activeTab) activeTab.classList.add('active');
        
        // Update Title in UI
        const titleEl = document.getElementById('current-tab-title');
        if (titleEl && tabTitles[tabId]) {
            titleEl.textContent = tabTitles[tabId];
        }

        // Update Active Link
        document.querySelectorAll('.sidebar-link').forEach(link => {
            if (link.getAttribute('onclick')?.includes(`'${tabId}'`)) {
                link.classList.add('active');
            }
        });

        // Close sidebar on mobile
        if (window.innerWidth <= 1024) {
            const sidebar = document.getElementById('sidebar');
            if (sidebar && sidebar.classList.contains('active')) {
                window.toggleSidebar();
            }
        }

        // --- NEW: Dynamic Refresh on Tab Switch ---
        if (tabId === 'players') fetchPlayers();
        else if (tabId === 'matches') fetchMatches();
        else if (tabId === 'gallery') fetchGallery();
        else if (tabId === 'quiz') fetchQuizData();
    };

    // Modal control functions
    window.openModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add('active');
    };

    window.closeModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('active');
    };

    // Close modal when clicking outside
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('active');
        }
    };

    // --- Helper: Open Add Modals (Reset State) ---
    window.openAddPlayer = function() {
        document.getElementById('addPlayerForm').reset();
        document.getElementById('p_id').value = '';
        document.getElementById('playerModalTitle').textContent = 'Ajouter un Joueur';
        document.getElementById('playerSubmitBtn').textContent = 'Enregistrer le joueur';
        openModal('playerModal');
    };

    window.openAddMatch = function() {
        document.getElementById('addMatchForm').reset();
        document.getElementById('m_id').value = '';
        document.getElementById('matchModalTitle').textContent = 'Publier un Match';
        document.getElementById('matchSubmitBtn').textContent = 'Publier le match';
        openModal('matchModal');
    };

    // Image Upload helper
    async function uploadFile(file, folder) {
        if (!file) return null;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        const { error: uploadError } = await supabaseClient.storage
            .from('football')
            .upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }

        const { data: { publicUrl } } = supabaseClient.storage
            .from('football')
            .getPublicUrl(filePath);

        return publicUrl;
    }

    // --- Players Management ---
    async function fetchPlayers() {
        const { data: players, error } = await supabaseClient.from('joueurs').select('*').order('categorie', { ascending: true });
        if (error) return console.error('Error fetching players:', error);

        playersCache = players;

        const tbody = document.getElementById('players-list');
        if (tbody) {
            const categories = ['U7', 'U9', 'U11', 'U13', 'U15', 'U17', 'Elite'];
            let html = '';
            
            categories.forEach(cat => {
                const catPlayers = players.filter(p => p.categorie === cat);
                if (catPlayers.length > 0) {
                    html += `
                        <tr class="category-divider">
                            <td colspan="4" style="background: #f1f5f9; font-weight: 800; font-size: 0.75rem; color: #64748b; text-transform: uppercase; padding: 0.75rem 1.5rem;">${cat}</td>
                        </tr>
                    `;
                    catPlayers.forEach(p => {
                        html += `
                            <tr class="player-row" style="cursor: pointer;" onclick="showPlayerDetails('${p.id}')">
                                <td style="display: flex; align-items: center; gap: 1rem;">
                                    <img src="${p.photo_url || 'assets/images/logo.jpg'}" style="width: 40px; height: 40px; border-radius: 10px; object-fit: cover; background: #e2e8f0; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.05);" alt="">
                                    <span style="font-weight: 600;">${p.prenom} ${p.nom}</span>
                                </td>
                                <td><span class="badge badge-info">${p.position || 'N/A'}</span></td>
                                <td><span class="badge ${p.statut_dossier === 'Complet' ? 'badge-success' : 'badge-warning'}">${p.statut_dossier}</span></td>
                                <td onclick="event.stopPropagation()">
                                    <div style="display: flex; gap: 0.5rem;">
                                        <button class="btn-action" style="color: var(--primary); background: none; border: none; cursor: pointer; font-size: 1.1rem;" onclick="editPlayer('${p.id}')">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn-action" style="color: #ef4444; background: none; border: none; cursor: pointer; font-size: 1.1rem;" onclick="deleteItem('joueurs', '${p.id}')">
                                            <i class="fas fa-trash-alt"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `;
                    });
                }
            });
            tbody.innerHTML = html || '<tr><td colspan="4" style="text-align:center; padding: 3rem; color: var(--text-muted);">Aucun joueur trouvé</td></tr>';
        }
        document.getElementById('stat-players').textContent = players.length;
    }

    window.showPlayerDetails = function(playerId) {
        const player = playersCache.find(p => p.id === playerId);
        if (!player) return;

        const content = document.getElementById('player-details-content');
        if (content) {
            content.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 2rem;">
                    <div style="display: flex; align-items: center; gap: 2rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 1.5rem;">
                        <img src="${player.photo_url || 'assets/images/logo.jpg'}" style="width: 120px; height: 120px; border-radius: 20px; object-fit: cover; border: 4px solid white; box-shadow: var(--shadow-md);">
                        <div>
                            <h2 style="font-size: 1.75rem; margin-bottom: 0.5rem;">${player.prenom} ${player.nom}</h2>
                            <span class="badge badge-info" style="font-size: 0.9rem;">${player.categorie} - ${player.position || 'Sans position'}</span>
                            <div style="margin-top: 1rem;">
                                <button class="btn btn-outline btn-sm" onclick="closeModal('playerDetailsModal'); editPlayer('${player.id}')">
                                    <i class="fas fa-edit"></i> Modifier le profil
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                        <div class="info-block">
                            <label style="display: block; font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin-bottom: 0.5rem;">Filiation (Père)</label>
                            <p style="font-weight: 600; font-size: 1.1rem;">${player.nom_pere || '<span style="color: #ef4444; font-size: 0.8rem;">Non renseigné</span>'}</p>
                        </div>
                        <div class="info-block">
                            <label style="display: block; font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin-bottom: 0.5rem;">Filiation (Mère)</label>
                            <p style="font-weight: 600; font-size: 1.1rem;">${player.nom_mere || '<span style="color: #ef4444; font-size: 0.8rem;">Non renseigné</span>'}</p>
                        </div>
                        <div class="info-block">
                            <label style="display: block; font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin-bottom: 0.5rem;">Contact Parent</label>
                            <p style="font-weight: 600; font-size: 1.1rem; color: var(--primary);"><i class="fas fa-phone-alt" style="font-size: 0.8rem; margin-right: 0.5rem;"></i>${player.parent_contact || 'N/A'}</p>
                        </div>
                        <div class="info-block">
                            <label style="display: block; font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin-bottom: 0.5rem;">Statut Dossier</label>
                            <span class="badge ${player.statut_dossier === 'Complet' ? 'badge-success' : 'badge-warning'}">${player.statut_dossier}</span>
                        </div>
                    </div>
                </div>
            `;
            openModal('playerDetailsModal');
        }
    };

    window.editPlayer = function(id) {
        const p = playersCache.find(x => x.id === id);
        if (!p) return;

        document.getElementById('p_id').value = p.id;
        document.getElementById('p_prenom').value = p.prenom;
        document.getElementById('p_nom').value = p.nom;
        document.getElementById('p_categorie').value = p.categorie;
        document.getElementById('p_position').value = p.position || '';
        document.getElementById('p_nom_pere').value = p.nom_pere || '';
        document.getElementById('p_nom_mere').value = p.nom_mere || '';
        document.getElementById('p_contact').value = p.parent_contact || '';
        
        document.getElementById('playerModalTitle').textContent = 'Modifier le Joueur';
        document.getElementById('playerSubmitBtn').textContent = 'Mettre à jour';
        openModal('playerModal');
    };

    // --- Matches Management ---
    async function fetchMatches() {
        // Correct columns: date, type, score_adv
        const { data: matches, error } = await supabaseClient.from('matches').select('*').order('date', { ascending: false });
        if (error) return console.error('Error fetching matches:', error);

        matchesCache = matches;

        const tbody = document.getElementById('matches-list');
        if (tbody) {
            tbody.innerHTML = matches.map(match => `
                <tr>
                    <td><span style="font-weight: 600;">${new Date(match.date).toLocaleDateString()}</span></td>
                    <td>${match.adversaire}</td>
                    <td><span class="badge badge-info">${match.type || 'N/A'}</span></td>
                    <td><span style="font-size: 0.85rem; opacity: 0.8;">${match.match_type || '-'}</span></td>
                    <td style="font-weight: 800; color: var(--primary);">${match.score_equipe ?? '-'} : ${match.score_adv ?? '-'}</td>
                    <td>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn-action" style="color: var(--primary); background: none; border: none; cursor: pointer; font-size: 1.1rem;" onclick="editMatch('${match.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-action" style="color: #ef4444; background: none; border: none; cursor: pointer; font-size: 1.1rem;" onclick="deleteItem('matches', '${match.id}')">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
            if (matches.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 3rem; color: var(--text-muted);">Aucun match publié</td></tr>';
            }
        }
        document.getElementById('stat-matches').textContent = matches.length;
    }

    window.editMatch = function(id) {
        const m = matchesCache.find(x => x.id === id);
        if (!m) return;

        document.getElementById('m_id').value = m.id;
        document.getElementById('m_date').value = m.date ? new Date(m.date).toISOString().split('T')[0] : '';
        document.getElementById('m_adversaire').value = m.adversaire;
        document.getElementById('m_type').value = m.type || '';
        document.getElementById('m_match_type').value = m.match_type || '';
        document.getElementById('m_lieu').value = m.lieu || '';
        document.getElementById('m_score_eq').value = m.score_equipe ?? '';
        document.getElementById('m_score_adv').value = m.score_adv ?? '';

        document.getElementById('matchModalTitle').textContent = 'Modifier le Match';
        document.getElementById('matchSubmitBtn').textContent = 'Mettre à jour';
        openModal('matchModal');
    };

    // --- Gallery & Generic ---
    async function fetchGallery() {
        const { data: images, error } = await supabaseClient.from('gallery').select('*').order('created_at', { ascending: false });
        if (error) return console.error('Error fetching gallery:', error);

        const grid = document.getElementById('admin-gallery-grid');
        if (grid) {
            grid.innerHTML = images.map(img => `
                <div class="gallery-item" style="position: relative; border-radius: 15px; overflow: hidden; box-shadow: var(--shadow-sm); aspect-ratio: 1; group">
                    <img src="${img.image_url}" alt="${img.titre}" style="width: 100%; height: 100%; object-fit: cover;">
                    <button onclick="deleteItem('gallery', '${img.id}')" style="position: absolute; top: 12px; right: 12px; width: 35px; height: 35px; border-radius: 50%; border: none; background: rgba(239, 68, 68, 0.9); color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s; opacity: 0;" class="delete-btn-gallery">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                    <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.8)); color: white; padding: 20px 15px 15px; font-size: 0.9rem; font-weight: 600;">
                        ${img.titre}
                    </div>
                </div>
            `).join('');

            if (!document.getElementById('gallery-js-styles')) {
                const style = document.createElement('style');
                style.id = 'gallery-js-styles';
                style.textContent = `
                    .gallery-item:hover .delete-btn-gallery { opacity: 1 !important; transform: scale(1.1); }
                    .btn-action:hover { transform: scale(1.2); }
                    .player-row:hover td { background: #f8fafc !important; }
                `;
                document.head.appendChild(style);
            }
        }
        document.getElementById('stat-gallery').textContent = images.length;
    }

    window.deleteItem = async function(table, id) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;
        const { error } = await supabaseClient.from(table).delete().eq('id', id);
        if (error) alert('Erreur : ' + error.message);
        else {
            if (table === 'joueurs') fetchPlayers();
            if (table === 'matches') fetchMatches();
            if (table === 'gallery') fetchGallery();
        }
    };

    // --- Form Submissions (Edit/Add) ---
    document.getElementById('addPlayerForm').onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById('p_id').value;
        const cat = document.getElementById('p_categorie').value;
        const youthCategories = ['U7', 'U9', 'U11', 'U13', 'U15'];
        const nomPere = document.getElementById('p_nom_pere').value;
        const nomMere = document.getElementById('p_nom_mere').value;
        const contact = document.getElementById('p_contact').value;

        if (youthCategories.includes(cat) && (!nomPere || !nomMere || !contact)) {
            alert('Pour les catégories U7 à U15, les noms du père, de la mère et le contact sont obligatoires.');
            return;
        }

        const btn = document.getElementById('playerSubmitBtn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Traitement...';
        btn.disabled = true;

        try {
            const photoFile = document.getElementById('p_photo').files[0];
            let photoUrl = null;
            if (photoFile) photoUrl = await uploadFile(photoFile, 'players');

            const playerData = {
                prenom: document.getElementById('p_prenom').value,
                nom: document.getElementById('p_nom').value,
                categorie: cat,
                position: document.getElementById('p_position').value,
                parent_contact: contact,
                nom_pere: nomPere,
                nom_mere: nomMere,
                statut_dossier: 'Complet'
            };
            if (photoUrl) playerData.photo_url = photoUrl;

            let result;
            if (id) {
                result = await supabaseClient.from('joueurs').update(playerData).eq('id', id);
            } else {
                result = await supabaseClient.from('joueurs').insert([playerData]);
            }

            if (result.error) throw result.error;
            closeModal('playerModal');
            fetchPlayers();
            e.target.reset();
            alert(id ? 'Joueur mis à jour !' : 'Joueur enregistré !');
        } catch (err) {
            alert('Erreur: ' + err.message);
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    };

    document.getElementById('addMatchForm').onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById('m_id').value;
        const matchData = {
            date: document.getElementById('m_date').value,
            adversaire: document.getElementById('m_adversaire').value,
            type: document.getElementById('m_type').value, 
            match_type: document.getElementById('m_match_type').value,
            lieu: document.getElementById('m_lieu').value,
            score_equipe: document.getElementById('m_score_eq').value || null,
            score_adv: document.getElementById('m_score_adv').value || null
        };

        let result;
        if (id) {
            result = await supabaseClient.from('matches').update(matchData).eq('id', id);
        } else {
            result = await supabaseClient.from('matches').insert([matchData]);
        }

        if (result.error) alert(result.error.message); 
        else { 
            closeModal('matchModal'); 
            fetchMatches(); 
            e.target.reset(); 
            alert(id ? 'Match mis à jour !' : 'Match publié !');
        }
    };

    document.getElementById('addGalleryForm').onsubmit = async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Traitement...';
        btn.disabled = true;

        try {
            const imageFile = document.getElementById('g_file').files[0];
            const imageUrl = await uploadFile(imageFile, 'gallery');

            const { error } = await supabaseClient.from('gallery').insert([{
                image_url: imageUrl,
                titre: document.getElementById('g_titre').value
            }]);

            if (error) throw error;
            closeModal('galleryModal');
            fetchGallery();
            e.target.reset();
        } catch (err) {
            alert('Erreur: ' + err.message);
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    };

    window.toggleSidebar = function() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        sidebar.classList.toggle('active');
        overlay?.classList.toggle('active');
        
        const icon = document.querySelector('#mobile-toggle i');
        if (sidebar.classList.contains('active')) {
            icon?.classList.replace('fa-bars', 'fa-times');
        } else {
            icon?.classList.replace('fa-times', 'fa-bars');
        }
    };

    fetchPlayers();
    fetchMatches();
    fetchGallery();
    fetchQuizData();

    // --- Quiz Management Functions ---
    window.currentSelectedThemeId = null;

    async function fetchQuizData() {
        await fetchThemes();
        await fetchResults();
    }

    async function fetchThemes() {
        const { data, error } = await supabaseClient.from('quiz_themes').select('*').order('created_at', { ascending: false });
        if (error) { console.error(error); return; }
        
        const tbody = document.getElementById('themes-list');
        const themeFilter = document.getElementById('theme-filter');
        const qThemeId = document.getElementById('q_theme_id');
        
        tbody.innerHTML = '';
        themeFilter.innerHTML = '<option value="">Tous les thèmes</option>';
        qThemeId.innerHTML = '<option value="" disabled selected>Choisir un thème</option>';

        data.forEach(theme => {
            // Table Row
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><i class="${theme.icon}"></i></td>
                <td><span class="theme-name-link" onclick="selectTheme('${theme.id}', '${theme.name}')" style="cursor:pointer; color:var(--primary); font-weight:600;">${theme.name}</span></td>
                <td>
                    <button class="btn-icon" onclick="editTheme('${theme.id}', '${theme.name}', '${theme.icon}')" title="Modifier"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon delete" onclick="deleteTheme('${theme.id}')" title="Supprimer"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);

            // Filters & Selects
            themeFilter.innerHTML += `<option value="${theme.id}">${theme.name}</option>`;
            qThemeId.innerHTML += `<option value="${theme.id}">${theme.name}</option>`;
        });
    }

    window.selectTheme = function(id, name) {
        window.currentSelectedThemeId = id;
        document.getElementById('selected-theme-name').textContent = name;
        document.getElementById('theme-filter').value = id;
        loadQuestions();
    };

    window.loadQuestions = async function() {
        const themeId = document.getElementById('theme-filter').value;
        const level = document.getElementById('level-filter').value;
        if (!themeId) {
            document.getElementById('questions-list').innerHTML = '<tr><td colspan="3" style="text-align:center; padding:2rem; opacity:0.5;">Sélectionnez un thème pour voir les questions</td></tr>';
            return;
        }

        const { data, error } = await supabaseClient
            .from('quiz_questions')
            .select('*')
            .eq('theme_id', themeId)
            .eq('level', level)
            .order('created_at', { ascending: true });

        if (error) { console.error(error); return; }

        const tbody = document.getElementById('questions-list');
        tbody.innerHTML = '';

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:2rem; opacity:0.5;">Aucune question trouvée pour ce niveau.</td></tr>';
            return;
        }

        data.forEach(q => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="max-width: 300px; white-space: normal;">${q.question}</td>
                <td>${q.options[q.correct_index]}</td>
                <td>
                    <button class="btn-icon" onclick="editQuestion('${q.id}')" title="Modifier"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon delete" onclick="deleteQuestion('${q.id}')" title="Supprimer"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    };

    async function fetchResults() {
        console.log("Chargement des résultats du quiz...");
        const { data, error } = await supabaseClient.from('quiz_results').select('*').order('completed_at', { ascending: false });
        if (error) { 
            console.error("Erreur fetching results:", error); 
            return; 
        }
        console.log("Résultats reçus :", data);

        const tbody = document.getElementById('results-list');
        tbody.innerHTML = '';
        
        let winners = 0;
        data.forEach(res => {
            if (res.score === res.total_questions) winners++;
            const isWinner = res.score === res.total_questions;
            const tr = document.createElement('tr');
            tr.className = isWinner ? 'winner-row' : '';
            tr.innerHTML = `
                <td><div style="font-weight:700;">${res.user_name}</div></td>
                <td>${res.user_phone}</td>
                <td><span style="font-size:0.8rem; opacity:0.7;">${res.theme_name} / ${res.difficulty}</span></td>
                <td><span class="badge" style="background:${isWinner ? 'var(--primary)' : '#e2e8f0'}; color:${isWinner ? 'white' : 'inherit'};">${res.score}/${res.total_questions}</span></td>
                <td><button class="btn-icon delete" onclick="deleteResult('${res.id}')"><i class="fas fa-trash"></i></button></td>
            `;
            tbody.appendChild(tr);
        });

        document.getElementById('total-participants').textContent = data.length;
        document.getElementById('total-winners').textContent = winners;
    }

    // Modal Handlers
    window.editTheme = function(id, name, icon) {
        document.getElementById('theme_id').value = id;
        document.getElementById('theme_name').value = name;
        document.getElementById('theme_icon').value = icon;
        openModal('themeModal');
    };

    window.deleteTheme = async function(id) {
        if (!confirm('Supprimer ce thème et toutes ses questions ?')) return;
        const { error } = await supabaseClient.from('quiz_themes').delete().eq('id', id);
        if (error) alert(error.message);
        else fetchThemes();
    };

    window.editQuestion = async function(id) {
        const { data, error } = await supabaseClient.from('quiz_questions').select('*').eq('id', id).single();
        if (error) return;
        
        document.getElementById('q_id').value = data.id;
        document.getElementById('q_theme_id').value = data.theme_id;
        document.getElementById('q_level').value = data.level;
        document.getElementById('q_question').value = data.question;
        document.getElementById('opt_0').value = data.options[0];
        document.getElementById('opt_1').value = data.options[1];
        document.getElementById('opt_2').value = data.options[2];
        document.getElementById('opt_3').value = data.options[3];
        document.getElementById('q_correct_index').value = data.correct_index;
        
        openModal('questionModal');
    };

    window.deleteQuestion = async function(id) {
        if (!confirm('Supprimer cette question ?')) return;
        const { error } = await supabaseClient.from('quiz_questions').delete().eq('id', id);
        if (error) alert(error.message);
        else loadQuestions();
    };

    window.deleteResult = async function(id) {
        if (!confirm('Supprimer ce résultat ?')) return;
        const { error } = await supabaseClient.from('quiz_results').delete().eq('id', id);
        if (error) alert(error.message);
        else fetchResults();
    };

    // Forms
    document.getElementById('themeForm').onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById('theme_id').value;
        const themeData = {
            name: document.getElementById('theme_name').value,
            icon: document.getElementById('theme_icon').value
        };

        let result;
        if (id) result = await supabaseClient.from('quiz_themes').update(themeData).eq('id', id);
        else result = await supabaseClient.from('quiz_themes').insert([themeData]);

        if (result.error) alert(result.error.message);
        else {
            closeModal('themeModal');
            fetchThemes();
            e.target.reset();
        }
    };

    document.getElementById('questionForm').onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById('q_id').value;
        const questionData = {
            theme_id: document.getElementById('q_theme_id').value,
            level: document.getElementById('q_level').value,
            question: document.getElementById('q_question').value,
            options: [
                document.getElementById('opt_0').value,
                document.getElementById('opt_1').value,
                document.getElementById('opt_2').value,
                document.getElementById('opt_3').value
            ],
            correct_index: parseInt(document.getElementById('q_correct_index').value)
        };

        let result;
        if (id) result = await supabaseClient.from('quiz_questions').update(questionData).eq('id', id);
        else result = await supabaseClient.from('quiz_questions').insert([questionData]);

        if (result.error) alert(result.error.message);
        else {
            closeModal('questionModal');
            loadQuestions();
            e.target.reset();
            document.getElementById('q_id').value = '';
        }
    };
});
