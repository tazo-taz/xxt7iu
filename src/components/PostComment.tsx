"use client"

import { formatTimeToNow } from '@/lib/utils'
import { Comment, CommentVote, User } from '@prisma/client'
import { useRef, useState } from 'react'
import UserAvatar from './UserAvatar'
import CommentVotes from './CommentVotes'
import { Button } from './ui/Button'
import { MessageSquare } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { useMutation } from '@tanstack/react-query'
import { CommentRequest } from '@/lib/validators/comment'
import axios from 'axios'
import { toast } from './ui/use-toast'

type ExtendedComment = Comment & {
    votes: CommentVote[],
    author: User
}

interface PostCommentProps {
    comment: ExtendedComment,
    currentVote: CommentVote | undefined,
    votesAmt: number,
    postId: string
}

export default function PostComment({
    comment,
    currentVote,
    votesAmt,
    postId
}: PostCommentProps) {
    const commentRef = useRef<HTMLDivElement>(null)
    const router = useRouter()
    const { data: session } = useSession()
    const [isReplying, setIsReplying] = useState(false)
    const [input, setInput] = useState("")
    const { mutate: postComment, isLoading } = useMutation({
        mutationFn: async ({ replyToId, postId, text }: CommentRequest) => {
            const payload = {
                replyToId, postId, text
            }

            const { data } = await axios.patch("/api/subreddit/post/comment", payload)
            return data
        },
        onError: () => {
            toast({
                title: "Something went wrong",
                description: "Your comment was't posted",
                variant: "destructive"
            })
        },
        onSuccess: () => {
            router.refresh()
            setIsReplying(false)
            setInput("")
        }
    })

    return (
        <div ref={commentRef} className='flex flex-col'>
            <div className='flex items-center'>
                <UserAvatar
                    user={{
                        name: comment.author.name,
                        image: comment.author.image
                    }}
                    className='h-6 w-6'
                />

                <div className='ml-2 flex items-center gap-x-2'>
                    <p className='text-sm font-medium text-gray-900'>
                        u/${comment.author.username}
                    </p>
                    <p className="max-h-40 truncate text-xs text-zinc-500">
                        {formatTimeToNow(new Date(comment.createdAt))}
                    </p>
                </div>
            </div>

            <p className="text-sm text-zinc-900 mt-2">{comment.text}</p>

            <div className='flex gap-2 items-center flex-wrap'>
                <CommentVotes
                    commentId={comment.id}
                    initialVotesAmt={votesAmt}
                    initiallVote={currentVote}
                />

                <Button onClick={() => {
                    if (!session) {
                        return router.push("/sign-in")
                    }
                    setIsReplying(true)
                }} variant="ghost" size="xs" aria-label='reply'>
                    <MessageSquare className='h-4 w-4 mr-1.5' />
                    Reply
                </Button>

                {isReplying && (
                    <div className='grid w-full gap-1.5'>
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

                                <div className='mt-2 gap-2 flex justify-end'>
                                    <Button onClick={() => setIsReplying(false)} variant="subtle" tabIndex={-1}>Cancel</Button>
                                    <Button isLoading={isLoading} onClick={() => {
                                        if (!input) return
                                        postComment({
                                            postId,
                                            text: input,
                                            replyToId: comment.replyToId ?? comment.id
                                        })
                                    }}>Post</Button>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    )
}
