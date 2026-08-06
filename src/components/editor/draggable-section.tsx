'use client'

import * as React from 'react'
import { useDrag, useDrop } from 'react-dnd'
import type { DragItem, DropResult } from '@/types'
import { cn } from '@/lib/utils'

/**
 * DraggableSection — a React DnD wrapper that makes its
 * children draggable and acts as a drop target for
 * reordering. Calls `onMove` with the source/target indices.
 */
interface DraggableSectionProps {
  id: string
  index: number
  type: string
  onMove: (result: DropResult) => void
  children: React.ReactNode
  className?: string
}

export function DraggableSection({
  id,
  index,
  type,
  onMove,
  children,
  className,
}: DraggableSectionProps) {
  const ref = React.useRef<HTMLDivElement>(null)

  const [{ isDragging }, drag] = useDrag<
    DragItem,
    DropResult,
    { isDragging: boolean }
  >(() => ({
    type,
    item: { type, id, index, data: null },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }))

  const [{ isOver }, drop] = useDrop<
    DragItem,
    DropResult,
    { isOver: boolean }
  >(() => ({
    accept: type,
    hover: (item, monitor) => {
      if (!ref.current) return
      const dragIndex = item.index
      const hoverIndex = index
      if (dragIndex === hoverIndex) return
      const hoverRect = ref.current.getBoundingClientRect()
      const hoverMiddleY = (hoverRect.bottom - hoverRect.top) / 2
      const clientOffset = monitor.getClientOffset()
      if (!clientOffset) return
      const hoverClientY = clientOffset.y - hoverRect.top
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return
      onMove({ sourceIndex: dragIndex, targetIndex: hoverIndex })
      item.index = hoverIndex
    },
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  }))

  drag(drop(ref))

  return (
    <div
      ref={ref}
      className={cn(
        'cursor-grab transition-opacity',
        isDragging && 'opacity-50',
        isOver && 'ring-2 ring-primary',
        className,
      )}
    >
      {children}
    </div>
  )
}