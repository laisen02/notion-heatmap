-- Create Users Table
create table public.users (
    id uuid references auth.users on delete cascade not null primary key,
    email text not null unique,
    created_at timestamp with time zone default now() not null,
    week_start text check (week_start in ('monday', 'sunday')) default 'monday' not null,
    username text unique,
    avatar_url text,
    constraint username_length check (char_length(username) >= 3)
);

-- Enable Row Level Security
alter table public.users enable row level security;

-- Create policy to allow users to read their own data
create policy "Users can read own data" on public.users
    for select using (auth.uid() = id);

-- Create policy to allow users to update their own data
create policy "Users can update own data" on public.users
    for update using (auth.uid() = id);

-- Create Heatmaps Table
create table public.heatmaps (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.users on delete cascade not null,
    name text not null,
    description text,
    notion_database_id text not null,
    color_theme text not null default 'orange',
    privacy text check (privacy in ('public', 'private')) default 'public' not null,
    avg_time_per_day boolean default true not null,
    total_days_active boolean default true not null,
    total_time_spent boolean default true not null,
    std_deviation boolean default false not null,
    week_start text check (week_start in ('monday', 'sunday')) default 'monday' not null,
    created_at timestamp with time zone default now() not null,
    embed_link text unique,
    display_order integer not null,
    property_column_name text not null,
    activity_name text not null,
    recorded_time_property text not null
);

-- Enable Row Level Security
alter table public.heatmaps enable row level security;

-- Create policies for heatmaps
create policy "Users can read own heatmaps" on public.heatmaps
    for select using (auth.uid() = user_id);

create policy "Users can read public heatmaps" on public.heatmaps
    for select using (privacy = 'public');

create policy "Users can create own heatmaps" on public.heatmaps
    for insert with check (auth.uid() = user_id);

create policy "Users can update own heatmaps" on public.heatmaps
    for update using (auth.uid() = user_id);

create policy "Users can delete own heatmaps" on public.heatmaps
    for delete using (auth.uid() = user_id);

-- Create Records Table
create table public.records (
    id uuid default gen_random_uuid() primary key,
    heatmap_id uuid references public.heatmaps on delete cascade not null,
    date date not null,
    total_hours float not null check (total_hours >= 0),
    created_at timestamp with time zone default now() not null,
    unique(heatmap_id, date)
);

-- Enable Row Level Security
alter table public.records enable row level security;

-- Create policies for records
create policy "Users can read records of their heatmaps" on public.records
    for select using (
        exists (
            select 1 from public.heatmaps
            where heatmaps.id = records.heatmap_id
            and heatmaps.user_id = auth.uid()
        )
    );

create policy "Users can create records for their heatmaps" on public.records
    for insert with check (
        exists (
            select 1 from public.heatmaps
            where heatmaps.id = records.heatmap_id
            and heatmaps.user_id = auth.uid()
        )
    );

-- Create indexes for better query performance
create index heatmaps_user_id_idx on public.heatmaps(user_id);
create index records_heatmap_id_idx on public.records(heatmap_id);
create index records_date_idx on public.records(date); 