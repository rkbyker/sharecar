-- ═══════════════════════════════════════════════════════════
--  Sharecar — Supabase Database Schema v2.0
--  Run this in Supabase SQL Editor: Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════

-- ─── Enable extensions ────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── PROFILES ─────────────────────────────────────────────────────────────────
-- Extends auth.users automatically via trigger
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  first_name      text not null default '',
  last_name       text not null default '',
  nickname        text unique,
  city            text default 'Москва',
  avatar_url      text,
  account_type    text default 'personal' check (account_type in ('personal','business')),
  org_name        text,                          -- for business accounts
  level           text default 'bronze' check (level in ('bronze','silver','gold','premium','vip')),
  trips_driven    int  default 0,
  trips_rode      int  default 0,
  rating_driver   numeric(3,2) default 5.00,
  rating_passenger numeric(3,2) default 5.00,
  score           int  default 0,
  credits         int  default 0,
  bio             text,
  instagram       text,
  telegram        text,
  invite_code     text unique default substr(md5(random()::text), 1, 8),
  invited_by      text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ─── CARS ─────────────────────────────────────────────────────────────────────
create table if not exists public.cars (
  id              uuid primary key default uuid_generate_v4(),
  owner_id        uuid references public.profiles(id) on delete cascade,
  status          text default 'draft' check (status in ('draft','published','archived')),
  account_type    text default 'personal' check (account_type in ('personal','business')),

  -- Basic info
  brand           text not null,
  model           text not null,
  year            int,
  color           text,
  description     text,
  hashtags        text[],

  -- Technical
  horsepower      int,
  engine_volume   numeric(3,1),
  drive_type      text,                          -- FWD/RWD/AWD
  transmission    text,                          -- AT/MT

  -- Classification
  car_class       text default 'city' check (car_class in ('ring','drift','city','offroad','special','sport','business')),

  -- Pricing
  is_free         boolean default false,
  price_driver    int default 0,               -- price for driver role
  price_passenger int default 0,              -- price for passenger role
  has_driver_role    boolean default true,
  has_passenger_role boolean default false,

  -- Conditions & Location
  country         text default 'Russia',
  city            text default 'Москва',
  min_level       text default 'bronze',
  schedule        text,

  -- Media
  photos          text[],                        -- URLs from Supabase Storage

  -- Stats
  likes           int default 0,
  views           int default 0,
  requests_count  int default 0,
  rides_count     int default 0,
  rating          numeric(3,2) default 5.00,
  is_boosted      boolean default false,
  boost_until     timestamptz,

  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ─── REQUESTS (Заявки на поездку) ────────────────────────────────────────────
create table if not exists public.requests (
  id              uuid primary key default uuid_generate_v4(),
  car_id          uuid references public.cars(id) on delete cascade,
  owner_id        uuid references public.profiles(id),
  requester_id    uuid references public.profiles(id) on delete cascade,
  role            text default 'driver' check (role in ('driver','passenger')),
  status          text default 'pending' check (status in ('pending','accepted','rejected','completed','cancelled','expired')),

  message         text,
  price           int default 0,
  scheduled_at    timestamptz,
  meeting_point   text,

  -- Confirmations
  user_confirmed  boolean default false,
  owner_confirmed boolean default false,
  user_confirmed_at  timestamptz,
  owner_confirmed_at timestamptz,

  -- Credits for owner (calculated on owner confirm)
  credits_earned  int default 0,

  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ─── MESSAGES (Чат) ──────────────────────────────────────────────────────────
create table if not exists public.messages (
  id              uuid primary key default uuid_generate_v4(),
  request_id      uuid references public.requests(id) on delete cascade,
  sender_id       uuid references public.profiles(id) on delete cascade,
  content         text not null,
  read            boolean default false,
  created_at      timestamptz default now()
);

-- ─── REVIEWS (Отзывы) ────────────────────────────────────────────────────────
create table if not exists public.reviews (
  id              uuid primary key default uuid_generate_v4(),
  request_id      uuid references public.requests(id) on delete cascade,
  car_id          uuid references public.cars(id) on delete cascade,
  reviewer_id     uuid references public.profiles(id) on delete cascade,
  reviewed_id     uuid references public.profiles(id),     -- owner or passenger
  role            text check (role in ('driver','passenger','owner')),
  rating          int check (rating between 1 and 5),
  comment         text,
  tags            text[],
  created_at      timestamptz default now()
);

-- ─── LIKES ───────────────────────────────────────────────────────────────────
create table if not exists public.likes (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references public.profiles(id) on delete cascade,
  car_id          uuid references public.cars(id) on delete cascade,
  created_at      timestamptz default now(),
  unique(user_id, car_id)
);

-- ─── RACING TRACKS ───────────────────────────────────────────────────────────
create table if not exists public.racing_tracks (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  category        text default 'circuit' check (category in ('karting','circuit','drag','offroad')),
  city            text,
  country         text default 'Russia',
  length_m        int,
  description     text,
  active          boolean default true,
  created_at      timestamptz default now()
);

-- ─── RACING RESULTS ──────────────────────────────────────────────────────────
create table if not exists public.racing_results (
  id              uuid primary key default uuid_generate_v4(),
  track_id        uuid references public.racing_tracks(id),
  user_id         uuid references public.profiles(id) on delete cascade,
  car_id          uuid references public.cars(id),
  car_name        text,                           -- denormalized for speed
  lap_time_ms     int,
  position        int,
  points          int default 0,
  session_date    date default current_date,
  verified        boolean default false,
  notes           text,
  created_at      timestamptz default now()
);

-- ─── BOOSTS ──────────────────────────────────────────────────────────────────
create table if not exists public.boosts (
  id              uuid primary key default uuid_generate_v4(),
  car_id          uuid references public.cars(id) on delete cascade,
  owner_id        uuid references public.profiles(id),
  plan            text,
  credits_spent   int,
  starts_at       timestamptz default now(),
  ends_at         timestamptz,
  active          boolean default true,
  created_at      timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════════
--  TRIGGERS & FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, first_name, last_name, city, account_type, org_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.raw_user_meta_data->>'city', 'Москва'),
    coalesce(new.raw_user_meta_data->>'account_type', 'personal'),
    new.raw_user_meta_data->>'org_name'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Update updated_at automatically
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();
create trigger cars_updated_at before update on public.cars
  for each row execute procedure public.set_updated_at();
create trigger requests_updated_at before update on public.requests
  for each row execute procedure public.set_updated_at();

-- Update car likes count
create or replace function public.update_car_likes()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'INSERT' then
    update public.cars set likes = likes + 1 where id = new.car_id;
  elsif TG_OP = 'DELETE' then
    update public.cars set likes = greatest(likes - 1, 0) where id = old.car_id;
  end if;
  return null;
end;
$$;

create trigger likes_car_count
  after insert or delete on public.likes
  for each row execute procedure public.update_car_likes();

-- Calculate RSKG racing points (1→25, 2→18, 3→15, 4→12, 5→10, 6→8, 7→6, 8→4, 9→2, 10→1)
create or replace function public.rskg_points(pos int)
returns int language sql immutable as $$
  select case pos
    when 1 then 25 when 2 then 18 when 3 then 15
    when 4 then 12 when 5 then 10 when 6 then 8
    when 7 then 6  when 8 then 4  when 9 then 2
    when 10 then 1 else 0
  end;
$$;

-- ═══════════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════

alter table public.profiles enable row level security;
alter table public.cars enable row level security;
alter table public.requests enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;
alter table public.likes enable row level security;
alter table public.racing_results enable row level security;

-- Profiles: public read, own write
create policy "Profiles are public" on public.profiles for select using (true);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

-- Cars: published are public; owner can do all
create policy "Published cars are public" on public.cars for select using (status = 'published' or owner_id = auth.uid());
create policy "Owners insert cars" on public.cars for insert with check (auth.uid() = owner_id);
create policy "Owners update cars" on public.cars for update using (auth.uid() = owner_id);
create policy "Owners delete cars" on public.cars for delete using (auth.uid() = owner_id);

-- Requests: owner and requester can see
create policy "Parties see requests" on public.requests for select
  using (auth.uid() = requester_id or auth.uid() = owner_id);
create policy "Authenticated insert requests" on public.requests for insert
  with check (auth.uid() = requester_id);
create policy "Parties update requests" on public.requests for update
  using (auth.uid() = requester_id or auth.uid() = owner_id);

-- Messages: parties only
create policy "Parties see messages" on public.messages for select
  using (exists (
    select 1 from public.requests r
    where r.id = request_id and (r.requester_id = auth.uid() or r.owner_id = auth.uid())
  ));
create policy "Parties insert messages" on public.messages for insert
  with check (auth.uid() = sender_id);

-- Reviews: public read, own insert
create policy "Reviews are public" on public.reviews for select using (true);
create policy "Authenticated insert reviews" on public.reviews for insert
  with check (auth.uid() = reviewer_id);

-- Likes: public read, own insert/delete
create policy "Likes are public" on public.likes for select using (true);
create policy "Authenticated insert likes" on public.likes for insert with check (auth.uid() = user_id);
create policy "Own delete likes" on public.likes for delete using (auth.uid() = user_id);

-- Racing results: public read, own insert
create policy "Racing results public" on public.racing_results for select using (true);
create policy "Authenticated insert racing" on public.racing_results for insert with check (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════
--  STORAGE BUCKETS
-- ═══════════════════════════════════════════════════════════════════
-- Run in Supabase Dashboard → Storage → New Bucket:
-- Bucket name: "avatars"     → Public: YES
-- Bucket name: "car-photos"  → Public: YES

-- ═══════════════════════════════════════════════════════════════════
--  SEED DATA (Optional demo tracks)
-- ═══════════════════════════════════════════════════════════════════
insert into public.racing_tracks (name, category, city, length_m, description) values
  ('МКК Основная', 'karting', 'Москва', 850, 'Московский картинг-клуб, основная трасса'),
  ('МКК Короткая', 'karting', 'Москва', 550, 'Московский картинг-клуб, короткая конфигурация'),
  ('Никольское Ринг', 'circuit', 'Подмосковье', 2100, 'Кольцевая трасса Никольское'),
  ('Смоленское Кольцо', 'circuit', 'Смоленск', 3800, 'Профессиональный трек FIA класс'),
  ('Внуково 402м', 'drag', 'Москва', 402, 'Дрэг-рейсинг аэродром Внуково')
on conflict do nothing;
