import { Controller, Get, Patch, Post, UseGuards, Request, Body, Query, UnauthorizedException, Res, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UsersService } from './users.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Response } from 'express';
import { URL } from 'url';

// Create DTOs for type safety
class UpdateProfileDto {
  name: string;
  email: string;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.usersService.findById(req.user.userId);
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto
  ) {
    try {
      const updatedUser = await this.usersService.updateProfile(
        req.user.userId,
        updateProfileDto
      );
      return {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        createdAt: updatedUser.createdAt,
      };
    } catch (error) {
      throw new UnauthorizedException('Failed to update profile');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePasswordPost(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    try {
      await this.usersService.changePassword(
        req.user.userId,
        changePasswordDto.currentPassword,
        changePasswordDto.newPassword
      );
      return { message: 'Password updated successfully via POST' };
    } catch (error) {
      console.error('Password change failed:', error);
      throw new UnauthorizedException('Failed to change password');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('change-password')
  async changePasswordGet(
    @Request() req,
    @Query('currentPassword') currentPassword: string,
    @Query('newPassword') newPassword: string
  ) {
    if (!currentPassword || !newPassword) {
      throw new UnauthorizedException('Missing currentPassword or newPassword query parameter');
    }
    if (newPassword.length < 6) {
       throw new UnauthorizedException('New password must be at least 6 characters long');
    }

    try {
      await this.usersService.changePassword(
        req.user.userId,
        currentPassword,
        newPassword
      );
      return { message: 'Password updated successfully via GET (Vulnerable)' };
    } catch (error) {
      console.error('Password change failed:', error);
      throw new UnauthorizedException('Failed to change password');
    }
  }

  // FIXED: Secure Redirect endpoint with proper validation
  @Get('redirect')
  @HttpCode(HttpStatus.FOUND)
  openRedirect(@Query('url') url: string, @Res() res: Response) {
    if (!url) {
      return res.status(HttpStatus.BAD_REQUEST).send('Missing url query parameter');
    }
    
    // Validate redirect URL
    try {
      const parsedUrl = new URL(url);
      const allowedHosts = ['localhost:3000', 'localhost:3001', 'yourdomain.com'];
      
      if (!allowedHosts.includes(parsedUrl.host)) {
        return res.status(HttpStatus.BAD_REQUEST).send('Invalid redirect URL: host not allowed');
      }
      
      // Only allow http/https protocols
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return res.status(HttpStatus.BAD_REQUEST).send('Invalid protocol: only http/https allowed');
      }
      
      console.log(`Performing safe redirect to: ${url}`);
      res.redirect(url);
    } catch (error) {
      console.error('Redirect validation failed:', error);
      res.status(HttpStatus.BAD_REQUEST).send('Invalid URL format');
    }
  }
}