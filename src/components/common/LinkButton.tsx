import { Button } from 'antd'
import type { ButtonProps } from 'antd'
import { useHref, useLinkClickHandler } from 'react-router-dom'
export function LinkButton({ to, ...props }: Omit<ButtonProps, 'href' | 'onClick'> & { to: string }) {
  const href = useHref(to)
  const navigate = useLinkClickHandler<HTMLAnchorElement>(to)
  return (
    <Button
      {...props}
      href={href}
      onClick={(event) => navigate(event as React.MouseEvent<HTMLAnchorElement>)}
    />
  )
}
