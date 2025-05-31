export async function tryCatch<T>(promise: Promise<T>): Promise<{ data: T | null; error: string | null }> {
  try {
    const data = await promise;
    return { data, error: null };
  } catch (error: unknown) {
    let message = "Unknown error";

    if (typeof error === "string") {
      message = error;
    } else if (error instanceof Error) {
      message = error.message;
    }
    return { data: null, error: message };
  }
}
