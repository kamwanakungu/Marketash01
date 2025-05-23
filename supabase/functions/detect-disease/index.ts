import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import { decode as base64Decode } from "https://deno.land/std@0.208.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DetectionResult {
  disease: string;
  confidence: number;
  recommendations: string[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { image, cropType } = await req.json();

    // Decode base64 image
    const imageData = base64Decode(image.split(',')[1]);

    // Initialize AI model
    const model = new Supabase.ai.Session('gte-small');

    // Process image and get prediction
    const result: DetectionResult = {
      disease: "Leaf Blight", // Replace with actual AI detection
      confidence: 0.95,
      recommendations: [
        "Apply copper-based fungicide",
        "Improve air circulation",
        "Remove infected leaves"
      ]
    };

    // Store the diagnosis in the database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data: { user } } = await supabase.auth.getUser(req.headers.get('Authorization')?.split(' ')[1] ?? '');

    if (!user) {
      throw new Error('Unauthorized');
    }

    await supabase.from('crop_diagnosis').insert({
      user_id: user.id,
      image_url: image,
      crop_type: cropType,
      diagnosis: result.disease,
      confidence_score: result.confidence,
      recommendation: result.recommendations.join('\n')
    });

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});