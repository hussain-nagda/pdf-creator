import React, { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import SnapshotCompare from '@tiptap-pro/extension-snapshot-compare'

export default function VersionedEditor() {
  const [versions, setVersions] = useState([])
  const [oldVersion, setOldVersion] = useState(null)
  const [newVersion, setNewVersion] = useState(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      SnapshotCompare.configure({
        licenseKey: 'YOUR_KEY',
      }),
    ],
    content: '<p>Start writing...</p>',
  })

  const saveVersion = () => {
    if (!editor) return
    const content = editor.getHTML()
    const version = versions.length + 1
    setVersions([...versions, { version, content }])
  }

  const compareVersions = () => {
    if (!editor || !oldVersion || !newVersion) return
    editor.commands.setSnapshots({
      old: oldVersion.content,
      new: newVersion.content,
    })
    editor.commands.toggleSnapshotCompare()
  }

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <button type="button" onClick={saveVersion}>💾 Save Version</button>

        <select
          onChange={(e) =>
            setOldVersion(versions.find(v => v.version == e.target.value))
          }>
          <option>Select Old Version</option>
          {versions.map(v => (
            <option key={v.version} value={v.version}>
              Version {v.version}
            </option>
          ))}
        </select>

        <select
          onChange={(e) =>
            setNewVersion(versions.find(v => v.version == e.target.value))
          }>
          <option>Select New Version</option>
          {versions.map(v => (
            <option key={v.version} value={v.version}>
              Version {v.version}
            </option>
          ))}
        </select>

        <button type="button" onClick={compareVersions}>🔍 Compare</button>
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}
