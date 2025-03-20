
import * as React from "react"
import { useToast as useToastUI } from "@/components/ui/toast"

export { type ToastProps, type ToastActionElement } from "@/components/ui/toast"

export const useToast = useToastUI

// In addition to useToast, we also export a toast method for more convenience
export const toast = useToastUI().toast
