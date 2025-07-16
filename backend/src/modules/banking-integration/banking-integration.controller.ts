import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Logger,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BankingIntegrationService } from './banking-integration.service';
import { TransactionCategorizationService } from './services/transaction-categorization.service';
import { FraudDetectionService } from './services/fraud-detection.service';
import { BankingInsightsService } from './services/banking-insights.service';
import { PaymentService } from './services/payment.service';
import { AdvancedLoggerService } from '../../common/logger/advanced-logger.service';
import { TransactionCategory } from './interfaces/banking.interface';

export class ConnectBankDto {
  bankId: string;
  connectionMethod?: 'direct' | 'okra';
}

export class UpdateTransactionCategoryDto {
  category: TransactionCategory;
}

export class CreatePaymentDto {
  fromAccountId: string;
  toAccount: {
    accountNumber: string;
    branchCode: string;
    accountName: string;
    bankId: string;
    reference: string;
  };
  amount: number;
  currency: string;
  paymentType: 'immediate' | 'future_dated' | 'recurring';
  scheduledDate?: string;
  description: string;
}

@ApiTags('Banking Integration')
@Controller('api/banking')
export class BankingIntegrationController {
  private readonly logger = new Logger(BankingIntegrationController.name);

  constructor(
    private readonly bankingService: BankingIntegrationService,
    private readonly categorizationService: TransactionCategorizationService,
    private readonly fraudDetectionService: FraudDetectionService,
    private readonly insightsService: BankingInsightsService,
    private readonly paymentService: PaymentService,
    private readonly advancedLogger: AdvancedLoggerService,
  ) {}

  // ===== BANK CONNECTION ENDPOINTS =====

