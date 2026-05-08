# Tài liệu Kỹ thuật: Task 4 - Thanh toán & Tính phí (Payment & Billing)

## 1. Giới thiệu (Overview)
Task 4 đóng vai trò cốt lõi trong hệ thống Smart Parking IoT, chịu trách nhiệm xử lý quy trình tính phí và thanh toán của người dùng. Hệ thống tự động tính toán chi phí dựa trên thời điểm lấy xe, tổng hợp công nợ theo chu kỳ và tích hợp với cổng thanh toán (BKPay) để xử lý các giao dịch. Module này đảm bảo tính minh bạch, chính xác trong việc thu phí và cung cấp trải nghiệm thanh toán liền mạch cho sinh viên/cán bộ.

> **Lưu ý:**
> Phí gửi xe áp dụng chính sách giá dựa vào **thời điểm lấy xe (endTime)** để xác định mức phí áp dụng.

## 2. Chi tiết các thành phần (Component Details)

### 2.1. `BillingService`
Dịch vụ xử lý các logic tính toán tiền nong cốt lõi của hệ thống.

*   **`calculateFee(endTime, vehicleType)`**: Hàm tính phí ngay tại thời điểm người dùng lấy xe ra khỏi bãi. 
    *   **Logic tính phí thực tế:**
        *   Nếu thời điểm lấy xe (`endTime`) rơi vào **Chủ Nhật** hoặc **từ 18:00 trở đi** (các ngày Thứ 2 - Thứ 7), hệ thống sẽ áp dụng mức giá đêm/Chủ Nhật (`nightOrSundayRate`).
        *   Các trường hợp còn lại (Thứ 2 - Thứ 7, lấy xe trước 18:00), hệ thống sẽ áp dụng mức giá ban ngày (`dayRate`).
*   **`calculateCycleFee(sessions)`**: Hàm tiện ích giúp cộng dồn (accumulate) tổng số tiền của một danh sách các phiên đỗ xe chưa thanh toán trong một chu kỳ, sử dụng `Array.reduce`.

### 2.2. `PaymentController`
Controller xử lý các HTTP request liên quan đến thanh toán và công nợ.

*   **API Xem tổng nợ (`getDebt`)**: Nhận `subjectId` và truy vấn tất cả các phiên đỗ xe có trạng thái `COMPLETED` nhưng `paymentStatus` là `UNPAID`. Trả về tổng số tiền đang nợ và số lượng phiên chưa thanh toán.
*   **API Xem lịch sử (`getHistory`)**: Cho phép người dùng xem lại lịch sử gửi xe của mình. Mặc định trả về dữ liệu trong 30 ngày gần nhất, có thể tùy chỉnh thông qua biến môi trường `HISTORY_VIEW_DAYS_LIMIT`.
*   **API Xem lịch sử cho Admin (`getHistoryAdmin`)**: Cho phép Admin kiểm tra lịch sử gửi xe theo khoảng thời gian tùy chọn (`startDate`, `endDate`) và có thể lọc thêm theo mã người dùng (`subjectId`).
*   **API Khởi tạo thanh toán chu kỳ (`initiateCyclePayment`)**: 
    *   Nhận yêu cầu thanh toán cho một khoảng thời gian (startDate đến endDate).
    *   Tìm các phiên `UNPAID` trong chu kỳ, tính toán tổng tiền bằng `BillingService.calculateCycleFee`.
    *   Cập nhật trạng thái các phiên này sang `PENDING` và gán một mã hóa đơn chung (`invoiceId`) để theo dõi.
    *   Trả về URL thanh toán tích hợp với hệ thống giả lập BKPay.

### 2.3. Models (`ParkingSession` & `PricingPolicy`)
*   **`ParkingSession` (Phiên đỗ xe)**: Đóng vai trò là trung tâm lưu trữ thông tin tính phí cho mỗi lượt gửi. Chứa các trường quan trọng:
    *   `fee`: Số tiền phí của phiên đỗ xe (được tính toán khi lấy xe).
    *   `paymentStatus`: Trạng thái thanh toán, thay đổi từ `UNPAID` (chưa trả) -> `PENDING` (đang chờ thanh toán qua cổng) -> `PAID` (đã thanh toán thành công).
    *   `invoiceId`: Mã giao dịch liên kết với cổng thanh toán để xác nhận hàng loạt khi có callback thành công.
