/*
    Avenir de Thiawlene - Jeu d'Exploration
    Écran de jeu : tâches, carte, position en direct, pause/reprise
*/

let mission = null;
let progress = null;
let map = null;
let userMarker = null;
let watchId = null;

const els = {};

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const missionId = params.get('mission');
    mission = getMissionById(missionId);

    cacheEls();

    if (!mission) {
        document.getElementById('task-panel').innerHTML = `
            <h2>Mission introuvable</h2>
            <p>Cette mission n'existe pas ou a été retirée.</p>
            <a href="exploration.html" class="btn btn-primary">Retour aux missions</a>`;
        document.querySelector('.explo-map-wrap').style.display = 'none';
        document.querySelector('.explo-task-list-wrap').style.display = 'none';
        return;
    }

    progress = getMissionProgress(mission.id) || createFreshProgress();
    if (progress.status === 'completed') {
        // Rejouer depuis la liste : repart sur une progression neuve
        progress = createFreshProgress();
    }
    progress.status = 'in_progress';
    saveProgress();

    renderHeader();
    initMap();
    renderTaskList();
    renderCurrentTask();

    els.pauseBtn.addEventListener('click', pauseMission);
    els.resumeNowBtn.addEventListener('click', () => {
        els.pauseOverlay.style.display = 'none';
    });
    els.replayBtn.addEventListener('click', () => {
        clearMissionProgress(mission.id);
        window.location.reload();
    });

    startGeolocation();
});

function cacheEls() {
    els.themeTag = document.getElementById('mission-theme-tag');
    els.title = document.getElementById('mission-title');
    els.pauseBtn = document.getElementById('pause-btn');
    els.progressBar = document.getElementById('progress-bar');
    els.progressLabel = document.getElementById('progress-label');
    els.startLabel = document.getElementById('route-start-label');
    els.endLabel = document.getElementById('route-end-label');
    els.geoStatus = document.getElementById('geo-status');
    els.distanceReadout = document.getElementById('distance-readout');
    els.distanceValue = document.getElementById('distance-value');
    els.taskIndexLabel = document.getElementById('task-index-label');
    els.taskPoints = document.getElementById('task-points');
    els.taskTitle = document.getElementById('task-title');
    els.taskDescription = document.getElementById('task-description');
    els.completeBtn = document.getElementById('complete-task-btn');
    els.taskList = document.getElementById('task-list');
    els.pauseOverlay = document.getElementById('pause-overlay');
    els.resumeNowBtn = document.getElementById('resume-now-btn');
    els.completeOverlay = document.getElementById('complete-overlay');
    els.completeTitle = document.getElementById('complete-title');
    els.completeMessage = document.getElementById('complete-message');
    els.completePoints = document.getElementById('complete-points');
    els.replayBtn = document.getElementById('replay-btn');
}

function createFreshProgress() {
    const now = new Date().toISOString();
    return {
        missionId: mission.id,
        status: 'in_progress',
        currentTaskIndex: 0,
        completedTaskIds: [],
        startedAt: now,
        updatedAt: now
    };
}

function saveProgress() {
    progress.updatedAt = new Date().toISOString();
    setMissionProgress(mission.id, progress);
}

function renderHeader() {
    const theme = EXPLORATION_THEMES[mission.theme];
    els.themeTag.innerHTML = `<i class="${theme.icon}"></i> ${theme.label}`;
    els.themeTag.style.background = `${theme.color}1a`;
    els.themeTag.style.color = theme.color;

    const playerName = getPlayerName();
    els.title.textContent = playerName ? `${mission.title}` : mission.title;
    document.title = `${mission.title} | Avenir de Thiawlene`;

    els.startLabel.textContent = mission.start.label;
    els.endLabel.textContent = mission.end.label;
}

function initMap() {
    if (typeof L === 'undefined') {
        document.getElementById('explo-map').innerHTML =
            '<div class="explo-map-fallback"><i class="fas fa-map"></i> Carte indisponible (hors-ligne). Les tâches restent jouables normalement.</div>';
        els.geoStatus.style.display = 'none';
        return;
    }

    map = L.map('explo-map', { zoomControl: true, attributionControl: false });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
    }).addTo(map);

    const routePoints = [
        [mission.start.lat, mission.start.lng],
        ...mission.tasks.map(t => [t.lat, t.lng]),
        [mission.end.lat, mission.end.lng]
    ];

    L.polyline(routePoints, { color: '#22c55e', weight: 4, opacity: 0.8, dashArray: '2, 10' }).addTo(map);

    const startIcon = L.divIcon({
        className: 'explo-map-icon explo-map-icon-start',
        html: '<i class="fas fa-flag"></i>',
        iconSize: [34, 34]
    });
    const endIcon = L.divIcon({
        className: 'explo-map-icon explo-map-icon-end',
        html: '<i class="fas fa-flag-checkered"></i>',
        iconSize: [34, 34]
    });

    L.marker([mission.start.lat, mission.start.lng], { icon: startIcon }).addTo(map).bindPopup(mission.start.label);
    L.marker([mission.end.lat, mission.end.lng], { icon: endIcon }).addTo(map).bindPopup(mission.end.label);

    mission.tasks.forEach((task, index) => {
        const taskIcon = L.divIcon({
            className: 'explo-map-icon explo-map-icon-task',
            html: `<span>${index + 1}</span>`,
            iconSize: [26, 26]
        });
        L.marker([task.lat, task.lng], { icon: taskIcon }).addTo(map).bindPopup(task.title);
    });

    const bounds = L.latLngBounds(routePoints);
    map.fitBounds(bounds, { padding: [30, 30] });
}

