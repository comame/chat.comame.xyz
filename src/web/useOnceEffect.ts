import { useRef, useEffect } from 'react'

export function useOnceEffect(effect: () => void) {
    const doneRef = useRef(false)
    useEffect(() => {
        if (doneRef.current) return
        doneRef.current = true
        effect()
    }, [])
}
