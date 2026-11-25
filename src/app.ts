import viVN from 'antd/locale/vi_VN'
import type { ThemeConfig } from 'antd'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'
import './css/variables.css'
import './css/global.css'
import './css/layout.css'
import './css/machines.css'
import './css/responsive.css'
dayjs.locale('vi')
export const locale = viVN
export const theme: ThemeConfig = {
  token: {
    colorPrimary: '#2563eb',
    colorText: '#17243a',
    colorTextSecondary: '#607086',
    colorTextPlaceholder: '#64748b',
    colorBorder: '#e1e7ef',
    fontFamily: 'Inter, system-ui, "Segoe UI", sans-serif',
    borderRadius: 8,
    controlHeight: 36,
  },
  components: {
    Table: { headerBg: '#f5f7fb', headerColor: '#435573', cellPaddingBlock: 11 },
    Button: { fontWeight: 600 },
    Card: { headerFontSize: 16 },
  },
}
