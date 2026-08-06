import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Log in',
  description: 'Sign in to your CV Builder account.',
}

/**
 * Login page — architecture placeholder.
 * The form will be implemented in `@/components/forms/login-form`
 * using React Hook Form + Zod (`loginSchema`).
 */
export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to continue building your resume.
        </p>
      </div>
      {/* <LoginForm /> — to be implemented */}
    </div>
  )
}