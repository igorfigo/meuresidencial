
import * as React from "react"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth < MOBILE_BREAKPOINT : false
  )

  React.useEffect(() => {
    if (typeof window === "undefined") return

    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    window.addEventListener("resize", checkMobile)
    checkMobile() // Check on initial mount

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return isMobile
}

export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean>(
    typeof window !== "undefined" 
      ? window.innerWidth >= MOBILE_BREAKPOINT && window.innerWidth < TABLET_BREAKPOINT 
      : false
  )

  React.useEffect(() => {
    if (typeof window === "undefined") return

    const checkTablet = () => {
      setIsTablet(
        window.innerWidth >= MOBILE_BREAKPOINT && window.innerWidth < TABLET_BREAKPOINT
      )
    }

    window.addEventListener("resize", checkTablet)
    checkTablet() // Check on initial mount

    return () => window.removeEventListener("resize", checkTablet)
  }, [])

  return isTablet
}

export function useIsMobileOrTablet() {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  return isMobile || isTablet
}

export function useScreenSize() {
  const [windowSize, setWindowSize] = React.useState<{
    width: number;
    height: number;
  }>({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  })

  React.useEffect(() => {
    if (typeof window === "undefined") return

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener("resize", handleResize)
    handleResize() // Check on initial mount

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return {
    width: windowSize.width,
    height: windowSize.height,
    isMobile: windowSize.width < MOBILE_BREAKPOINT,
    isTablet: windowSize.width >= MOBILE_BREAKPOINT && windowSize.width < TABLET_BREAKPOINT,
    isDesktop: windowSize.width >= TABLET_BREAKPOINT,
  }
}
