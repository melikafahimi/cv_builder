import { NextResponse } from 'next/server'
import type { ApiResponse, Resume } from '@/types'

/**
 * GET /api/resumes/:id
 * Returns a single resume by id.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    // TODO: fetch from DB by id
    const data: Resume | null = null
    if (!data) {
      return NextResponse.json(
        { success: false, data: null, message: 'Resume not found' },
        { status: 404 },
      )
    }
    return NextResponse.json<ApiResponse<Resume>>({
      success: true,
      data,
      message: 'Resume fetched',
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
 * PATCH /api/resumes/:id
 * Updates an existing resume.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await request.json()
    // TODO: validate + persist
    return NextResponse.json<ApiResponse<unknown>>({
      success: true,
      data: { id, ...body },
      message: 'Resume updated',
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
 * DELETE /api/resumes/:id
 * Deletes a resume by id.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    // TODO: delete from DB
    return NextResponse.json<ApiResponse<null>>({
      success: true,
      data: null,
      message: 'Resume deleted',
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