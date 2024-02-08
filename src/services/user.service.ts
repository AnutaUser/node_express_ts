import { UploadedFile } from 'express-fileupload';

import { EFileType } from '../enums';
import { ApiError } from '../errors';
import { User } from '../models';
import { userRepository } from '../repositories';
import { IUser } from '../types';
import { s3Service } from './s3.service';

class UserService {
  public async findAll(): Promise<IUser[]> {
    try {
      return await User.find();
    } catch (e) {
      throw new ApiError(e.message, e.status);
    }
  }

  public async getById(userId: string): Promise<IUser> {
    return await this.getOneByIdOrThrow(userId);
  }

  public async update(userId: string, data: IUser): Promise<IUser> {
    await this.getOneByIdOrThrow(userId);

    return await userRepository.update(userId, data);
  }

  public async delete(userId: string): Promise<void> {
    await this.getOneByIdOrThrow(userId);
    await User.findByIdAndDelete(userId);
  }

  public async uploadPhoto(
    photo: UploadedFile,
    userId: string,
  ): Promise<IUser> {
    const user = await this.getOneByIdOrThrow(userId);

    if (user.photo) {
      await s3Service.deletedFile(user.photo);
    }

    const pathToPhoto = await s3Service.uploadFile(
      photo,
      EFileType.userPhoto,
      userId,
    );

    return await User.findByIdAndUpdate(
      userId,
      { $set: { photo: pathToPhoto } },
      { new: true },
    );
  }

  public async deletePhoto(userId: string): Promise<IUser> {
    const user = await this.getOneByIdOrThrow(userId);

    if (user.photo) {
      await s3Service.deletedFile(user.photo);
    }

    return await User.findByIdAndUpdate(
      userId,
      { $set: { photo: user.photo } },
      { new: true },
    );
  }

  private async getOneByIdOrThrow(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError('User not found', 422);
    }
    return user;
  }
}

export const userService = new UserService();
