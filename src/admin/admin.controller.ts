import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { RequestStatus, DonationStatus } from '@prisma/client';

@ApiTags('Admin Portal')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get live Admin Dashboard metrics and sections directly from PostgreSQL' })
  async getDashboard() {
    return this.adminService.getDashboard();
  }

  @Patch('beneficiary-requests/:id/status')
  @ApiOperation({ summary: 'Update status of a beneficiary request' })
  async updateRequestStatus(
    @Param('id') id: string,
    @Body('status') status: RequestStatus,
    @Body('reviewNotes') reviewNotes?: string,
  ) {
    return this.adminService.updateRequestStatus(id, status, reviewNotes);
  }

  // --- Donor CRM Endpoints ---

  @Get('donors')
  @ApiOperation({ summary: 'View all registered donors with their complete giving records' })
  async getAllDonors() {
    return this.adminService.getAllDonors();
  }

  @Get('donors/:id')
  @ApiOperation({ summary: 'View individual donor profile and donation history' })
  async getDonorById(@Param('id') id: string) {
    return this.adminService.getDonorById(id);
  }

  @Post('donors')
  @ApiOperation({ summary: 'Add a new donor account directly to the database' })
  async createDonor(@Body() body: any) {
    return this.adminService.createDonor(body);
  }

  @Put('donors/:id')
  @ApiOperation({ summary: 'Edit donor details, assigned tier, and communication consent' })
  async updateDonor(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updateDonor(id, body);
  }

  @Post('donors/:id/donations')
  @ApiOperation({ summary: 'Record a new donation for donor (automatically updates total giving and tier)' })
  async recordDonorDonation(@Param('id') id: string, @Body() body: any) {
    return this.adminService.recordDonorDonation(id, body);
  }

  @Delete('donors/:id')
  @ApiOperation({ summary: 'Delete a donor account from the database' })
  async deleteDonor(@Param('id') id: string) {
    return this.adminService.deleteDonor(id);
  }

  // --- Campaign Management Endpoints ---

  @Get('campaigns')
  @ApiOperation({ summary: 'View all campaigns with progress, total raised, target, and donations' })
  async getAllCampaigns() {
    return this.adminService.getAllCampaigns();
  }

  @Get('campaigns/:id')
  @ApiOperation({ summary: 'Get details and all donations received for a specific campaign' })
  async getCampaignById(@Param('id') id: string) {
    return this.adminService.getCampaignById(id);
  }

  @Post('campaigns')
  @ApiOperation({ summary: 'Create a new campaign with target, dates, description, and image' })
  async createCampaign(@Body() body: any) {
    return this.adminService.createCampaign(body);
  }

  @Put('campaigns/:id')
  @ApiOperation({ summary: 'Edit existing campaign details, target amount, dates, or image' })
  async updateCampaign(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updateCampaign(id, body);
  }

  @Patch('campaigns/:id/status')
  @ApiOperation({ summary: 'Activate or deactivate a fundraising campaign' })
  async toggleCampaignStatus(
    @Param('id') id: string,
    @Body('active') active: boolean,
  ) {
    return this.adminService.toggleCampaignStatus(id, active);
  }

  @Patch('campaigns/:id/archive')
  @ApiOperation({ summary: 'Archive or unarchive a campaign' })
  async archiveCampaign(
    @Param('id') id: string,
    @Body('archived') archived: boolean,
  ) {
    return this.adminService.archiveCampaign(id, archived);
  }

  @Delete('campaigns/:id')
  @ApiOperation({ summary: 'Delete or archive a campaign from the database' })
  async deleteCampaign(
    @Param('id') id: string,
    @Query('force') force?: string,
  ) {
    const isForce = force === 'true' || force === '1';
    return this.adminService.deleteCampaign(id, isForce);
  }

  // --- Donation Management Endpoints ---

  @Get('donations')
  @ApiOperation({ summary: 'View all donations from PostgreSQL with donor and campaign relations' })
  async getAllDonations() {
    return this.adminService.getAllDonations();
  }

  @Get('donations/:id')
  @ApiOperation({ summary: 'View individual donation transaction details and receipt metadata' })
  async getDonationById(@Param('id') id: string) {
    return this.adminService.getDonationById(id);
  }

  @Post('donations')
  @ApiOperation({ summary: 'Record external donation received offline (cash, bank transfer, cheque, etc.)' })
  async recordOfflineDonation(@Body() body: any) {
    return this.adminService.recordOfflineDonation(body);
  }

  @Patch('donations/:id/status')
  @ApiOperation({ summary: 'Update payment status of a donation transaction' })
  async updateDonationStatus(
    @Param('id') id: string,
    @Body('status') status: DonationStatus,
  ) {
    return this.adminService.updateDonationStatus(id, status);
  }

  @Delete('donations/:id')
  @ApiOperation({ summary: 'Delete a donation record and reconcile ledger accounts' })
  async deleteDonation(@Param('id') id: string) {
    return this.adminService.deleteDonation(id);
  }

  // --- Beneficiary Management Endpoints ---

  @Get('beneficiaries')
  @ApiOperation({ summary: 'View all beneficiaries with their support history and documents' })
  async getAllBeneficiaries() {
    return this.adminService.getAllBeneficiaries();
  }

  @Get('beneficiaries/:id')
  @ApiOperation({ summary: 'View detailed beneficiary profile, documents, and communication logs' })
  async getBeneficiaryById(@Param('id') id: string) {
    return this.adminService.getBeneficiaryById(id);
  }

  @Post('beneficiaries')
  @ApiOperation({ summary: 'Add a new beneficiary record to PostgreSQL' })
  async createBeneficiary(@Body() body: any) {
    return this.adminService.createBeneficiary(body);
  }

  @Put('beneficiaries/:id')
  @ApiOperation({ summary: 'Edit beneficiary details' })
  async updateBeneficiary(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updateBeneficiary(id, body);
  }

  @Patch('beneficiaries/:id/status')
  @ApiOperation({ summary: 'Activate or deactivate a beneficiary account' })
  async toggleBeneficiaryActive(
    @Param('id') id: string,
    @Body('active') active: boolean,
  ) {
    return this.adminService.toggleBeneficiaryActive(id, active);
  }

  @Patch('beneficiaries/:id/advocate')
  @ApiOperation({ summary: 'Assign an advocate or caseworker to beneficiary' })
  async assignAdvocate(
    @Param('id') id: string,
    @Body('assignedAdvocate') advocate: string,
  ) {
    return this.adminService.assignAdvocate(id, advocate);
  }

  @Post('beneficiaries/:id/requests')
  @ApiOperation({ summary: 'Create a new assistance request for beneficiary' })
  async createBeneficiaryRequest(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.adminService.createBeneficiaryRequest(id, body);
  }

  @Post('beneficiaries/:id/documents')
  @ApiOperation({ summary: 'Add a document record to beneficiary profile' })
  async addBeneficiaryDocument(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.adminService.addBeneficiaryDocument(id, body);
  }

  @Delete('beneficiaries/:id/documents/:docId')
  @ApiOperation({ summary: 'Delete a document record from beneficiary profile' })
  async deleteBeneficiaryDocument(
    @Param('id') id: string,
    @Param('docId') docId: string,
  ) {
    return this.adminService.deleteBeneficiaryDocument(id, docId);
  }

  @Post('beneficiaries/:id/communications')
  @ApiOperation({ summary: 'Log a communication record for beneficiary' })
  async addBeneficiaryCommunication(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.adminService.addBeneficiaryCommunication(id, body);
  }

  @Delete('beneficiaries/:id')
  @ApiOperation({ summary: 'Delete a beneficiary account from database' })
  async deleteBeneficiary(@Param('id') id: string) {
    return this.adminService.deleteBeneficiary(id);
  }

  // --- Support Categories Management Endpoints ---

  @Get('support-categories')
  @ApiOperation({ summary: 'List all dynamic support categories with target, allocated, and distributed funding' })
  async getSupportCategories() {
    return this.adminService.getSupportCategories();
  }

  @Post('support-categories')
  @ApiOperation({ summary: 'Create a new dynamic support category with funding requirement target' })
  async createSupportCategory(@Body() body: any) {
    return this.adminService.createSupportCategory(body);
  }

  @Put('support-categories/:id')
  @ApiOperation({ summary: 'Update an existing support category and funding target' })
  async updateSupportCategory(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updateSupportCategory(id, body);
  }

  @Delete('support-categories/:id')
  @ApiOperation({ summary: 'Delete a support category' })
  async deleteSupportCategory(@Param('id') id: string) {
    return this.adminService.deleteSupportCategory(id);
  }

  // --- Fund Allocation & Assistance Disbursement Endpoints ---

  @Get('allocations')
  @ApiOperation({ summary: 'View all fund allocations, distribution records, and live financial metrics' })
  async getAllAllocations() {
    return this.adminService.getAllAllocations();
  }

  @Get('allocations/:id')
  @ApiOperation({ summary: 'View single fund allocation details' })
  async getAllocationById(@Param('id') id: string) {
    return this.adminService.getAllocationById(id);
  }

  @Post('allocations')
  @ApiOperation({ summary: 'Allocate funds to a beneficiary' })
  async createAllocation(@Body() body: any) {
    return this.adminService.createAllocation(body);
  }

  @Patch('allocations/:id/distribute')
  @ApiOperation({ summary: 'Record actual assistance distribution to beneficiary' })
  async recordDistribution(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.adminService.recordDistribution(id, body);
  }

  @Put('allocations/:id')
  @ApiOperation({ summary: 'Update allocation information' })
  async updateAllocation(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.adminService.updateAllocation(id, body);
  }

  @Patch('allocations/:id/cancel')
  @ApiOperation({ summary: 'Cancel an allocated fund record' })
  async cancelAllocation(@Param('id') id: string) {
    return this.adminService.cancelAllocation(id);
  }

  @Delete('allocations/:id')
  @ApiOperation({ summary: 'Delete an allocation record' })
  async deleteAllocation(@Param('id') id: string) {
    return this.adminService.deleteAllocation(id);
  }

  // --- Reports & Analytics Endpoints ---

  @Get('reports')
  @ApiOperation({ summary: 'Get comprehensive reports and analytics data with filters' })
  async getReports(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('period') period?: string,
    @Query('campaignId') campaignId?: string,
    @Query('donationType') donationType?: string,
  ) {
    return this.adminService.getReports({ startDate, endDate, period, campaignId, donationType });
  }

  // --- Staff & Admin Activity Management Endpoints ---

  @Get('staff')
  @ApiOperation({ summary: 'View all staff and admin accounts with roles and permissions' })
  async getAllStaff() {
    return this.adminService.getAllStaff();
  }

  @Post('staff')
  @ApiOperation({ summary: 'Create a new staff or admin user account' })
  async createStaff(@Body() body: any) {
    return this.adminService.createStaff(body);
  }

  @Put('staff/:id')
  @ApiOperation({ summary: 'Update staff member details, role, department, and permissions' })
  async updateStaff(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updateStaff(id, body);
  }

  @Patch('staff/:id/status')
  @ApiOperation({ summary: 'Activate or deactivate a staff member account' })
  async toggleStaffStatus(@Param('id') id: string, @Body('active') active: boolean) {
    return this.adminService.toggleStaffStatus(id, active);
  }

  @Delete('staff/:id')
  @ApiOperation({ summary: 'Delete a staff account' })
  async deleteStaff(@Param('id') id: string) {
    return this.adminService.deleteStaff(id);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Retrieve full audit history and recent admin activities with filters' })
  async getAuditLogs(
    @Query('search') search?: string,
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
    @Query('actorId') actorId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getAuditLogs({
      search,
      action,
      entityType,
      actorId,
      startDate,
      endDate,
      limit: limit ? parseInt(limit, 10) : 50,
    });
  }

  @Get('roles-permissions')
  @ApiOperation({ summary: 'Get staff role definitions and permission matrix for Trust governance' })
  async getRolesAndPermissions() {
    return this.adminService.getRolesAndPermissions();
  }

  // --- Admin Profile, Settings & Newsletter Endpoints ---

  @Get('profile')
  @ApiOperation({ summary: 'Get current admin user profile' })
  async getProfile(@Query('email') email?: string) {
    return this.adminService.getAdminProfile(email);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update admin profile information' })
  async updateProfile(@Body() body: any) {
    return this.adminService.updateAdminProfile(body);
  }

  @Post('change-password')
  @ApiOperation({ summary: 'Change admin account password' })
  async changePassword(@Body() body: any) {
    return this.adminService.changeAdminPassword(body);
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get system and charity configuration settings' })
  async getSettings() {
    return this.adminService.getSystemSettings();
  }

  @Put('settings')
  @ApiOperation({ summary: 'Update system and charity configuration settings' })
  async updateSettings(@Body() body: any) {
    return this.adminService.updateSystemSettings(body);
  }

  @Get('newsletter')
  @ApiOperation({ summary: 'Get newsletter subscribers and communication consent metrics' })
  async getNewsletter() {
    return this.adminService.getNewsletterMetrics();
  }

  @Post('newsletter/dispatch')
  @ApiOperation({ summary: 'Record newsletter campaign dispatch' })
  async dispatchNewsletter(@Body() body: any) {
    return this.adminService.dispatchNewsletter(body);
  }
}
