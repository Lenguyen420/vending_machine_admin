import { App } from 'antd'
import type { Result } from '../../types/common'
export function useAction() {
  const { message, modal } = App.useApp()
  const report = <T,>(result: Result<T>, success = 'Đã lưu thay đổi') => {
    if (!result.ok) {
      void message.error(result.message)
      return undefined
    }
    if (success) void message.success(success)
    return result.data
  }
  const confirm = (
    title: string,
    description: string,
    action: () => Result<unknown>,
    success?: string,
    onError?: (message: string) => void,
  ) => {
    modal.confirm({
      title,
      content: description,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: () => {
        const result = action()
        report(result, success)
        if (!result.ok) onError?.(result.message)
      },
    })
  }
  return { report, confirm }
}
