import { User } from 'next-auth'
import React from 'react'
import { Avatar, AvatarFallback } from './ui/avatar'
import Image from 'next/image'
import { Icons } from './Icons'
import { AvatarProps } from '@radix-ui/react-avatar'

interface UserAvatarProps extends AvatarProps {
    user: Pick<User, "name" | "image">
}


export default function UserAvatar({ user, ...props }: UserAvatarProps) {
    return (
        <Avatar {...props}>
            {user.image ? (
                <div className='relative aspect-square h-full w-full'>
                    <Image
                        fill
                        src={user.image}
                        alt='Profile picture'
                        referrerPolicy="no-referrer"
                    />
                </div>
            ) :
                (
                    <AvatarFallback>
                        <span className="sr-only">{user.name}</span>
                        <Icons.user />das
                    </AvatarFallback>
                )}
        </Avatar>
    )
}
