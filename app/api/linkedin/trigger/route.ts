import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, apiKey } = body;
    
    if (!url || !apiKey) {
      return NextResponse.json(
        { error: 'LinkedIn URL and API key are required' }, 
        { status: 400 }
      );
    }
    
    console.log(`Triggering Brightdata API for URL: ${url}`);
    
    const response = await fetch(
      "https://api.brightdata.com/datasets/v3/trigger?dataset_id=gd_l1viktl72bvl7bjuj0&include_errors=true", 
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([{ url }])
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Brightdata trigger API error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: `API Error: ${response.status} - ${errorText || response.statusText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log('Brightdata trigger response:', data);
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('LinkedIn API proxy error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 