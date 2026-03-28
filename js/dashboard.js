/* 
    Avenir de Thiawlene - Dashboard management
    Refactored for Simple & Premium UI
*/

document.addEventListener('DOMContentLoaded', async () => {
    // Global player storage for details view
    let playersCache = [];

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
        'gallery': 'Galerie Photo'
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
            if (sidebar.classList.contains('active')) {
                window.toggleSidebar();
            }
        }
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

    // Fetch and display players
    async function fetchPlayers() {
        const { data: players, error } = await supabaseClient.from('joueurs').select('*').order('categorie', { ascending: true });
        if (error) return console.error('Error fetching players:', error);

        playersCache = players; // Update cache

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
                                    <button class="btn-action" style="color: #ef4444; background: none; border: none; cursor: pointer; font-size: 1.1rem; transition: transform 0.2s;" onclick="deleteItem('joueurs', '${p.id}')">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
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

    // Show Player Details
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

    // Fetch and display matches
    async function fetchMatches() {
        const { data: matches, error } = await supabaseClient.from('matches').select('*').order('date', { ascending: false });
        if (error) return console.error('Error fetching matches:', error);

        const tbody = document.getElementById('matches-list');
        if (tbody) {
            tbody.innerHTML = matches.map(match => `
                <tr>
                    <td><span style="font-weight: 600;">${new Date(match.date).toLocaleDateString()}</span></td>
                    <td>${match.adversaire}</td>
                    <td><span class="badge badge-info">${match.type}</span></td>
                    <td style="font-weight: 800; color: var(--primary);">${match.score_equipe ?? '-'} : ${match.score_adv ?? '-'}</td>
                    <td>
                        <button class="btn-action" style="color: #ef4444; background: none; border: none; cursor: pointer; font-size: 1.1rem; transition: transform 0.2s;" onclick="deleteItem('matches', '${match.id}')">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
            if (matches.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 3rem; color: var(--text-muted);">Aucun match publié</td></tr>';
            }
        }
        document.getElementById('stat-matches').textContent = matches.length;
    }

    // Fetch and display gallery
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

            // Add CSS for gallery item interactions
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

    // Generic Delete function
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

    // Forms handling
    document.getElementById('addPlayerForm').onsubmit = async (e) => {
        e.preventDefault();

        // Validation based on Category
        const cat = document.getElementById('p_categorie').value;
        const youthCategories = ['U7', 'U9', 'U11', 'U13', 'U15'];
        const nomPere = document.getElementById('p_nom_pere').value;
        const nomMere = document.getElementById('p_nom_mere').value;
        const contact = document.getElementById('p_contact').value;

        if (youthCategories.includes(cat)) {
            if (!nomPere || !nomMere || !contact) {
                alert('Pour les catégories U7 à U15, les noms du père, de la mère et le contact sont obligatoires.');
                return;
            }
        }

        const btn = e.target.querySelector('button');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Traitement...';
        btn.disabled = true;

        try {
            const photoFile = document.getElementById('p_photo').files[0];
            const photoUrl = await uploadFile(photoFile, 'players');

            const { error } = await supabaseClient.from('joueurs').insert([{
                prenom: document.getElementById('p_prenom').value,
                nom: document.getElementById('p_nom').value,
                categorie: cat,
                position: document.getElementById('p_position').value,
                parent_contact: contact,
                nom_pere: nomPere,
                nom_mere: nomMere,
                photo_url: photoUrl,
                statut_dossier: 'Complet'
            }]);

            if (error) throw error;
            closeModal('playerModal');
            fetchPlayers();
            e.target.reset();
            alert('Joueur enregistré avec succès.');
        } catch (err) {
            alert('Erreur: ' + err.message + '\n\nNote: Assurez-vous que les colonnes nom_pere et nom_mere existent dans votre base de données.');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    };

    document.getElementById('addMatchForm').onsubmit = async (e) => {
        e.preventDefault();
        const { error } = await supabaseClient.from('matches').insert([{
            date: document.getElementById('m_date').value,
            adversaire: document.getElementById('m_adversaire').value,
            type: document.getElementById('m_type').value,
            lieu: document.getElementById('m_lieu').value,
            score_equipe: document.getElementById('m_score_eq').value || null,
            score_adv: document.getElementById('m_score_adv').value || null
        }]);
        if (error) alert(error.message); else { closeModal('matchModal'); fetchMatches(); e.target.reset(); }
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

    // Global toggle function for sidebar (mobile)
    window.toggleSidebar = function() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('active');
        const icon = document.querySelector('#mobile-toggle i');
        if (sidebar.classList.contains('active')) {
            icon?.classList.replace('fa-bars', 'fa-times');
        } else {
            icon?.classList.replace('fa-times', 'fa-bars');
        }
    };

    // Initialize all sections
    fetchPlayers();
    fetchMatches();
    fetchGallery();
});
