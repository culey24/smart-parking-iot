# Utils Module (`src/utils/`)

## 1. Vai trò (Purpose)
Chứa các hàm tiện ích nhỏ (utility functions) dùng chung cho toàn bộ dự án mà không dính tới database logic hay http request.

## 2. Danh sách các file

- **`seed.ts`** *(Task 1)*: Script dùng để xóa toàn bộ Database và nạp lại dữ liệu giả lập (Mock Data) như danh sách User, Zone, PricingPolicy để team có dữ liệu test. Chạy bằng lệnh `npm run seed` hoặc `make seed`.
- Các file có thể thêm vào: `formatDate.ts`, `generateInvoiceId.ts`, v.v.
