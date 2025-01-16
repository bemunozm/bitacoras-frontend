import { cn } from '@/lib/utils'
import React from 'react'

type ErrorMessageProps = {
  children: React.ReactNode,
  className?: string
}

export default function ErrorMessage({ children, className }: ErrorMessageProps) {
  return (
    <span className={cn("text-red-500 text-sm", className)}> {children} </span>
  )
}
