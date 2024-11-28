'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function Setup() {
    const [username, setUsername] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const searchParams = useSearchParams()
    const router = useRouter()
    const { toast } = useToast()
    const uid = searchParams.get('uid')

    useEffect(() => {
        const checkSetup = async () => {
            try {
                const response = await fetch(`/api/setup?uid=${uid}`)
                const data = await response.json()
                
                if (data.is_setup_completed) {
                    router.push('/')
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: `Failed to check setup status: ${error}`,
                    variant: "destructive"
                })
            }
        }

        if (uid) {
            checkSetup()
        }
    }, [uid, router, toast])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const response = await fetch('/api/user/new', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    userid: uid
                })
            })

            if (!response.ok) {
                throw new Error('Failed to create user')
            }

            window.location.reload()
        } catch (error) {
            toast({
                title: "Error",
                description: `Failed to create user: ${error}`,
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (!uid) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-[350px]">
                    <CardHeader>
                        <CardTitle>Error</CardTitle>
                        <CardDescription>No uid provided</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>Setup Your Account</CardTitle>
                    <CardDescription>Choose a username to get started</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <Button 
                            type="submit" 
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? "Setting up..." : "Complete Setup"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}