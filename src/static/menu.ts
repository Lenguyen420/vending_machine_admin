import {
  AppstoreOutlined,
  BarChartOutlined,
  BellOutlined,
  CreditCardOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  SettingOutlined,
  SwapOutlined,
  TeamOutlined,
  ToolOutlined,
} from '@ant-design/icons'
export const groups = [
  { label: 'Tổng quan', items: [{ path: '/', label: 'Bảng điều khiển', icon: DashboardOutlined }] },
  {
    label: 'Vận hành',
    items: [
      { path: '/machines', label: 'Máy bán hàng', icon: AppstoreOutlined },
      { path: '/products', label: 'Sản phẩm', icon: DatabaseOutlined },
      { path: '/inventory', label: 'Kho hàng', icon: DatabaseOutlined },
    ],
  },
  {
    label: 'Kinh doanh',
    items: [
      { path: '/transactions', label: 'Giao dịch', icon: SwapOutlined },
      { path: '/cards', label: 'Thẻ & ví', icon: CreditCardOutlined },
      { path: '/customers', label: 'Khách hàng', icon: TeamOutlined },
      { path: '/reports', label: 'Báo cáo', icon: BarChartOutlined },
    ],
  },
  {
    label: 'Hệ thống',
    items: [
      { path: '/alerts', label: 'Cảnh báo', icon: BellOutlined },
      // { path: '/maintenance', label: 'Bảo trì', icon: ToolOutlined },
      // { path: '/settings', label: 'Cài đặt', icon: SettingOutlined },
    ],
  },
]
export const pageLabels: Record<string, string> = {
  new: 'Thêm máy',
  edit: 'Chỉnh sửa',
  simulator: 'Mô phỏng mua hàng',
  categories: 'Danh mục',
  restock: 'Thao tác tồn kho',
  history: 'Lịch sử kho',
  'top-ups': 'Lịch sử nạp tiền',
}
