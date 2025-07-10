import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { BusinessStrategy } from './business-strategy.interface';

const STRATEGY_DOC_ID = 'main-strategy';

@Injectable()
export class BusinessStrategyService implements OnModuleInit {
  private readonly logger = new Logger(BusinessStrategyService.name);
  private chromaClient: any;
  private collection: any;
  private isInitialized = false;

  private readonly collectionName = 'business_strategy';
  private readonly persistPath = './storage/chromadb';

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    try {
      const chromadb = await import('chromadb');
      this.chromaClient = new chromadb.ChromaClient();
      await this.initializeCollection();
      this.isInitialized = true;
      this.logger.log('BusinessStrategyService initialized with ChromaDB');
    } catch (error) {
      this.logger.error(`Failed to initialize ChromaDB: ${error.message}`);
      this.isInitialized = false;
    }
  }

  private async initializeCollection(): Promise<void> {
    try {
      this.collection = await this.chromaClient.getCollection({
        name: this.collectionName
      });
    } catch (error) {
      this.collection = await this.chromaClient.createCollection({
        name: this.collectionName,
        metadata: {
          description: 'Business Strategy Data'
        }
      });
      this.logger.log(`Created new ChromaDB collection: ${this.collectionName}`);
    }
  }

  // Fetch the current business strategy from ChromaDB
  async getStrategy(): Promise<BusinessStrategy | null> {
    if (!this.isInitialized) return null;
    const results = await this.collection.get({ ids: [STRATEGY_DOC_ID] });
    if (results && results.documents && results.documents[0]) {
      try {
        return JSON.parse(results.documents[0]);
      } catch (e) {
        this.logger.error('Failed to parse business strategy document');
        return null;
      }
    }
    return null;
  }

  // Update (upsert) the business strategy in ChromaDB
  async updateStrategy(data: BusinessStrategy): Promise<boolean> {
    if (!this.isInitialized) return false;
    await this.collection.upsert({
      ids: [STRATEGY_DOC_ID],
      documents: [JSON.stringify(data)],
      metadatas: [{ updatedAt: new Date().toISOString() }]
    });
    return true;
  }

  // Placeholder for MCP sync logic
  async syncToMCP(data: BusinessStrategy): Promise<void> {
    // TODO: Implement MCP sync logic here
    this.logger.log('MCP sync placeholder called');
  }
} 