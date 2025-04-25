export interface HttpResponse<T> {
  status: number;
  headers: Record<string, string | string[]>;
  data: T;
}