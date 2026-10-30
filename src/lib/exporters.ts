import { ApiEndpoint } from '../types/api';

/**
 * Downloads a string payload as a client-side file.
 */
export function downloadFile(filename: string, content: string, mimeType = 'application/json'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Transforms endpoints to OpenAPI 3.1.0 standard JSON
 */
export function exportToOpenAPI(endpoints: ApiEndpoint[], apiTitle = 'APIBench Specification', version = '1.0.0'): string {
  const paths: Record<string, any> = {};

  endpoints.forEach((ep) => {
    // OpenAPI standard uses {param} instead of :param
    const openApiPath = ep.path.replace(/:([a-zA-Z0-9_]+)/g, '{$1}');

    if (!paths[openApiPath]) {
      paths[openApiPath] = {};
    }

    const responses: Record<string, any> = {};
    if (ep.responses && ep.responses.length > 0) {
      ep.responses.forEach((res) => {
        let parsedExample: any = undefined;
        if (res.body && res.body.trim()) {
          try {
            parsedExample = JSON.parse(res.body);
          } catch {
            parsedExample = res.body;
          }
        }

        responses[res.statusCode.toString()] = {
          description: res.description || res.statusText || 'Response definition',
          content: parsedExample !== undefined ? {
            'application/json': {
              schema: { type: 'object' },
              example: parsedExample
            }
          } : undefined
        };
      });
    } else {
      responses['200'] = { description: 'Successful response' };
    }

    const parameters: any[] = [];

    // Path parameters
    if (ep.pathParams) {
      ep.pathParams.forEach((p) => {
        if (p.key && p.key.trim()) {
          parameters.push({
            name: p.key,
            in: 'path',
            required: true,
            description: p.description || '',
            schema: { type: 'string', example: p.value || undefined }
          });
        }
      });
    }

    // Query parameters
    if (ep.queryParams) {
      ep.queryParams.forEach((q) => {
        if (q.key && q.key.trim()) {
          parameters.push({
            name: q.key,
            in: 'query',
            required: !!q.required,
            description: q.description || '',
            schema: { type: 'string', example: q.value || undefined }
          });
        }
      });
    }

    // Headers
    if (ep.headers) {
      ep.headers.forEach((h) => {
        if (h.key && h.key.trim() && h.key.toLowerCase() !== 'content-type') {
          parameters.push({
            name: h.key,
            in: 'header',
            required: !!h.required,
            description: h.description || '',
            schema: { type: 'string', example: h.value || undefined }
          });
        }
      });
    }

    let requestBody: any = undefined;
    if (['POST', 'PUT', 'PATCH'].includes(ep.method) && ep.requestBody?.rawBody) {
      let parsedBody: any;
      try {
        parsedBody = JSON.parse(ep.requestBody.rawBody);
      } catch {
        parsedBody = ep.requestBody.rawBody;
      }

      requestBody = {
        required: true,
        content: {
          [ep.requestBody.contentType || 'application/json']: {
            schema: { type: 'object' },
            example: parsedBody
          }
        }
      };
    }

    paths[openApiPath][ep.method.toLowerCase()] = {
      summary: ep.title,
      description: `${ep.summary || ''}\n\n### Business Rules\n${ep.businessRules || 'None documented.'}`,
      tags: [ep.service || 'Default'],
      parameters: parameters.length > 0 ? parameters : undefined,
      requestBody,
      responses
    };
  });

  const spec = {
    openapi: '3.1.0',
    info: {
      title: apiTitle,
      version,
      description: 'Exported from APIBench personal workbench'
    },
    paths
  };

  return JSON.stringify(spec, null, 2);
}

/**
 * Transforms endpoints to Postman Collection v2.1.0 JSON
 */
export function exportToPostman(endpoints: ApiEndpoint[], collectionName = 'APIBench Collection'): string {
  // Group items by service/controller
  const serviceMap = new Map<string, ApiEndpoint[]>();

  endpoints.forEach((ep) => {
    const s = ep.service || 'DefaultController';
    if (!serviceMap.has(s)) serviceMap.set(s, []);
    serviceMap.get(s)!.push(ep);
  });

  const itemGroups: any[] = [];

  serviceMap.forEach((eps, serviceName) => {
    const items = eps.map((ep) => {
      const urlPathSegments = ep.path.split('/').filter(Boolean);

      return {
        name: `${ep.method} ${ep.title || ep.path}`,
        request: {
          method: ep.method,
          header: (ep.headers || []).map((h) => ({
            key: h.key,
            value: h.value,
            description: h.description || ''
          })),
          url: {
            raw: `{{baseUrl}}${ep.path}`,
            host: ['{{baseUrl}}'],
            path: urlPathSegments,
            query: (ep.queryParams || []).map((q) => ({
              key: q.key,
              value: q.value,
              description: q.description || ''
            }))
          },
          body: ep.requestBody?.rawBody ? {
            mode: 'raw',
            raw: ep.requestBody.rawBody,
            options: {
              raw: {
                language: ep.requestBody.contentType === 'application/json' ? 'json' : 'text'
              }
            }
          } : undefined,
          description: `**Summary:** ${ep.summary || 'N/A'}\n\n### Business Rules\n${ep.businessRules || 'None'}`
        },
        response: (ep.responses || []).map((res) => ({
          name: `${res.statusCode} ${res.statusText}`,
          status: res.statusText,
          code: res.statusCode,
          _postman_previewlanguage: 'json',
          header: [],
          body: res.body || ''
        }))
      };
    });

    itemGroups.push({
      name: serviceName,
      item: items
    });
  });

  const collection = {
    info: {
      name: collectionName,
      _postman_id: `apibench-${Date.now()}`,
      description: 'API Collection exported directly from APIBench.',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    },
    item: itemGroups,
    variable: [
      {
        key: 'baseUrl',
        value: 'http://localhost:8080',
        type: 'string'
      }
    ]
  };

  return JSON.stringify(collection, null, 2);
}

/**
 * Transforms endpoints to formatted Markdown documentation (API_DOCS.md)
 */
export function exportToMarkdown(endpoints: ApiEndpoint[]): string {
  let md = `# API Documentation\n\n`;
  md += `> Generated by **APIBench** on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}.\n`;
  md += `> Total Documented Endpoints: **${endpoints.length}**\n\n`;

  md += `## Table of Contents\n\n`;
  // Group by service
  const serviceMap = new Map<string, ApiEndpoint[]>();
  endpoints.forEach((ep) => {
    const s = ep.service || 'DefaultController';
    if (!serviceMap.has(s)) serviceMap.set(s, []);
    serviceMap.get(s)!.push(ep);
  });

  serviceMap.forEach((eps, serviceName) => {
    md += `- **${serviceName}**\n`;
    eps.forEach((ep) => {
      md += `  - [${ep.method} \`${ep.path}\`](#${slugify(`${ep.method}-${ep.path}`)}) - ${ep.title}\n`;
    });
  });
  md += `\n---\n\n`;

  serviceMap.forEach((eps, serviceName) => {
    md += `## Service: ${serviceName}\n\n`;

    eps.forEach((ep) => {
      const anchor = slugify(`${ep.method}-${ep.path}`);
      md += `### <a id="${anchor}"></a>${ep.method} \`${ep.path}\`\n\n`;
      md += `**Title:** ${ep.title}  \n`;
      if (ep.summary) md += `**Summary:** ${ep.summary}  \n\n`;

      if (ep.businessRules) {
        md += `#### Business Rules\n\n${ep.businessRules}\n\n`;
      }

      if (ep.headers && ep.headers.length > 0) {
        md += `#### Request Headers\n\n`;
        md += `| Header | Required | Example | Description |\n`;
        md += `| :--- | :---: | :--- | :--- |\n`;
        ep.headers.forEach((h) => {
          md += `| \`${h.key}\` | ${h.required ? 'Yes' : 'No'} | \`${h.value || '-'}\` | ${h.description || '-'} |\n`;
        });
        md += `\n`;
      }

      if (ep.queryParams && ep.queryParams.length > 0) {
        md += `#### Query Parameters\n\n`;
        md += `| Parameter | Required | Example | Description |\n`;
        md += `| :--- | :---: | :--- | :--- |\n`;
        ep.queryParams.forEach((q) => {
          md += `| \`${q.key}\` | ${q.required ? 'Yes' : 'No'} | \`${q.value || '-'}\` | ${q.description || '-'} |\n`;
        });
        md += `\n`;
      }

      if (ep.requestBody?.rawBody) {
        md += `#### Request Body (${ep.requestBody.contentType})\n\n`;
        md += `\`\`\`json\n${ep.requestBody.rawBody}\n\`\`\`\n\n`;
      }

      if (ep.responses && ep.responses.length > 0) {
        md += `#### Responses\n\n`;
        ep.responses.forEach((res) => {
          md += `##### \`${res.statusCode} ${res.statusText}\` - ${res.description || 'Response'}\n\n`;
          if (res.body) {
            md += `\`\`\`json\n${res.body}\n\`\`\`\n\n`;
          }
        });
      }

      md += `---\n\n`;
    });
  });

  return md;
}

/**
 * Transforms a single endpoint to formatted Markdown documentation.
 */
export function exportSingleEndpointToMarkdown(endpoint: ApiEndpoint): string {
  let md = `### ${endpoint.method} \`${endpoint.path}\`\n\n`;
  md += `**Title:** ${endpoint.title}  \n`;
  if (endpoint.service) md += `**Controller:** \`${endpoint.service}\`  \n`;
  if (endpoint.summary) md += `\n**Description:**\n\n${endpoint.summary}\n\n`;

  if (endpoint.businessRules) {
    md += `#### Business Rules & Governance\n\n${endpoint.businessRules}\n\n`;
  }

  if (endpoint.headers && endpoint.headers.length > 0) {
    md += `#### Request Headers\n\n`;
    md += `| Header | Required | Example | Description |\n`;
    md += `| :--- | :---: | :--- | :--- |\n`;
    endpoint.headers.forEach((h) => {
      md += `| \`${h.key}\` | ${h.required ? 'Yes' : 'No'} | \`${h.value || '-'}\` | ${h.description || '-'} |\n`;
    });
    md += `\n`;
  }

  if (endpoint.pathParams && endpoint.pathParams.length > 0) {
    md += `#### Path Parameters\n\n`;
    md += `| Parameter | Required | Example | Description |\n`;
    md += `| :--- | :---: | :--- | :--- |\n`;
    endpoint.pathParams.forEach((p) => {
      md += `| \`${p.key}\` | ${p.required ? 'Yes' : 'No'} | \`${p.value || '-'}\` | ${p.description || '-'} |\n`;
    });
    md += `\n`;
  }

  if (endpoint.queryParams && endpoint.queryParams.length > 0) {
    md += `#### Query Parameters\n\n`;
    md += `| Parameter | Required | Example | Description |\n`;
    md += `| :--- | :---: | :--- | :--- |\n`;
    endpoint.queryParams.forEach((q) => {
      md += `| \`${q.key}\` | ${q.required ? 'Yes' : 'No'} | \`${q.value || '-'}\` | ${q.description || '-'} |\n`;
    });
    md += `\n`;
  }

  if (endpoint.requestBody?.rawBody) {
    md += `#### Request Body (${endpoint.requestBody.contentType})\n\n`;
    md += `\`\`\`json\n${endpoint.requestBody.rawBody}\n\`\`\`\n\n`;
  }

  if (endpoint.responses && endpoint.responses.length > 0) {
    md += `#### Responses\n\n`;
    endpoint.responses.forEach((res) => {
      md += `##### \`${res.statusCode} ${res.statusText}\` - ${res.description || 'Response'}\n\n`;
      if (res.body) {
        md += `\`\`\`json\n${res.body}\n\`\`\`\n\n`;
      }
    });
  }

  return md;
}

/**
 * Raw JSON backup
 */
export function exportToJson(endpoints: ApiEndpoint[]): string {
  return JSON.stringify(endpoints, null, 2);
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
}
