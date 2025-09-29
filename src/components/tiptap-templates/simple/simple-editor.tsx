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

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button"
import { Toolbar, ToolbarGroup, ToolbarSeparator } from "@/components/tiptap-ui-primitive/toolbar"

// --- Tiptap Node ---
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension"
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import { Node } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pageBreak: {
      setPageBreak: (pageNumber?: number) => ReturnType
    }
  }
}
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
import { handleImageUpload, MAX_FILE_SIZE, exportElementAsWord } from "@/lib/tiptap-utils"

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

  const [pages, setPages] = React.useState<Array<{id: string, title: string}>>([
    { id: '1', title: 'Page 1' }
  ])
  const [currentPageId, setCurrentPageId] = React.useState('1')
  const [pageContents, setPageContents] = React.useState<Record<string, string>>({
    '1': ''
  })
  // const [compareResult, setCompareResult] = React.useState<JSX.Element | null>(null)

  const PageBreak = Node.create({
    name: 'pageBreak',
    group: 'block',
    atom: true,
    
    addAttributes() {
      return {
        pageNumber: {
          default: null,
        },
      }
    },

    parseHTML() {
      return [
        {
          tag: 'div[data-page-break]',
        },
      ]
    },

    renderHTML({ HTMLAttributes }) {
      return ['div', {
        ...HTMLAttributes,
        'data-page-break': '',
        'class': 'page-break-section',
        'style': 'page-break-before: always; height: 2rem; display: flex; align-items: center; justify-content: center; margin: 2rem 0; border-top: 2px solid #e0e0e0; position: relative;'
      }, ['span', {
        'style': 'background: white; padding: 0 1rem; color: #5f6368; font-size: 12px; position: absolute; top: -8px;'
      }, `Page ${HTMLAttributes.pageNumber || 'Break'}`]]
    },

    addCommands() {
      return {
        setPageBreak: (pageNumber?: number) => ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { pageNumber },
          })
        },
      }
    },
  })

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
      PageBreak,
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

  // Initialize editor with default content (runs once)
  const [initialized, setInitialized] = React.useState(false)
  
  React.useEffect(() => {
    if (editor && !initialized) {
      const defaultContent = editor.getHTML()
      setPageContents(prev => ({
        ...prev,
        '1': defaultContent
      }))
      setInitialized(true)
    }
  }, [editor, initialized])

  // Only load content when page is manually switched (not on every render)
  const loadPageContent = React.useCallback((pageId: string) => {
    if (editor && pageContents[pageId]) {
      editor.commands.setContent(pageContents[pageId])
    }
  }, [editor, pageContents])

  // No need to scroll since we show only one page at a time

  // Remove auto-save to prevent conflicts - we'll save only when switching pages

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

  // --- Page Management Functions ---
  const addNewPage = () => {
    const newPageNumber = pages.length + 1
    const newPageId = newPageNumber.toString()
    const newPage = {
      id: newPageId,
      title: `Page ${newPageNumber}`
    }
    
    // Save current page content before adding new page
    if (editor) {
      const currentContent = editor.getHTML()
      setPageContents(prev => ({
        ...prev,
        [currentPageId]: currentContent,
        [newPageId]: '<p></p>'
      }))
      
      // Switch to the new page immediately
      setCurrentPageId(newPageId)
      setTimeout(() => {
        editor.commands.setContent('<p></p>')
        editor.commands.focus()
      }, 0)
    } else {
      setPageContents(prev => ({
        ...prev,
        [newPageId]: '<p></p>'
      }))
    }
    
    setPages([...pages, newPage])
  }

  const removePage = (pageId: string) => {
    if (pages.length > 1) {
      const updatedPages = pages.filter(page => page.id !== pageId)
      // Renumber pages sequentially
      const renumberedPages = updatedPages.map((page, index) => ({
        ...page,
        id: (index + 1).toString(),
        title: `Page ${index + 1}`
      }))
      
      // Update page contents with new IDs
      const newPageContents: Record<string, string> = {}
      renumberedPages.forEach((page, index) => {
        const oldId = updatedPages[index].id
        newPageContents[page.id] = pageContents[oldId] || '<p></p>'
      })
      
      setPages(renumberedPages)
      setPageContents(newPageContents)
      
      if (currentPageId === pageId) {
        setCurrentPageId(renumberedPages[0].id)
      } else {
        const currentPageIndex = parseInt(currentPageId) - 1
        const pageIdIndex = parseInt(pageId) - 1
        if (currentPageIndex > pageIdIndex) {
          setCurrentPageId((currentPageIndex).toString())
        }
      }
    }
  }

  const switchToPage = (pageId: string) => {
    if (currentPageId !== pageId && editor) {
      // Save current page content before switching
      const currentContent = editor.getHTML()
      setPageContents(prev => ({
        ...prev,
        [currentPageId]: currentContent
      }))
      
      // Switch to new page
      setCurrentPageId(pageId)
      
      // Load new page content immediately
      setTimeout(() => {
        loadPageContent(pageId)
      }, 0)
    }
  }

  const insertPageBreak = () => {
    if (editor) {
      const nextPageNumber = pages.length + 1
      editor.chain().focus().insertContent({
        type: 'pageBreak',
        attrs: { pageNumber: nextPageNumber },
      }).run()
      
      // Add new page to the list
      const newPage = {
        id: nextPageNumber.toString(),
        title: `Page ${nextPageNumber}`
      }
      setPages([...pages, newPage])
    }
  }

  // Direct PDF generation without browser print
  const exportAllPagesAsPdf = async () => {
    if (!editor) return
    
    try {
      // Import PDF libraries
      const { jsPDF } = await import('jspdf')
      const html2canvas = await import('html2canvas')
      
      // Save current page content before export
      const currentContent = editor.getHTML()
      const updatedPageContents = {
        ...pageContents,
        [currentPageId]: currentContent
      }
      
      // Create a temporary container with all content styled for PDF
      const tempContainer = document.createElement('div')
      tempContainer.style.cssText = `
        position: absolute;
        top: -10000px;
        left: -10000px;
        width: 794px;
        background: white;
        font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.6;
        color: #202124;
        padding: 40px;
        box-sizing: border-box;
        overflow: visible;
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
      `
      
      // Add CSS styles to ensure proper text alignment rendering
      const styleElement = document.createElement('style')
      styleElement.textContent = `
        .temp-pdf-container * {
          box-sizing: border-box;
          text-rendering: optimizeLegibility;
        }
        .temp-pdf-container p,
        .temp-pdf-container h1,
        .temp-pdf-container h2,
        .temp-pdf-container h3,
        .temp-pdf-container h4,
        .temp-pdf-container h5,
        .temp-pdf-container h6,
        .temp-pdf-container div {
          display: block !important;
          width: 100% !important;
        }
        .temp-pdf-container [style*="text-align: center"] {
          text-align: center !important;
        }
        .temp-pdf-container [style*="text-align: right"] {
          text-align: right !important;
        }
        .temp-pdf-container [style*="text-align: justify"] {
          text-align: justify !important;
        }
        .temp-pdf-container [style*="text-align: left"] {
          text-align: left !important;
        }
      `
      tempContainer.className = 'temp-pdf-container'
      document.head.appendChild(styleElement)
      
      // Combine all pages with proper spacing
      let combinedHTML = ''
      pages.forEach((page, index) => {
        const pageContent = updatedPageContents[page.id] || ''
        
        if (pageContent && pageContent !== '<p></p>') {
          // Clean up the content
          const cleanedContent = pageContent
            .replace(/^(<p[^>]*><\/p>|<p[^>]*><br[^>]*><\/p>)+/g, '')
            .replace(/(<p[^>]*><\/p>|<p[^>]*><br[^>]*><\/p>)+$/g, '')
            .trim()
          
          if (cleanedContent) {
            // Add spacing between pages
            if (index > 0 && combinedHTML) {
              combinedHTML += '<div style="height: 40px; page-break-before: always;"></div>'
            }
            
            // Add page indicator for multiple pages
            if (pages.length > 1) {
              combinedHTML += `<div style="text-align: right; font-size: 12px; color: #666; margin-bottom: 20px;">Page ${page.id}</div>`
            }
            
            combinedHTML += cleanedContent
          }
        }
      })
      
      // Process content with enhanced styling and better alignment preservation
      let processedContent = combinedHTML
      
      // First, let's handle text alignment more comprehensively
      // Handle paragraphs with text-align in style attribute
      processedContent = processedContent
        .replace(/<p([^>]*style="[^"]*text-align:\s*center[^"]*"[^>]*)>/g, '<p$1 style="text-align: center !important; margin: 12px 0; line-height: 1.6; display: block;">')
        .replace(/<p([^>]*style="[^"]*text-align:\s*right[^"]*"[^>]*)>/g, '<p$1 style="text-align: right !important; margin: 12px 0; line-height: 1.6; display: block;">')
        .replace(/<p([^>]*style="[^"]*text-align:\s*justify[^"]*"[^>]*)>/g, '<p$1 style="text-align: justify !important; margin: 12px 0; line-height: 1.6; display: block;">')
        .replace(/<p([^>]*style="[^"]*text-align:\s*left[^"]*"[^>]*)>/g, '<p$1 style="text-align: left !important; margin: 12px 0; line-height: 1.6; display: block;">')
      
      // Handle headings with text alignment
      processedContent = processedContent
        .replace(/<h([1-6])([^>]*style="[^"]*text-align:\s*center[^"]*"[^>]*)>/g, '<h$1$2 style="text-align: center !important; font-weight: 700; margin: 20px 0 12px 0; line-height: 1.3; color: #202124; display: block;">')
        .replace(/<h([1-6])([^>]*style="[^"]*text-align:\s*right[^"]*"[^>]*)>/g, '<h$1$2 style="text-align: right !important; font-weight: 700; margin: 20px 0 12px 0; line-height: 1.3; color: #202124; display: block;">')
        .replace(/<h([1-6])([^>]*style="[^"]*text-align:\s*justify[^"]*"[^>]*)>/g, '<h$1$2 style="text-align: justify !important; font-weight: 700; margin: 20px 0 12px 0; line-height: 1.3; color: #202124; display: block;">')
        .replace(/<h([1-6])([^>]*style="[^"]*text-align:\s*left[^"]*"[^>]*)>/g, '<h$1$2 style="text-align: left !important; font-weight: 700; margin: 20px 0 12px 0; line-height: 1.3; color: #202124; display: block;">')
      
      // Handle divs with text alignment (TipTap sometimes wraps content in divs)
      processedContent = processedContent
        .replace(/<div([^>]*style="[^"]*text-align:\s*center[^"]*"[^>]*)>/g, '<div$1 style="text-align: center !important; margin: 12px 0; line-height: 1.6; display: block;">')
        .replace(/<div([^>]*style="[^"]*text-align:\s*right[^"]*"[^>]*)>/g, '<div$1 style="text-align: right !important; margin: 12px 0; line-height: 1.6; display: block;">')
        .replace(/<div([^>]*style="[^"]*text-align:\s*justify[^"]*"[^>]*)>/g, '<div$1 style="text-align: justify !important; margin: 12px 0; line-height: 1.6; display: block;">')
        .replace(/<div([^>]*style="[^"]*text-align:\s*left[^"]*"[^>]*)>/g, '<div$1 style="text-align: left !important; margin: 12px 0; line-height: 1.6; display: block;">')
      
      // Now handle elements without specific alignment (default to left)
      processedContent = processedContent
        .replace(/<p(?![^>]*text-align)([^>]*)>/g, '<p$1 style="margin: 12px 0; line-height: 1.6; text-align: left; display: block;">')
      
      // Enhanced heading styles (only for headings without alignment already set)
      processedContent = processedContent
        .replace(/<h1(?![^>]*text-align)([^>]*)>/g, '<h1$1 style="font-size: 28px; font-weight: 700; margin: 24px 0 16px 0; line-height: 1.3; color: #202124; text-align: left; display: block;">')
        .replace(/<h2(?![^>]*text-align)([^>]*)>/g, '<h2$1 style="font-size: 24px; font-weight: 600; margin: 20px 0 14px 0; line-height: 1.3; color: #202124; text-align: left; display: block;">')
        .replace(/<h3(?![^>]*text-align)([^>]*)>/g, '<h3$1 style="font-size: 20px; font-weight: 600; margin: 18px 0 12px 0; line-height: 1.3; color: #202124; text-align: left; display: block;">')
        .replace(/<h([4-6])(?![^>]*text-align)([^>]*)>/g, '<h$1$2 style="font-size: 16px; font-weight: 600; margin: 16px 0 10px 0; line-height: 1.3; color: #202124; text-align: left; display: block;">')
        
        // Enhanced list styling
        .replace(/<ul[^>]*>/g, '<ul style="margin: 12px 0; padding-left: 24px; line-height: 1.6;">')
        .replace(/<ol[^>]*>/g, '<ol style="margin: 12px 0; padding-left: 24px; line-height: 1.6;">')
        .replace(/<li[^>]*>/g, '<li style="margin: 6px 0; line-height: 1.6;">')
        
        // Enhanced blockquote styling
        .replace(/<blockquote[^>]*>/g, '<blockquote style="margin: 20px 0; padding: 16px 20px; border-left: 4px solid #e0e0e0; color: #5f6368; font-style: italic; background: #f8f9fa; border-radius: 4px;">')
        
        // Enhanced table styling
        .replace(/<table[^>]*>/g, '<table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">')
        .replace(/<td[^>]*>/g, '<td style="padding: 12px 16px; border: 1px solid #dadce0; line-height: 1.4;">')
        .replace(/<th[^>]*>/g, '<th style="padding: 12px 16px; border: 1px solid #dadce0; font-weight: 600; background: #f8f9fa; color: #202124;">')
        
        // Enhanced code styling
        .replace(/<code[^>]*>/g, '<code style="background: #f1f3f4; padding: 2px 6px; border-radius: 3px; font-family: monospace; font-size: 13px; color: #d73a49;">')
        .replace(/<pre[^>]*>/g, '<pre style="background: #f6f8fa; padding: 16px; border-radius: 6px; margin: 16px 0; font-family: monospace; font-size: 13px; line-height: 1.4; overflow-wrap: break-word; white-space: pre-wrap; border: 1px solid #e1e4e8;">')
        
        // Text formatting
        .replace(/<strong[^>]*>/g, '<strong style="font-weight: 700;">')
        .replace(/<em[^>]*>/g, '<em style="font-style: italic;">')
        .replace(/<u[^>]*>/g, '<u style="text-decoration: underline;">')
        
        // Clean up empty paragraphs
        .replace(/<p[^>]*><\/p>/g, '')
        .replace(/<p[^>]*><br[^>]*><\/p>/g, '')
      
      tempContainer.innerHTML = processedContent || '<p style="margin: 0;">No content to export</p>'
      
      // Add to DOM temporarily
      document.body.appendChild(tempContainer)
      
      // Generate canvas from HTML
      const canvas = await html2canvas.default(tempContainer, {
        scale: 2, // High resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794, // A4 width in pixels at 96 DPI
        windowWidth: 794,
        scrollX: 0,
        scrollY: 0
      })
      
      // Remove temporary container and style element
      document.body.removeChild(tempContainer)
      document.head.removeChild(styleElement)
      
      // Create PDF
      const imgData = canvas.toDataURL('image/png', 1.0)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      })
      
      // Calculate dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pdfWidth
      const imgHeight = (canvas.height * pdfWidth) / canvas.width
      
      let heightLeft = imgHeight
      let position = 0
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST')
      heightLeft -= pdfHeight
      
      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST')
        heightLeft -= pdfHeight
      }
      
      // Save the PDF
      pdf.save(`Document-${pages.length}-Pages.pdf`)
      
    } catch (error) {
      console.error('PDF generation failed:', error)
      alert('PDF generation failed. Please make sure you have a stable internet connection and try again.')
    }
  }


  // Export all pages as Word document
  const exportAllPagesAsWord = () => {
    if (!editor) return
    
    // Save current page content before export
    const currentContent = editor.getHTML()
    const updatedPageContents = {
      ...pageContents,
      [currentPageId]: currentContent
    }
    
    // Create a temporary container with all pages
    const tempContainer = document.createElement('div')
    tempContainer.style.cssText = `
      font-family: 'DM Sans', sans-serif;
      color: #202124;
      background: white;
      margin: 0;
      padding: 1in;
      line-height: 1.5;
    `
    
    // Add each page with page breaks
    pages.forEach((page, index) => {
      const pageContent = updatedPageContents[page.id] || '<p></p>'
      
      // Clean up the content
      const cleanedContent = pageContent
        .replace(/^<p><\/p>/g, '')
        .replace(/<p><\/p>$/g, '')
        .replace(/^<p><br[^>]*><\/p>/g, '')
        .replace(/<p><br[^>]*><\/p>$/g, '')
        .trim()
      
      // Add page break before each page (except the first)
      if (index > 0) {
        const pageBreak = document.createElement('div')
        pageBreak.style.cssText = 'page-break-before: always; margin: 0; padding: 0;'
        tempContainer.appendChild(pageBreak)
      }
      
      // Add page content with better formatting
      const pageDiv = document.createElement('div')
      pageDiv.className = 'tiptap ProseMirror'
      pageDiv.style.cssText = `
        font-family: 'DM Sans', sans-serif;
        font-size: 12pt;
        line-height: 1.5;
        color: #202124;
        margin: 0;
        padding: 0;
        text-align: left;
      `
      
      // Process content for better Word formatting
      const processedContent = cleanedContent
        .replace(/<p[^>]*style="[^"]*text-align:\s*center[^"]*"[^>]*>/g, '<p style="text-align: center; margin: 0.5em 0;">')
        .replace(/<p[^>]*style="[^"]*text-align:\s*right[^"]*"[^>]*>/g, '<p style="text-align: right; margin: 0.5em 0;">')
        .replace(/<p[^>]*style="[^"]*text-align:\s*justify[^"]*"[^>]*>/g, '<p style="text-align: justify; margin: 0.5em 0;">')
        .replace(/<p[^>]*>/g, '<p style="margin: 0.5em 0;">')
        .replace(/<h([1-6])[^>]*>/g, '<h$1 style="margin: 1em 0 0.5em 0; color: #202124; font-weight: bold;">')
        .replace(/<ul[^>]*>/g, '<ul style="margin: 0.5em 0; padding-left: 1.5em;">')
        .replace(/<ol[^>]*>/g, '<ol style="margin: 0.5em 0; padding-left: 1.5em;">')
        .replace(/<li[^>]*>/g, '<li style="margin: 0.25em 0;">')
        .replace(/<blockquote[^>]*>/g, '<blockquote style="margin: 1em 0; padding: 0.5em 1em; border-left: 3px solid #ddd; color: #666; font-style: italic;">')
      
      pageDiv.innerHTML = processedContent || '<p>Empty page</p>'
      tempContainer.appendChild(pageDiv)
    })
    
    // Export the combined content
    exportElementAsWord(tempContainer, {
      filename: `Document-${pages.length}-Pages`,
      title: `Document - ${pages.length} Pages`
    })
  }



  // Render miniature page preview with actual content styling
  const renderPagePreview = (pageId: string) => {
    const content = pageContents[pageId] || ''
    
    if (!content || content === '<p></p>') {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#ccc',
          fontSize: '2px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '4px', marginBottom: '0.5px' }}>📄</div>
            <div>Empty</div>
          </div>
        </div>
      )
    }

    // Create a more accurate HTML preview with better styling
    const previewContent = content
      // Handle headings with different sizes
      .replace(/<h1[^>]*>/g, '<div style="font-weight: bold; margin: 1px 0; font-size: 4px; line-height: 1.1;">')
      .replace(/<h2[^>]*>/g, '<div style="font-weight: bold; margin: 1px 0; font-size: 3.5px; line-height: 1.1;">')
      .replace(/<h3[^>]*>/g, '<div style="font-weight: bold; margin: 1px 0; font-size: 3px; line-height: 1.1;">')
      .replace(/<h[4-6][^>]*>/g, '<div style="font-weight: bold; margin: 1px 0; font-size: 2.5px; line-height: 1.1;">')
      .replace(/<\/h[1-6]>/g, '</div>')
      
      // Handle paragraphs
      .replace(/<p[^>]*>/g, '<div style="margin: 0.5px 0; font-size: 2.5px; line-height: 1.0;">')
      .replace(/<\/p>/g, '</div>')
      
      // Handle text formatting
      .replace(/<strong[^>]*>/g, '<span style="font-weight: bold;">')
      .replace(/<\/strong>/g, '</span>')
      .replace(/<b[^>]*>/g, '<span style="font-weight: bold;">')
      .replace(/<\/b>/g, '</span>')
      .replace(/<em[^>]*>/g, '<span style="font-style: italic;">')
      .replace(/<\/em>/g, '</span>')
      .replace(/<i[^>]*>/g, '<span style="font-style: italic;">')
      .replace(/<\/i>/g, '</span>')
      .replace(/<u[^>]*>/g, '<span style="text-decoration: underline;">')
      .replace(/<\/u>/g, '</span>')
      
      // Handle lists with better spacing
      .replace(/<ul[^>]*>/g, '<div style="margin: 1px 0; padding-left: 1px;">')
      .replace(/<ol[^>]*>/g, '<div style="margin: 1px 0; padding-left: 1px;">')
      .replace(/<\/[uo]l>/g, '</div>')
      .replace(/<li[^>]*>/g, '<div style="margin: 0; font-size: 2px; line-height: 1.0;">• ')
      .replace(/<\/li>/g, '</div>')
      
      // Handle blockquotes
      .replace(/<blockquote[^>]*>/g, '<div style="margin: 1px 0; padding-left: 2px; border-left: 0.5px solid #ccc; font-size: 2px;">')
      .replace(/<\/blockquote>/g, '</div>')
      
      // Handle code blocks
      .replace(/<pre[^>]*>/g, '<div style="background: #f5f5f5; padding: 1px; margin: 1px 0; font-family: monospace; font-size: 2px;">')
      .replace(/<\/pre>/g, '</div>')
      .replace(/<code[^>]*>/g, '<span style="background: #f5f5f5; padding: 0.5px; font-family: monospace; font-size: 2px;">')
      .replace(/<\/code>/g, '</span>')
      
      // Handle images as placeholders
      .replace(/<img[^>]*>/g, '<div style="width: 8px; height: 6px; background: #e0e0e0; margin: 1px 0; display: inline-block; border: 0.5px solid #ccc;"></div>')
      
      // Handle tables
      .replace(/<table[^>]*>/g, '<div style="border: 0.5px solid #ccc; margin: 1px 0;">')
      .replace(/<\/table>/g, '</div>')
      .replace(/<tr[^>]*>/g, '<div style="display: flex;">')
      .replace(/<\/tr>/g, '</div>')
      .replace(/<t[hd][^>]*>/g, '<div style="border: 0.5px solid #ccc; padding: 0.5px; font-size: 2px; flex: 1;">')
      .replace(/<\/t[hd]>/g, '</div>')
      
      // Remove any remaining HTML tags
      .replace(/<[^>]*>/g, '')
      // Clean up extra whitespace
      .replace(/\s+/g, ' ')
      .trim()

    const maxLength = 300 // Show more content for better preview
    const truncatedContent = previewContent.length > maxLength 
      ? previewContent.substring(0, maxLength) + '...' 
      : previewContent

    return (
      <div 
        style={{
          fontSize: '2.5px',
          lineHeight: '1.0',
          color: '#666',
          height: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          wordWrap: 'break-word',
          padding: '1px'
        }}
        dangerouslySetInnerHTML={{ __html: truncatedContent }}
      />
    )
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
  <div className="simple-editor-wrapper" style={{ 
    paddingLeft: 80, /* space for pages sidebar */
    paddingRight: versions.length > 0 ? 80 : 0 /* leave space for versions sidebar */ 
  }}>
    <EditorContext.Provider value={{ editor }}>
      
      {/* --- Pages Sidebar --- */}
      <div
        className="pages-sidebar"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "280px",
          height: "100dvh",
          padding: "1rem",
          backgroundColor: "#f8f9fa",
          borderRight: "1px solid #e8eaed",
          overflowY: "auto",
          zIndex: 1000,
          boxShadow: "2px 0 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: "1rem"
        }}>
          <h4 style={{ 
            margin: "0", 
            fontSize: "16px", 
            fontWeight: "500", 
            color: "#202124" 
          }}>Pages</h4>
          <button
            onClick={addNewPage}
            style={{
              padding: "0.5rem",
              fontSize: "12px",
              border: "1px solid #dadce0",
              borderRadius: "4px",
              backgroundColor: "#1a73e8",
              color: "white",
              cursor: "pointer",
              fontWeight: "500",
            }}
            onMouseOver={(e) => {
              const target = e.currentTarget as HTMLButtonElement;
              target.style.backgroundColor = "#1557b0";
            }}
            onMouseOut={(e) => {
              const target = e.currentTarget as HTMLButtonElement;
              target.style.backgroundColor = "#1a73e8";
            }}
          >
            + Add Page
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
          {pages.map((page) => (
            <div
              key={page.id}
              style={{
                padding: "0.5rem", // Reduced padding
                backgroundColor: currentPageId === page.id ? "#e8f0fe" : "white",
                borderRadius: "6px", // Slightly smaller radius
                border: currentPageId === page.id ? "2px solid #1a73e8" : "1px solid #e8eaed",
                boxShadow: "0 1px 2px rgba(60, 64, 67, 0.1)",
                transition: "all 0.2s ease"
              }}
            >
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                marginBottom: "0.3rem" // Reduced margin
              }}>
                <span style={{ 
                  fontSize: "14px", 
                  fontWeight: currentPageId === page.id ? "600" : "500", 
                  color: currentPageId === page.id ? "#1a73e8" : "#202124" 
                }}>{page.title}</span>
                {pages.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removePage(page.id);
                    }}
                    style={{
                      width: "20px",
                      height: "20px",
                      border: "none",
                      borderRadius: "50%",
                      backgroundColor: "#ea4335",
                      color: "white",
                      cursor: "pointer",
                      fontSize: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                    title="Remove page"
                  >
                    ×
                  </button>
                )}
              </div>
              <div 
                className={`sidebar-page-preview ${currentPageId === page.id ? 'active' : ''}`}
                onClick={() => switchToPage(page.id)}
              >
                <div className="sidebar-page-number">
                  {page.id}
                </div>
                <div className="sidebar-page-content">
                  {renderPagePreview(page.id)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Top Navigation Bar */}
      <div style={{
        backgroundColor: "white !important",
        borderBottom: "1px solid #e8eaed",
        padding: "0.75rem 1rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 11,
        boxShadow: "0 1px 2px rgba(60, 64, 67, 0.1)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{
            width: "40px",
            height: "40px",
            backgroundColor: "#4285f4",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            fontSize: "16px"
          }}>
            📝
          </div>
          <span style={{ fontSize: "16px", color: "#202124", fontWeight: "400" }}>
            Document Editor
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <ThemeToggle />
        </div>
      </div>
      
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
          {/* <Button
            type="button"
            data-style="ghost"
            onClick={insertPageBreak}
            title="Insert Page Break"
          >
            📄 Page Break
          </Button> */}
          <Button
            type="button"
            data-style="ghost"
            onClick={exportAllPagesAsPdf}
            title="Export all pages as PDF"
          >
            Export PDF
          </Button>
          <Button
            type="button"
            data-style="ghost"
            onClick={exportAllPagesAsWord}
            title="Export all pages as Word document"
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
        style={{ marginTop: "1rem" }}
      >
        <div className="pages-container">
          <div
            className="a4-page"
            data-page-number={currentPageId}
            data-page-id={currentPageId}
            style={{
              border: '2px solid #1a73e8',
            }}
          >
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '20px',
              fontSize: '12px',
              color: '#5f6368',
              fontWeight: '500'
            }}>
              Page {currentPageId} of {pages.length}
            </div>
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </EditorContext.Provider>

    {/* --- Version Sidebar --- */}
    {versions.length > 0 && (
      <div
        className="versions-sidebar"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "280px",
          height: "100dvh",
          padding: "1rem",
          backgroundColor: "#f8f9fa",
          borderLeft: "1px solid #e8eaed",
          overflowY: "auto",
          zIndex: 1000,
          boxShadow: "-2px 0 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h4 style={{ 
          margin: "0 0 1rem 0", 
          fontSize: "16px", 
          fontWeight: "500", 
          color: "#202124" 
        }}>Version History</h4>

        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {versions.map((v, i) => (
            <li
              key={i}
              style={{
                padding: "0.75rem",
                marginBottom: "0.5rem",
                backgroundColor: "white",
                borderRadius: "8px",
                border: "1px solid #e8eaed",
                boxShadow: "0 1px 2px rgba(60, 64, 67, 0.1)",
              }}
            >
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                marginBottom: "0.5rem"
              }}>
                <span style={{ 
                  fontSize: "14px", 
                  fontWeight: "500", 
                  color: "#202124" 
                }}>{`Version ${i + 1}`}</span>
                <span style={{ 
                  fontSize: "12px", 
                  color: "#5f6368" 
                }}>{new Date().toLocaleDateString()}</span>
              </div>
              <button
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  fontSize: "14px",
                  border: "1px solid #dadce0",
                  borderRadius: "4px",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                  color: "#1a73e8",
                  fontWeight: "500",
                }}
                onClick={() => restoreVersion(i)}
                onMouseOver={(e) => {
                  const target = e.currentTarget as HTMLButtonElement;
                  target.style.backgroundColor = "#f8f9fa";
                }}
                onMouseOut={(e) => {
                  const target = e.currentTarget as HTMLButtonElement;
                  target.style.backgroundColor = "#fff";
                }}
              >
                Restore this version
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