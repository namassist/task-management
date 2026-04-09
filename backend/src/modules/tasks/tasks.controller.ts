import type { NextFunction, Request, Response } from "express";
import { tasksService } from "./tasks.service.js";
import { listTasksQuerySchema } from "./tasks.schemas.js";

export const tasksController = {
  async listTasks(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const query = listTasksQuerySchema.parse(req.query);
      const result = await tasksService.getAllTasks(query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async createTask(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const task = await tasksService.createTask(req.body);
      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  },

  async updateTask(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = Number(req.params.id);
      const task = await tasksService.updateTask(id, req.body);
      res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  },

  async patchTask(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = Number(req.params.id);
      const task = await tasksService.patchTask(id, req.body);
      res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  },

  async deleteTask(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = Number(req.params.id);
      await tasksService.deleteTask(id);
      res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
      next(error);
    }
  },
};
