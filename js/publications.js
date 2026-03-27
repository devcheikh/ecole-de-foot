/* 
    Avenir de Thiawlene - Publications Logic
*/

document.addEventListener('DOMContentLoaded', async () => {
    
    // Fetch and display matches
    async function fetchMatches() {
        const matchesContainer = document.getElementById('matchesList');
        
        try {
            const { data: matches, error } = await supabaseClient
                .from('matches')
                .select('*')
                .order('date', { ascending: false });

            if (error) throw error;

            if (!matches || matches.length === 0) {
                matchesContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); width: 100%;">Aucun match publié pour le moment.</p>';
                return;
            }

            matchesContainer.innerHTML = '';
            matches.forEach(match => {
                const matchDate = new Date(match.date);
                const isUpcoming = matchDate > new Date();
                
                const card = document.createElement('div');
                card.className = 'match-card reveal';
                card.innerHTML = `
                    <span class="match-status ${isUpcoming ? 'status-upcoming' : 'status-past'}">
                        ${isUpcoming ? 'À venir' : 'Résultat'}
                    </span>
                    <div class="team">${match.type}</div>
                    <div class="match-teams">
                        <div class="team">AVENIR</div>
                        <div class="score">${match.score_equipe ?? '-'} : ${match.score_adv ?? '-'}</div>
                        <div class="team">${match.adversaire}</div>
                    </div>
                    <div class="match-info">
                        <span><i class="far fa-calendar-alt"></i> ${matchDate.toLocaleDateString('fr-FR')}</span>
                        <span><i class="fas fa-location-dot"></i> ${match.lieu}</span>
                    </div>
                `;
                matchesContainer.appendChild(card);
            });

        } catch (err) {
            console.error('Error fetching matches:', err);
            matchesContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); width: 100%;">Erreur lors du chargement des matchs.</p>';
        }
    }

    // Fetch and display gallery
    async function fetchGallery() {
        const galleryGrid = document.getElementById('galleryGrid');

        try {
            const { data: images, error } = await supabaseClient
                .from('gallery')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (!images || images.length === 0) {
                galleryGrid.innerHTML = '<p style="text-align: center; color: var(--text-muted); width: 100%;">La galerie est vide.</p>';
                return;
            }

            galleryGrid.innerHTML = '';
            images.forEach(img => {
                const item = document.createElement('div');
                item.className = 'gallery-item reveal';
                item.innerHTML = `
                    <img src="${img.image_url}" alt="${img.titre}">
                    <div class="gallery-overlay">
                        <span>${img.titre}</span>
                    </div>
                `;
                galleryGrid.appendChild(item);
            });

        } catch (err) {
            console.error('Error fetching gallery:', err);
            galleryGrid.innerHTML = '<p style="text-align: center; color: var(--text-muted); width: 100%;">Erreur lors du chargement de la galerie.</p>';
        }
    }

    // Initial load
    fetchMatches();
    fetchGallery();
});