function currentObjective() {
    if (progress.currentTaskIndex < mission.tasks.length) {
        return mission.tasks[progress.currentTaskIndex];
    }
    return mission.end;
}

function startGeolocation() {
    if (!('geolocation' in navigator)) {
        els.geoStatus.innerHTML = `<i class="fas fa-triangle-exclamation"></i> Géolocalisation non supportée sur cet appareil.`;
        return;
    }

    watchId = navigator.geolocation.watchPosition(onPosition, onPositionError, {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 15000
    });
}

function onPosition(pos) {
    const { latitude, longitude } = pos.coords;

    els.geoStatus.innerHTML = `<i class="fas fa-location-crosshairs"></i> Position active`;
    els.distanceReadout.style.display = 'flex';

    if (map) {
        const userIcon = L.divIcon({
            className: 'explo-map-icon explo-map-icon-user',
            html: '<span class="explo-user-dot"></span>',
            iconSize: [22, 22]
        });

        if (!userMarker) {
            userMarker = L.marker([latitude, longitude], { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
        } else {
            userMarker.setLatLng([latitude, longitude]);
        }
    }

    const objective = currentObjective();
    const dist = distanceMeters(latitude, longitude, objective.lat, objective.lng);
    els.distanceValue.textContent = formatDistance(dist);
    els.distanceReadout.classList.toggle('explo-distance-close', dist < 50);
}

function onPositionError(err) {
    els.geoStatus.innerHTML = `<i class="fas fa-triangle-exclamation"></i> Position indisponible (${err.message || 'accès refusé'})`;
    els.distanceReadout.style.display = 'none';
}

function renderProgressBar() {
    const total = mission.tasks.length;
    const done = progress.completedTaskIds.length;
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);
    els.progressBar.style.width = `${pct}%`;
    els.progressLabel.textContent = `${done} / ${total} tâches terminées`;
}

function renderTaskList() {
    els.taskList.innerHTML = '';
    mission.tasks.forEach((task, index) => {
        const isDone = progress.completedTaskIds.includes(task.id);
        const isCurrent = !isDone && index === progress.currentTaskIndex;
        const li = document.createElement('li');
        li.className = `explo-task-item ${isDone ? 'is-done' : ''} ${isCurrent ? 'is-current' : ''}`;
        li.innerHTML = `
            <span class="explo-task-item-icon">
                <i class="fas ${isDone ? 'fa-circle-check' : (isCurrent ? 'fa-location-dot' : 'fa-circle')}"></i>
            </span>
            <span class="explo-task-item-title">${index + 1}. ${task.title}</span>
            <span class="explo-task-item-points">+${task.points} pts</span>
        `;
        els.taskList.appendChild(li);
    });
    renderProgressBar();
}

function renderCurrentTask() {
    const total = mission.tasks.length;

    if (progress.currentTaskIndex >= total) {
        finishMission();
        return;
    }

    const task = mission.tasks[progress.currentTaskIndex];
    els.taskIndexLabel.textContent = `Tâche ${progress.currentTaskIndex + 1} / ${total}`;
    els.taskPoints.textContent = `+${task.points} pts`;
    els.taskTitle.textContent = task.title;
    els.taskDescription.textContent = task.description;

    els.completeBtn.onclick = () => completeCurrentTask(task);
}

function completeCurrentTask(task) {
    if (!progress.completedTaskIds.includes(task.id)) {
        progress.completedTaskIds.push(task.id);
    }
    progress.currentTaskIndex += 1;
    saveProgress();
    renderTaskList();
    renderCurrentTask();
}

function finishMission() {
    progress.status = 'completed';
    progress.completedAt = new Date().toISOString();
    saveProgress();

    if (watchId !== null) navigator.geolocation.clearWatch(watchId);

    document.getElementById('task-panel').style.display = 'none';

    const totalPoints = mission.tasks.reduce((sum, t) => sum + t.points, 0);
    const playerName = getPlayerName();

    els.completeTitle.textContent = playerName ? `Bravo ${playerName} !` : 'Mission accomplie !';
    els.completeMessage.textContent = `Tu as terminé "${mission.title}" du départ jusqu'à l'arrivée.`;
    els.completePoints.textContent = `${totalPoints} points gagnés`;
    els.completeOverlay.style.display = 'flex';
}

function pauseMission() {
    progress.status = 'paused';
    saveProgress();
    els.pauseOverlay.style.display = 'flex';
}
