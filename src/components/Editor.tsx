"use client"

import React, { useCallback, useEffect, useRef, useState } from 'react'
import TextareaAutosize from "react-textarea-autosize"
import { useForm } from "react-hook-form"
import { PostCreationRequest, PostValidator } from '@/lib/validators/post'
import { zodResolver } from "@hookform/resolvers/zod"
import type EditorJS from "@editorjs/editorjs"
import { uploadFiles } from '@/lib/uploadthing'
import { toast } from './ui/use-toast'
import { useMutation } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { usePathname, useRouter } from 'next/navigation'

interface EditorProps {
    subredditId: string
}

export default function Editor({ subredditId }: EditorProps) {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<PostCreationRequest>({
        resolver: zodResolver(PostValidator),
        defaultValues: {
            subredditId,
            title: "",
            content: null
        }
    })
    const [isMounted, setIsMounted] = useState(false)
    const pathname = usePathname()
    const router = useRouter()

    const { mutate: createPost } = useMutation({
        mutationFn: async ({ title, content, subredditId }: PostCreationRequest) => {
            const payload = { title, content, subredditId }
            const { data } = await axios.post("/api/subreddit/post/create", payload)
            return data
        },
        onError: (error) => {
            if (error instanceof AxiosError) {
                if (error.response?.status === 400) {
                    return toast({
                        title: "Subscribe to post",
                        description: "You have not subscribed to the subreddit",
                        variant: "destructive"
                    })
                }
            }

            return toast({
                title: "Something went wrong",
                description: "Your post was not published, please try again later",
                variant: "destructive"
            })
        },
        onSuccess: () => {
            const newPathname = pathname.split("/").slice(0, -1).join("/")
            router.push(newPathname)
            router.refresh()
            return toast({
                description: "Your post has been published",
            })
        }
    })

    useEffect(() => {
        if (typeof window !== "undefined") {
            setIsMounted(true)
        }
    }, [])



    const ref = useRef<EditorJS>()
    const _titleRef = useRef<HTMLTextAreaElement>()

    const initializeEditor = useCallback(async () => {
        const EditorJs = (await import("@editorjs/editorjs")).default
        const Header = (await import("@editorjs/header")).default
        const Embed = (await import("@editorjs/embed")).default
        const Table = (await import("@editorjs/table")).default
        const List = (await import("@editorjs/list")).default
        const Code = (await import("@editorjs/code")).default
        const LinkTool = (await import("@editorjs/link")).default
        const InlineCode = (await import("@editorjs/inline-code")).default
        const ImageTool = (await import("@editorjs/image")).default

        if (!ref.current) {
            const editor = new EditorJs({
                holder: "editor",
                onReady() {
                    ref.current = editor
                },
                placeholder: "Type here to write your post",
                inlineToolbar: true,
                data: { blocks: [] },
                tools: {
                    header: Header,
                    LinkTool: {
                        class: LinkTool,
                        config: {
                            endpoint: "/api/link"
                        }
                    },
                    ImageTool: {
                        class: ImageTool,
                        config: {
                            uploader: {
                                async uploadByFile(file: File) {
                                    const [res] = await uploadFiles([file], "imageUploader")

                                    return {
                                        success: 1,
                                        file: {
                                            url: res.fileUrl
                                        }
                                    }
                                }
                            }
                        }
                    },
                    list: List,
                    code: Code,
                    inlineCode: InlineCode,
                    table: Table,
                    embed: Embed
                }
            })
        }
    }, [])

    useEffect(() => {
        const init = async () => {
            await initializeEditor()

            setTimeout(() => {
                _titleRef.current?.focus()
            })
        }

        if (isMounted) {
            init()
            return () => {
                ref.current?.destroy()
                ref.current = undefined
            }
        }
    }, [initializeEditor, isMounted])

    useEffect(() => {
        if (Object.keys(errors)) {
            for (const [_key, value] of Object.entries(errors)) {
                toast({
                    title: "Something went wrong",
                    description: (value as { message: string }).message,
                    variant: "destructive"
                })
            }
        }
    }, [errors])

    async function onSubmit(data: PostCreationRequest) {
        const blocks = await ref.current?.save()

        const payload: PostCreationRequest = {
            title: data.title,
            content: blocks,
            subredditId
        }

        createPost(payload)
    }

    const { ref: titleRef, ...rest } = register("title")

    return (
        <div className='w-full p-4 bg-zinc-50 rounded-lg border border-zinc-200'>
            <form
                id='subreddit-post-form'
                className='w-fit'
                onSubmit={handleSubmit(onSubmit)}
            >
                <div className='prose prose-stone dark:prose-invert'>
                    <TextareaAutosize
                        ref={(e) => {
                            titleRef(e)
                            if (e) _titleRef.current = e
                        }}
                        {...rest}
                        placeholder='Title'
                        className="w-full resize-none appearance-none overflow-hidden bg-transparent text-5xl font-bold focus:outline-none"
                    />

                    <div id='editor' className="min-h-[500px]" />
                </div>
            </form>
        </div>
    )
}
