alter table public.photo_boards
  add column if not exists settings jsonb;

update public.photo_boards
   set settings = '{"daySlots":[1,2,3,4,5],"temperatureSlots":[1,2],"extraDaySlotsHidden":false,"dayLabels":{}}'::jsonb
 where settings is null
    or settings = '{}'::jsonb;

alter table public.photo_boards
  alter column settings set default '{"daySlots":[1,2,3,4,5],"temperatureSlots":[1,2],"extraDaySlotsHidden":false,"dayLabels":{}}'::jsonb,
  alter column settings set not null;

alter table public.photo_boards
  add column if not exists deleted_at timestamptz;

do $$
begin
  if exists (
    select 1
      from public.photo_entries
     group by board_id, day_no
    having count(*) > 1
  ) then
    raise exception 'photo_entries contains duplicate (board_id, day_no) rows';
  end if;
end;
$$;

create unique index if not exists photo_entries_board_day_unique_idx
  on public.photo_entries (board_id, day_no);


create or replace function public.set_photo_record_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
begin
  new.updated_at := clock_timestamp();
  return new;
end;
$$;

drop trigger if exists photo_boards_set_updated_at on public.photo_boards;
create trigger photo_boards_set_updated_at
before update on public.photo_boards
for each row
execute function public.set_photo_record_updated_at();

drop trigger if exists photo_entries_set_updated_at on public.photo_entries;
create trigger photo_entries_set_updated_at
before update on public.photo_entries
for each row
execute function public.set_photo_record_updated_at();

create or replace function public.assert_photo_entry_board_active()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_memo jsonb := '{}'::jsonb;
begin
  if current_setting('app.photo_entry_atomic_write', true) is distinct from 'on' then
    raise exception 'photo_entries must be changed through save_photo_entry_atomic'
      using errcode = '42501';
  end if;

  perform 1
    from public.photo_boards as b
   where b.id = new.board_id
     and b.deleted_at is null
   for share;

  if not found then
    raise exception 'active photo board % was not found', new.board_id
      using errcode = 'P0002';
  end if;

  if nullif(btrim(new.memo), '') is not null then
    begin
      v_memo := new.memo::jsonb;
    exception
      when invalid_text_representation then
        v_memo := '{}'::jsonb;
    end;
  end if;
  if jsonb_typeof(v_memo) is distinct from 'object' then
    v_memo := '{}'::jsonb;
  end if;

  -- Keep curing-photo and rain-hold states mutually exclusive even for old
  -- clients that write photo_entries directly instead of using the RPC.
  if lower(coalesce(v_memo ->> 'rainHold', v_memo ->> 'rain_hold', 'false')) in ('true', '1', 'yes', 'on')
     and (
       nullif(btrim(new.photo_url), '') is not null
       or nullif(btrim(new.photo_path), '') is not null
       or nullif(btrim(v_memo -> 'photos' -> 'curing' ->> 'photoUrl'), '') is not null
       or nullif(btrim(v_memo -> 'photos' -> 'curing' ->> 'photo_url'), '') is not null
       or nullif(btrim(v_memo -> 'photos' -> 'curing' ->> 'photoPath'), '') is not null
       or nullif(btrim(v_memo -> 'photos' -> 'curing' ->> 'photo_path'), '') is not null
       or nullif(btrim(v_memo -> 'curing' ->> 'photoUrl'), '') is not null
       or nullif(btrim(v_memo -> 'curing' ->> 'photoPath'), '') is not null
       or nullif(btrim(v_memo -> 'curingPhoto' ->> 'photoUrl'), '') is not null
       or nullif(btrim(v_memo -> 'curingPhoto' ->> 'photoPath'), '') is not null
       or nullif(btrim(v_memo ->> 'photoUrl'), '') is not null
       or nullif(btrim(v_memo ->> 'photo_url'), '') is not null
       or nullif(btrim(v_memo ->> 'photoPath'), '') is not null
       or nullif(btrim(v_memo ->> 'photo_path'), '') is not null
     ) then
    raise exception 'curing photo and rainHold cannot coexist'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists photo_entries_require_active_board on public.photo_entries;
create trigger photo_entries_require_active_board
before insert or update on public.photo_entries
for each row
execute function public.assert_photo_entry_board_active();


create or replace function public.assert_photo_entry_delete_via_purge()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
begin
  if current_setting('app.photo_entry_atomic_delete', true) is distinct from 'on' then
    raise exception 'photo_entries must be deleted through purge_photo_board'
      using errcode = '42501';
  end if;
  return old;
end;
$$;

