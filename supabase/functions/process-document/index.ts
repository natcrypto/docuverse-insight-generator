
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      throw new Error('No file uploaded');
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Sanitize filename and generate path
    const sanitizedFileName = file.name.replace(/[^\x00-\x7F]/g, '');
    const fileExt = sanitizedFileName.split('.').pop();
    const filePath = `${crypto.randomUUID()}.${fileExt}`;

    // Upload file to storage
    const { data: storageData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    // Get file data for OpenAI processing
    const { data: fileData } = await supabase.storage
      .from('documents')
      .download(filePath);

    if (!fileData) {
      throw new Error('Failed to retrieve uploaded file');
    }

    // Convert file to base64
    const reader = new FileReader();
    const base64Promise = new Promise((resolve) => {
      reader.onload = () => resolve(reader.result);
    });
    reader.readAsDataURL(fileData);
    const base64Data = await base64Promise;

    // Get embeddings from OpenAI
    const openAiResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: base64Data,
        model: "text-embedding-3-small"
      }),
    });

    if (!openAiResponse.ok) {
      throw new Error(`OpenAI API error: ${await openAiResponse.text()}`);
    }

    const { data: [{ embedding }] } = await openAiResponse.json();

    // Save document metadata and embedding to database
    const { error: dbError } = await supabase
      .from('documents')
      .insert({
        title: sanitizedFileName,
        file_path: filePath,
        content_type: file.type,
        file_size: file.size,
        embedding,
        user_id: req.headers.get('x-user-id'),
      });

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    return new Response(
      JSON.stringify({ 
        message: 'Document processed successfully',
        filePath 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error processing document:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
