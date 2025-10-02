"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const jwt_guard_1 = require("../auth/jwt.guard");
const users_service_1 = require("./users.service");
const change_password_dto_1 = require("./dto/change-password.dto");
const url_1 = require("url");
class UpdateProfileDto {
}
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async getProfile(req) {
        const user = await this.usersService.findById(req.user.userId);
        return {
            id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
        };
    }
    async updateProfile(req, updateProfileDto) {
        try {
            const updatedUser = await this.usersService.updateProfile(req.user.userId, updateProfileDto);
            return {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                createdAt: updatedUser.createdAt,
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Failed to update profile');
        }
    }
    async changePasswordPost(req, changePasswordDto) {
        try {
            await this.usersService.changePassword(req.user.userId, changePasswordDto.currentPassword, changePasswordDto.newPassword);
            return { message: 'Password updated successfully via POST' };
        }
        catch (error) {
            console.error('Password change failed:', error);
            throw new common_1.UnauthorizedException('Failed to change password');
        }
    }
    async changePasswordGet(req, currentPassword, newPassword) {
        if (!currentPassword || !newPassword) {
            throw new common_1.UnauthorizedException('Missing currentPassword or newPassword query parameter');
        }
        if (newPassword.length < 6) {
            throw new common_1.UnauthorizedException('New password must be at least 6 characters long');
        }
        try {
            await this.usersService.changePassword(req.user.userId, currentPassword, newPassword);
            return { message: 'Password updated successfully via GET (Vulnerable)' };
        }
        catch (error) {
            console.error('Password change failed:', error);
            throw new common_1.UnauthorizedException('Failed to change password');
        }
    }
    openRedirect(url, res) {
        if (!url) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).send('Missing url query parameter');
        }
        try {
            const parsedUrl = new url_1.URL(url);
            const allowedHosts = ['localhost:3000', 'localhost:3001', 'yourdomain.com'];
            if (!allowedHosts.includes(parsedUrl.host)) {
                return res.status(common_1.HttpStatus.BAD_REQUEST).send('Invalid redirect URL: host not allowed');
            }
            if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
                return res.status(common_1.HttpStatus.BAD_REQUEST).send('Invalid protocol: only http/https allowed');
            }
            console.log(`Performing safe redirect to: ${url}`);
            res.redirect(url);
        }
        catch (error) {
            console.error('Redirect validation failed:', error);
            res.status(common_1.HttpStatus.BAD_REQUEST).send('Invalid URL format');
        }
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Patch)('profile'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, UpdateProfileDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Post)('change-password'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, change_password_dto_1.ChangePasswordDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "changePasswordPost", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)('change-password'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('currentPassword')),
    __param(2, (0, common_1.Query)('newPassword')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "changePasswordGet", null);
__decorate([
    (0, common_1.Get)('redirect'),
    (0, common_1.HttpCode)(common_1.HttpStatus.FOUND),
    __param(0, (0, common_1.Query)('url')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "openRedirect", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map