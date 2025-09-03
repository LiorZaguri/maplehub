import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const allowedOrigins = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);


serve(async (req) => {
  const origin = req.headers.get('origin') ?? '';

  if (!allowedOrigins.includes(origin)) {
    return new Response('Forbidden', { status: 403 });
  }

  const corsHeaders = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
  };
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { characterName } = await req.json();
    
    if (!characterName) {
      return new Response(
        JSON.stringify({ error: 'Character name is required' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Looking up character: ${characterName}`);

    const response = await fetch(
      `https://www.nexon.com/api/maplestory/no-auth/ranking/v2/na?type=overall&id=weekly&reboot_index=1&page_index=1&character_name=${encodeURIComponent(characterName)}`
    );
    
    if (!response.ok) {
      console.error(`Nexon API error: ${response.status} ${response.statusText}`);
      return new Response(
        JSON.stringify({ error: 'Character not found' }), 
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const data = await response.json();
    console.log(`API response:`, data);
    
    if (!data.ranks || data.ranks.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Character not found in rankings' }), 
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const character = data.ranks[0];
    
    const characterData = {
      name: character.characterName,
      jobID: character.jobID,
      jobDetail: character.jobDetail,
      level: character.level,
      exp: character.exp,
      rank: character.rank,
      worldID: character.worldID,
      characterImgURL: character.characterImgURL
    };

    console.log(`Returning character data:`, characterData);

    return new Response(
      JSON.stringify(characterData), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in nexon-character-lookup function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch character data' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});