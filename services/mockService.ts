export async function mockRequest<T>(data: T, delay = 150): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, delay));
  return structuredClone(data);
}
