// components/tiptap-ui/table-button.tsx
"use client"

import { useCurrentEditor } from "@tiptap/react"
import { Button } from "@/components/tiptap-ui-primitive/button"

export function TableButton() {
  const { editor } = useCurrentEditor()
  if (!editor) return null

  return (
    <Button
      onClick={() =>
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
      }
    >
      Table
    </Button>
  )
}
