-- =====================================================================
-- Avenir de Thiawlene : politiques de sécurité PROPOSÉES (non appliquées)
-- =====================================================================
-- À relire puis exécuter dans Supabase > SQL Editor, idéalement d'abord
-- sur une branche ou un projet de test. Le script est rejouable.
--
-- Principe :
--   * public (anon)   : lit seulement le contenu public (matches, galerie, quiz)
--                       et peut seulement AJOUTER une visite ou un score.
--   * administrateurs : listés dans public.admins, eux seuls modifient.
--   * joueurs (données de mineurs, parents, téléphones) : jamais lisibles en public.
--
-- AVANT D'EXÉCUTER :
--   1. Auth > Providers > Email : désactiver "Allow new users to sign up".
--      Sinon n'importe qui peut créer un compte et devenir "authenticated".
--   2. Remplacer l'e-mail ci-dessous par celui du compte admin réel.
-- =====================================================================

-- 0. Diagnostic : état actuel (lecture seule, à lancer en premier)
-- select tablename, rowsecurity from pg_tables where schemaname = 'public';
-- select tablename, policyname, roles, cmd, qual, with_check from pg_policies where schemaname = 'public';

-- 1. Liste des administrateurs ----------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;

insert into public.admins (user_id)
select id from auth.users where email = 'REMPLACER_PAR_EMAIL_ADMIN@exemple.com'
on conflict do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins a where a.user_id = (select auth.uid()));
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- 2. Activer RLS partout ----------------------------------------------
alter table public.joueurs        enable row level security;
alter table public.matches        enable row level security;
alter table public.gallery        enable row level security;
alter table public.quiz_themes    enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_results   enable row level security;
alter table public.site_tracking  enable row level security;

-- 3. Supprimer les anciennes politiques permissives --------------------
-- (pour repartir proprement ; vérifier leurs noms avec la requête de diagnostic)
do $$
declare r record;
begin
  for r in
    select schemaname, tablename, policyname from pg_policies
    where schemaname = 'public'
      and tablename in ('joueurs','matches','gallery','quiz_themes','quiz_questions','quiz_results','site_tracking')
  loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

-- 4. joueurs : réservé aux admins (données personnelles de mineurs) ----
create policy "joueurs_admin_all" on public.joueurs
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- 5. Contenu public en lecture, écriture admin -------------------------
create policy "matches_public_read" on public.matches for select to anon, authenticated using (true);
create policy "matches_admin_write" on public.matches for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "gallery_public_read" on public.gallery for select to anon, authenticated using (true);
create policy "gallery_admin_write" on public.gallery for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "quiz_themes_public_read" on public.quiz_themes for select to anon, authenticated using (true);
create policy "quiz_themes_admin_write" on public.quiz_themes for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- NB : les bonnes réponses (correct_index) restent lisibles par le quiz public.
-- Pour empêcher la triche, il faudrait corriger le quiz côté serveur (fonction RPC).
create policy "quiz_questions_public_read" on public.quiz_questions for select to anon, authenticated using (true);
create policy "quiz_questions_admin_write" on public.quiz_questions for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- 6. quiz_results : le public peut seulement ajouter un score valide ---
-- Les noms et téléphones des participants ne sont lisibles que par les admins.
create policy "quiz_results_public_insert" on public.quiz_results
  for insert to anon, authenticated
  with check (
    char_length(coalesce(user_name, ''))  between 1 and 60
    and char_length(coalesce(user_phone, '')) between 4 and 20
    and char_length(coalesce(theme_name, '')) <= 100
    and char_length(coalesce(difficulty, '')) <= 20
    and total_questions between 1 and 50
    and score between 0 and total_questions
  );
create policy "quiz_results_admin_read" on public.quiz_results for select to authenticated
  using ((select public.is_admin()));
create policy "quiz_results_admin_delete" on public.quiz_results for delete to authenticated
  using ((select public.is_admin()));

-- 7. site_tracking : ajout de visites seulement, lecture admin --------
create policy "site_tracking_public_insert" on public.site_tracking
  for insert to anon, authenticated
  with check (
    char_length(coalesce(page_path, ''))   <= 100
    and char_length(coalesce(referrer, ''))    <= 255
    and char_length(coalesce(device_type, '')) <= 20
    and char_length(coalesce(browser, ''))     <= 40
    and char_length(coalesce(screen_size, '')) <= 20
    and char_length(coalesce(session_id, ''))  <= 64
  );
create policy "site_tracking_admin_read" on public.site_tracking for select to authenticated
  using ((select public.is_admin()));

-- 8. Stockage : bucket "football" -------------------------------------
-- Lecture publique (les URL publiques des photos), écriture admin seulement.
update storage.buckets
   set file_size_limit = 5242880,
       allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif']
 where id = 'football';

drop policy if exists "football_admin_insert" on storage.objects;
drop policy if exists "football_admin_update" on storage.objects;
drop policy if exists "football_admin_delete" on storage.objects;
create policy "football_admin_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'football' and (select public.is_admin()));
create policy "football_admin_update" on storage.objects for update to authenticated
  using (bucket_id = 'football' and (select public.is_admin()));
create policy "football_admin_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'football' and (select public.is_admin()));
-- Vérifier aussi qu'aucune ancienne politique storage n'autorise anon à écrire :
-- select policyname, roles, cmd from pg_policies where schemaname = 'storage';
