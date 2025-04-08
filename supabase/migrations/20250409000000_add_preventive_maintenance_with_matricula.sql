
-- Create a new function that accepts matricula as a parameter
CREATE OR REPLACE FUNCTION public.add_preventive_maintenance_with_matricula(
  p_matricula text,
  p_category text, 
  p_title text, 
  p_description text, 
  p_scheduled_date date
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.preventive_maintenance (
    matricula, 
    category, 
    title, 
    description, 
    scheduled_date
  ) VALUES (
    p_matricula,
    p_category,
    p_title,
    p_description,
    p_scheduled_date
  ) RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;
