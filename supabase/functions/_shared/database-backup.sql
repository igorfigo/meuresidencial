
-- This is a SQL file that will be referenced in the AdminTools component
-- to create the database backup function

CREATE OR REPLACE FUNCTION public.generate_full_backup()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  schemas_data json;
  tables_data json;
  functions_data json;
  policies_data json;
  roles_data json;
  result json;
BEGIN
  -- Get schemas
  SELECT json_agg(json_build_object(
    'schema_name', nspname,
    'owner', pg_get_userbyid(nspowner),
    'acl', nspacl
  ))
  INTO schemas_data
  FROM pg_namespace
  WHERE nspname NOT LIKE 'pg_%' 
    AND nspname != 'information_schema';

  -- Get tables with columns
  WITH tables AS (
    SELECT 
      c.relname AS table_name,
      n.nspname AS schema_name,
      pg_get_userbyid(c.relowner) AS owner
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'r'
      AND n.nspname NOT LIKE 'pg_%'
      AND n.nspname != 'information_schema'
  ),
  columns AS (
    SELECT 
      t.table_name,
      t.schema_name,
      json_agg(json_build_object(
        'name', a.attname,
        'type', pg_catalog.format_type(a.atttypid, a.atttypmod),
        'default', (SELECT substring(pg_catalog.pg_get_expr(d.adbin, d.adrelid, true) FOR 128)
                    FROM pg_catalog.pg_attrdef d
                    WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum AND a.atthasdef),
        'is_nullable', NOT a.attnotnull
      ) ORDER BY a.attnum) AS columns
    FROM tables t
    JOIN pg_catalog.pg_class c ON c.relname = t.table_name
    JOIN pg_catalog.pg_namespace n ON n.nspname = t.schema_name AND n.oid = c.relnamespace
    JOIN pg_catalog.pg_attribute a ON a.attrelid = c.oid
    WHERE a.attnum > 0
      AND NOT a.attisdropped
    GROUP BY t.table_name, t.schema_name
  )
  SELECT json_agg(json_build_object(
    'schema', t.schema_name,
    'name', t.table_name,
    'owner', t.owner,
    'columns', c.columns,
    'row_count', (SELECT count(*) FROM (SELECT 1 FROM pg_catalog.pg_namespace n 
                  JOIN pg_catalog.pg_class rel ON rel.relnamespace = n.oid 
                  WHERE n.nspname = t.schema_name AND rel.relname = t.table_name 
                  LIMIT 10000) x)
  ))
  INTO tables_data
  FROM tables t
  JOIN columns c ON c.table_name = t.table_name AND c.schema_name = t.schema_name;

  -- Get functions
  SELECT json_agg(json_build_object(
    'schema', n.nspname,
    'name', p.proname,
    'language', l.lanname,
    'type', p.prokind,
    'args', pg_get_function_arguments(p.oid),
    'result_type', pg_get_function_result(p.oid),
    'definition', pg_get_functiondef(p.oid)
  ))
  INTO functions_data
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  JOIN pg_language l ON p.prolang = l.oid
  WHERE n.nspname NOT LIKE 'pg_%'
    AND n.nspname != 'information_schema';

  -- Get RLS policies
  SELECT json_agg(json_build_object(
    'table_schema', n.nspname,
    'table_name', c.relname,
    'policy_name', pol.polname,
    'cmd', CASE WHEN pol.polcmd = 'r' THEN 'SELECT'
                WHEN pol.polcmd = 'a' THEN 'INSERT'
                WHEN pol.polcmd = 'w' THEN 'UPDATE'
                WHEN pol.polcmd = 'd' THEN 'DELETE'
                ELSE pol.polcmd::text END,
    'roles', pol.polroles,
    'using_expr', pg_get_expr(pol.polqual, pol.polrelid),
    'with_check_expr', pg_get_expr(pol.polwithcheck, pol.polrelid)
  ))
  INTO policies_data
  FROM pg_policy pol
  JOIN pg_class c ON c.oid = pol.polrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname NOT LIKE 'pg_%'
    AND n.nspname != 'information_schema';

  -- Get roles
  SELECT json_agg(json_build_object(
    'role_name', rolname,
    'superuser', rolsuper,
    'inherit', rolinherit,
    'create_role', rolcreaterole,
    'create_db', rolcreatedb,
    'can_login', rolcanlogin,
    'connection_limit', rolconnlimit,
    'valid_until', rolvaliduntil,
    'config', rolconfig
  ))
  INTO roles_data
  FROM pg_roles
  WHERE rolname NOT LIKE 'pg_%' 
    AND rolname != 'postgres';

  -- Combine all data into result
  SELECT json_build_object(
    'backup_date', now(),
    'schemas', COALESCE(schemas_data, '[]'::json),
    'tables', COALESCE(tables_data, '[]'::json),
    'functions', COALESCE(functions_data, '[]'::json),
    'policies', COALESCE(policies_data, '[]'::json),
    'roles', COALESCE(roles_data, '[]'::json)
  ) INTO result;

  RETURN result;
END;
$$;

-- Add permissions to execute the function
GRANT EXECUTE ON FUNCTION public.generate_full_backup() TO authenticated;
