"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, UserRole } from '@/lib/store/auth-store'
import { Loader2 } from 'lucide-react'

export interface ProtectedRouteProps {
    children: React.ReactNode
    allowedRoles?: Array<UserRole>
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { isAuthenticated, user } = useAuthStore()
    const router = useRouter()
    const [isAuthorized, setIsAuthorized] = useState(false)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
        } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
            // Redirect to their appropriate dashboard if they try to access a route they don't have permission for
            if (user.role === 'admin') router.push('/admin')
            else if (user.role === 'hospital') router.push('/hospital')
            else if (user.role === 'blood-bank') router.push('/blood-bank')
        } else {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsAuthorized(true)
        }
    }, [isAuthenticated, user, router, allowedRoles])

    if (!isAuthorized) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-background z-40">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        )
    }

    return <>{children}</>
}
