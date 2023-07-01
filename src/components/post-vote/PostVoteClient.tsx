"use client"

import { useCustomToast } from '@/hooks/useCustomToast'
import { usePrevious } from '@mantine/hooks'
import { VoteType } from '@prisma/client'
import React, { useEffect, useState } from 'react'
import { Button } from '../ui/Button'
import { ArrowBigDown, ArrowBigUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMutation } from '@tanstack/react-query'
import { PostVoteRequest } from '@/lib/validators/vote'
import axios, { AxiosError } from 'axios'
import { toast } from '../ui/use-toast'

interface PostVoteClientProps {
    postId: string,
    initialVotesAmt: number,
    initiallVote?: VoteType | null
}

export default function PostVoteClient({
    postId,
    initialVotesAmt,
    initiallVote
}: PostVoteClientProps) {
    const { loginToast } = useCustomToast()
    const [votesAmt, setVotesAmt] = useState(initialVotesAmt)
    const [currentVote, setCurrentVote] = useState(initiallVote)
    const prevVote = usePrevious(currentVote)

    useEffect(() => {
        setCurrentVote(initiallVote)
    }, [initiallVote])

    const { mutate: vote } = useMutation({
        mutationFn: async (voteType: VoteType) => {
            const payload: PostVoteRequest = {
                postId: postId,
                voteType
            }

            await axios.patch('/api/subreddit/post/vote', payload)
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
            if (currentVote === type) {
                // User is voting the same way again, so remove their vote
                setCurrentVote(undefined)
                if (type === 'UP') setVotesAmt((prev) => prev - 1)
                else if (type === 'DOWN') setVotesAmt((prev) => prev + 1)
            } else {
                // User is voting in the opposite direction, so subtract 2
                setCurrentVote(type)
                if (type === 'UP') setVotesAmt((prev) => prev + (currentVote ? 2 : 1))
                else if (type === 'DOWN')
                    setVotesAmt((prev) => prev - (currentVote ? 2 : 1))
            }
        },
    })

    return (
        <div className='flex sm:flex-col gap-4 sm:gap-0 pr-6 sm:w-20 pb-4 sm:pb-0'>
            <Button
                onClick={() => vote("UP")}
                size="sm"
                variant="ghost"
                aria-label='upvote'
            >
                <ArrowBigUp className={cn("h-5 w-5 text-zinc-700", {
                    "text-emerald-500 fill-emerald-500": currentVote === "UP"
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
                    "text-red-500 fill-red-500": currentVote === "DOWN"
                })} />
            </Button>
        </div>
    )
}