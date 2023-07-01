"use client"

import { useCustomToast } from '@/hooks/useCustomToast'
import { cn } from '@/lib/utils'
import { CommentVoteRequest } from '@/lib/validators/vote'
import { usePrevious } from '@mantine/hooks'
import { CommentVote, VoteType } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { ArrowBigDown, ArrowBigUp } from 'lucide-react'
import { useState } from 'react'
import { Button } from './ui/Button'
import { toast } from './ui/use-toast'

interface CommentVoteProps {
    commentId: string,
    initialVotesAmt: number,
    initiallVote?: Pick<CommentVote, "type"> | null
}

export default function CommentVote({
    commentId,
    initialVotesAmt,
    initiallVote
}: CommentVoteProps) {
    const { loginToast } = useCustomToast()
    const [votesAmt, setVotesAmt] = useState(initialVotesAmt)
    const [currentVote, setCurrentVote] = useState(initiallVote)
    const prevVote = usePrevious(currentVote)

    const { mutate: vote } = useMutation({
        mutationFn: async (voteType: VoteType) => {
            const payload: CommentVoteRequest = {
                commentId,
                voteType
            }

            await axios.patch('/api/subreddit/post/comment/vote', payload)
        },
        onError: (err, voteType) => {
            if (voteType === "UP") {
                setVotesAmt((prev) => prev - 1)
            } else {
                setVotesAmt((prev) => prev + 1)
            }

            setCurrentVote(prevVote)

            if (err instanceof AxiosError) {
                if (err.response?.status === 401) {
                    return loginToast()
                }
            }
            return toast({
                title: "Something went wrong",
                description: "Your vote was not registered, please try again",
                variant: "destructive"
            })
        },
        onMutate: (type: VoteType) => {
            if (currentVote?.type === type) {
                // User is voting the same way again, so remove their vote
                setCurrentVote(undefined)
                if (type === 'UP') setVotesAmt((prev) => prev - 1)
                else if (type === 'DOWN') setVotesAmt((prev) => prev + 1)
            } else {
                // User is voting in the opposite direction, so subtract 2
                setCurrentVote({ type })
                if (type === 'UP') setVotesAmt((prev) => prev + (currentVote ? 2 : 1))
                else if (type === 'DOWN')
                    setVotesAmt((prev) => prev - (currentVote ? 2 : 1))
            }
        },
    })

    return (
        <div className='flex gap-1'>
            <Button
                onClick={() => vote("UP")}
                size="sm"
                variant="ghost"
                aria-label='upvote'
            >
                <ArrowBigUp className={cn("h-5 w-5 text-zinc-700", {
                    "text-emerald-500 fill-emerald-500": currentVote?.type === "UP"
                })} />
            </Button>

            <p className="text-center py-2 font-medium text-sm text-zinc-900">{votesAmt}</p>

            <Button
                onClick={() => vote("DOWN")}
                size="sm"
                variant="ghost"
                aria-label='upvote'
            >
                <ArrowBigDown className={cn("h-5 w-5 text-zinc-700", {
                    "text-red-500 fill-red-500": currentVote?.type === "DOWN"
                })} />
            </Button>
        </div>
    )
}
