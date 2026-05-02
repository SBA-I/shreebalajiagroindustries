
ALTER TABLE public.sustainability_articles
  ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'article',
  ADD COLUMN IF NOT EXISTS author text,
  ADD COLUMN IF NOT EXISTS author_role text,
  ADD COLUMN IF NOT EXISTS read_time text,
  ADD COLUMN IF NOT EXISTS display_date text,
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS content text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;
