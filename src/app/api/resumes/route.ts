import { NextResponse } from 'next/server'
import type { ApiResponse, ResumeSummary } from '@/types'

/**
 * GET /api/resumes
 * Returns a list of the current user's resumes.
 *
 * NOTE: This is an architecture stub. Wire up your
 * database / ORM (e.g. Prisma) and auth session here.
 */
export async function GET() {
  try {
    // TODO: authenticate request + query DB
    const data: ResumeSummary[] = []
    return NextResponse.json<ApiResponse<ResumeSummary[]>>({
      success: true,
      data,
      message: 'Resumes fetched',
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Internal error',
      },
      { status: 500 },
    )
  }
}

/**
 * POST /api/resumes
 * Creates a new resume.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    // TODO: validate with resumeSchema, persist to DB
    return NextResponse.json<ApiResponse<unknown>>(
      { success: true, data: body, message: 'Resume created' },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Internal error',
      },
      { status: 500 },
    )
  }
}