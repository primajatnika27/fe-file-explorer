import type { ExplorerResponse } from "../types/explorer";

export async function fetchWithError<T>(
  url: string,
  options?: RequestInit
): Promise<ExplorerResponse<T>> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data;
}
