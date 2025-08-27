// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'
// import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'

import '@/styles/_keyframe-animations.scss'
import '@/styles/_variables.scss'
import { SimpleEditor } from './components/tiptap-templates/simple/simple-editor'

export default function App() {
  // const editor = useEditor({
  //   extensions: [
  //     StarterKit,
  //     Underline,
  //     TextAlign.configure({ types: ['heading', 'paragraph'] }),
  //     Image.configure({ inline: false }),
  //     // Table.configure({ resizable: true }),
  //     TableRow,
  //     TableHeader,
  //     TableCell,
  //   ],
  //   content: '<p>Hello World!</p>',
  // })

  return <SimpleEditor />
}

