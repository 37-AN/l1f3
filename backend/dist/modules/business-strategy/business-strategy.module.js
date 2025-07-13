"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessStrategyModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const business_strategy_service_1 = require("./business-strategy.service");
const business_strategy_controller_1 = require("./business-strategy.controller");
let BusinessStrategyModule = class BusinessStrategyModule {
};
exports.BusinessStrategyModule = BusinessStrategyModule;
exports.BusinessStrategyModule = BusinessStrategyModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        providers: [business_strategy_service_1.BusinessStrategyService],
        controllers: [business_strategy_controller_1.BusinessStrategyController],
        exports: [business_strategy_service_1.BusinessStrategyService]
    })
], BusinessStrategyModule);
//# sourceMappingURL=business-strategy.module.js.map