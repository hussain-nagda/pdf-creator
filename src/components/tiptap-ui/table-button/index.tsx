// components/tiptap-ui/table-button.tsx
"use client"

import { useCurrentEditor } from "@tiptap/react"
import { Button } from "@/components/tiptap-ui-primitive/button"
import * as React from "react"

export function TableButton() {
  const { editor } = useCurrentEditor()
  const [color, setColor] = React.useState<string>("#cccccc")
  if (!editor) return null

  const applyBorderColor = (value: string) => {
    setColor(value)
    editor.chain().focus().updateAttributes("table", { borderColor: value }).run()
  }

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Button
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
        }
      >
        Table
      </Button>
      <Button onClick={() => editor.chain().focus().addRowAfter().run()}>+ Row</Button>
      <Button onClick={() => editor.chain().focus().addColumnAfter().run()}>+ Col</Button>
      {/* <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <span>Stroke</span>
        <input
          type="color"
          value={color}
          onChange={(e) => applyBorderColor(e.target.value)}
          style={{ width: 28, height: 28, padding: 0, border: 0, background: "transparent" }}
        />
      </label> */}
    </div>
  )
}
