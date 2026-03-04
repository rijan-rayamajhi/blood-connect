"use client"

import React from 'react'
import { usePathname } from 'next/navigation'
import { AuthGate } from '@/components/auth/auth-gate'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { UserRole } from '@/lib/store/auth-store'

export function DashboardGuard({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    let allowedRoles: UserRole[] = []

    if (pathname.startsWith('/admin')) {
        allowedRoles = ['admin']
    } else if (pathname.startsWith('/blood-bank')) {
        allowedRoles = ['blood-bank']
    } else if (pathname.startsWith('/hospital')) {
        allowedRoles = ['hospital']
    }

    return (
        <AuthGate>
            <ProtectedRoute allowedRoles={allowedRoles}>
                {children}
            </ProtectedRoute>
        </AuthGate>
    )
}
