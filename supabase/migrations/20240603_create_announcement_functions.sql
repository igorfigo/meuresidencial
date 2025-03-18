
-- Function to get announcements by matricula
CREATE OR REPLACE FUNCTION get_announcements_by_matricula(p_matricula TEXT)
RETURNS SETOF public.announcements AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM announcements 
  WHERE matricula = p_matricula
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get announcement attachments
CREATE OR REPLACE FUNCTION get_announcement_attachments(p_announcement_id UUID)
RETURNS SETOF public.announcement_attachments AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM announcement_attachments
  WHERE announcement_id = p_announcement_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create a new announcement
CREATE OR REPLACE FUNCTION create_announcement(announcement_data JSONB)
RETURNS SETOF public.announcements AS $$
DECLARE
  v_result announcements;
BEGIN
  INSERT INTO announcements (
    matricula,
    data,
    finalidade,
    descricao
  )
  VALUES (
    announcement_data->>'matricula',
    announcement_data->>'data',
    announcement_data->>'finalidade',
    announcement_data->>'descricao'
  )
  RETURNING * INTO v_result;
  
  RETURN NEXT v_result;
END;
$$ LANGUAGE plpgsql;

-- Function to update an announcement
CREATE OR REPLACE FUNCTION update_announcement(
  p_id UUID,
  p_data TEXT,
  p_finalidade TEXT,
  p_descricao TEXT
)
RETURNS SETOF public.announcements AS $$
DECLARE
  v_result announcements;
BEGIN
  UPDATE announcements
  SET 
    data = p_data,
    finalidade = p_finalidade,
    descricao = p_descricao,
    updated_at = now()
  WHERE id = p_id
  RETURNING * INTO v_result;
  
  RETURN NEXT v_result;
END;
$$ LANGUAGE plpgsql;

-- Function to delete an announcement
CREATE OR REPLACE FUNCTION delete_announcement(p_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  attachment_count INT;
BEGIN
  -- First, delete attachments (if any)
  DELETE FROM announcement_attachments
  WHERE announcement_id = p_id;
  
  -- Then delete the announcement
  DELETE FROM announcements
  WHERE id = p_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;
