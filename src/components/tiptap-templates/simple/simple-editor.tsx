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
import { TableButton } from "@/components/tiptap-ui/table-button"
import { diffWords } from "diff"

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button"
import { Spacer } from "@/components/tiptap-ui-primitive/spacer"
import { Toolbar, ToolbarGroup, ToolbarSeparator } from "@/components/tiptap-ui-primitive/toolbar"

// --- Tiptap Node ---
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension"
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss"
import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/image-node/image-node.scss"
import "@/components/tiptap-node/heading-node/heading-node.scss"
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"

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

// --- Components ---
import { ThemeToggle } from "@/components/tiptap-templates/simple/theme-toggle"

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE, exportElementToPdf, exportElementAsWord } from "@/lib/tiptap-utils"

// --- Styles ---
import "@/components/tiptap-templates/simple/simple-editor.scss"

import content from "@/components/tiptap-templates/simple/data/content.json"

export function SimpleEditor() {
  const isMobile = useIsMobile()
  const { height } = useWindowSize()
  const [mobileView, setMobileView] = React.useState<"main" | "highlighter" | "link">("main")
  const toolbarRef = React.useRef<HTMLDivElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)

  const [versions, setVersions] = React.useState<string[]>([])
  // const [compareResult, setCompareResult] = React.useState<JSX.Element | null>(null)

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

  // const compareVersions = (index1: number, index2: number) => {
  //   const v1 = versions[index1]
  //   const v2 = versions[index2]
  //   const diff = diffWords(v1, v2)

  //   const jsx = (
  //     <div style={{ padding: 10, border: "1px solid #ccc", marginTop: 10 }}>
  //       {diff.map((part, i) => {
  //         const style = part.added
  //           ? { backgroundColor: "lightgreen" }
  //           : part.removed
  //             ? { backgroundColor: "salmon", textDecoration: "line-through" }
  //             : {}
  //         return (
  //           <span key={i} style={style}>
  //             {part.value}
  //           </span>
  //         )
  //       })}
  //     </div>
  //   )
  //   setCompareResult(jsx)
  // }
return (
  <div className="simple-editor-wrapper" style={{ paddingRight: 220 /* leave space for sidebar */ }}>
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
          <TableButton /> 
          <Button
            type="button"
            data-style="ghost"
            onClick={() => exportElementToPdf(contentRef.current!)}
          >
            Export PDF
          </Button>
          <Button
            type="button"
            data-style="ghost"
            onClick={() => exportElementAsWord(contentRef.current!)}
          >
            Export Word
          </Button>
          <Button type="button" data-style="ghost" onClick={saveVersion}>
            💾 Save Version
          </Button>
        </ToolbarGroup>
      </Toolbar>

      <div
        ref={contentRef}
        className="simple-editor-content"
        style={{ display: "flex", gap: "20px", marginTop: 10 }}
      >
        <EditorContent editor={editor} />
      </div>
    </EditorContext.Provider>

    {/* --- Version Sidebar --- */}
    {versions.length > 0 && (
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "20dvw",
          height: "100dvh",
          padding: "10px",
          backgroundColor: "#f9f9f9",
          borderLeft: "1px solid #ddd",
          overflowY: "auto",
          zIndex: 1000,
        }}
      >
        <h4>Versions</h4>

        <ul style={{ listStyle: "none", padding: 0, marginTop: 10 }}>
          {versions.map((v, i) => (
            <li
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-around",
                marginBottom: 5,
              }}
            >
              <span>{`Version ${i + 1}`}</span>
              <div style={{ display: "flex", gap: 5 }}>
                <button
                  style={{
                    padding: "5px 8px",
                    textAlign: "left",
                    border: "1px solid #ccc",
                    borderRadius: 4,
                    backgroundColor: "#fff",
                    cursor: "pointer",
                  }}
                  onClick={() => restoreVersion(i)}
                >
                  Restore
                </button>
                {/* {i < versions.length - 1 && (
                  <button
                    style={{
                      padding: "2px 5px",
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                    onClick={() => compareVersions(i, i + 1)}
                  >
                    Compare ↔
                  </button>
                )} */}
              </div>
            </li>
          ))}
        </ul>

        {/* {compareResult && (
          <div style={{ marginTop: 20 }}>
            <h5>Comparison Result:</h5>
            {compareResult}
          </div>
        )} */}
      </div>
    )}
  </div>
)
}