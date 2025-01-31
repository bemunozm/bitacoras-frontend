
import { createContext, ReactNode, useContext, useState } from "react"

export interface BreadcrumbItemType {
  label: string
  to?: string
}

interface BreadcrumbContextProps {
  breadcrumbItems: BreadcrumbItemType[]
  setBreadcrumbItems: (items: BreadcrumbItemType[]) => void
}

const BreadcrumbContext = createContext<BreadcrumbContextProps>({
  breadcrumbItems: [],
  setBreadcrumbItems: () => {}
})

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [breadcrumbItems, setBreadcrumbItems] = useState<BreadcrumbItemType[]>([])

  return (
    <BreadcrumbContext.Provider value={{ breadcrumbItems, setBreadcrumbItems }}>
      {children}
    </BreadcrumbContext.Provider>
  )
}

export function useBreadcrumb() {
  return useContext(BreadcrumbContext)
}