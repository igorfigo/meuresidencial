
import { createClient } from "npm:@supabase/supabase-js@2.39.7";
import { Octokit } from "npm:@octokit/rest@20.0.2";
import { Base64 } from "npm:js-base64@3.7.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract the JWT token
    const token = authHeader.replace('Bearer ', '');
    
    // Initialize Supabase client with service role key for full access
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify if user is admin
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if the user is an admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
      
    if (!roleData || roleData.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate the backup
    const { data, error } = await supabase.rpc('generate_full_backup');
    
    if (error) {
      console.error('Error generating backup:', error);
      return new Response(
        JSON.stringify({ error: `Failed to generate backup: ${error.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get current date for the backup filename
    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const fileName = `meu-residencial-backup-${formattedDate}.json`;
    
    // Get GitHub credentials from environment variables
    const githubToken = Deno.env.get('GITHUB_TOKEN');
    const githubRepo = Deno.env.get('GITHUB_REPO');
    const githubOwner = Deno.env.get('GITHUB_OWNER');
    
    if (!githubToken || !githubRepo || !githubOwner) {
      return new Response(
        JSON.stringify({ 
          error: 'GitHub configuration incomplete. Please set GITHUB_TOKEN, GITHUB_REPO, and GITHUB_OWNER environment variables.',
          backup: data 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    try {
      // Initialize GitHub client
      const octokit = new Octokit({ auth: githubToken });
      
      // Create or update the file in GitHub repository
      const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      const contentEncoded = Base64.encode(content);
      
      // Check if the file exists to determine if we need to create or update
      let sha;
      try {
        const { data: fileData } = await octokit.repos.getContent({
          owner: githubOwner,
          repo: githubRepo,
          path: `backups/${fileName}`,
        });
        
        if ('sha' in fileData) {
          sha = fileData.sha;
        }
      } catch (error) {
        // File doesn't exist, will be created
      }
      
      // Create the backups directory if it doesn't exist
      try {
        await octokit.repos.getContent({
          owner: githubOwner,
          repo: githubRepo,
          path: 'backups',
        });
      } catch (error) {
        // Create the directory by creating an empty file
        await octokit.repos.createOrUpdateFileContents({
          owner: githubOwner,
          repo: githubRepo,
          path: 'backups/.gitkeep',
          message: 'Create backups directory',
          content: '',
        });
      }
      
      // Create or update the file
      const commitResponse = await octokit.repos.createOrUpdateFileContents({
        owner: githubOwner,
        repo: githubRepo,
        path: `backups/${fileName}`,
        message: `Database backup ${formattedDate}`,
        content: contentEncoded,
        sha,
      });
      
      const fileUrl = `https://github.com/${githubOwner}/${githubRepo}/blob/main/backups/${fileName}`;
      
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Backup successfully generated and saved to GitHub',
          fileUrl,
          fileName,
          commitSha: commitResponse.data.commit.sha,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (githubError) {
      console.error('GitHub error:', githubError);
      return new Response(
        JSON.stringify({ 
          error: `Failed to save to GitHub: ${githubError.message}`,
          backup: data // Still return the backup data
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
  } catch (err) {
    console.error('Error in edge function:', err);
    return new Response(
      JSON.stringify({ error: `Internal server error: ${err.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
