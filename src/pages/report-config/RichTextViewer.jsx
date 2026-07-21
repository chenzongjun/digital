import { isRichTextEmpty } from './report-field-utils';

const RichTextViewer = ({ value }) => {
  if (isRichTextEmpty(value)) {
    return <div className="rich-text-viewer rich-text-viewer--empty">--</div>;
  }

  return (
    <div
      className="rich-text-viewer"
      dangerouslySetInnerHTML={{ __html: value }}
    />
  );
};

export default RichTextViewer;
