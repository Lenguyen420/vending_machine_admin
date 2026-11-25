export function usePagination() {
  return {
    defaultPageSize: 10,
    showSizeChanger: true,
    pageSizeOptions: [10, 20, 50],
    showTotal: (total: number) => total + ' kết quả',
  }
}
