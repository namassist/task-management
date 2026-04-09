export type Task = {
  id: number;
  title: string;
  description: string | null;
  due_date: string;
  status: "Pending" | "Completed";
  created_at: string;
  updated_at: string | null;
};

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PaginatedTasksResponse = {
  data: Task[];
  meta: PaginationMeta;
};
