import Link from 'next/link'

/**
 * Global 404 page.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-6xl font-bold tracking-tight">404</h1>
      <p className="text-muted-foreground">
        The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="text-primary underline-offset-4 hover:underline"
      >
        Back to home
      </Link>
    </main>
  )
}