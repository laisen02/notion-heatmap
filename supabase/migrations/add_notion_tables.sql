-- Table for storing OAuth state parameters
create table public.notion_oauth_states (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users on delete cascade not null,
    state text not null,
    created_at timestamp with time zone default now() not null,
    unique(state)
);

-- Table for storing Notion connections
create table public.notion_connections (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users on delete cascade not null,
    access_token text not null,
    workspace_id text not null,
    workspace_name text,
    workspace_icon text,
    bot_id text not null,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null,
    unique(user_id, workspace_id)
);

-- Enable RLS
alter table public.notion_oauth_states enable row level security;
alter table public.notion_connections enable row level security;

-- RLS policies for notion_oauth_states
create policy "Users can insert their own states"
    on public.notion_oauth_states for insert
    with check (auth.uid() = user_id);

create policy "Users can read their own states"
    on public.notion_oauth_states for select
    using (auth.uid() = user_id);

create policy "Users can delete their own states"
    on public.notion_oauth_states for delete
    using (auth.uid() = user_id);

-- RLS policies for notion_connections
create policy "Users can read their own connections"
    on public.notion_connections for select
    using (auth.uid() = user_id);

create policy "Users can insert their own connections"
    on public.notion_connections for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own connections"
    on public.notion_connections for update
    using (auth.uid() = user_id); 