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
exports.BusinessStrategyController = void 0;
const common_1 = require("@nestjs/common");
const business_strategy_service_1 = require("./business-strategy.service");
const business_strategy_dto_1 = require("./business-strategy.dto");
let BusinessStrategyController = class BusinessStrategyController {
    constructor(strategyService) {
        this.strategyService = strategyService;
    }
    async getStrategy() {
        const strategy = await this.strategyService.getStrategy();
        if (!strategy) {
            throw new common_1.HttpException('No business strategy found', common_1.HttpStatus.NOT_FOUND);
        }
        return strategy;
    }
    async updateStrategy(data) {
        const ok = await this.strategyService.updateStrategy(data);
        if (!ok) {
            throw new common_1.HttpException('Failed to update business strategy', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        await this.strategyService.syncToMCP(data);
        return { success: true };
    }
};
exports.BusinessStrategyController = BusinessStrategyController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BusinessStrategyController.prototype, "getStrategy", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [business_strategy_dto_1.BusinessStrategyDto]),
    __metadata("design:returntype", Promise)
], BusinessStrategyController.prototype, "updateStrategy", null);
exports.BusinessStrategyController = BusinessStrategyController = __decorate([
    (0, common_1.Controller)('business-strategy'),
    __metadata("design:paramtypes", [business_strategy_service_1.BusinessStrategyService])
], BusinessStrategyController);
//# sourceMappingURL=business-strategy.controller.js.map