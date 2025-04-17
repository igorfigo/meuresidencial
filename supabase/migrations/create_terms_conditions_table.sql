
-- Create terms_conditions table
CREATE TABLE IF NOT EXISTS public.terms_conditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Set up RLS policies
ALTER TABLE public.terms_conditions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow only admins to insert new terms
CREATE POLICY "Allow admins to insert terms" 
ON public.terms_conditions
FOR INSERT 
TO authenticated
WITH CHECK (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
));

-- Create policy to allow anyone to read terms
CREATE POLICY "Allow anyone to read terms" 
ON public.terms_conditions
FOR SELECT 
TO authenticated
USING (true);

-- Create policy to allow public (non-authenticated users) to read terms
CREATE POLICY "Allow public to read terms" 
ON public.terms_conditions
FOR SELECT 
TO anon
USING (true);

-- Add a function to initialize default terms if none exist
CREATE OR REPLACE FUNCTION public.initialize_default_terms()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.terms_conditions LIMIT 1) THEN
        INSERT INTO public.terms_conditions (content)
        VALUES ('Termos e condições padrão da plataforma Meu Residencial');
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run the function once after table creation
CREATE OR REPLACE TRIGGER trigger_initialize_default_terms
AFTER INSERT ON public.terms_conditions
FOR EACH STATEMENT
EXECUTE FUNCTION public.initialize_default_terms();
