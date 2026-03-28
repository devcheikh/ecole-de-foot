/* 
    Avenir de Thiawlene - Dashboard management
*/

document.addEventListener('DOMContentLoaded', async () => {
    // Auth Session Check
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
        window.location.href = 'login.html';
        return;
    }

    // Tab Management
    window.switchTab = function(tabId) {
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.sidebar-link').forEach(link => link.classList.remove('active'));
        
        const activeTab = document.getElementById(`tab-${tabId}`);
        if (activeTab) activeTab.classList.add('active');
        
        const activeLink = document.querySelector(`[onclick="switchTab('${tabId}')"]`);
        if (activeLink) activeLink.classList.add('active');
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
        const { data: players, error } = await supabaseClient.from('joueurs' ).select('*').order('categorie', { ascending: true });
        if (error) return console.error('Error fetching players:', error);

        const tbody = document.getElementById('players-list');
        if (tbody) {
            const categories = ['U13', 'U15', 'U17', 'Elite'];
            let html = '';
            
            categories.forEach(cat => {
                const catPlayers = players.filter(p => p.categorie === cat);
                if (catPlayers.length > 0) {
                    html += `
                        <tr>
                            <td colspan="4" class="category-header">${cat}</td>
                        </tr>
                    `;
                    catPlayers.forEach(p => {
                        html += `
                            <tr>
                                <td style="display: flex; align-items: center; gap: 0.75rem;">
                                    <img src="${p.photo_url || 'assets/logo.png'}" class="player-avatar" alt="">
                                    <span>${p.prenom} ${p.nom}</span>
                                </td>
                                <td>${p.position || 'N/A'}</td>
                                <td><span class="badge ${p.statut_dossier === 'Complet' ? 'badge-success' : 'badge-warning'}">${p.statut_dossier}</span></td>
                                <td><i class="fas fa-trash" style="cursor: pointer; color: #fca5a5;" onclick="deleteItem('joueurs', '${p.id}')"></i></td>
                            </tr>
                        `;
                    });
                }
            });
            tbody.innerHTML = html || '<tr><td colspan="4" style="text-align:center;">Aucun joueur trouvé</td></tr>';
        }
        document.getElementById('stat-players').textContent = players.length;
    }

    // Fetch and display matches
    async function fetchMatches() {
        const { data: matches, error } = await supabaseClient.from('matches').select('*').order('date', { ascending: false });
        if (error) return console.error('Error fetching matches:', error);

        const tbody = document.getElementById('matches-list');
        if (tbody) {
            tbody.innerHTML = matches.map(match => `
                <tr>
                    <td>${new Date(match.date).toLocaleDateString()}</td>
                    <td>${match.adversaire}</td>
                    <td>${match.type}</td>
                    <td>${match.score_equipe ?? '-'} : ${match.score_adv ?? '-'}</td>
                    <td><i class="fas fa-trash" style="cursor: pointer; color: #fca5a5;" onclick="deleteItem('matches', '${match.id}')"></i></td>
                </tr>
            `).join('');
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
                <div class="gallery-item" style="position: relative;">
                    <img src="${img.image_url}" alt="${img.titre}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
                    <button onclick="deleteItem('gallery', '${img.id}')" style="position: absolute; top: 10px; right: 10px; background: rgba(255,0,0,0.7); color: white; border: none; border-radius: 4px; padding: 5px 10px; cursor: pointer;"><i class="fas fa-trash"></i></button>
                    <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.5); color: white; padding: 5px; font-size: 0.8rem; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">${img.titre}</div>
                </div>
            `).join('');
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
        const btn = e.target.querySelector('button');
        const originalText = btn.textContent;
        btn.textContent = 'Téléchargement...';
        btn.disabled = true;

        try {
            const photoFile = document.getElementById('p_photo').files[0];
            const photoUrl = await uploadFile(photoFile, 'players');

            const { error } = await supabaseClient.from('joueurs').insert([{
                prenom: document.getElementById('p_prenom').value,
                nom: document.getElementById('p_nom').value,
                categorie: document.getElementById('p_categorie').value,
                position: document.getElementById('p_position').value,
                parent_contact: document.getElementById('p_contact').value,
                photo_url: photoUrl,
                statut_dossier: 'En attente'
            }]);

            if (error) throw error;
            closeModal('playerModal');
            fetchPlayers();
            e.target.reset();
        } catch (err) {
            alert('Erreur: ' + err.message);
        } finally {
            btn.textContent = originalText;
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
        const originalText = btn.textContent;
        btn.textContent = 'Téléchargement...';
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
            btn.textContent = originalText;
            btn.disabled = false;
        }
    };

    // Initialize all sections
    fetchPlayers();
    fetchMatches();
    fetchGallery();
});
