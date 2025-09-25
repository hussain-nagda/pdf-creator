"use client"

import * as React from "react"
import { EditorContent, EditorContext, useEditor } from "@tiptap/react"

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { TextStyle } from "@tiptap/extension-text-style"
import { FontFamily } from "@tiptap/extension-font-family"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { Selection } from "@tiptap/extensions"
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table"
import { diffWords } from "diff"
// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button"
import { Spacer } from "@/components/tiptap-ui-primitive/spacer"
import { Toolbar, ToolbarGroup, ToolbarSeparator } from "@/components/tiptap-ui-primitive/toolbar"

// --- Custom Nodes ---
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension"
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu"
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button"
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu"
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button"
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button"
import { MarkButton } from "@/components/tiptap-ui/mark-button"
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button"
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button"

// --- Hooks ---
import { useIsMobile } from "@/hooks/use-mobile"
import { useWindowSize } from "@/hooks/use-window-size"
import { useCursorVisibility } from "@/hooks/use-cursor-visibility"

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE, exportElementToPdf, exportElementAsWord } from "@/lib/tiptap-utils"

// --- Diff library for version comparison ---

import content from "@/components/tiptap-templates/simple/data/content.json"

export function SimpleEditor() {
  const isMobile = useIsMobile()
  const { height } = useWindowSize()
  const [mobileView, setMobileView] = React.useState<"main" | "highlighter" | "link">("main")
  const toolbarRef = React.useRef<HTMLDivElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)

  // --- Versioning State ---
  const [versions, setVersions] = React.useState<string[]>([])
  const [compareResult, setCompareResult] = React.useState<JSX.Element | null>(null)

  // --- Extend Table to support border color ---
  const TableWithBorder = Table.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        borderColor: {
          default: "#cccccc",
          parseHTML: (element: HTMLElement) =>
            element.getAttribute("data-border-color") || "#cccccc",
          renderHTML: (attributes: { borderColor?: string }) => ({
            "data-border-color": attributes.borderColor || "#cccccc",
            style: `--tbl-border: ${attributes.borderColor || "#cccccc"}`,
          }),
        },
      }
    },
  })

  // --- Tiptap Editor Setup ---
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area",
        class: "simple-editor",
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: { openOnClick: false, enableClickSelection: true },
      }),
      TableWithBorder.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      TextStyle,
      FontFamily,
      Typography,
      Superscript,
      Subscript,
      Selection,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error("Upload failed:", error),
      }),
    ],
    content,
  })

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  })

  React.useEffect(() => {
    if (!isMobile && mobileView !== "main") setMobileView("main")
  }, [isMobile, mobileView])

  if (!editor) return null

  // --- Versioning Functions ---
  const saveVersion = () => {
    const contentHTML = editor.getHTML()
    setVersions([...versions, contentHTML])
    alert(`Saved Version ${versions.length + 1}`)
  }

  const restoreVersion = (index: number) => {
    editor.commands.setContent(versions[index])
  }

  const compareVersions = (index1: number, index2: number) => {
    const v1 = versions[index1]
    const v2 = versions[index2]
    const diff = diffWords(v1, v2)

    const jsx = (
      <div style={{ padding: 10, border: "1px solid #ccc", marginTop: 10 }}>
        {diff.map((part, i) => {
          const style = part.added
            ? { backgroundColor: "lightgreen" }
            : part.removed
            ? { backgroundColor: "salmon", textDecoration: "line-through" }
            : {}
          return (
            <span key={i} style={style}>
              {part.value}
            </span>
          )
        })}
      </div>
    )
    setCompareResult(jsx)
  }

  return (
    <div className="simple-editor-wrapper">
      <EditorContext.Provider value={{ editor }}>
        {/* Toolbar */}
        <Toolbar
          ref={toolbarRef}
          style={isMobile ? { bottom: `calc(100% - ${height - rect.y}px)` } : {}}
        >
          <ToolbarGroup>
            <UndoRedoButton action="undo" />
            <UndoRedoButton action="redo" />
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} />
            <ListDropdownMenu types={["bulletList", "orderedList", "taskList"]} portal={isMobile} />
            <BlockquoteButton />
            <CodeBlockButton />
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            <MarkButton type="bold" />
            <MarkButton type="italic" />
            <MarkButton type="strike" />
            <MarkButton type="code" />
            <MarkButton type="underline" />
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            <TextAlignButton align="left" />
            <TextAlignButton align="center" />
            <TextAlignButton align="right" />
            <TextAlignButton align="justify" />
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            <ImageUploadButton text="Add" />
            <Button type="button" data-style="ghost" onClick={() => exportElementToPdf(contentRef.current!)}>
              Export PDF
            </Button>
            <Button type="button" data-style="ghost" onClick={() => exportElementAsWord(contentRef.current!)}>
              Export Word
            </Button>
             <button onClick={saveVersion}>💾 Save Version</button>
          </ToolbarGroup>
        </Toolbar>

        <div ref={contentRef} className="simple-editor-content">
          <EditorContent editor={editor} />
        </div>
      </EditorContext.Provider>

      {/* Version Controls */}
      <div className="simple-editor-container" style={{ display: "flex", gap: "20px" }}>
  {/* Editor area */}
  <div style={{ flex: 1 }}>
    <EditorContent editor={editor} />
  </div>

  {/* Versions sidebar */}
  {versions.length > 0 && (
    <div
      className="versions-sidebar"
      style={{
        width: "250px",
        borderLeft: "1px solid #ccc",
        padding: "10px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <h4>History ({versions.length} version{versions.length > 1 ? "s" : ""})</h4>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {versions.map((v, i) => (
          <li
            key={i}
            style={{
              border: "1px solid #ccc",
              borderRadius: "5px",
              padding: "5px",
              cursor: "pointer",
            }}
          >
            <div>Version {i + 1}</div>
            <div style={{ marginTop: "5px", display: "flex", gap: "5px" }}>
              <button onClick={() => restoreVersion(i)}>Restore</button>
              {/* {i < versions.length - 1 && (
                <button onClick={() => compareVersions(i, i + 1)}>Compare</button>
              )} */}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )}
</div>
    </div>
  )
}
