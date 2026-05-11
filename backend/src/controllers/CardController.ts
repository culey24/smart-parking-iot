import { Request, Response } from 'express';

export class CardController {
  
  // API: Tra cứu thẻ bằng biển số xe
  static async lookup(req: Request, res: Response) {
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
        message: "Card information lookup successful."
      });
    } catch (error: any) {
      throw error; // Ném lỗi cho errorHandler
    }
  }

  // API: Khóa thẻ khi bị mất (Phục vụ UC 1.6 & 1.7)
  static async disableCard(req: Request, res: Response) {
    try {
      const cardId = req.params.id;

      // TODO: Sau này sẽ tìm thẻ trong DB và cập nhật cardStatus thành 'DEACTIVATED'
      // VD: await TemporaryCard.updateOne({ cardId }, { cardStatus: 'DEACTIVATED' });

      res.json({ 
        success: true, 
        message: `Card with ID ${cardId} has been disabled successfully` 
      });
    } catch (error: any) {
      throw error;
    }
  }
}