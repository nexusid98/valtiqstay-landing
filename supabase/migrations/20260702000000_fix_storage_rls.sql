-- Fix: storage policy "staff_select_docs" era troppo permissiva
-- Chiunque autenticato poteva leggere documenti di qualsiasi hotel.
-- La nuova policy verifica che la reservation appartenga a un hotel
-- di cui l'utente è membro prima di concedere l'accesso.

drop policy if exists "staff_select_docs" on storage.objects;

create policy "staff_select_docs" on storage.objects for select
  using (
    bucket_id = 'guest-documents'
    and auth.role() = 'authenticated'
    and exists (
      select 1
      from reservations r
      join hotel_users hu on hu.hotel_id = r.hotel_id
      where hu.user_id = auth.uid()
        and storage.objects.name like (r.id::text || '/%')
    )
  );
