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
import { diffWords } from "diff"

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button"
import { Spacer } from "@/components/tiptap-ui-primitive/spacer"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar"

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
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "@/components/tiptap-ui/color-highlight-popover"
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "@/components/tiptap-ui/link-popover"
import { MarkButton } from "@/components/tiptap-ui/mark-button"
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button"
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button"

// --- Icons ---
import { ArrowLeftIcon } from "@/components/tiptap-icons/arrow-left-icon"
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon"
import { LinkIcon } from "@/components/tiptap-icons/link-icon"

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
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table"
import { TableButton } from "@/components/tiptap-ui/table-button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/tiptap-ui-primitive/dropdown-menu"
import { Card, CardBody } from "@/components/tiptap-ui-primitive/card"
import type { Editor } from "@tiptap/react"

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  onExportPdf,
  onExportWord,
  onFontChange,
  isMobile,
  saveVersion,
}: {
  onHighlighterClick: () => void
  onLinkClick: () => void
  onExportPdf: () => void
  onExportWord: () => void
  onFontChange: (family: string) => void
  saveVersion: () => void
  isMobile: boolean
}) => {
  return (
    <>
      <Spacer />

      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} />
        <ListDropdownMenu
          types={["bulletList", "orderedList", "taskList"]}
          portal={isMobile}
        />
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
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup style={{ display: 'flex', gap: '6px', flexWrap: 'nowrap', alignItems: 'center' }}>
        <DropdownMenu modal>
          <DropdownMenuTrigger asChild>
            <Button type="button" data-style="ghost" tooltip="Font">
              <span className="tiptap-button-text">Font</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <Card>
              <CardBody>
                <div style={{ display: "grid", gap: 4 }}>
                  <DropdownMenuItem asChild>
                    <button type="button" onClick={() => onFontChange("Inter, sans-serif")} style={{ fontFamily: 'Inter, sans-serif' }}>
                      Inter
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <button type="button" onClick={() => onFontChange("DM Sans, sans-serif")} style={{ fontFamily: 'DM Sans, sans-serif' }}>
                      DM Sans
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <button type="button" onClick={() => onFontChange("Georgia, serif")} style={{ fontFamily: 'Georgia, serif' }}>
                      Georgia
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <button type="button" onClick={() => onFontChange("Times New Roman, Times, serif")} style={{ fontFamily: 'Times New Roman, Times, serif' }}>
                      Times New Roman
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <button type="button" onClick={() => onFontChange("Arial, Helvetica, sans-serif")} style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                      Arial
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <button type="button" onClick={() => onFontChange("Courier New, Courier, monospace")} style={{ fontFamily: 'Courier New, Courier, monospace' }}>
                      Courier New
                    </button>
                  </DropdownMenuItem>
                </div>
              </CardBody>
            </Card>
          </DropdownMenuContent>
        </DropdownMenu>
        <ImageUploadButton text="Add" />

        <TableButton />
        <Button type="button" data-style="ghost" onClick={onExportPdf}>
          Export PDF
        </Button>
        <Button type="button" data-style="ghost" onClick={onExportWord}>
          Export Word
        </Button>
        <Button type="button" data-style="ghost" onClick={saveVersion}>
          💾 Save Version
        </Button>
        
      </ToolbarGroup>

      <Spacer />

      {isMobile && <ToolbarSeparator />}

      {/* <ToolbarGroup>
        <ThemeToggle />
      </ToolbarGroup> */}
    </>
  )
}

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link"
  onBack: () => void
}) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
)

export function SimpleEditor() {
  const isMobile = useIsMobile()
  const { height } = useWindowSize()
  const [mobileView, setMobileView] = React.useState<
    "main" | "highlighter" | "link"
  >("main")
  const toolbarRef = React.useRef<HTMLDivElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [versions, setVersions] = React.useState<string[]>([])


  const TableWithBorder = Table.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        borderColor: {
          default: "#cccccc",
          parseHTML: (element: HTMLElement) =>
            element.getAttribute("data-border-color") || "#cccccc",
          renderHTML: (attributes: { borderColor?: string }) => {
            const value = attributes.borderColor || "#cccccc"
            return {
              "data-border-color": value,
              style: `--tbl-border: ${value}`,
            }
          },
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
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
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
    if (!isMobile && mobileView !== "main") {
      setMobileView("main")
    }
  }, [isMobile, mobileView])

  if (!editor) return null
  const saveVersion = () => {
    console.log('Save version clicked');
    const contentHTML = editor.getHTML()
    setVersions([...versions, contentHTML])
    alert(`Saved Version ${versions.length + 1}`)
  }

  const restoreVersion = (index: number) => {
    editor.commands.setContent(versions[index])
  }

  // --- Versioning Functions ---

  return (
    <div className="simple-editor-wrapper" style={{   /* leave space for sidebar */ }}>
      <EditorContext.Provider value={{ editor }}>
        {/* Toolbar */}
        <Toolbar
          ref={toolbarRef}
          style={isMobile ? { bottom: `calc(100% - ${height - rect.y}px)` } : {}}
        >
          {mobileView === "main" ? (
            <MainToolbarContent
              onHighlighterClick={() => setMobileView("highlighter")}
              onLinkClick={() => setMobileView("link")}
              onExportPdf={() => {
                if (contentRef.current) {
                  exportElementToPdf(contentRef.current, {
                    documentTitle: "Document",
                    page: { size: "A4", margin: "16mm" },
                  })
                }
              }}
              onExportWord={() => {
                if (contentRef.current) {
                  exportElementAsWord(contentRef.current, { filename: "Document" })
                }
              }}
              onFontChange={(family) => {
                editor?.chain().focus().setFontFamily(family).run()
              }}
              saveVersion={saveVersion} // 🔹 add this line**
              isMobile={isMobile}
            />
          ) : (
            <MobileToolbarContent
              type={mobileView === "highlighter" ? "highlighter" : "link"}
              onBack={() => setMobileView("main")}
            />
          )}
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
            width: "14dvw",
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
        </div>
      )
      }

    </div>
  )
}