'use client';

import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Link } from '@tiptap/extension-link';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Unlink,
  Undo,
  Redo,
  Table as TableIcon,
  Plus,
  Trash2,
  Columns,
  Rows,
} from 'lucide-react';

export default function PolicyEditor({ content, onChange, placeholder = 'Write policy content here...' }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#EB1000] underline font-medium hover:text-white transition-colors',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'w-full border-collapse my-4 border border-[#222234] rounded-lg overflow-hidden',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'border-b border-[#222234]',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'bg-[#181826] text-white font-bold text-left p-3 border border-[#222234]',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'p-3 border border-[#222234] text-sm text-[#D0D0E0]',
        },
      }),
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class:
          'prose prose-invert max-w-none min-h-[350px] p-5 focus:outline-none text-[#E0E0EC] leading-relaxed text-sm sm:text-base font-normal selection:bg-[#EB1000] selection:text-white',
      },
    },
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
    immediatelyRender: false,
  });

  // Keep editor content in sync when external prop changes (e.g. switching policies)
  useEffect(() => {
    if (editor && content !== undefined && editor.getHTML() !== content) {
      editor.commands.setContent(content || '', false);
    }
  }, [content, editor]);

  if (!mounted || !editor) {
    return (
      <div className="w-full h-80 rounded-2xl bg-[#0F0F18] border border-[#1E1E2E] flex items-center justify-center text-sm text-[#707085]">
        Initializing TipTap Policy Editor...
      </div>
    );
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter link URL (e.g. https://... or /terms-and-conditions):', previousUrl || '');

    if (url === null) return;
    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div className="w-full rounded-2xl bg-[#0A0A10] border border-[#1E1E2E] overflow-hidden focus-within:border-[#EB1000]/60 transition-all shadow-inner">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-[#10101C] border-b border-[#1E1E2E] text-xs">
        {/* Headings */}
        <div className="flex items-center gap-0.5 border-r border-[#222235] pr-1.5 mr-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1.5 rounded-lg transition ${
              editor.isActive('heading', { level: 1 })
                ? 'bg-[#EB1000] text-white'
                : 'text-[#A0A0B2] hover:text-white hover:bg-[#1A1A2A]'
            }`}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded-lg transition ${
              editor.isActive('heading', { level: 2 })
                ? 'bg-[#EB1000] text-white'
                : 'text-[#A0A0B2] hover:text-white hover:bg-[#1A1A2A]'
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-1.5 rounded-lg transition ${
              editor.isActive('heading', { level: 3 })
                ? 'bg-[#EB1000] text-white'
                : 'text-[#A0A0B2] hover:text-white hover:bg-[#1A1A2A]'
            }`}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>
        </div>

        {/* Inline Formatting */}
        <div className="flex items-center gap-0.5 border-r border-[#222235] pr-1.5 mr-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded-lg transition ${
              editor.isActive('bold') ? 'bg-[#EB1000] text-white' : 'text-[#A0A0B2] hover:text-white hover:bg-[#1A1A2A]'
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded-lg transition ${
              editor.isActive('italic') ? 'bg-[#EB1000] text-white' : 'text-[#A0A0B2] hover:text-white hover:bg-[#1A1A2A]'
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded-lg transition ${
              editor.isActive('blockquote') ? 'bg-[#EB1000] text-white' : 'text-[#A0A0B2] hover:text-white hover:bg-[#1A1A2A]'
            }`}
            title="Callout Blockquote"
          >
            <Quote className="w-4 h-4" />
          </button>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-0.5 border-r border-[#222235] pr-1.5 mr-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded-lg transition ${
              editor.isActive('bulletList') ? 'bg-[#EB1000] text-white' : 'text-[#A0A0B2] hover:text-white hover:bg-[#1A1A2A]'
            }`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded-lg transition ${
              editor.isActive('orderedList') ? 'bg-[#EB1000] text-white' : 'text-[#A0A0B2] hover:text-white hover:bg-[#1A1A2A]'
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>

        {/* Links */}
        <div className="flex items-center gap-0.5 border-r border-[#222235] pr-1.5 mr-1">
          <button
            type="button"
            onClick={setLink}
            className={`p-1.5 rounded-lg transition ${
              editor.isActive('link') ? 'bg-[#EB1000] text-white' : 'text-[#A0A0B2] hover:text-white hover:bg-[#1A1A2A]'
            }`}
            title="Insert Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          {editor.isActive('link') && (
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetLink().run()}
              className="p-1.5 rounded-lg text-rose-400 hover:bg-[#1A1A2A] transition"
              title="Remove Link"
            >
              <Unlink className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tables */}
        <div className="flex items-center gap-0.5 border-r border-[#222235] pr-1.5 mr-1">
          <button
            type="button"
            onClick={insertTable}
            className={`p-1.5 rounded-lg transition ${
              editor.isActive('table') ? 'bg-[#EB1000] text-white' : 'text-[#A0A0B2] hover:text-white hover:bg-[#1A1A2A]'
            }`}
            title="Insert Table (3x3)"
          >
            <TableIcon className="w-4 h-4" />
          </button>
          {editor.isActive('table') && (
            <>
              <button
                type="button"
                onClick={() => editor.chain().focus().addColumnAfter().run()}
                className="p-1 px-1.5 text-[10px] rounded bg-[#1B1B2A] text-white hover:bg-[#252538] transition"
                title="Add Column"
              >
                + Col
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteColumn().run()}
                className="p-1 px-1.5 text-[10px] rounded bg-[#1B1B2A] text-rose-400 hover:bg-[#252538] transition"
                title="Delete Column"
              >
                - Col
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().addRowAfter().run()}
                className="p-1 px-1.5 text-[10px] rounded bg-[#1B1B2A] text-white hover:bg-[#252538] transition"
                title="Add Row"
              >
                + Row
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteRow().run()}
                className="p-1 px-1.5 text-[10px] rounded bg-[#1B1B2A] text-rose-400 hover:bg-[#252538] transition"
                title="Delete Row"
              >
                - Row
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteTable().run()}
                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 transition"
                title="Delete Table"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 ml-auto">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded-lg text-[#A0A0B2] hover:text-white hover:bg-[#1A1A2A] disabled:opacity-30 transition"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded-lg text-[#A0A0B2] hover:text-white hover:bg-[#1A1A2A] disabled:opacity-30 transition"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* TipTap Document Area */}
      <div className="min-h-[350px] max-h-[550px] overflow-y-auto bg-[#0A0A10]/80">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

