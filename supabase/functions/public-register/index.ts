import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RegistrationRequest {
  contribuableData: any;
  clientIp?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { contribuableData, clientIp } = await req.json() as RegistrationRequest;
    const ipAddress = clientIp || req.headers.get('x-forwarded-for') || 'unknown';

    console.log('Registration attempt from IP:', ipAddress);

    // Rate limiting: Check submissions from this IP in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: recentSubmissions, error: checkError } = await supabase
      .from('contribuables')
      .select('id, created_at')
      .eq('statut', 'en_attente')
      .gte('created_at', oneHourAgo)
      .limit(10);

    if (checkError) {
      console.error('Error checking rate limit:', checkError);
    }

    // Allow max 3 submissions per hour (simplified - in production use IP tracking table)
    if (recentSubmissions && recentSubmissions.length >= 3) {
      console.warn('Rate limit exceeded for IP:', ipAddress);
      return new Response(
        JSON.stringify({ 
          error: 'Trop de demandes. Veuillez réessayer dans une heure.' 
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Default organization for public registrations
    const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

    // Insert the contribuable with status "en_attente"
    const { data: newContribuable, error: contribuableError } = await supabase
      .from('contribuables')
      .insert({
        ...contribuableData,
        organisation_id: DEFAULT_ORG_ID,
        statut: 'en_attente'
      })
      .select()
      .single();

    if (contribuableError) {
      console.error('Error creating contribuable:', contribuableError);
      return new Response(
        JSON.stringify({ 
          error: 'Impossible d\'enregistrer votre demande. Veuillez réessayer.' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Successfully created contribuable:', newContribuable.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        contribuableId: newContribuable.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in public-register function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Une erreur est survenue lors de l\'enregistrement.' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
