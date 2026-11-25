# Vending Machine Admin

Ứng dụng React + TypeScript chạy trên Vite để vận hành dữ liệu mô phỏng của nhiều máy bán hàng. Dữ liệu mẫu, nghiệp vụ và giao diện chạy trong trình duyệt.

## Chạy cục bộ

Dùng Node.js 22.12 trở lên hoặc Node.js 20.19 thuộc nhánh 20.x.

```sh
npm install
npm run dev
npm run test
npm run lint
npm run type-check
npm run build
```

Vite in địa chỉ xem trước trong terminal. Bản production nằm trong `dist/`. Dùng `npm run preview` để kiểm tra bản build.

## Thử một giao dịch

1. Mở **Thẻ & ví**, tìm thẻ mẫu **CARD000028** của Nguyễn Văn A. Ví ban đầu có **150.000 ₫**.
2. Trong **Máy bán hàng**, mở **VM001**. Tab **Kệ sản phẩm** cho thấy ô **A01** chứa Coca Cola 330ml, giá **12.000 ₫** và tồn **8/10**.
3. Chọn **Mô phỏng mua hàng**, ô A01, phương thức thẻ nội bộ và CARD000028. Kịch bản thành công giảm tồn xuống 7/10 và số dư xuống 138.000 ₫.
4. Mở chi tiết đơn và hoàn tiền. Ví trở về 150.000 ₫. Kho ghi nhận một sản phẩm đã xuất.
5. Dùng **Kho hàng → Thao tác tồn kho** để lập phiếu tiếp hàng. Báo cáo doanh thu thuần ghi nhận tiền hoàn theo ngày bán và tab **Hoàn tiền** tra cứu theo ngày hoàn.

## Cấu trúc và lưu trữ

- `src/pages` chứa màn hình theo route. `src/components` chứa layout, thành phần dùng chung và thành phần theo nghiệp vụ.
- `src/datas` tạo dữ liệu demo qua các nghiệp vụ trong `src/services`. Các loại dữ liệu, route, bộ lọc và tiện ích nằm trong `types`, `static`, `hooks`, `utils`.
- `src/stores` chứa store Zustand và selector. Dữ liệu demo được lưu theo phiên bản tại khóa LocalStorage `vending-admin-demo-v1`. Đơn mua và ví là dữ liệu giả lập cục bộ; không có đồng bộ giữa các trình duyệt.
- Để khôi phục bộ mẫu, mở **Cài đặt → Đặt lại dữ liệu** và xác nhận. Thao tác thay toàn bộ dữ liệu demo của trình duyệt hiện tại.

## Triển khai Vercel

Chọn thư mục `vending-machine-admin` làm Root Directory của dự án Vercel, chọn framework preset **Vite**, build command `npm run build` và thư mục output `dist`. `vercel.json` đã khai báo SPA rewrite để tải trực tiếp các đường dẫn như `/machines/...`. Biến `VITE_APP_NAME` là tùy chọn, xem `.env.example`.