*   **`PricingPolicy` (Chính sách giá)**: Lưu trữ các mức giá `dayRate` và `nightOrSundayRate` cho từng loại xe (ví dụ: MOTORBIKE). `BillingService` sẽ query chính sách `ACTIVE` để áp dụng.

## 3. Hướng dẫn Kiểm thử (Testing Guide)

Hệ thống được kiểm thử tự động một cách nghiêm ngặt để đảm bảo độ chính xác về tiền bạc.

### 3.1. Công cụ sử dụng
*   **Jest & ts-jest**: Framework kiểm thử chính và trình biên dịch TypeScript cho Jest.
*   **Supertest**: Thư viện đặc biệt quan trọng giúp giả lập các HTTP request tới Controller mà không cần mở một server Node.js thực thụ, giúp các bài test chạy nhanh và độc lập.

### 3.2. Các Test Case Tiêu biểu

*   **Unit Test (`BillingService.test.ts`)**:
    *   **Hàm `calculateFee`**:
        *   Đảm bảo trả về mức phí đêm/Chủ Nhật (`nightOrSundayRate`) nếu lấy xe vào ngày Chủ nhật (bất kể khung giờ).
        *   Đảm bảo trả về mức phí đêm/Chủ Nhật (`nightOrSundayRate`) nếu lấy xe từ 18:00 trở đi (Thứ 2 - Thứ 7).
        *   Đảm bảo trả về mức phí ban ngày (`dayRate`) nếu lấy xe trước 18:00 (Thứ 2 - Thứ 7).
        *   Bắt lỗi ngoại lệ (throw error) nếu không tìm thấy chính sách giá (`PricingPolicy`) nào đang `ACTIVE`.
    *   **Hàm `calculateCycleFee`**:
        *   Kiểm tra tính chính xác khi cộng dồn tổng phí cho lượng lớn dữ liệu (giả lập 100 user, mỗi user có 30-35 phiên gửi xe).
        *   Xử lý an toàn các trường hợp mảng truyền vào bị thiếu thuộc tính `fee` (tự động coi là 0đ) hoặc mảng rỗng (trả về 0).

*   **Integration Test (`PaymentController.test.ts`)**: Sử dụng `Supertest` để gửi các request GET/POST giả lập và kiểm tra response HTTP.
    *   **API `getDebt`**:
        *   Đảm bảo trả về đúng tổng nợ và số lượng phiên chưa thanh toán khi có `subjectId`.
        *   Báo lỗi 400 nếu thiếu tham số `subjectId` bắt buộc.
    *   **API `getHistory`**:
        *   Kiểm tra giới hạn số ngày xem lịch sử hoạt động chính xác theo mặc định (30 ngày) và theo biến môi trường `HISTORY_VIEW_DAYS_LIMIT`.
        *   Kiểm tra khả năng bắt lỗi 500 khi Database gặp sự cố.
    *   **API `getHistoryAdmin`**: 
        *   Kiểm tra khả năng truy xuất toàn bộ dữ liệu lịch sử trong một khoảng thời gian (giả lập 76 bản ghi).
        *   Áp dụng chính xác bộ lọc `subjectId` khi Admin truyền vào query.
        *   Báo lỗi 400 nếu thiếu `startDate` hoặc `endDate`.
    *   **API `initiateCyclePayment` (bao gồm Stress Test / Bulk Test)**:
        *   Kiểm tra luồng khởi tạo thanh toán thành công, cập nhật trạng thái các phiên sang `PENDING` và sinh link thanh toán ảo.
        *   Trả về thông báo hợp lệ khi khoảng thời gian chu kỳ không có phiên đỗ xe nào cần thanh toán.
        *   **Kiểm tra xử lý hàng loạt (Bulk Update)**: Giả lập một User thanh toán cùng lúc **50 lượt đỗ xe** chưa thanh toán. Test case chứng minh vòng lặp cập nhật trạng thái đồng loạt, gán chung một `invoiceId` và tính tổng tiền hoạt động cực kỳ mượt mà, tính toán chính xác.

### 3.3. Lệnh Thực thi
Để chạy các bộ kiểm thử và kiểm tra chất lượng code:
*   Chạy tất cả các bài test:
    ```bash
    cd backend
    npm test
    ```
*   Chạy test và xuất báo cáo độ phủ code (Coverage Report):
    ```bash
    npm run test:cov
    ```
