import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ArrowLeftRight, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Overview of your resumes and account.',
}

/**
 * Dashboard home — entry point to the resume builder.
 * Lists resume summaries (API-backed list is stubbed)
 * and quick actions.
 */
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Pick up where you left off or start a new resume.
          </p>
        </div>
        <Button asChild>
          <Link href="/editor/demo">
            <ArrowLeftRight className="size-4" />
            Resume Builder
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="size-4" />
              </span>
              Build a new resume
            </CardTitle>
            <CardDescription>
              Open the builder with live preview, 6 templates and PDF export.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/editor/demo">
                Start building
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Getting started</CardTitle>
            <CardDescription>
              Your resumes are saved automatically as you type.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ol className="list-inside list-decimal space-y-1.5">
              <li>Open the builder and load the sample resume.</li>
              <li>
                Edit your personal info, experience and skills on the left.
              </li>
              <li>
                Watch the live preview — switch templates, accent color and
                fonts.
              </li>
              <li>Export a polished PDF when you are happy.</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
