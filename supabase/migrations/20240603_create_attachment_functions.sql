
-- Function to get an attachment by ID
CREATE OR REPLACE FUNCTION get_attachment_by_id(p_attachment_id UUID)
RETURNS SETOF public.announcement_attachments AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM announcement_attachments
  WHERE id = p_attachment_id;
END;
$$ LANGUAGE plpgsql;

-- Function to delete an attachment
CREATE OR REPLACE FUNCTION delete_attachment(p_attachment_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM announcement_attachments
  WHERE id = p_attachment_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to add an attachment
CREATE OR REPLACE FUNCTION add_attachment(
  p_announcement_id UUID,
  p_file_name TEXT,
  p_file_path TEXT,
  p_file_type TEXT
)
RETURNS SETOF public.announcement_attachments AS $$
DECLARE
  v_result announcement_attachments;
BEGIN
  INSERT INTO announcement_attachments (
    announcement_id,
    file_name,
    file_path,
    file_type
  )
  VALUES (
    p_announcement_id,
    p_file_name,
    p_file_path,
    p_file_type
  )
  RETURNING * INTO v_result;
  
  RETURN NEXT v_result;
END;
$$ LANGUAGE plpgsql;
