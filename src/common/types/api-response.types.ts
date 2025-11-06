// Tipos compartidos para respuestas de la API
// Estas interfaces se usan en todos los controllers para mantener consistencia en las respuestas HTTP

// Respuesta con un solo recurso (ej: GET /users/:id, POST /users)
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

// Respuesta con múltiples recursos (ej: GET /users)
export interface ApiListResponse<T> {
  statusCode: number;
  message: string;
  data: T[];
}

// Respuesta sin datos (ej: DELETE /users/:id)
export interface ApiMessageResponse {
  statusCode: number;
  message: string;
}

// Respuesta paginada (ej: GET /users?page=1&limit=10)
export interface ApiPaginatedResponse<T> {
  statusCode: number;
  message: string;
  data: T[];
  total: number;
  page: number;
  limit: number;
}

