# SkillLink Phú Quốc — frontend demo

React + Vite. Website khách được giữ nguyên; quản trị dùng chung dữ liệu đơn, phòng và hồ sơ khách. Không có backend, database, xác thực hoặc thanh toán thật. Dữ liệu chỉ ở trong bộ nhớ phiên, tải lại trang sẽ khôi phục dữ liệu mẫu. Chỉ dùng thông tin giả định khi trình diễn.

## Chạy dự án

```powershell
npm.cmd install
npm.cmd run dev
```

Mở địa chỉ Vite hiển thị, thường là `http://localhost:5173`. Nhấn **Đăng nhập quản trị → Vào quản trị demo**, không cần tài khoản. Nếu cổng đang được dùng, Vite hiển thị cổng khác.

## Quản trị mới

- **Hôm nay**: công việc theo ngày Việt Nam; bốn thẻ bấm được và danh sách yêu cầu mới, khách đến, khách trả, phòng đang dọn. Cảnh báo quá ngày đến/trả tách riêng; không tự nhận hoặc trả phòng.
- **Đặt phòng**: các tab Chờ duyệt, Đã xác nhận, Đang ở, Đã trả phòng, Đã từ chối, Tất cả; tìm mã/tên/điện thoại, lọc theo Ngày nhận phòng. Xác nhận xong giữ tab/bộ lọc; có thông báo mở lại đơn hoặc chuyển tab Đã xác nhận.
- **Sơ đồ phòng**: ô gọn theo khu/tầng, tình trạng hôm nay tách khỏi lịch tương lai. Phòng trống có lịch tuần sau vẫn Trống, sẵn sàng. Bấm ô mở panel bên phải; mobile toàn màn hình. Escape/Đóng về danh sách, giữ vị trí. Lịch đặt và tìm phòng theo ngày nằm riêng.
- **Khách hàng**: một dòng mỗi hồ sơ, kể cả khách chưa ở. Số lần chỉ tính Đang ở và Đã trả phòng. Có tìm kiếm, bộ lọc trạng thái, khách quay lại và khoảng ngày thực tế; giấy tờ được che mặc định; lịch sử mở được từng đơn.
- **Cài đặt**: nhóm Thông tin chung, Liên hệ, Giờ nhận/trả, Mạng xã hội. Nút Lưu thay đổi chỉ cập nhật phiên demo.

Bộ lọc giữ riêng theo trang. Nút Trở lại website và Khôi phục dữ liệu demo ở menu quản trị.

## Luồng xử lý chung

Tất cả thao tác từ Hôm nay, Đặt phòng và Sơ đồ phòng dùng `src/admin/model.js`:

1. Chờ duyệt chưa giữ phòng. Xác nhận kiểm tra lại phòng và lịch `[nhận, trả)`. Ngày trả có thể là ngày khách khác nhận.

   Ngoại lệ khi **đã đến hoặc quá ngày trả dự kiến mà vẫn Đang ở**: không tự giải phóng phòng. Tìm phòng công khai, tìm theo ngày trong quản trị và xác nhận đơn đều loại phòng này, kể cả lịch tương lai chưa chắc chắn. Giao diện khách báo cần liên hệ kiểm tra, không tiết lộ khách/phòng cụ thể; quản trị chỉ rõ phòng cần xử lý. Sau khi xác nhận trả phòng và dọn xong, phòng dùng lại bình thường trong cùng ngày. Hồi quy bao gồm A201 quá hạn và A101 đến ngày trả nhưng chưa trả.
2. Nhận phòng yêu cầu đơn đã xác nhận, đến ngày nhận, còn lịch hợp lệ và phòng Trống, sẵn sàng. Không nhận vào phòng đang có khách/đang dọn/bảo trì. Đơn đã quá cả ngày trả cần kiểm tra lại lịch trước khi nhận trực tiếp với lịch mới.
3. Nhận khách trực tiếp: chọn ngày trả, số khách, hạng/phòng; nhập mới hoặc tìm/chọn khách cũ theo tên/điện thoại. Email và giấy tờ không bắt buộc. Không tự gộp theo email; trùng điện thoại nhưng khác tên yêu cầu chọn đúng hồ sơ hoặc kiểm tra số.
4. Giữ `actualArrival`, `actualArrivalTime`, `actualDeparture`, `actualDepartureTime`, số đêm thực tế, ghi chú và thời điểm xác nhận. Giữ riêng lịch dự kiến. Ngày trả thay đổi cần lý do; không cho giờ trả trước nhận hoặc sau hiện tại.
5. Trả phòng → Đang dọn → Đã dọn xong → Trống, sẵn sàng. Bảo trì/kết thúc bảo trì có xác nhận. Không có select biến phòng đang có khách thành trống.
6. Kiểm tra trạng thái mới nhất và token nhận trực tiếp để ngăn thao tác lặp tạo bản ghi trùng.

