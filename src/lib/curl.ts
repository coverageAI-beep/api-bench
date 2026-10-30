import { ApiEndpoint } from '../types/api';

export function generateCurlCommand(endpoint: ApiEndpoint, baseUrl = 'http://localhost:8080'): string {
  let resolvedPath = endpoint.path || '/';

  // Replace path variables e.g. :id or {id}
  if (endpoint.pathParams && endpoint.pathParams.length > 0) {
    endpoint.pathParams.forEach((param) => {
      const val = param.value?.trim() || `{${param.key}}`;
      resolvedPath = resolvedPath.replace(`:${param.key}`, val);
      resolvedPath = resolvedPath.replace(`{${param.key}}`, val);
    });
  }

  // Construct query string
  let queryString = '';
  if (endpoint.queryParams && endpoint.queryParams.length > 0) {
    const validParams = endpoint.queryParams.filter((p) => p.key && p.key.trim().length > 0);
    if (validParams.length > 0) {
      queryString = '?' + validParams
        .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value || `{${p.key}}`)}`)
        .join('&');
    }
  }

  const fullUrl = `${baseUrl.replace(/\/$/, '')}${resolvedPath}${queryString}`;
  const lines: string[] = [`curl -X ${endpoint.method} "${fullUrl}"`];

  // Headers
  if (endpoint.headers && endpoint.headers.length > 0) {
    endpoint.headers.forEach((h) => {
      if (h.key && h.key.trim().length > 0) {
        lines.push(`  -H "${h.key}: ${h.value || ''}"`);
      }
    });
  }

  // Body
  if (['POST', 'PUT', 'PATCH'].includes(endpoint.method) && endpoint.requestBody?.rawBody) {
    const raw = endpoint.requestBody.rawBody.trim();
    if (raw.length > 0) {
      if (endpoint.requestBody.contentType === 'application/json') {
        const hasJsonHeader = endpoint.headers?.some(
          (h) => h.key.toLowerCase() === 'content-type' && h.value.includes('json')
        );
        if (!hasJsonHeader) {
          lines.push(`  -H "Content-Type: application/json"`);
        }
        // Minify JSON or escape properly for terminal execution
        try {
          const parsed = JSON.parse(raw);
          const compact = JSON.stringify(parsed);
          lines.push(`  -d '${compact.replace(/'/g, "'\\''")}'`);
        } catch {
          lines.push(`  -d '${raw.replace(/'/g, "'\\''")}'`);
        }
      } else {
        lines.push(`  -d '${raw.replace(/'/g, "'\\''")}'`);
      }
    }
  }

  return lines.join(' \\\n');
}
