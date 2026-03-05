"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, UserRole } from '@/lib/store/auth-store'
import { Loader2 } from 'lucide-react'

export interface ProtectedRouteProps {
    children: React.ReactNode
    allowedRoles?: Array<UserRole>
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { isAuthenticated, user, sessionReady } = useAuthStore()
    const router = useRouter()

    useEffect(() => {
        if (!sessionReady) return

        if (process.env.NODE_ENV === 'development' && allowedRoles?.includes('admin')) {
            return
        }

        if (!isAuthenticated) {
            router.push('/login')
        } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
            // Redirect to their appropriate dashboard if they try to access a route they don't have permission for
            if (user.role === 'admin') router.push('/admin')
            else if (user.role === 'hospital') router.push('/hospital')
            else if (user.role === 'blood-bank') router.push('/blood-bank')
        }
    }, [isAuthenticated, user, router, allowedRoles, sessionReady])

    // Compute authorization state for rendering
    let isAuthorized = false
    if (sessionReady) {
        if (process.env.NODE_ENV === 'development' && allowedRoles?.includes('admin')) {
            isAuthorized = true
        } else if (isAuthenticated) {
            if (!allowedRoles || (user && allowedRoles.includes(user.role))) {
                isAuthorized = true
            }
        }
    }

    if (!isAuthorized) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-background z-40">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        )
    }

    return <>{children}</>
}