Mẫu có 15 hồ sơ, khách quay lại, chờ duyệt, đã từ chối, đến/trả hôm nay, quá ngày, tương lai, dọn và bảo trì. Ngày tương đối theo `Asia/Ho_Chi_Minh`. Hồ sơ và các lần ở tách biệt; giữ lịch sử cũ.

## Excel

**Khách hàng → Xuất Excel** cho chọn:

- **Hồ sơ khách hàng**: một dòng mỗi khách, kể cả chưa từng nhận phòng.
- **Lịch sử lưu trú**: một dòng mỗi lần thực sự Đang ở hoặc Đã trả phòng; có ngày giờ thực tế, lịch dự kiến và ghi chú trả phòng.
- **Theo bộ lọc hiện tại của Khách hàng** hoặc **Toàn bộ dữ liệu của loại đã chọn**. Lịch sử theo bộ lọc cũng áp dụng khoảng ngày lưu trú; xuất toàn bộ bỏ qua mọi bộ lọc.

File `.xlsx` thật bằng ExcelJS, có cột tiếng Việt, độ rộng, dòng tiêu đề cố định, ngày trong tên file; giấy tờ luôn che. Không có dữ liệu thì thông báo, không tải file rỗng.

## Vị trí thay nội dung

- `src/data.js`: tên, địa chỉ, hotline, Zalo, email, giờ nhận/trả, mạng xã hội, ảnh/hạng phòng và dữ liệu ban đầu.
- `src/main.jsx`: giao diện khách và logo chữ; không thay giao diện khách trong đợt nâng cấp này.
- `src/admin/Admin.jsx`: năm màn hình, bộ lọc riêng, điều phối panel và Excel.
- `src/admin/Dialogs.jsx`: chi tiết đơn/phòng/khách và form nhận khách dùng chung.
- `src/admin/model.js`: kiểm tra lịch, chuyển trạng thái, đếm lần ở, hồ sơ khách và phạm vi xuất.
- `src/admin/admin.css`: CSS giới hạn trong quản trị, không đổi website khách.
- `src/CheckoutDetail.jsx`: ngày giờ trả thực tế và đối chiếu lịch ban đầu.
- `public/images/`: ảnh minh họa cục bộ, hero và logo Zalo. `public/fallback.svg`: dự phòng ảnh lỗi.

Số `0000000000` là minh họa; email/mạng xã hội dùng `.example`. Ảnh Unsplash minh họa, không phải một khách sạn SkillLink có thật. Font Google cần Internet, lỗi sẽ dùng Arial/Georgia. Gói ExcelJS tải riêng khi xuất.

## Kiểm tra

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run test:e2e
```

E2E cần dev server đang chạy. Mặc định dùng Edge trên Windows trong `playwright.config.js`. Nếu dev dùng cổng khác:

```powershell
$env:PLAYWRIGHT_BASE_URL='http://localhost:5174'
npm.cmd run test:e2e
```

Kiểm tra đơn vị: trùng lịch/ngày liền kề; nhận/trả và giờ thực tế; dọn/bảo trì; khách cũ và không gộp email thiếu; đếm lần ở; token thao tác; nhóm việc đúng ngày; phạm vi Excel. E2E: duyệt/tìm lại đơn, website khách sang quản trị, nhận/trả/dọn, khách cũ, đọc lại file Excel, panel/focus/Escape, bộ lọc độc lập, desktop/mobile. Ảnh QA ở `test-results/`.

Build còn cảnh báo kích thước gói ExcelJS. Dependency gián tiếp ExcelJS có cảnh báo npm audit mức vừa được ghi nhận từ trước; demo chỉ tạo file, không nhận file người dùng. Rà soát dependency trước khi triển khai thật. Chưa kiểm tra Safari, Firefox hoặc điện thoại vật lý.

## Checklist tự test

- [ ] Duyệt yêu cầu, giữ tab/bộ lọc; mở lại từ thông báo hoặc tab Đã xác nhận.
- [ ] Nhận phòng từ đơn hôm nay; thử đơn tương lai để thấy lý do chưa nhận được.
- [ ] Nhận khách trực tiếp: chọn ngày/số khách/phòng, tìm khách cũ hoặc nhập mới; thử để trống email.
- [ ] Trả phòng: kiểm tra ngày giờ và lý do → Đang dọn → Đã dọn xong → Trống, sẵn sàng.
- [ ] Xem B501 trống hôm nay nhưng có lịch tương lai; mở panel/lịch, tìm ngày liền sau ngày trả của khách cũ.
- [ ] Tìm KH001/KH002/KH003, xem nhiều lần đã ở, giấy tờ được che và mở từng đơn.
- [ ] Xuất Hồ sơ/Lịch sử theo bộ lọc và toàn bộ; kiểm tra số dòng, giờ, giấy tờ che; thử không có dữ liệu.
- [ ] Trên điện thoại: năm menu, bảng cuộn trong khung, panel toàn màn hình, nút Đóng/Trở lại và các thao tác.
