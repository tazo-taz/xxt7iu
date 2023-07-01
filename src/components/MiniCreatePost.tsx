"use client"

import { Session } from 'next-auth'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'
import UserAvatar from './UserAvatar'
import { Input } from './ui/input'
import { Button } from './ui/Button'
import { ImageIcon, Link2Icon } from 'lucide-react'

interface MiniCreatePostProps {
    session: Session | null
}

export default function MiniCreatePost({
    session
}: MiniCreatePostProps) {
    const router = useRouter()
    const pathname = usePathname()
    return (
        <div className='rounded-md bg-white shadow'>
            <div className="h-full px-6 py-4 flex justify-between gap-6">
                <div className='relative'>
                    <UserAvatar
                        user={{
                            name: session?.user.name || null,
                            image: session?.user.image || null,
                        }}
                    />

                    <span className=' bottom-0 right-0 rounded-full w-3 h-3 bg-green-500 outline outline-white outline-2' />
                </div>

                <Input
                    readOnly
                    onClick={() => router.push(pathname + '/submit')}
                    placeholder='Create a post'
                />

                <Button
                    onClick={() => router.push(pathname + '/submit')}
                    variant="ghost"
                >
                    <ImageIcon />
                </Button>
                <Button
                    onClick={() => router.push(pathname + '/submit')}
                    variant="ghost"
                >
                    <Link2Icon className="text-zinc-600" />
                </Button>
            </div>
        </div>
    )
}
