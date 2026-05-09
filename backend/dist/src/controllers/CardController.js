"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardController = void 0;
// Sau này bạn có thể import thêm model User hoặc TemporaryCard ở đây 
class CardController {
    // API: Tra cứu thẻ bằng biển số xe
    static async lookup(req, res) {
        try {
            const { plate } = req.query;
            // TODO: Sau này có Database thực tế sẽ dùng lệnh find() để tìm thẻ đang khớp với biển số này
            // Hiện tại tạm thời giữ mock data để Frontend có cái gọi thử
            res.json({
                success: true,
                data: {
                    cardId: 1001,
                    plateNumber: plate,
                    status: 'ACTIVE'
                },
                message: "Tra cứu thông tin thẻ thành công"
            });
        }
        catch (error) {
            throw error; // Ném lỗi cho errorHandler
        }
    }
    // API: Khóa thẻ khi bị mất (Phục vụ UC 1.6 & 1.7)
    static async disableCard(req, res) {
        try {
            const cardId = req.params.id;
            // TODO: Sau này sẽ tìm thẻ trong DB và cập nhật cardStatus thành 'DEACTIVATED'
            // VD: await TemporaryCard.updateOne({ cardId }, { cardStatus: 'DEACTIVATED' });
            res.json({
                success: true,
                message: `Thẻ có mã ${cardId} đã được vô hiệu hóa thành công`
            });
        }
        catch (error) {
            throw error;
        }
    }
}
exports.CardController = CardController;