  @Get('banks')
  @ApiOperation({ summary: 'Get supported South African banks' })
  @ApiResponse({ status: 200, description: 'Banks retrieved successfully' })
  async getSupportedBanks() {
    try {
      const banks = this.bankingService.getSouthAfricanBanks();
      
      return {
        success: true,
        data: banks,
        count: banks.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get supported banks:', error);
      throw new HttpException('Failed to retrieve supported banks', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('connect')
  @ApiOperation({ summary: 'Connect to a bank account' })
  @ApiResponse({ status: 200, description: 'Bank connected successfully' })
  async connectBank(@Body() dto: ConnectBankDto, @Query('userId') userId: string) {
    try {
      if (!userId) {
        throw new HttpException('User ID is required', HttpStatus.BAD_REQUEST);
      }

      const connection = await this.bankingService.connectBank(
        userId,
        dto.bankId,
        dto.connectionMethod || 'okra'
      );

      this.advancedLogger.logFinancial(`Bank connection initiated: ${dto.bankId}`, {
        operation: 'bank_connection_api',
        userId,
        metadata: { bankId: dto.bankId, connectionMethod: dto.connectionMethod },
      });

      return {
        success: true,
        data: connection,
        message: 'Bank connection initiated successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to connect bank:', error);
      throw new HttpException(
        error.message || 'Failed to connect bank',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('connections')
  @ApiOperation({ summary: 'Get user bank connections' })
  @ApiResponse({ status: 200, description: 'Connections retrieved successfully' })
  async getConnections(@Query('userId') userId: string) {
    try {
      const connections = this.bankingService.getConnections();
      const userConnections = userId 
        ? connections.filter(conn => conn.userId === userId)
        : connections;

      return {
        success: true,
        data: userConnections,
        count: userConnections.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get connections:', error);
      throw new HttpException('Failed to retrieve connections', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('sync/:connectionId')
  @ApiOperation({ summary: 'Sync account data' })
  @ApiResponse({ status: 200, description: 'Account data synced successfully' })
  async syncAccountData(@Param('connectionId') connectionId: string) {
    try {
      const results = await this.bankingService.syncAccountData(connectionId);

      return {
        success: true,
        data: results,
        message: 'Account data synced successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to sync account data for ${connectionId}:`, error);
      throw new HttpException('Failed to sync account data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ===== ACCOUNT ENDPOINTS =====

  @Get('accounts')
  @ApiOperation({ summary: 'Get user bank accounts' })
  @ApiResponse({ status: 200, description: 'Accounts retrieved successfully' })
  async getAccounts(@Query('userId') userId: string) {
    try {
      const accounts = this.bankingService.getAccounts(userId);

      return {
        success: true,
        data: accounts,
        count: accounts.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get accounts:', error);
      throw new HttpException('Failed to retrieve accounts', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('accounts/:accountId/transactions')
  @ApiOperation({ summary: 'Get account transactions' })
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
  async getAccountTransactions(
    @Param('accountId') accountId: string,
    @Query('limit') limit: string = '50',
    @Query('offset') offset: string = '0'
  ) {
    try {
      const allTransactions = this.bankingService.getTransactions(accountId);
      const limitNum = parseInt(limit);
      const offsetNum = parseInt(offset);
      
      const transactions = allTransactions.slice(offsetNum, offsetNum + limitNum);

      return {
        success: true,
        data: transactions,
        pagination: {
          total: allTransactions.length,
          limit: limitNum,
          offset: offsetNum,
          hasMore: offsetNum + limitNum < allTransactions.length,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to get transactions for account ${accountId}:`, error);
      throw new HttpException('Failed to retrieve transactions', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ===== DASHBOARD ENDPOINT =====

  @Get('dashboard')
  @ApiOperation({ summary: 'Get banking dashboard' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  async getBankingDashboard(@Query('userId') userId: string) {
    try {
      if (!userId) {
        throw new HttpException('User ID is required', HttpStatus.BAD_REQUEST);
      }

      const dashboard = await this.bankingService.getBankingDashboard(userId);

      return {
        success: true,
        data: dashboard,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get banking dashboard:', error);
      throw new HttpException('Failed to retrieve dashboard', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ===== TRANSACTION CATEGORIZATION ENDPOINTS =====

  @Put('transactions/:transactionId/category')
  @ApiOperation({ summary: 'Update transaction category' })
  @ApiResponse({ status: 200, description: 'Transaction category updated successfully' })
  async updateTransactionCategory(
    @Param('transactionId') transactionId: string,
    @Body() dto: UpdateTransactionCategoryDto
  ) {
    try {
      // This would update the transaction in the database
      // For now, we'll just log the learning
      this.advancedLogger.logFinancial(`Transaction category updated: ${transactionId}`, {
        operation: 'transaction_category_update',
        metadata: {
          transactionId,
          newCategory: dto.category,
        },
      });

      return {
        success: true,
        message: 'Transaction category updated successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to update transaction category ${transactionId}:`, error);
      throw new HttpException('Failed to update transaction category', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('categorization/stats')
  @ApiOperation({ summary: 'Get categorization statistics' })
  @ApiResponse({ status: 200, description: 'Categorization stats retrieved successfully' })
  async getCategorizationStats() {
    try {
      const stats = this.categorizationService.getCategorizationStats();

      return {
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get categorization stats:', error);
      throw new HttpException('Failed to retrieve categorization stats', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ===== FRAUD DETECTION ENDPOINTS =====

  @Get('fraud/alerts')
  @ApiOperation({ summary: 'Get fraud alerts' })
  @ApiResponse({ status: 200, description: 'Fraud alerts retrieved successfully' })
  async getFraudAlerts(
    @Query('userId') userId: string,
    @Query('accountId') accountId?: string
  ) {
    try {
      if (accountId) {
        const alerts = await this.fraudDetectionService.getAccountAlerts(accountId);
        return {
          success: true,
          data: alerts,
          count: alerts.length,
          timestamp: new Date().toISOString(),
        };
      }

      const alertCount = await this.fraudDetectionService.getActiveAlertsCount(userId);
      return {
        success: true,
        data: { activeAlerts: alertCount },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get fraud alerts:', error);
      throw new HttpException('Failed to retrieve fraud alerts', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('fraud/alerts/:alertId/resolve')
  @ApiOperation({ summary: 'Resolve fraud alert' })
  @ApiResponse({ status: 200, description: 'Fraud alert resolved successfully' })
  async resolveFraudAlert(
    @Param('alertId') alertId: string,
    @Body() body: { resolution: string }
  ) {
    try {
      await this.fraudDetectionService.resolveAlert(alertId, body.resolution);

      return {
        success: true,
        message: 'Fraud alert resolved successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to resolve fraud alert ${alertId}:`, error);
      throw new HttpException('Failed to resolve fraud alert', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('fraud/rules')
  @ApiOperation({ summary: 'Get fraud detection rules' })
  @ApiResponse({ status: 200, description: 'Fraud rules retrieved successfully' })
  async getFraudRules() {
    try {
      const rules = this.fraudDetectionService.getFraudRules();

      return {
        success: true,
        data: rules,
        count: rules.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get fraud rules:', error);
      throw new HttpException('Failed to retrieve fraud rules', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ===== INSIGHTS ENDPOINTS =====

  @Get('insights')
  @ApiOperation({ summary: 'Get banking insights' })
  @ApiResponse({ status: 200, description: 'Banking insights retrieved successfully' })
  async getBankingInsights(@Query('userId') userId: string) {
    try {
      if (!userId) {
        throw new HttpException('User ID is required', HttpStatus.BAD_REQUEST);
      }

      const accounts = this.bankingService.getAccounts(userId);
      const allTransactions = accounts.flatMap(acc => 
        this.bankingService.getTransactions(acc.id)
      );

      const insights = await this.insightsService.generateInsights(userId, accounts, allTransactions);

      return {
        success: true,
        data: insights,
        count: insights.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get banking insights:', error);
      throw new HttpException('Failed to retrieve banking insights', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ===== PAYMENT ENDPOINTS =====

  @Post('payments')
  @ApiOperation({ summary: 'Create payment instruction' })
  @ApiResponse({ status: 201, description: 'Payment instruction created successfully' })
  async createPayment(@Body() dto: CreatePaymentDto) {
    try {
      const payment = await this.paymentService.createPayment({
        ...dto,
        scheduledDate: dto.scheduledDate ? new Date(dto.scheduledDate) : undefined,
        beneficiaryVerified: false,
        requiresOTP: true,
        fees: 7.50, // Standard EFT fee
      });

      return {
        success: true,
        data: payment,
        message: 'Payment instruction created successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to create payment:', error);
      throw new HttpException('Failed to create payment', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('payments')
  @ApiOperation({ summary: 'Get payment instructions' })
  @ApiResponse({ status: 200, description: 'Payment instructions retrieved successfully' })
  async getPayments() {
    try {
      const payments = await this.paymentService.getAllPayments();

      return {
        success: true,
        data: payments,
        count: payments.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get payments:', error);
      throw new HttpException('Failed to retrieve payments', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('payments/:paymentId')
  @ApiOperation({ summary: 'Get payment instruction details' })
  @ApiResponse({ status: 200, description: 'Payment instruction retrieved successfully' })
  async getPayment(@Param('paymentId') paymentId: string) {
    try {
      const payment = await this.paymentService.getPayment(paymentId);

      if (!payment) {
        throw new HttpException('Payment instruction not found', HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        data: payment,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to get payment ${paymentId}:`, error);
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to retrieve payment', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ===== UTILITY ENDPOINTS =====

  @Post('disconnect/:connectionId')
  @ApiOperation({ summary: 'Disconnect bank connection' })
  @ApiResponse({ status: 200, description: 'Bank disconnected successfully' })
  async disconnectBank(@Param('connectionId') connectionId: string) {
    try {
      await this.bankingService.disconnectBank(connectionId);

      return {
        success: true,
        message: 'Bank disconnected successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to disconnect bank ${connectionId}:`, error);
      throw new HttpException('Failed to disconnect bank', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('connections/:connectionId/status')
  @ApiOperation({ summary: 'Get connection status' })
  @ApiResponse({ status: 200, description: 'Connection status retrieved successfully' })
  async getConnectionStatus(@Param('connectionId') connectionId: string) {
    try {
      const connection = await this.bankingService.getConnectionStatus(connectionId);

      if (!connection) {
        throw new HttpException('Connection not found', HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        data: {
          id: connection.id,
          status: connection.status,
          lastSyncAt: connection.lastSyncAt,
          errorMessage: connection.errorMessage,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to get connection status ${connectionId}:`, error);
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to retrieve connection status', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}