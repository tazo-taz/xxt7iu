'use client'

import React, { useState } from 'react'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Button } from './ui/Button'
import { useMutation } from '@tanstack/react-query'
import { CommentRequest } from '@/lib/validators/comment'
import axios, { AxiosError } from 'axios'
import { useCustomToast } from '@/hooks/useCustomToast'
import { toast } from './ui/use-toast'
import { useRouter } from 'next/navigation'

interface CreateCommentProps {
    postId: string
    replyToId?: string
}

export default function CreateComment({ postId, replyToId }: CreateCommentProps) {
    const [input, setInput] = useState("")
    const { loginToast } = useCustomToast()
    const router = useRouter()

    const { mutate: comment, isLoading } = useMutation({
        mutationFn: async ({ postId, text, replyToId }: CommentRequest) => {
            const payload: CommentRequest = {
                postId,
                text,
                replyToId
            }

            const { data } = await axios.patch("/api/subreddit/post/comment", payload)
            return data
        },
        onError: (error) => {
            if (error instanceof AxiosError) {
                if (error.response?.status === 401) {
                    return loginToast()
                }
            }

            return toast({
                title: "Something went wrong",
                description: "Your comment was not created, please try again later",
                variant: "destructive"
            })
        },
        onSuccess: () => {
            router.refresh()
            setInput("")
        }
    })

    return (
        <div className='grid w-full gap-1.5'>
            <Label htmlFor='comment' >Your comment</Label>
            <div className='mt-2'>
                <Textarea
                    id='comment'
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    rows={1}
                    placeholder='What are your thoughts?'
                />

                <div className='mt-2 flex justify-end'>
                    <Button isLoading={isLoading} onClick={() => comment({ postId, text: input, replyToId })}>Post</Button>
                </div>
            </div>
        </div>
    )
}
