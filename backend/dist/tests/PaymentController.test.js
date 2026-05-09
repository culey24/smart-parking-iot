"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const globals_1 = require("@jest/globals");
const PaymentController_1 = require("../src/controllers/PaymentController");
const ParkingSession_1 = require("../src/models/ParkingSession");
const BillingService_1 = require("../src/services/BillingService");
globals_1.jest.mock('../src/models/ParkingSession');
globals_1.jest.mock('../src/services/BillingService');
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get('/api/payment/debt', PaymentController_1.PaymentController.getDebt);
app.get('/api/payment/history', (req, res, next) => {
    // Mock req.user for testing purposes
    req.user = { id: req.query.userId || 'SV001' };
    next();
}, PaymentController_1.PaymentController.getHistory);
app.get('/api/payment/history/admin', PaymentController_1.PaymentController.getHistoryAdmin);
app.post('/api/payment/cycle', PaymentController_1.PaymentController.initiateCyclePayment);
(0, globals_1.describe)('PaymentController (Supertest)', () => {
    (0, globals_1.beforeEach)(() => {
        globals_1.jest.clearAllMocks();
    });
    (0, globals_1.describe)('GET /api/payment/debt', () => {
        (0, globals_1.it)('Should return 400 error if subjectId is missing', async () => {
            // User supertest calling GET API directly (without passing query)
            const res = await (0, supertest_1.default)(app).get('/api/payment/debt');
            (0, globals_1.expect)(res.status).toBe(400);
            (0, globals_1.expect)(res.body.success).toBe(false);
            (0, globals_1.expect)(res.body.message).toBe('Missing query subjectId');
        });
        (0, globals_1.it)('Should return the correct total debt of the User', async () => {
            // Simulate Database finding 2 unpaid sessions
            ParkingSession_1.ParkingSession.find.mockResolvedValue([
                { subjectId: 'SV001', fee: 2000 },
                { subjectId: 'SV001', fee: 3000 }
            ]);
            // Use supertest to call the API with query parameters
            const res = await (0, supertest_1.default)(app).get('/api/payment/debt?subjectId=SV001');
            (0, globals_1.expect)(ParkingSession_1.ParkingSession.find).toHaveBeenCalled();
            (0, globals_1.expect)(res.status).toBe(200);
            (0, globals_1.expect)(res.body).toEqual({
                success: true,
                data: {
                    subjectId: 'SV001',
                    totalDebt: 5000,
                    unpaidCount: 2
                }
            });
        });
    });
    (0, globals_1.describe)('GET /api/payment/history', () => {
        (0, globals_1.it)("Should return the User's parking history using the default number of days (30)", async () => {
            const mockHistory = [
                { sessionId: 'S1', subjectId: 'SV001', createdAt: new Date() }
            ];
            ParkingSession_1.ParkingSession.find.mockReturnValue({
                sort: globals_1.jest.fn().mockReturnValue(Promise.resolve(mockHistory))
            });
            const res = await (0, supertest_1.default)(app).get('/api/payment/history?userId=SV001');
            (0, globals_1.expect)(res.status).toBe(200);
            (0, globals_1.expect)(res.body.success).toBe(true);
            (0, globals_1.expect)(res.body.data).toEqual(JSON.parse(JSON.stringify(mockHistory)));
            // Verify find was called with correct filter (subjectId and createdAt limit)
            (0, globals_1.expect)(ParkingSession_1.ParkingSession.find).toHaveBeenCalledWith(globals_1.expect.objectContaining({
                subjectId: 'SV001',
                createdAt: globals_1.expect.any(Object) // Contains $gte
            }));
        });
        (0, globals_1.it)('Should correctly apply the number of days from the HISTORY_VIEW_DAYS_LIMIT environment variable', async () => {
            process.env.HISTORY_VIEW_DAYS_LIMIT = '15';
            const mockHistory = [
                { sessionId: 'S2', subjectId: 'SV001', createdAt: new Date() }
            ];
            const sortMock = globals_1.jest.fn().mockReturnValue(Promise.resolve(mockHistory));
            ParkingSession_1.ParkingSession.find.mockReturnValue({ sort: sortMock });
            await (0, supertest_1.default)(app).get('/api/payment/history?userId=SV001');
            // The $gte date should be approx 15 days ago
            const findCallArgs = ParkingSession_1.ParkingSession.find.mock.calls[0][0];
            (0, globals_1.expect)(findCallArgs.createdAt.$gte).toBeInstanceOf(Date);
            const cutoffDate = findCallArgs.createdAt.$gte;
            const expectedDate = new Date();
            expectedDate.setDate(expectedDate.getDate() - 15);
            // Allow minor differences in ms
            (0, globals_1.expect)(Math.abs(cutoffDate.getTime() - expectedDate.getTime())).toBeLessThan(1000);
            delete process.env.HISTORY_VIEW_DAYS_LIMIT; // Clean up
        });
        (0, globals_1.it)('Should return 500 error if DB throws an error', async () => {
            ParkingSession_1.ParkingSession.find.mockImplementation(() => {
                throw new Error('Database Error');
            });
            const res = await (0, supertest_1.default)(app).get('/api/payment/history?userId=SV001');
            (0, globals_1.expect)(res.status).toBe(500);
            (0, globals_1.expect)(res.body.success).toBe(false);
            (0, globals_1.expect)(res.body.message).toBe('Lỗi server'); // Hardcoded in the catch block of PaymentController
        });
    });
    (0, globals_1.describe)('GET /api/payment/history/admin', () => {
        (0, globals_1.it)('Should return all history data (test with 76 logs)', async () => {
            // Generate 76 mock rows
            const mockLargeHistory = Array.from({ length: 76 }, (_, i) => ({
                sessionId: `S${i}`,
                subjectId: i % 2 === 0 ? 'SV001' : 'SV002',
                createdAt: new Date()
            }));
            const sortMock = globals_1.jest.fn().mockReturnValue(Promise.resolve(mockLargeHistory));
            ParkingSession_1.ParkingSession.find.mockReturnValue({ sort: sortMock });
            const res = await (0, supertest_1.default)(app).get('/api/payment/history/admin?startDate=2026-01-01&endDate=2026-01-31');
            (0, globals_1.expect)(res.status).toBe(200);
            (0, globals_1.expect)(res.body.success).toBe(true);
            (0, globals_1.expect)(res.body.data.length).toBe(76); // Verify it returns all 76 rows
            const findCallArgs = ParkingSession_1.ParkingSession.find.mock.calls[0][0];
            (0, globals_1.expect)(findCallArgs.createdAt.$gte).toBeDefined();
            (0, globals_1.expect)(findCallArgs.createdAt.$lte).toBeDefined();
            (0, globals_1.expect)(findCallArgs.subjectId).toBeUndefined(); // No subjectId was passed
        });
        (0, globals_1.it)('Should apply subjectId to the query if provided', async () => {
            const sortMock = globals_1.jest.fn().mockReturnValue(Promise.resolve([]));
            ParkingSession_1.ParkingSession.find.mockReturnValue({ sort: sortMock });
            const res = await (0, supertest_1.default)(app).get('/api/payment/history/admin?startDate=2026-01-01&endDate=2026-01-31&subjectId=SV001');
            (0, globals_1.expect)(res.status).toBe(200);
            const findCallArgs = ParkingSession_1.ParkingSession.find.mock.calls[0][0];
            (0, globals_1.expect)(findCallArgs.subjectId).toBe('SV001'); // Ensure it queried with the correct subjectId
        });
        (0, globals_1.it)('Should return 400 if startDate or endDate is missing', async () => {
            const res = await (0, supertest_1.default)(app).get('/api/payment/history/admin?startDate=2026-01-01');
            (0, globals_1.expect)(res.status).toBe(400);
            (0, globals_1.expect)(res.body.success).toBe(false);
        });
    });
    (0, globals_1.describe)('POST /api/payment/cycle', () => {
        (0, globals_1.it)('Should successfully initiate payment and return a mock link', async () => {
            const payload = {
                subjectId: 'SV001',
                startDate: '2026-04-01',
                endDate: '2026-04-30'
            };
            const mockSession1 = { fee: 2000, save: globals_1.jest.fn() };
            const mockSession2 = { fee: 3000, save: globals_1.jest.fn() };
            ParkingSession_1.ParkingSession.find.mockResolvedValue([mockSession1, mockSession2]);
            BillingService_1.BillingService.calculateCycleFee.mockReturnValue(5000);
            // Supertest gọi API POST và gửi kèm payload vào body
            const res = await (0, supertest_1.default)(app).post('/api/payment/cycle').send(payload);
            (0, globals_1.expect)(mockSession1.save).toHaveBeenCalled();
            (0, globals_1.expect)(mockSession2.save).toHaveBeenCalled();
            (0, globals_1.expect)(res.status).toBe(200);
            (0, globals_1.expect)(res.body.success).toBe(true);
            (0, globals_1.expect)(res.body.data.totalAmount).toBe(5000);
            (0, globals_1.expect)(res.body.data.status).toBe('PENDING');
        });
        (0, globals_1.it)('Should return a message if there are no sessions that require payment', async () => {
            const payload = {
                subjectId: 'SV001',
                startDate: '2026-04-01',
                endDate: '2026-04-30'
            };
            ParkingSession_1.ParkingSession.find.mockResolvedValue([]);
            const res = await (0, supertest_1.default)(app).post('/api/payment/cycle').send(payload);
            (0, globals_1.expect)(res.status).toBe(200);
            (0, globals_1.expect)(res.body.success).toBe(true);
            (0, globals_1.expect)(res.body.message).toBe('No fees need to be paid in this cycle');
        });
        (0, globals_1.it)('Should smoothly handle initiating payment for 50 parking sessions', async () => {
            const payload = {
                subjectId: 'SV_VIP_001',
                startDate: '2026-04-01',
                endDate: '2026-04-30'
            };
            let expectedTotalAmount = 0;
            const mockBulkSessions = Array.from({ length: 50 }, (_, i) => {
                const fee = Math.random() > 0.5 ? 3000 : 2000;
                expectedTotalAmount += fee;
                return {
                    sessionId: `SESSION_${i}`,
                    subjectId: 'SV_VIP_001',
                    fee: fee,
                    paymentStatus: 'UNPAID',
                    save: globals_1.jest.fn()
                };
            });
            ParkingSession_1.ParkingSession.find.mockResolvedValue(mockBulkSessions);
            BillingService_1.BillingService.calculateCycleFee.mockReturnValue(expectedTotalAmount);
            const res = await (0, supertest_1.default)(app).post('/api/payment/cycle').send(payload);
            console.warn(`\n💳 User: ${payload.subjectId} | Số lượt: 50 | Output API: ${res.body.data.totalAmount}đ | Kỳ vọng: ${expectedTotalAmount}đ`);
            mockBulkSessions.forEach(session => {
                (0, globals_1.expect)(session.save).toHaveBeenCalled();
                (0, globals_1.expect)(session.paymentStatus).toBe('PENDING');
                (0, globals_1.expect)(session.invoiceId).toContain('BKPAY_CYCLE_');
            });
            (0, globals_1.expect)(res.status).toBe(200);
            (0, globals_1.expect)(res.body.success).toBe(true);
            (0, globals_1.expect)(res.body.message).toBe('Created payment request for 50 parking sessions in the cycle');
            (0, globals_1.expect)(res.body.data.totalAmount).toBe(expectedTotalAmount);
        });
    });
});
