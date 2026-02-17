"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'

interface ProtectedRouteProps {
    children: React.ReactNode
    allowedRoles?: string[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { isAuthenticated, user } = useAuthStore()
    const router = useRouter()

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
        } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
            // Redirect to their appropriate dashboard if they try to access a route they don't have permission for
            // This is a basic check, can be expanded
            if (user.role === 'admin') router.push('/admin')
            else if (user.role === 'hospital') router.push('/hospital')
            else if (user.role === 'blood-bank') router.push('/blood-bank')
        }
    }, [isAuthenticated, user, router, allowedRoles])

    if (!isAuthenticated) {
        return null // or a loading spinner
    }

    // Double check role access for rendering prevention
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return null
    }

    return <>{children}</>
}
