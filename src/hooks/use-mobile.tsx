
import * as React from "react"

const MOBILE_BREAKPOINT = 768

/**
 * Hook to detect if the current device is mobile based on screen width
 * @returns boolean indicating if the device is mobile
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Initial check for mobile status
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Set up event listener for resize events
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Modern browsers use addEventListener
    mql.addEventListener("change", checkMobile)
    
    // Initial check
    checkMobile()
    
    // Cleanup event listener when component unmounts
    return () => mql.removeEventListener("change", checkMobile)
  }, [])

  // Ensure we always return a boolean, even before the effect runs
  return !!isMobile
}
