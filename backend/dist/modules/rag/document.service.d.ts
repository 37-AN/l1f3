import { DocumentMetadata } from './interfaces/rag.interface';
export declare class DocumentService {
    private readonly logger;
    processFile(filePath: string, fileName: string, userId: string, metadata?: Partial<DocumentMetadata>): Promise<{
        content: string;
        metadata: DocumentMetadata;
    }>;
    private extractPdfContent;
    private extractDocxContent;
    private extractTextContent;
    private extractJsonContent;
    private jsonToText;
    private determineCategory;
    private cleanContent;
    validateFile(file: Express.Multer.File): Promise<boolean>;
    saveUploadedFile(file: Express.Multer.File, userId: string): Promise<string>;
    deleteFile(filePath: string): Promise<void>;
}
