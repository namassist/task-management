import { z } from "zod";

const statusEnum = z.enum(["Pending", "Completed"]);

const dueDateSchema = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}$/,
    "due_date must be a valid date in YYYY-MM-DD format",
  )
  .refine(
    (val) => {
      const [year, month, day] = val.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
      );
    },
    { message: "due_date must be a valid date in YYYY-MM-DD format" },
  );

export const createTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(255, "Title must be at most 255 characters"),
    description: z
      .string()
      .max(5000, "Description must be at most 5000 characters")
      .nullable()
      .optional()
      .transform((val) => val ?? null),
    due_date: dueDateSchema,
    status: statusEnum,
  })
  .strict();

export const updateTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(255, "Title must be at most 255 characters"),
    description: z
      .string()
      .max(5000, "Description must be at most 5000 characters")
      .nullable()
      .optional()
      .transform((val) => val ?? null),
    due_date: dueDateSchema,
    status: statusEnum,
  })
  .strict();

export const patchTaskSchema = z
  .object({
    status: statusEnum,
  })
  .strict();

export const taskIdParamSchema = z.object({
  id: z.coerce.number().int().positive("Task ID must be a positive integer"),
});

export const listTasksQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort_by: z.enum(["created_at", "due_date", "title"]).default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
  status: statusEnum.optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type PatchTaskInput = z.infer<typeof patchTaskSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
