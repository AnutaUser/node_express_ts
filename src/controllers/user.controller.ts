import { NextFunction, Request, Response } from 'express';

import { ApiError } from '../errors';
import { userService } from '../services';
import { IUser } from '../types';

class UserController {
  public async findAll(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response<IUser[]>> {
    try {
      const users = await userService.findAll();
      return res.json(users);
    } catch (e) {
      next(new ApiError(e.message, e.status));
    }
  }

  public async getById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response<IUser>> {
    try {
      const userById = await userService.getById(req.params.userId);

      return res.status(200).json(userById);
    } catch (e) {
      next(new ApiError(e.message, e.status));
    }
  }

  public async update(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response<IUser>> {
    try {
      const { userId } = req.params;
      const user = req.body;

      const updateUser = await userService.update(userId, user);

      return res.status(201).json(updateUser);
    } catch (e) {
      next(new ApiError(e.message, e.status));
    }
  }

  public async delete(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response<void>> {
    try {
      await userService.delete(req.params.userId);

      return res.sendStatus(204);
    } catch (e) {
      next(new ApiError(e.message, e.status));
    }
  }
}

export const userController = new UserController();
