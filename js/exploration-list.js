/*
    Avenir de Thiawlene - Jeu d'Exploration
    Écran de sélection des missions
*/

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('mission-grid');
    const filterBtns = document.querySelectorAll('.explo-filter-btn');
    const playerInput = document.getElementById('player-name-input');

    let activeTheme = 'all';

    // Prénom du joueur (persistant, personnalise l'expérience)
    playerInput.value = getPlayerName();
    playerInput.addEventListener('input', () => setPlayerName(playerInput.value.trim()));

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeTheme = btn.dataset.theme;
            renderMissions();
        });
    });

    function renderMissions() {
        const missions = EXPLORATION_MISSIONS.filter(m => activeTheme === 'all' || m.theme === activeTheme);
        grid.innerHTML = '';

        if (missions.length === 0) {
            grid.innerHTML = `<p style="opacity:0.7; grid-column: 1/-1; text-align:center;">Aucune mission pour ce thème pour le moment.</p>`;
            return;
        }

        missions.forEach(mission => {
            const progress = getMissionProgress(mission.id);
            const theme = EXPLORATION_THEMES[mission.theme];
            const totalTasks = mission.tasks.length;

            let statusBadge = '<span class="explo-badge explo-badge-new"><i class="fas fa-sparkles"></i> Nouveau</span>';
            let ctaLabel = 'Commencer <i class="fas fa-play"></i>';
            let ctaClass = 'btn-primary';

            if (progress && progress.status === 'completed') {
                statusBadge = '<span class="explo-badge explo-badge-done"><i class="fas fa-circle-check"></i> Terminée</span>';
                ctaLabel = 'Rejouer <i class="fas fa-rotate-right"></i>';
                ctaClass = 'btn-outline explo-btn-outline';
            } else if (progress && progress.status === 'paused') {
                const done = progress.completedTaskIds.length;
                statusBadge = `<span class="explo-badge explo-badge-paused"><i class="fas fa-pause"></i> En pause · ${done}/${totalTasks}</span>`;
                ctaLabel = 'Reprendre <i class="fas fa-play"></i>';
            }

            const card = document.createElement('div');
            card.className = 'explo-card';
            card.innerHTML = `
                <div class="explo-card-top" style="background:${theme.color}1a; color:${theme.color};">
                    <i class="${mission.icon}"></i>
                </div>
                <div class="explo-card-body">
                    <div class="explo-card-meta">
                        <span class="explo-theme-tag" style="background:${theme.color}1a; color:${theme.color};">
                            <i class="${theme.icon}"></i> ${theme.label}
                        </span>
                        ${statusBadge}
                    </div>
                    <h3>${mission.title}</h3>
                    <p class="explo-card-desc">${mission.description}</p>
                    <div class="explo-card-stats">
                        <span><i class="fas fa-list-check"></i> ${totalTasks} tâches</span>
                        <span><i class="fas fa-clock"></i> ~${mission.durationMin} min</span>
                        <span><i class="fas fa-signal"></i> ${mission.difficulty}</span>
                    </div>
                    <a href="exploration-play.html?mission=${mission.id}" class="btn ${ctaClass}" style="width:100%; text-align:center; margin-top:1.5rem;">
                        ${ctaLabel}
                    </a>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    renderMissions();
});
