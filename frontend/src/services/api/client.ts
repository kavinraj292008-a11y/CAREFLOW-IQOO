// Centralized HTTP client for the CareFlow Financial Engine API.

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export class ApiError extends Error {
  constructor(
    public status: number,
    public userMessage: string,
    public detail?: unknown,
  ) {
    super(userMessage)
    this.name = 'ApiError'
  }
}

function normalizeError(status: number, detail?: unknown): ApiError {
  if (status === 0 || status === undefined) {
    return new ApiError(0, 'Unable to connect to CareFlow Financial Engine.')
  }
  if (status === 400 || status === 422) {
    return new ApiError(status, 'Input validation failed. Please review the case parameters.', detail)
  }
  if (status === 404) {
    return new ApiError(status, 'The requested resource was not found.', detail)
  }
  return new ApiError(status, 'CareFlow optimization could not be completed.', detail)
}

export async function apiGet<T>(path: string): Promise<T> {
  let resp: Response
  try {
    resp = await fetch(`${BASE_URL}${path}`, {
      headers: { Accept: 'application/json' },
    })
  } catch {
    throw normalizeError(0)
  }
  if (!resp.ok) {
    const detail = await resp.json().catch(() => undefined)
    throw normalizeError(resp.status, detail)
  }
  return resp.json() as Promise<T>
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  let resp: Response
  try {
    resp = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw normalizeError(0)
  }
  if (!resp.ok) {
    const detail = await resp.json().catch(() => undefined)
    console.error('CareFlow API error', resp.status, detail)
    throw normalizeError(resp.status, detail)
  }
  return resp.json() as Promise<T>
}
