const images = import.meta.glob<string>('../../assets/images/*.svg', { eager: true, import: 'default' })
export function ProductImage({ image = 'water' }: { image?: string }) {
  return (
    <img
      className="product-thumb"
      alt=""
      src={images['../../assets/images/' + image + '.svg'] ?? images['../../assets/images/water.svg']}
    />
  )
}
