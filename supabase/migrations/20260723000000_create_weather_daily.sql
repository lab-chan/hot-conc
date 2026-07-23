create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron with schema pg_catalog;

create table if not exists public.weather_daily (
  station_id text not null,
  station_name text not null,
  observed_date date not null,
  rain_mm numeric(10, 1) not null check (rain_mm >= 0),
  is_final boolean not null default true,
  source_name text not null,
  source_url text not null,
  source_payload jsonb not null default '{}'::jsonb,
  fetched_at timestamptz not null,
  created_at timestamptz not null default now(),
  primary key (station_id, observed_date)
);

comment on table public.weather_daily is '관리자 우천 검증용 기상청 AWS 일강수량 영구 보관';
comment on column public.weather_daily.source_payload is '최초 수집 당시 기상청 원본 일자료';

alter table public.weather_daily enable row level security;
revoke all on table public.weather_daily from anon, authenticated;
grant all on table public.weather_daily to service_role;

do $$
declare
  existing_job record;
begin
  for existing_job in
    select jobid
      from cron.job
     where jobname in (
       'kma-weather-daily-494',
       'kma-weather-daily-494-0630',
       'kma-weather-daily-494-0640',
       'kma-weather-daily-494-0700'
     )
  loop
    perform cron.unschedule(existing_job.jobid);
  end loop;

  perform cron.schedule(
    'kma-weather-daily-494-0630',
    '30 21 * * *',
    $job$
      select net.http_get(
        url := 'https://fgktnhtcswxczbnrfbai.supabase.co/functions/v1/kma-weather?stationId=494&scheduled=0630&at='
          || extract(epoch from now())::bigint,
        headers := jsonb_build_object(
          'apikey', 'sb_publishable_ihdcdu0I86TT-Ku274tc8g_FMbmQSQv'
        ),
        timeout_milliseconds := 15000
      ) as request_id;
    $job$
  );
end
$$;
