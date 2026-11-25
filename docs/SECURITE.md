# Audit de sécurité : Avenir de Thiawlene (novembre 2026)

Périmètre : site statique HTML/CSS/JS, client Supabase côté navigateur, déploiement Vercel.

## Résumé des risques

| # | Risque | Gravité | État |
|---|--------|---------|------|
| 1 | XSS stockée dans le tableau de bord via `quiz_results` et `site_tracking` | **Critique** | Corrigé dans le code |
| 2 | Données des joueurs mineurs (noms des parents, téléphones) peut-être lisibles en public si RLS est absent ou trop large | **Critique (à vérifier)** | SQL proposé |
| 3 | Tout compte connecté est traité comme admin ; inscription publique possiblement ouverte | **Élevée** | SQL proposé + réglage Auth |
| 4 | Pas d'en-têtes de sécurité (CSP, anti-clickjacking, etc.) | Moyenne | Corrigé (`vercel.json`) |
| 5 | Script Supabase chargé en version flottante `@2` depuis un CDN, sans contrôle d'intégrité | Moyenne | Corrigé (version figée + SRI) |
| 6 | Upload de fichiers sans contrôle de type ni de taille | Moyenne | Corrigé côté client + limite du bucket proposée |
| 7 | Bonnes réponses du quiz lisibles dans le navigateur (triche possible) | Faible | Documenté |
| 8 | `unsafe-inline` encore nécessaire dans la CSP (scripts inline et `onclick`) | Faible | À faire plus tard |

## 1. XSS stockée (critique, corrigé)

`quiz_results` et `site_tracking` acceptent des insertions depuis le public (clé publishable). Le tableau de bord affichait ces valeurs avec `innerHTML` sans échappement. Un visiteur pouvait donc enregistrer un nom comme `<img src=x onerror=...>` : le code s'exécutait dans la session de l'admin à l'ouverture du tableau de bord, avec accès à son jeton Supabase (stocké dans `localStorage`) et donc à toutes les données.

Correctifs :
- Nouveaux helpers dans `js/supabase-config.js` : `escapeHTML`, `safeUrl` (bloque `javascript:` et `data:`) et `safeIconClass`.
- Toutes les valeurs venant de la base sont échappées dans `js/dashboard-v2.js`, `js/publications.js` et `js/quiz.js`.
- Les `onclick` ne reçoivent plus que des identifiants. Le nom et l'icône d'un thème sont relus depuis un cache, car un échappement HTML ne protège pas une chaîne JS placée dans un attribut.
- Les `<option>` sont créées avec `new Option()` plutôt qu'avec `innerHTML`.
- Le lien WhatsApp a reçu `rel="noopener noreferrer"`.
- `deleteItem` n'accepte plus que les tables prévues.

Vérification : avec des données piégées simulées, l'ancien code exécutait `alert(1)` dans le tableau de bord. Le nouveau code n'exécute rien, et le texte s'affiche tel quel.

Bug corrigé au passage : `fetchAudienceData()` était appelée avant d'être définie. Le chargement du tableau de bord s'arrêtait alors sur une erreur, et le temps réel, le rafraîchissement automatique et les formulaires du quiz n'étaient pas initialisés. La fonction est maintenant déclarée de façon hoistée.

## 2 et 3. Supabase : clés, RLS, rôles

**Clés exposées** : seule la clé `sb_publishable_…` figure dans le code (`js/supabase-config.js`). C'est normal et acceptable. Aucune clé `secret` ni `service_role` n'a été trouvée dans le dépôt.

**Vérification RLS non faite** : le projet Supabase du site (`gqnqjbwqybuhrttgymhm`) n'est pas accessible avec le connecteur Supabase actuel, qui ne voit que deux autres projets. Les advisors et les politiques n'ont donc pas pu être lus. Tables utilisées par le code :

| Table | Accès public nécessaire | Accès admin |
|-------|-------------------------|-------------|
| `joueurs` | **aucun** | tout |
| `matches`, `gallery`, `quiz_themes`, `quiz_questions` | lecture | tout |
| `quiz_results` | insertion seulement | lecture et suppression |
| `site_tracking` | insertion seulement | lecture |
| Storage `football` | lecture des fichiers | upload et suppression |

Le fichier [`supabase/securite-rls-proposee.sql`](../supabase/securite-rls-proposee.sql) contient les politiques correspondantes. **Il n'a pas été appliqué.** Il ajoute une table `admins` et une fonction `is_admin()`, pour que seul le staff listé puisse modifier les données (et non n'importe quel compte connecté). Il limite aussi la longueur des champs insérés par le public, et la taille et le type des fichiers du bucket.

À faire dans le tableau de bord Supabase :
1. Auth > Sign In / Providers : désactiver les nouvelles inscriptions (« Allow new users to sign up »).
2. Lancer les requêtes de diagnostic en tête du fichier SQL, puis le script après relecture.
3. Ouvrir Advisors > Security Advisor et corriger les alertes restantes.

Test rapide depuis un terminal, pour voir si les joueurs sont publics (un résultat autre que `[]` signifie une fuite) :

```bash
curl "https://gqnqjbwqybuhrttgymhm.supabase.co/rest/v1/joueurs?select=nom&limit=1" \
  -H "apikey: sb_publishable__RSQpoMDW24pa_hzVRbfpA_A0xOrEto"
```

## 4. En-têtes HTTP (corrigé)

Nouveau fichier `vercel.json` :
- `Content-Security-Policy` : scripts limités au site et à jsDelivr, connexions limitées au projet Supabase, `frame-ancestors 'none'`, `object-src 'none'` et `base-uri 'self'`.
- `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security` et `Cross-Origin-Opener-Policy`.
- `dashboard` et `login` : `Cache-Control: no-store` et `X-Robots-Tag: noindex`.

Si un nouveau service externe est ajouté (Google Maps, analytics, vidéo…), il faudra ajouter son domaine dans la CSP.

## 5. Dépendance CDN (corrigé)

`@supabase/supabase-js@2` devient `@2.119.0/dist/umd/supabase.js` avec un attribut `integrity` (SRI) : si le CDN servait un fichier modifié, le navigateur refuserait de l'exécuter. Pour mettre à jour la version, il faut recalculer le hash SRI.

## 6. Uploads (corrigé côté client)

`uploadFile` n'accepte plus que JPG, PNG, WEBP et GIF de 5 Mo au maximum. Le nom de fichier vient de `crypto.randomUUID()` et non plus de l'extension fournie par l'utilisateur. La vraie protection reste la limite du bucket et les politiques Storage du script SQL.

## 7 et 8. Pistes suivantes

- Corriger le quiz côté serveur (fonction RPC qui reçoit les réponses et renvoie le score) pour ne plus exposer `correct_index`, et pour que le score enregistré ne puisse pas être falsifié.
- Remplacer les scripts inline et les `onclick` par des `addEventListener` dans des fichiers `.js`, puis retirer `'unsafe-inline'` de `script-src`.
- Ajouter un captcha ou une limite de débit (Edge Function) sur les insertions publiques si du spam apparaît.
