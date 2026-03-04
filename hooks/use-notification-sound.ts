"use client"

import { useEffect, useRef } from 'react'

export function useNotificationSound(shouldPlay: boolean) {
    const audioRef = useRef<HTMLAudioElement | null>(null)

    useEffect(() => {
        // Initialize audio only on client side
        if (typeof window !== 'undefined' && !audioRef.current) {
            audioRef.current = new Audio('/sounds/sos.mp3')
            audioRef.current.loop = true
        }

        const audio = audioRef.current

        if (!audio) return

        if (shouldPlay) {
            // Browsers often block autoplay without user interaction.
            // A catch block is necessary so the app doesn't crash if interrupted.
            audio.play().catch((error) => {
                console.warn('Audio playback prevented by browser policy:', error)
            })
        } else {
            audio.pause()
            audio.currentTime = 0
        }

        return () => {
            audio.pause()
        }
    }, [shouldPlay])

    return null
}
