import { NextResponse } from 'next/server';

// This should be stored as an environment variable in production
const BRIGHTDATA_API_KEY = '7188c6d4-44e1-40d0-9309-d211fbaa4160';

export async function POST(request: Request) {
  try {
    const { linkedinUrl } = await request.json();
    
    if (!linkedinUrl) {
      return NextResponse.json(
        { error: 'LinkedIn URL is required' },
        { status: 400 }
      );
    }
    
    // Trigger the extraction
    const response = await fetch(
      'https://api.brightdata.com/datasets/v3/trigger?dataset_id=gd_l1viktl72bvl7bjuj0&include_errors=true',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${BRIGHTDATA_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: [{ url: linkedinUrl }],
          custom_output_fields: [
            "id", "name", "city", "country_code", "position", "about", "posts",
            "current_company", "experience", "url", "people_also_viewed",
            "educations_details", "education", "recommendations_count", "avatar",
            "courses", "languages", "certifications", "recommendations",
            "volunteer_experience", "followers", "connections", "current_company_company_id",
            "current_company_name", "publications", "patents", "projects",
            "organizations", "location", "input_url", "linkedin_id",
            "linkedin_num_id", "banner_image", "honors_and_awards", "default_avatar",
            "memorialized_account", "bio_links", "timestamp", "input", "error",
            "error_code", "warning", "warning_code"
          ]
        }),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Brightdata API error:', errorText);
      return NextResponse.json(
        { error: `API trigger failed with status: ${response.status}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error in LinkedIn API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const snapshotId = url.searchParams.get('snapshotId');
  
  if (!snapshotId) {
    return NextResponse.json(
      { error: 'Snapshot ID is required' },
      { status: 400 }
    );
  }
  
  try {
    const response = await fetch(
      `https://api.brightdata.com/datasets/v3/snapshot/${snapshotId}?format=json`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${BRIGHTDATA_API_KEY}`,
        },
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Brightdata API error:', errorText);
      return NextResponse.json(
        { error: `API polling failed with status: ${response.status}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error in LinkedIn API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 