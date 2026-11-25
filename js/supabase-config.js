// Configuration de la connexion à Supabase
// NOTE SÉCURITÉ : seule la clé "publishable" (ex-"anon") doit apparaître ici.
// Ne JAMAIS mettre la clé "secret" / "service_role" dans le code du site :
// elle contourne toutes les règles RLS. La sécurité des données repose sur RLS.
const SUPABASE_URL = 'https://gqnqjbwqybuhrttgymhm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable__RSQpoMDW24pa_hzVRbfpA_A0xOrEto';

// Initialisation du client Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Helpers de sécurité (anti-XSS) ---
// À utiliser pour TOUTE donnée venant de la base avant de l'insérer via innerHTML.
function escapeHTML(value) {
    if (value === null || value === undefined) return '';
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/`/g, '&#96;');
}

// N'accepte que les URL http(s) ou les chemins relatifs du site (bloque javascript:, data:, etc.)
function safeUrl(value, fallback = '') {
    if (!value) return fallback;
    try {
        const url = new URL(String(value), window.location.origin);
        if (url.protocol === 'https:' || url.protocol === 'http:') return escapeHTML(url.href);
    } catch (e) { /* URL invalide */ }
    return fallback;
}

// Classe d'icône Font Awesome : seulement lettres, chiffres, espaces et tirets
function safeIconClass(value, fallback = 'fas fa-question-circle') {
    const v = String(value || '').trim();
    return /^[a-z0-9 -]{1,60}$/i.test(v) ? v : fallback;
}
