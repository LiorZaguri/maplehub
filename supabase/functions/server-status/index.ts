import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Fetch server status and maintenance flag
    const [serverResponse, maintenanceResponse] = await Promise.all([
      fetch('https://www.nexon.com/api/maplestory/no-auth/v1/server-status/na'),
      fetch('https://www.nexon.com/api/maplestory/no-auth/v1/maintenance/10100')
    ])

    if (!serverResponse.ok) {
      throw new Error(`Server status HTTP error! status: ${serverResponse.status}`)
    }

    if (!maintenanceResponse.ok) {
      throw new Error(`Maintenance HTTP error! status: ${maintenanceResponse.status}`)
    }

    const serverData = await serverResponse.json()
    const maintenanceData = await maintenanceResponse.json()

    const maintenanceStatus = Array.isArray(maintenanceData)
      ? maintenanceData.length > 0
      : !!maintenanceData.maintenance

    // Combine the data
    const combinedData = {
      ...serverData,
      maintenance: maintenanceStatus
    }

    return new Response(
      JSON.stringify(combinedData),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Error fetching server status:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch server status' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})
