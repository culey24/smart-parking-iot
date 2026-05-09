"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
// 1. Định nghĩa bộ khung cấu hình (Options) cho Swagger
const options = {
    definition: {
        openapi: '3.0.0', // Khai báo chuẩn OpenAPI đang dùng
        info: {
            title: 'Smart Parking System API', // Tên project của nhóm ông
            version: '1.0.0',
            description: 'Tài liệu API cho hệ thống bãi đỗ xe thông minh (IoT-SPMS)',
        },
        // Khai báo cấu hình xác thực (Authentication)
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        // Áp dụng bảo mật (bắt buộc truyền token) cho toàn bộ API làm mặc định
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    // 2. Chỉ đường dẫn tới các file mà Swagger cần quét để tìm comment API
    // Nó sẽ lướt qua thư mục routes và controllers để đọc các chú thích của ông
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};
// 3. Đưa cái cấu hình bên trên cho thư viện xử lý và tạo ra cục Spec (tài liệu thô)
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
// 4. Export một hàm để đem qua app.ts gọi
const setupSwagger = (app) => {
    // Gắn giao diện Swagger UI vào đường dẫn /api-docs
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
    console.log('📄 Swagger Docs is running at http://localhost:3000/api-docs');
};
exports.setupSwagger = setupSwagger;
