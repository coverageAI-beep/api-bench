export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';

export interface KeyValueItem {
  id: string;
  key: string;
  value: string;
  required: boolean;
  description?: string;
}

export interface ApiResponseDef {
  id: string;
  statusCode: number;
  statusText: string;
  description: string;
  headers?: KeyValueItem[];
  body: string; // JSON formatted string example
}

export interface ApiEndpoint {
  id: string; // unique slug e.g. "usercontroller-get-api-v1-users-id"
  title: string;
  service: string; // Controller or microservice name
  path: string;
  method: HttpMethod;
  summary: string;
  businessRules: string; // Markdown / bullet points / business logic
  headers: KeyValueItem[];
  pathParams: KeyValueItem[];
  queryParams: KeyValueItem[];
  requestBody: {
    contentType: 'application/json' | 'multipart/form-data' | 'application/x-www-form-urlencoded' | 'none';
    rawBody: string;
  };
  responses: ApiResponseDef[];
  createdAt: string;
  updatedAt: string;
}

export type ExportFormat = 'openapi' | 'postman' | 'markdown' | 'json';

export type ActiveTab = 'dashboard' | 'apis';

export type ViewMode = 
  | { type: 'dashboard' }
  | { type: 'list' }
  | { type: 'detail'; endpointId: string }
  | { type: 'create' }
  | { type: 'edit'; endpointId: string };

export interface UserPreferences {
  workspaceName: string;
  defaultBaseUrl: string;
  requestTimeoutSeconds: number;
  autoFormatJson: boolean;
  wordWrap: boolean;
  defaultContentType: string;
  globalAuthHeader: string;
  theme: 'earth' | 'slate';
}
