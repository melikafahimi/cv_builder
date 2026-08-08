import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create account',
  description: 'Sign up for a free CV Builder account.',
}

/**
 * Register page — architecture placeholder.
 * The form will be implemented in `@/components/forms/register-form`
 * using React Hook Form + Zod (`registerSchema`).
 */
export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Start building professional resumes for free.
        </p>
      </div>
      {/* <RegisterForm /> — to be implemented */}
    </div>
  )
}