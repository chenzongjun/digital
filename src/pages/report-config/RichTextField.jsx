import { Form } from 'antd';
import RichTextEditor from './RichTextEditor';
import RichTextViewer from './RichTextViewer';
import { useReportPage } from './ReportPageContext';
import { getRichTextRules } from './report-field-utils';

const RichTextField = ({ field, name, validationTitle }) => {
  const { isReadonly } = useReportPage();

  if (isReadonly) {
    return (
      <Form.Item noStyle shouldUpdate>
        {({ getFieldValue }) => (
          <RichTextViewer value={getFieldValue(name)} />
        )}
      </Form.Item>
    );
  }

  return (
    <Form.Item
      className="rich-text-field"
      name={name}
      rules={getRichTextRules(field, validationTitle)}
    >
      <RichTextEditor
        disabled={field.editable === false}
        placeholder={`请输入${field.title}相关内容`}
      />
    </Form.Item>
  );
};

export default RichTextField;
