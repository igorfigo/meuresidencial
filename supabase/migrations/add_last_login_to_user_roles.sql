
ALTER TABLE public.user_roles
ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;

UPDATE public.user_roles
SET last_login = created_at
WHERE last_login IS NULL;
