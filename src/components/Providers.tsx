"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
// import { Toaster } from "react-hot-toast"
import { Toaster } from "@/components/ui/toaster"
import { SessionProvider } from 'next-auth/react'

export default function Providers({ children }: { children: React.ReactNode }) {
    const queryClient = new QueryClient()
    return (
        <QueryClientProvider client={queryClient}>
            <Toaster />
            <SessionProvider>
                {children}
            </SessionProvider>
        </QueryClientProvider>
    )
}
