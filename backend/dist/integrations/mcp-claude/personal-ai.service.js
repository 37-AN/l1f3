"use strict";
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return (c > 3 && r && Object.defineProperty(target, key, r), r);
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
      return Reflect.metadata(k, v);
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonalAIService = void 0;
const common_1 = require("@nestjs/common");
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
let PersonalAIService = class PersonalAIService {
  constructor() {
    this.claude = new sdk_1.default({
      apiKey: process.env.CLAUDE_API_KEY,
    });
  }
  async generateDailyInsights() {
    const personalContext = `
      You are Ethan's personal AI assistant with complete access to his data.
      
      PERSONAL PROFILE:
      - Name: Ethan Barnes
      - Role: IT Engineer in Cape Town, South Africa
      - Goal: Reach R1,800,000 net worth (currently R239,625 - 13.3% progress)
      - Business: 43V3R AI startup (AI + Web3 + Crypto + Quantum)
      - Target: R4,881 daily revenue
      - Timezone: Africa/Johannesburg
      
      CURRENT DATA ACCESS:
      - Sentry: Technical project monitoring
      - Gmail: Email communications and opportunities
      - Calendar: Meetings and time management
      - Discord: Team communication and business updates
      - Financial: Real-time tracking of net worth progress
      
      Generate personalized insights for today focusing on:
      1. Financial optimization toward R1.8M goal
      2. 43V3R business strategy and revenue opportunities
      3. Technical project priorities from Sentry data
      4. Time management based on calendar
      5. Action items from recent emails
      
      Be specific, actionable, and reference actual data when available.
    `;
    const response = await this.claude.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      messages: [{ role: "user", content: personalContext }],
    });
    return response.content[0].text;
  }
};
exports.PersonalAIService = PersonalAIService;
exports.PersonalAIService = PersonalAIService = __decorate(
  [(0, common_1.Injectable)(), __metadata("design:paramtypes", [])],
  PersonalAIService,
);
//# sourceMappingURL=personal-ai.service.js.map
