/**
 * GPM Relay — Cloudflare Worker
 * 
 * Proxies webhook calls from scarlettpelling.com to services.leadconnectorhq.com
 * Bypasses Cloudflare 1010 IP block (our VPS IP is blocked from GHL)
 * 
 * Deploy via: wrangler deploy
 * Workers.dev URL: https://gpm-relay.<your-subdomain>.workers.dev/webhook
 */

// GHL API base URL
const GHL_BASE = 'https://services.leadconnectorhq.com';

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, Version',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Health check
    if (path === '/' || path === '/health') {
      return new Response(JSON.stringify({ status: 'ok', relay: 'gpm-relay' }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Only proxy /webhook and /api/* paths
    if (!path.startsWith('/webhook') && !path.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      // Rebuild target URL — strip relay prefix and forward to GHL
      const targetPath = path.replace('/webhook', '/v1'); // GHL v1 API
      const targetUrl = `${GHL_BASE}${targetPath}${url.search}`;

      // Forward the request headers, body, and method
      const headers = new Headers(request.headers);
      
      // Ensure Content-Type is set
      if (!headers.has('Content-Type') && request.method === 'POST') {
        headers.set('Content-Type', 'application/json');
      }

      const response = await fetch(targetUrl, {
        method: request.method,
        headers: headers,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null,
      });

      // Return the GHL response to the caller
      const responseHeaders = new Headers(response.headers);
      responseHeaders.set('Access-Control-Allow-Origin', '*');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
  },
};
