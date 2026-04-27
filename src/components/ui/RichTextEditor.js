import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';

/* ── Botón de la barra de herramientas ── */
function ToolBtn({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`w-8 h-8 flex items-center justify-center rounded text-sm transition-colors ${
        active
          ? 'bg-[#C9922A] text-black font-bold'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );
}

/* ── Separador ── */
function Sep() {
  return <div className="w-px h-6 bg-gray-200 mx-1" />;
}

export default function RichTextEditor({ value, onChange, placeholder = 'Escribe la descripción aquí...' }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList:   { HTMLAttributes: { class: 'rte-ul' } },
        orderedList:  { HTMLAttributes: { class: 'rte-ol' } },
        blockquote:   { HTMLAttributes: { class: 'rte-blockquote' } },
        heading:      { levels: [2, 3, 4] },
      }),
      Underline,
      TextStyle,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'rte-content',
        'data-placeholder': placeholder,
      },
    },
  });

  if (!editor) return null;

  const btn = (label, action, isActive, title) => (
    <ToolBtn key={label} onClick={action} active={isActive} title={title}>
      {label}
    </ToolBtn>
  );

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#C9922A] focus-within:ring-1 focus-within:ring-[#C9922A] transition-all">
      {/* ── Barra de herramientas ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200">

        {/* Formato de texto */}
        {btn('B',  () => editor.chain().focus().toggleBold().run(),      editor.isActive('bold'),      'Negrita')}
        {btn('I',  () => editor.chain().focus().toggleItalic().run(),    editor.isActive('italic'),    'Cursiva')}
        {btn('U',  () => editor.chain().focus().toggleUnderline().run(), editor.isActive('underline'), 'Subrayado')}
        {btn('S',  () => editor.chain().focus().toggleStrike().run(),    editor.isActive('strike'),    'Tachado')}

        <Sep />

        {/* Encabezados */}
        {btn('H2', () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading', { level: 2 }), 'Título grande')}
        {btn('H3', () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive('heading', { level: 3 }), 'Título mediano')}
        {btn('H4', () => editor.chain().focus().toggleHeading({ level: 4 }).run(), editor.isActive('heading', { level: 4 }), 'Título pequeño')}

        <Sep />

        {/* Listas */}
        {btn('• —', () => editor.chain().focus().toggleBulletList().run(),  editor.isActive('bulletList'),  'Lista con viñetas')}
        {btn('1 —', () => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList'), 'Lista numerada')}

        <Sep />

        {/* Alineación */}
        {btn('«', () => editor.chain().focus().setTextAlign('left').run(),    editor.isActive({ textAlign: 'left' }),    'Alinear izquierda')}
        {btn('=', () => editor.chain().focus().setTextAlign('center').run(),  editor.isActive({ textAlign: 'center' }),  'Centrar')}
        {btn('»', () => editor.chain().focus().setTextAlign('right').run(),   editor.isActive({ textAlign: 'right' }),   'Alinear derecha')}

        <Sep />

        {/* Cita */}
        {btn('" "', () => editor.chain().focus().toggleBlockquote().run(), editor.isActive('blockquote'), 'Cita')}

        <Sep />

        {/* Deshacer / Rehacer */}
        {btn('↩', () => editor.chain().focus().undo().run(), false, 'Deshacer')}
        {btn('↪', () => editor.chain().focus().redo().run(), false, 'Rehacer')}
      </div>

      {/* ── Área de edición ── */}
      <EditorContent editor={editor} className="rte-wrapper" />
    </div>
  );
}