drop trigger if exists photo_entries_require_atomic_delete on public.photo_entries;
create trigger photo_entries_require_atomic_delete
before delete on public.photo_entries
for each row
execute function public.assert_photo_entry_delete_via_purge();


create or replace function public.assert_photo_board_delete_via_purge()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
begin
  if current_setting('app.photo_board_atomic_delete', true) is distinct from 'on' then
    raise exception 'photo_boards must be deleted through purge_photo_board'
      using errcode = '42501';
  end if;
  return old;
end;
$$;

drop trigger if exists photo_boards_require_atomic_delete on public.photo_boards;
create trigger photo_boards_require_atomic_delete
before delete on public.photo_boards
for each row
execute function public.assert_photo_board_delete_via_purge();


drop function if exists public.save_photo_entry_atomic(
  uuid, integer, text, text, text, bigint, text, text, boolean
);
drop function if exists public.save_photo_entry_atomic(
  uuid, integer, text, text, text, bigint, text, text, boolean, boolean
);

create function public.save_photo_entry_atomic(
  p_board_id uuid,
  p_day_no integer,
  p_photo_type text,
  p_photo_url text default null,
  p_photo_path text default null,
  p_size_bytes bigint default 0,
  p_captured_at text default null,
  p_captured_at_source text default null,
  p_rain_hold boolean default null,
  p_mutate_photo boolean default true
)
returns jsonb
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_board_id uuid;
  v_entry public.photo_entries%rowtype;
  v_memo jsonb;
  v_photos jsonb;
  v_existing_photo jsonb;
  v_photo_meta jsonb;
  v_old_photo_path text;
  v_photo_type text := lower(btrim(coalesce(p_photo_type, '')));
  v_photo_url text := nullif(btrim(p_photo_url), '');
  v_photo_path text := nullif(btrim(p_photo_path), '');
  v_captured_at text := nullif(btrim(p_captured_at), '');
  v_captured_at_source text := nullif(btrim(p_captured_at_source), '');
  v_is_delete boolean;
  v_mutate_photo boolean := coalesce(p_mutate_photo, true);
  v_has_curing_photo boolean;
  v_rain_hold_enabled boolean;
  v_saved_at timestamptz;
