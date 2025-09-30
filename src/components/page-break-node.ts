import { Node } from '@tiptap/core'
import "../components/tiptap-templates/simple/simple-editor.scss"

export const PageBreak = Node.create({
  name: 'pageBreak',

  group: 'block',

  selectable: false,
  atom: true, // behaves like a single block element

  parseHTML() {
    return [{ tag: 'div.page-break' }]
  },

  renderHTML() {
    return ['div', { class: 'page-break' }]
  },

  addCommands() {
    return {
      insertPageBreak: () => ({ commands }) => {
        return commands.insertContent('<div class="page-break"></div>')
      },
    }
  },
})
