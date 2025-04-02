
-- Create a database function to bypass RLS for historical data requests
CREATE OR REPLACE FUNCTION create_historical_data_request(
  p_matricula TEXT,
  p_request_type TEXT,
  p_status TEXT DEFAULT 'pending'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO historical_data_requests (matricula, request_type, status)
  VALUES (p_matricula, p_request_type, p_status);
END;
$$;