begin
  if p_board_id is null then
    raise exception 'p_board_id is required'
      using errcode = '22023';
  end if;

  if p_day_no is null or p_day_no <= 0 then
    raise exception 'p_day_no must be a positive integer'
      using errcode = '22023';
  end if;

  if v_photo_type not in ('curing', 'temperature') then
    raise exception 'p_photo_type must be curing or temperature'
      using errcode = '22023';
  end if;

  if p_size_bytes is not null and p_size_bytes < 0 then
    raise exception 'p_size_bytes cannot be negative'
      using errcode = '22023';
  end if;

  -- Reject stale clients that still perform read/merge/upsert directly. The
  -- transaction-local flag is visible to the write trigger only for this RPC.
  perform set_config('app.photo_entry_atomic_write', 'on', true);

  -- Lock the parent first. All photo mutation RPCs use this order so that a
  -- concurrent tombstone or purge cannot race a save into a deleted board.
  select b.id
    into v_board_id
    from public.photo_boards as b
   where b.id = p_board_id
     and b.deleted_at is null
   for update;

  if not found then
    raise exception 'active photo board % was not found', p_board_id
      using errcode = 'P0002';
  end if;

  -- The existing unique(board_id, day_no) constraint serializes concurrent
  -- first inserts. The following SELECT then locks both new and existing rows.
  insert into public.photo_entries (board_id, day_no)
  values (p_board_id, p_day_no)
  on conflict (board_id, day_no) do nothing;

  select e.*
    into v_entry
    from public.photo_entries as e
   where e.board_id = p_board_id
     and e.day_no = p_day_no
   for update;

  if not found then
    raise exception 'photo entry for board %, day % could not be locked', p_board_id, p_day_no
      using errcode = 'P0002';
  end if;

  -- memo is a legacy text column. Invalid or non-object JSON is treated as an
  -- empty memo, while valid object keys outside photos are retained.
  if nullif(btrim(v_entry.memo), '') is null then
    v_memo := '{}'::jsonb;
  else
    begin
      v_memo := v_entry.memo::jsonb;
    exception
      when invalid_text_representation then
        v_memo := '{}'::jsonb;
    end;
  end if;

  if jsonb_typeof(v_memo) is distinct from 'object' then
    v_memo := '{}'::jsonb;
  end if;

  if jsonb_typeof(v_memo -> 'photos') = 'object' then
    v_photos := v_memo -> 'photos';
  else
    v_photos := '{}'::jsonb;
  end if;

  -- Read the replaced object's path only after both locks are held. Legacy
  -- spellings are accepted so callers can safely clean up pre-RPC uploads too.
  if v_mutate_photo and v_photo_type = 'curing' then
    v_old_photo_path := coalesce(
      nullif(btrim(v_entry.photo_path), ''),
      nullif(btrim(v_photos -> 'curing' ->> 'photoPath'), ''),
      nullif(btrim(v_photos -> 'curing' ->> 'photo_path'), ''),
      nullif(btrim(v_memo -> 'curing' ->> 'photoPath'), ''),
      nullif(btrim(v_memo -> 'curing' ->> 'photo_path'), ''),
      nullif(btrim(v_memo -> 'curingPhoto' ->> 'photoPath'), ''),
      nullif(btrim(v_memo -> 'curingPhoto' ->> 'photo_path'), ''),
      nullif(btrim(v_memo ->> 'photoPath'), ''),
      nullif(btrim(v_memo ->> 'photo_path'), '')
    );
  elsif v_mutate_photo then
    v_old_photo_path := coalesce(
      nullif(btrim(v_photos -> 'temperature' ->> 'photoPath'), ''),
      nullif(btrim(v_photos -> 'temperature' ->> 'photo_path'), ''),
      nullif(btrim(v_memo -> 'temperature' ->> 'photoPath'), ''),
      nullif(btrim(v_memo -> 'temperature' ->> 'photo_path'), ''),
      nullif(btrim(v_memo -> 'temperaturePhoto' ->> 'photoPath'), ''),
      nullif(btrim(v_memo -> 'temperaturePhoto' ->> 'photo_path'), ''),
      nullif(btrim(v_memo ->> 'temperaturePhotoPath'), '')
    );
  end if;

  -- Remove only the selected type's legacy aliases. Without this cleanup, an
  -- old top-level value could make a deleted photo reappear in legacy readers.
  if v_mutate_photo and v_photo_type = 'curing' then
    v_memo := v_memo - array[
      'curing', 'curingPhoto',
      'photoUrl', 'photo_url', 'photoPath', 'photo_path',
      'uploadedAt', 'uploaded_at', 'verifiedAt', 'verified_at',
      'verifiedAtSource', 'verified_at_source',
      'capturedAt', 'captured_at', 'takenAt', 'taken_at',
      'capturedAtSource', 'captured_at_source',
      'sizeBytes', 'size_bytes'
    ];
  elsif v_mutate_photo then
    v_memo := v_memo - array[
      'temperature', 'temperaturePhoto',
      'temperaturePhotoUrl', 'temperaturePhotoPath',
      'temperatureUploadedAt', 'temperatureVerifiedAt', 'temperatureVerifiedAtSource',
      'temperatureCapturedAt', 'temperatureTakenAt',
      'temperatureCapturedAtSource', 'temperatureSizeBytes'
    ];
  end if;

  v_is_delete := v_mutate_photo and v_photo_url is null and v_photo_path is null;
  v_saved_at := clock_timestamp();

  if not v_mutate_photo then
    null;
  elsif v_is_delete then
    v_photos := v_photos - v_photo_type;
  else
    if jsonb_typeof(v_photos -> v_photo_type) = 'object' then
      v_existing_photo := v_photos -> v_photo_type;
    else
      v_existing_photo := '{}'::jsonb;
    end if;

    v_photo_meta := v_existing_photo || jsonb_build_object(
      'photoUrl', coalesce(v_photo_url, ''),
      'photoPath', coalesce(v_photo_path, ''),
      'uploadedAt', v_saved_at,
      'verifiedAt', v_saved_at,
      'verifiedAtSource', 'server',
      'capturedAt', coalesce(v_captured_at, ''),
      'capturedAtSource', coalesce(v_captured_at_source, ''),
      'sizeBytes', coalesce(p_size_bytes, 0)
    );
    v_photos := jsonb_set(v_photos, array[v_photo_type], v_photo_meta, true);
  end if;

  v_memo := jsonb_set(v_memo, '{photos}', v_photos, true);

  -- rainHold belongs to curing state. Temperature updates must not overwrite a
  -- concurrently established curing/rain decision.
  if v_photo_type = 'curing' and p_rain_hold is not null then
    v_memo := jsonb_set(v_memo, '{rainHold}', to_jsonb(p_rain_hold), true);
  end if;

  v_rain_hold_enabled := lower(coalesce(v_memo ->> 'rainHold', v_memo ->> 'rain_hold', 'false'))
    in ('true', '1', 'yes', 'on');
  v_has_curing_photo := case
    when v_photo_type = 'curing' and v_mutate_photo then not v_is_delete
    else (
      nullif(btrim(v_entry.photo_url), '') is not null
      or nullif(btrim(v_entry.photo_path), '') is not null
      or nullif(btrim(v_photos -> 'curing' ->> 'photoUrl'), '') is not null
      or nullif(btrim(v_photos -> 'curing' ->> 'photo_url'), '') is not null
      or nullif(btrim(v_photos -> 'curing' ->> 'photoPath'), '') is not null
      or nullif(btrim(v_photos -> 'curing' ->> 'photo_path'), '') is not null
    )
  end;

  if v_rain_hold_enabled and v_has_curing_photo then
    raise exception 'curing photo and rainHold cannot coexist'
      using errcode = '23514';
  end if;

  if v_photo_type = 'curing' then
    update public.photo_entries as e
       set photo_url = case
             when not v_mutate_photo then e.photo_url
             when v_is_delete then null
             else v_photo_url
           end,
           photo_path = case
             when not v_mutate_photo then e.photo_path
             when v_is_delete then null
             else v_photo_path
           end,
           uploaded_at = case
             when not v_mutate_photo then e.uploaded_at
             when v_is_delete then null
             else v_saved_at
           end,
           memo = v_memo::text
     where e.id = v_entry.id
     returning e.* into v_entry;
  else
    update public.photo_entries as e
       set memo = v_memo::text
     where e.id = v_entry.id
     returning e.* into v_entry;
  end if;

  return jsonb_build_object(
    'entry', to_jsonb(v_entry),
    'old_photo_path', v_old_photo_path,
    'verified_at', v_saved_at
  );
