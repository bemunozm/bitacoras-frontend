
import { useTheme } from "@/components/theme-provider"
import { Outlet } from "react-router-dom"

export default function AppLayout() {

  const theme = useTheme()

  const dark = theme.theme === 'dark'

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10 dark:bg-sidebar-accent">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="https://fundaciontrabajaunap.cl" className="flex items-center gap-2 self-center font-medium">
          <img src={dark ? '/logo-dark.webp' : '/logo.png'} alt="Logo Fundacion Trabaja UNAP" /> 
        </a>
            <Outlet />
        </div>
    </div>
  )
}