export interface IHTTPError extends Error {
  status?: number;
  type?: string;
  response?: Record<string, unknown> & { message?: string };
}