end;
$$;


create or replace function public.mark_photo_board_deleted(
  p_board_id uuid
)
returns public.photo_boards
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_board public.photo_boards%rowtype;
begin
  if p_board_id is null then
    raise exception 'p_board_id is required'
      using errcode = '22023';
  end if;

  update public.photo_boards as b
     set deleted_at = coalesce(b.deleted_at, clock_timestamp())
   where b.id = p_board_id
   returning b.* into v_board;

  if not found then
    raise exception 'photo board % was not found', p_board_id
      using errcode = 'P0002';
  end if;

  return v_board;
end;
$$;


create or replace function public.purge_photo_board(
  p_board_id uuid
)
returns boolean
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_board_id uuid;
begin
  if p_board_id is null then
    raise exception 'p_board_id is required'
      using errcode = '22023';
  end if;

  -- Take the same parent lock used by save_photo_entry_atomic before deleting
  -- children. The whole function runs in the caller's single DB transaction.
  select b.id
    into v_board_id
    from public.photo_boards as b
   where b.id = p_board_id
     and b.deleted_at is not null
   for update;

  if not found then
    return false;
  end if;

  perform set_config('app.photo_entry_atomic_delete', 'on', true);
  perform set_config('app.photo_board_atomic_delete', 'on', true);

  delete from public.photo_entries as e
   where e.board_id = p_board_id;

  delete from public.photo_boards as b
   where b.id = p_board_id;

  return true;
end;
$$;


revoke all on function public.set_photo_record_updated_at() from public;
revoke all on function public.assert_photo_entry_board_active() from public;
revoke all on function public.assert_photo_entry_delete_via_purge() from public;
revoke all on function public.assert_photo_board_delete_via_purge() from public;

revoke all on function public.save_photo_entry_atomic(
  uuid, integer, text, text, text, bigint, text, text, boolean, boolean
) from public;
grant execute on function public.save_photo_entry_atomic(
  uuid, integer, text, text, text, bigint, text, text, boolean, boolean
) to anon, authenticated;

revoke all on function public.mark_photo_board_deleted(uuid) from public;
grant execute on function public.mark_photo_board_deleted(uuid) to anon, authenticated;

revoke all on function public.purge_photo_board(uuid) from public;
grant execute on function public.purge_photo_board(uuid) to anon, authenticated;

comment on function public.save_photo_entry_atomic(
  uuid, integer, text, text, text, bigint, text, text, boolean, boolean
) is 'Atomically merges or removes one curing/temperature photo using server verification time.';

comment on function public.mark_photo_board_deleted(uuid)
  is 'Atomically tombstones a photo board without deleting its rows.';

comment on function public.purge_photo_board(uuid)
  is 'Deletes a photo board and all of its photo entries in one database transaction.';

notify pgrst, 'reload schema';
