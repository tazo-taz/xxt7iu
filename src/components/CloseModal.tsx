"use client"

import React from 'react'
import { Button } from './ui/Button'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CloseModal() {
    const router = useRouter()
    return (
        <Button
            aria-label='close modal'
            variant="subtle"
            className="w-6 h-6 p-0 rounded-md"
            onClick={() => router.back()}
        >
            <X className='h-4 w-4' />
        </Button>
    )
}
