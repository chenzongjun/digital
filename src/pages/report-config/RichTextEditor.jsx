import { useEffect, useMemo, useState } from 'react';
import { Editor, Toolbar } from '@wangeditor/editor-for-react';
import '@wangeditor/editor/dist/css/style.css';

const EXCLUDED_TOOLBAR_KEYS = [
  'uploadImage',
  'insertVideo',
  'uploadVideo',
  'group-video',
];

const RichTextEditor = ({
  disabled = false,
  onChange,
  placeholder = '请输入内容',
  value = '',
}) => {
  const [editor, setEditor] = useState(null);
  const toolbarConfig = useMemo(
    () => ({ excludeKeys: EXCLUDED_TOOLBAR_KEYS }),
    [],
  );
  const editorConfig = useMemo(
    () => ({
      autoFocus: false,
      placeholder,
      readOnly: disabled,
    }),
    [disabled, placeholder],
  );

  useEffect(() => {
    if (!editor || editor.isDestroyed) {
      return;
    }

    if (disabled) {
      editor.disable();
      return;
    }

    editor.enable();
  }, [disabled, editor]);

  useEffect(() => {
    return () => {
      if (!editor || editor.isDestroyed) {
        return;
      }

      editor.destroy();
      setEditor(null);
    };
  }, [editor]);

  return (
    <div className={`rich-text-editor${disabled ? ' rich-text-editor--readonly' : ''}`}>
      {!disabled && (
        <Toolbar
          defaultConfig={toolbarConfig}
          editor={editor}
          mode="default"
        />
      )}
      <Editor
        defaultConfig={editorConfig}
        mode="default"
        value={value || ''}
        onChange={(currentEditor) => onChange?.(currentEditor.getHtml())}
        onCreated={setEditor}
      />
    </div>
  );
};

export default RichTextEditor;
