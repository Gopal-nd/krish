export async function safeFetch<T>(url: string): Promise<T> {
    const response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Fetch error: ${response.status} - ${errorText}`);
    }
    return response.json() as Promise<T>;
  }