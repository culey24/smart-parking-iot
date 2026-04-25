"use strict";
// Script để tạo dữ liệu mẫu (Mock data cho HCMUT_DATACORE)
// Chạy bằng lệnh: npx ts-node src/utils/seed.ts
Object.defineProperty(exports, "__esModule", { value: true });
const seedDatabase = async () => {
    console.log('Seeding database...');
    // TODO: Kết nối MongoDB
    // TODO: Insert dữ liệu mẫu cho Zone, User, FeeStrategy
    console.log('Database seeded successfully!');
    process.exit(0);
};
seedDatabase();
