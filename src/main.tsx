import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App as AntApp, ConfigProvider } from 'antd'
import { BrowserRouter } from 'react-router-dom'
import { locale, theme } from './app.ts'
import App from './App.tsx'
document.title = import.meta.env.VITE_APP_NAME || 'Vending Admin'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider locale={locale} theme={theme}>
      <AntApp>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  </StrictMode>,
)
