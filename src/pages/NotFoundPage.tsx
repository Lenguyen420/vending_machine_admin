import { LinkButton } from '../components/common/LinkButton'
import { Result } from 'antd'
export default function NotFoundPage() {
  return (
    <section className="panel empty-page">
      <Result
        status="404"
        title="Không tìm thấy trang"
        subTitle="Đường dẫn hoặc dữ liệu bạn cần tra cứu không còn khả dụng."
        extra={
          <LinkButton to="/" type="primary">
            Về bảng điều khiển
          </LinkButton>
        }
      />
    </section>
  )
}
