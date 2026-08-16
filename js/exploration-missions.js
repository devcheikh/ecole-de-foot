/*
    Avenir de Thiawlene - Jeu d'Exploration
    Catalogue des missions (MVP : données statiques, migrera vers Supabase en V2)
*/

const EXPLORATION_THEMES = {
    sport: { label: 'Sport', icon: 'fas fa-futbol', color: '#3b82f6' },
    famille: { label: 'Famille', icon: 'fas fa-people-roof', color: '#f59e0b' },
    general: { label: 'Général', icon: 'fas fa-map-location-dot', color: '#8b5cf6' }
};

const EXPLORATION_MISSIONS = [
    {
        id: 'sport-champions',
        title: 'Sur les Traces des Champions',
        theme: 'sport',
        difficulty: 'facile',
        icon: 'fas fa-futbol',
        durationMin: 20,
        description: "Un parcours sportif autour du terrain d'entraînement, jusqu'au stade municipal.",
        start: { lat: 14.7180, lng: -17.2695, label: "Entrée du terrain d'entraînement" },
        end: { lat: 14.7210, lng: -17.2645, label: 'Stade municipal de Rufisque' },
        tasks: [
            {
                id: 't1', title: 'Échauffement de champion',
                description: 'Fais 10 jongles avec un ballon (ou un objet rond) avant de partir.',
                points: 10, lat: 14.7180, lng: -17.2695
            },
            {
                id: 't2', title: 'Le point de passe',
                description: "Trouve le mur le plus proche du terrain et fais 5 passes contre ce mur.",
                points: 10, lat: 14.7190, lng: -17.2680
            },
            {
                id: 't3', title: 'Salue un joueur',
                description: "Si tu croises un membre de l'école, salue-le et demande-lui son poste préféré.",
                points: 15, lat: 14.7200, lng: -17.2665
            },
            {
                id: 't4', title: 'Arrivée au stade',
                description: 'Te voilà devant le stade municipal : mission accomplie !',
                points: 15, lat: 14.7210, lng: -17.2645
            }
        ]
    },
    {
        id: 'sport-gardien',
        title: 'Le Circuit du Petit Gardien',
        theme: 'sport',
        difficulty: 'moyen',
        icon: 'fas fa-shield-halved',
        durationMin: 25,
        description: "Un défi de gardien de but entre le terrain annexe et l'aire de jeux du quartier.",
        start: { lat: 14.7205, lng: -17.2680, label: 'Terrain annexe' },
        end: { lat: 14.7225, lng: -17.2650, label: 'Aire de jeux du quartier' },
        tasks: [
            {
                id: 't1', title: 'Plongeon du gardien',
                description: 'Simule 3 arrêts de gardien de but, un à gauche, un à droite, un au centre.',
                points: 10, lat: 14.7205, lng: -17.2680
            },
            {
                id: 't2', title: 'Slalom',
                description: 'Fais un slalom entre 5 objets (pierres, plots, bouteilles) que tu trouves sur ton chemin.',
                points: 15, lat: 14.7213, lng: -17.2668
            },
            {
                id: 't3', title: 'Tir au but',
                description: 'Vise une cible avec un ballon ou une balle, 5 essais.',
                points: 15, lat: 14.7218, lng: -17.2658
            },
            {
                id: 't4', title: 'Fin du parcours',
                description: "Arrivée à l'aire de jeux du quartier. Bien joué, champion !",
                points: 10, lat: 14.7225, lng: -17.2650
            }
        ]
    },
    {
        id: 'famille-tresor',
        title: 'Chasse au Trésor en Famille',
        theme: 'famille',
        difficulty: 'facile',
        icon: 'fas fa-people-roof',
        durationMin: 25,
        description: 'Une balade en famille, entre observation, souvenirs et rires, jusqu\'au marché de Thiawlene.',
        start: { lat: 14.7150, lng: -17.2700, label: 'Devant la grande mosquée du quartier' },
        end: { lat: 14.7175, lng: -17.2660, label: 'Place du marché de Thiawlene' },
        tasks: [
            {
                id: 't1', title: 'Objet rouge',
                description: 'Trouve et montre à un adulte un objet rouge sur le chemin.',
                points: 10, lat: 14.7150, lng: -17.2700
            },
            {
                id: 't2', title: 'Question à un aîné',
                description: 'Demande à un membre de ta famille comment était le quartier il y a 20 ans.',
                points: 15, lat: 14.7160, lng: -17.2685
            },
            {
                id: 't3', title: 'Les portes bleues',
                description: 'Compte le nombre de portes bleues que tu croises sur le chemin.',
                points: 10, lat: 14.7168, lng: -17.2672
            },
            {
                id: 't4', title: 'Photo souvenir',
                description: 'Prends une photo en famille devant le marché de Thiawlene.',
                points: 15, lat: 14.7175, lng: -17.2660
            }
        ]
    },
    {
        id: 'general-rufisque',
        title: 'Découverte de Rufisque',
        theme: 'general',
        difficulty: 'moyen',
        icon: 'fas fa-map-location-dot',
        durationMin: 30,
        description: 'Un parcours de découverte entre la gare et la vieille ville, pour les jeunes curieux.',
        start: { lat: 14.7195, lng: -17.2730, label: 'Gare de Rufisque' },
        end: { lat: 14.7230, lng: -17.2690, label: 'Vieille ville et façades coloniales' },
        tasks: [
            {
                id: 't1', title: "L'histoire de la gare",
                description: 'Observe le bâtiment de la gare et note une chose qui te surprend.',
                points: 10, lat: 14.7195, lng: -17.2730
            },
            {
                id: 't2', title: 'Rue commerçante',
                description: 'Traverse le grand marché et observe 3 métiers différents exercés autour de toi.',
                points: 15, lat: 14.7210, lng: -17.2715
            },
            {
                id: 't3', title: 'Façade colorée',
                description: 'Trouve la façade la plus colorée ou la plus ancienne du quartier.',
                points: 15, lat: 14.7220, lng: -17.2700
            },
            {
                id: 't4', title: 'Arrivée en vieille ville',
                description: 'Tu es arrivé en vieille ville. Bravo, explorateur !',
                points: 10, lat: 14.7230, lng: -17.2690
            }
        ]
    }
];

function getMissionById(id) {
    return EXPLORATION_MISSIONS.find(m => m.id === id) || null;
}
