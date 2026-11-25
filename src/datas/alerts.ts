import type { TicketInput } from '../services/alertService'
export const ticketSeeds: Omit<TicketInput, 'machineId'>[] = [
  {
    description: 'Kiểm tra kết nối mạng tại điểm đặt máy.',
    assignee: 'Kỹ thuật viên An',
    priority: 'HIGH',
    status: 'OPEN',
  },
  {
    description: 'Bảo trì định kỳ và vệ sinh khay xuất hàng.',
    assignee: 'Kỹ thuật viên Bình',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
  },
  {
    description: 'Kiểm tra khe đọc thẻ nội bộ.',
    assignee: 'Kỹ thuật viên Chi',
    priority: 'LOW',
    status: 'DONE',
  },
  {
    description: 'Căn chỉnh đường xoắn ô bán đồ uống.',
    assignee: 'Kỹ thuật viên Dũng',
    priority: 'MEDIUM',
    status: 'DONE',
  },
]
