"use client"

import React, { useState } from 'react'
import { Button } from './ui/Button'
import { cn } from '@/lib/utils'
import { signIn } from "next-auth/react"
import { Icons } from './Icons'
import toast from 'react-hot-toast';

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> { }

export default function UserAuthForm({ className, ...props }: UserAuthFormProps) {

    const [isLoading, setIsLoading] = useState(false)

    const loginWithGoogle = async () => {
        setIsLoading(true)
        try {
            await signIn("google")
        } catch (error) {
            toast.error("There was a problem")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={cn("flex justify-center", className)} {...props}>
            <Button onClick={loginWithGoogle} isLoading={isLoading} size="sm" className='w-full'>
                {!isLoading && <Icons.google className='h-4 w-4 mr-2' />}
                Google
            </Button>
        </div>
    )
}
