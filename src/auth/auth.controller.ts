import { Controller, Post, Body, Get, Query, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Donor Authentication & Registration')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new donor account (Web & Mobile App)' })
  @ApiResponse({ status: 201, description: 'Donor registered successfully in PostgreSQL' })
  @ApiResponse({ status: 400, description: 'Validation error (invalid input)' })
  @ApiResponse({ status: 409, description: 'Email address already exists in database' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('donor/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Alias: Register a new donor account' })
  @ApiResponse({ status: 201, description: 'Donor registered successfully' })
  async registerDonor(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('beneficiary/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new beneficiary application (Individual or Organisation)' })
  @ApiResponse({ status: 201, description: 'Application submitted successfully, pending review' })
  async registerBeneficiary(@Body() body: any) {
    return this.authService.registerBeneficiary(body);
  }

  @Get('check-email')
  @ApiOperation({ summary: 'Check if an email is available for registration' })
  @ApiQuery({ name: 'email', required: true, example: 'donor@example.com' })
  @ApiResponse({ status: 200, description: 'Returns availability status' })
  async checkEmail(@Query('email') email: string) {
    return this.authService.checkEmailAvailability(email);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated donor profile from database' })
  @ApiResponse({ status: 200, description: 'Current donor profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@Request() req: any) {
    return {
      statusCode: 200,
      data: { user: req.user },
    };
  }

  @Get('beneficiary/portal-data')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get live portal data, requests, and allocations for authenticated beneficiary' })
  async getBeneficiaryPortalData(@Request() req: any) {
    return this.authService.getBeneficiaryPortalData(req.user.id);
  }
}
