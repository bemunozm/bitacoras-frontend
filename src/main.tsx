import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Router from './router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './components/theme-provider'
import { Toaster } from './components/ui/toaster'
import { BreadcrumbProvider } from './contexts/BreadcrumbContext'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme='light' storageKey='vite-ui-theme'>
        <BreadcrumbProvider>
          <Router />
          <Toaster/>
        </BreadcrumbProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
