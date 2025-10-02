import { UsersService } from './users.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Response } from 'express';
declare class UpdateProfileDto {
    name: string;
    email: string;
}
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): Promise<{
        id: any;
        name: string;
        email: string;
        createdAt: Date;
    }>;
    updateProfile(req: any, updateProfileDto: UpdateProfileDto): Promise<{
        id: any;
        name: string;
        email: string;
        createdAt: Date;
    }>;
    changePasswordPost(req: any, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    changePasswordGet(req: any, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    openRedirect(url: string, res: Response): Response<any, Record<string, any>>;
}
export {};
