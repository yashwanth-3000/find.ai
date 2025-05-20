import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const snapshotId = url.searchParams.get('id');
    const apiKey = url.searchParams.get('apiKey');
    
    if (!snapshotId || !apiKey) {
      return NextResponse.json(
        { error: 'Snapshot ID and API key are required' }, 
        { status: 400 }
      );
    }
    
    console.log(`Fetching snapshot data for ID: ${snapshotId}`);
    const response = await fetch(
      `https://api.brightdata.com/datasets/v3/snapshot/${snapshotId}?format=json`, 
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Brightdata API error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: `API Error: ${response.status} - ${errorText || response.statusText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    // Log the response type to help with debugging
    if (data && data.status === 'running') {
      console.log('Snapshot status: running - not ready yet');
    } else if (Array.isArray(data) && data.length > 0) {
      console.log('Snapshot data received successfully');
    } else {
      console.log('Unexpected data format:', typeof data, Array.isArray(data));
    }
    
    // Return the data as-is to the client
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('LinkedIn snapshot API proxy error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 