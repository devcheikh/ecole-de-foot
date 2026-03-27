// Configuration de la connexion à Supabase
const SUPABASE_URL = 'https://gqnqjbwqybuhrttgymhm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable__RSQpoMDW24pa_hzVRbfpA_A0xOrEto';

// Initialisation du client Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
