'use client'

import { useState } from 'react'
import { AuthService } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Mail, Lock, Brain, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

export default function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const { user, error } = await AuthService.signUp(email, password)
      if (error) throw new Error(error)
      toast.success('Account created successfully!')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const { user, error } = await AuthService.signIn(email, password)
      if (error) throw new Error(error)
      toast.success('Welcome back!')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <Brain className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Smart Todo AI
          </h1>
          <p className="text-gray-600 mb-4">
            AI-powered task management by <span className="font-semibold">Anant Kumar Jha</span>
            
          </p>
          
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mb-6">
            <div className="flex items-center gap-1">
              <Sparkles className="h-4 w-4" />
              <span>Smart Prioritization</span>
            </div>
            <div className="flex items-center gap-1">
              <Brain className="h-4 w-4" />
              <span>AI Suggestions</span>
            </div>
          </div>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <form className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="Enter your password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    minLength={6}
                    required
                  />
                </div>

                <TabsContent value="signin" className="mt-6">
                  <Button 
                    onClick={handleSignIn} 
                    disabled={loading || !email || !password}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    type="submit"
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </TabsContent>

                <TabsContent value="signup" className="mt-6">
                  <Button 
                    onClick={handleSignUp} 
                    disabled={loading || !email || !password}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    type="submit"
                  >
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </TabsContent>
              </form>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-xs text-gray-500">
          Experience the future of task management with AI
        </div>
      </div>
    </div>
  )
}