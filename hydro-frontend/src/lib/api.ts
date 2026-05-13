// All API calls go to the Express backend (port 5000)
const BASE = process.env.NEXT_PUBLIC_API_URL || '';
const KEY  = process.env.NEXT_PUBLIC_ADMIN_API_KEY || '';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': KEY,
};

async function handleResponse(r: Response) {
  const data = await r.json();
  if (!r.ok) {
    throw new Error(data.error || `Error ${r.status}: ${r.statusText}`);
  }
  return data;
}

export const api = {
  get: (path: string) => 
    fetch(`${BASE}${path}`, { headers }).then(handleResponse),
  
  post: (path: string, body: any) =>
    fetch(`${BASE}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }).then(handleResponse),
    
  put: (path: string, body: any) =>
    fetch(`${BASE}${path}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    }).then(handleResponse),
    
  delete: (path: string) =>
    fetch(`${BASE}${path}`, { 
      method: 'DELETE',
      headers,
    }).then(handleResponse),
    
  patch: (path: string, body: any) =>
    fetch(`${BASE}${path}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    }).then(handleResponse),
};
