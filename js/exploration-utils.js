/*
    Avenir de Thiawlene - Jeu d'Exploration
    Utilitaires : progression (pause/reprise) et calcul de distance GPS
*/

const EXPLORATION_STORAGE_KEY = 'adt_exploration_progress_v1';
const EXPLORATION_PLAYER_KEY = 'adt_exploration_player_name';

function getAllProgress() {
    try {
        return JSON.parse(localStorage.getItem(EXPLORATION_STORAGE_KEY)) || {};
    } catch (e) {
        return {};
    }
}

function saveAllProgress(all) {
    localStorage.setItem(EXPLORATION_STORAGE_KEY, JSON.stringify(all));
}

function getMissionProgress(missionId) {
    const all = getAllProgress();
    return all[missionId] || null;
}

function setMissionProgress(missionId, progress) {
    const all = getAllProgress();
    all[missionId] = progress;
    saveAllProgress(all);
}

function clearMissionProgress(missionId) {
    const all = getAllProgress();
    delete all[missionId];
    saveAllProgress(all);
}

function getPlayerName() {
    return localStorage.getItem(EXPLORATION_PLAYER_KEY) || '';
}

function setPlayerName(name) {
    localStorage.setItem(EXPLORATION_PLAYER_KEY, name);
}

// Distance en mètres entre deux points GPS (formule de Haversine)
function distanceMeters(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const toRad = (v) => (v * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function formatDistance(meters) {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
}
