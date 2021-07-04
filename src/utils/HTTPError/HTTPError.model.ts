export interface IHTTPError extends Error {
  status?: number;
  type?: string;
  response?: unknown;
}
