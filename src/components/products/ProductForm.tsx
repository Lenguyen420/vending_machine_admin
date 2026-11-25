import { Button, Form } from 'antd'
import type { Product } from '../../types/product'
import { useAppStore } from '../../stores/useAppStore'
import { productImages } from '../../static/constants'
import { FormModal, NumberField, SelectField, SwitchField, TextField } from '../common/FormFields'
import { ProductImage } from '../common/ProductImage'
import { useAction } from '../common/ConfirmDialog'
const imageLabels = [
  'Lon đỏ',
  'Lon xanh',
  'Lon cam',
  'Chai xanh',
  'Gói bánh',
  'Gói snack',
  'Gói vàng',
  'Bánh mì',
  'Hộp sữa',
]
export function ProductForm({ product, onClose }: { product?: Product; onClose: () => void }) {
  const categories = useAppStore((s) => s.db.categories)
  const [form] = Form.useForm()
  const image = Form.useWatch('image', form)
  const { report } = useAction()
  const save = (values: Omit<Product, 'id'>) => {
    const actions = useAppStore.getState()
    if (report(product ? actions.updateProduct(product.id, values) : actions.createProduct(values))) onClose()
  }
  return (
    <FormModal title={product ? 'Sửa sản phẩm' : 'Thêm sản phẩm'} onClose={onClose}>
      <Form
        form={form}
        layout="vertical"
        initialValues={product ?? { active: true, image: 'cola', unit: 'Gói' }}
        onFinish={save}
      >
        <div className="form-grid">
          <TextField name="name" label="Tên sản phẩm" />
          <TextField name="sku" label="SKU" />
          <TextField name="barcode" label="Barcode" />
          <SelectField
            name="categoryId"
            label="Danh mục"
            options={categories
              .filter((c) => c.active || c.id === product?.categoryId)
              .map((c) => ({ value: c.id, label: c.name }))}
          />
          <NumberField name="cost" label="Giá nhập (VNĐ)" />
          <NumberField name="price" label="Giá bán mặc định (VNĐ)" />
          <TextField name="unit" label="Đơn vị" />
          <SelectField
            name="image"
            label="Ảnh minh họa"
            options={productImages.map((value, i) => ({ value, label: imageLabels[i] }))}
          />
          <SwitchField name="active" label="Đang bán" />
          <ProductImage image={image} />
        </div>
        <div className="form-submit">
          <Button onClick={onClose}>Hủy</Button>
          <Button type="primary" htmlType="submit">
            Lưu sản phẩm
          </Button>
        </div>
      </Form>
    </FormModal>
  )
}
