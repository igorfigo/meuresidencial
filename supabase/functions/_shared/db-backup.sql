
-- Database function to generate a backup
CREATE OR REPLACE FUNCTION public.get_database_backup()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
BEGIN
    -- Get all tables with their schemas
    WITH tables_info AS (
        SELECT 
            table_schema,
            table_name
        FROM 
            information_schema.tables
        WHERE 
            table_schema IN ('public', 'storage')
            AND table_type = 'BASE TABLE'
    ),
    -- Get all tables data
    tables_data AS (
        SELECT
            t.table_schema,
            t.table_name,
            jsonb_agg(
                jsonb_build_object(
                    'columns', (
                        SELECT jsonb_agg(
                            jsonb_build_object(
                                'name', column_name,
                                'type', data_type,
                                'nullable', is_nullable
                            )
                        )
                        FROM information_schema.columns c
                        WHERE c.table_schema = t.table_schema AND c.table_name = t.table_name
                    ),
                    'data', (
                        SELECT 
                            COALESCE(
                                jsonb_agg(row_to_json(tbl)::jsonb), 
                                '[]'::jsonb
                            )
                        FROM (
                            SELECT *
                            FROM (SELECT * FROM (SELECT quote_ident(t.table_schema) || '.' || quote_ident(t.table_name)) t(fullname)) t1,
                            LATERAL (SELECT * FROM (EXECUTE 'SELECT * FROM ' || t.table_schema || '.' || t.table_name)) tbl
                        )
                    )
                )
            ) AS table_info
        FROM
            tables_info t
        GROUP BY
            t.table_schema, t.table_name
    ),
    -- Get all functions
    functions_info AS (
        SELECT
            routine_schema,
            routine_name,
            jsonb_agg(
                jsonb_build_object(
                    'name', routine_name,
                    'definition', (
                        SELECT pg_get_functiondef(p.oid)
                        FROM pg_proc p
                        JOIN pg_namespace n ON p.pronamespace = n.oid
                        WHERE n.nspname = routine_schema AND p.proname = routine_name
                    ),
                    'language', routine_language,
                    'security_type', external_security
                )
            ) AS function_info
        FROM
            information_schema.routines
        WHERE
            routine_schema IN ('public')
            AND routine_type = 'FUNCTION'
        GROUP BY
            routine_schema, routine_name
    ),
    -- Get all roles
    roles_info AS (
        SELECT
            jsonb_agg(
                jsonb_build_object(
                    'role_name', r.rolname,
                    'is_superuser', r.rolsuper,
                    'can_create_db', r.rolcreatedb,
                    'can_create_role', r.rolcreaterole
                )
            ) AS roles
        FROM
            pg_roles r
        WHERE
            r.rolname NOT LIKE 'pg_%'
            AND r.rolname NOT IN ('anon', 'authenticated', 'service_role')
    ),
    -- Get all RLS policies
    policies_info AS (
        SELECT
            jsonb_agg(
                jsonb_build_object(
                    'schema', n.nspname,
                    'table', c.relname,
                    'policy_name', pol.polname,
                    'cmd', CASE pol.polcmd
                        WHEN 'r' THEN 'SELECT'
                        WHEN 'a' THEN 'INSERT'
                        WHEN 'w' THEN 'UPDATE'
                        WHEN 'd' THEN 'DELETE'
                        ELSE pol.polcmd::text
                    END,
                    'roles', pol.polroles,
                    'qual', pg_get_expr(pol.polqual, pol.polrelid),
                    'with_check', pg_get_expr(pol.polwithcheck, pol.polrelid)
                )
            ) AS policies
        FROM
            pg_policy pol
            JOIN pg_class c ON c.oid = pol.polrelid
            JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE
            n.nspname = 'public'
    )
    -- Combine all information into one JSON object
    SELECT
        jsonb_build_object(
            'timestamp', now(),
            'tables', (
                SELECT
                    jsonb_object_agg(table_schema || '.' || table_name, table_info)
                FROM
                    tables_data
            ),
            'functions', (
                SELECT
                    jsonb_object_agg(routine_schema || '.' || routine_name, function_info)
                FROM
                    functions_info
            ),
            'roles', (
                SELECT roles FROM roles_info
            ),
            'policies', (
                SELECT policies FROM policies_info
            )
        ) INTO result;
    
    RETURN result;
END;
$$;
