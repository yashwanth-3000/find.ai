import { Metadata } from 'next'
import SignIn from '@/components/auth/sign-in'

export const metadata: Metadata = {
  title: 'Sign In | findr.ai',
  description: 'Sign in to your findr.ai account',
}

export default function SignInPage() {
  return (
    <div className="container max-w-screen-xl mx-auto pt-24 pb-16 px-4">
      <div className="max-w-md mx-auto mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Welcome Back</h1>
        <p className="text-center text-muted-foreground">
          Sign in to findr.ai to continue your journey
        </p>
      </div>
      
      <SignIn />
    </div>
  )
} 