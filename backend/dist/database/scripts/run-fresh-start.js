"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const fresh_start_seed_1 = require("../seeds/fresh-start.seed");
async function runFreshStartScript() {
    try {
        console.log('🚀 Initializing LIF3 Fresh Start Database Reset...');
        await data_source_1.AppDataSource.initialize();
        console.log('✅ Database connection established');
        await (0, fresh_start_seed_1.seedFreshStart)(data_source_1.AppDataSource);
        console.log('🎉 LIF3 Fresh Start Complete!');
        console.log('📊 Database reset with R0 starting values');
        console.log('🎯 Ready to track progress to R1,800,000');
    }
    catch (error) {
        console.error('❌ Fresh Start Script Error:', error);
        process.exit(1);
    }
    finally {
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
            console.log('🔌 Database connection closed');
        }
    }
}
runFreshStartScript();
//# sourceMappingURL=run-fresh-start.js.map