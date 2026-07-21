import { Alert, Form, Input } from 'antd';
import EditableTableField from './EditableTableField';
import RichTextField from './RichTextField';
import { useReportPage } from './ReportPageContext';
import {
  getFieldRules,
  getReadonlyFieldValue,
  isEmptyFieldValue,
} from './report-field-utils';

const SECTION_ORDER_PREFIX_PATTERN = /^(?:[一二三四五六七八九十]+、|（[一二三四五六七八九十]+）)\s*/;

const getSectionName = (title) => title.replace(SECTION_ORDER_PREFIX_PATTERN, '');

const FieldRenderer = ({ depth, field }) => {
  const { isReadonly } = useReportPage();
  const fieldName = field.fieldName || 'content';
  const name = ['sections', field.sectionId, fieldName];
  const rules = getFieldRules(field, `请填写${getSectionName(field.title)}`);

  if (field.fieldType === 'richText') {
    return (
      <RichTextField
        field={field}
        name={name}
        validationTitle={getSectionName(field.title)}
      />
    );
  }

  if (isReadonly && ['input', 'textarea'].includes(field.fieldType)) {
    return (
      <Form.Item noStyle shouldUpdate>
        {({ getFieldValue }) => {
          const value = getFieldValue(name);

          return (
            <div
              className={`report-field-value${isEmptyFieldValue(value) ? ' report-field-value--empty' : ''}`}
            >
              {getReadonlyFieldValue(value)}
            </div>
          );
        }}
      </Form.Item>
    );
  }

  if (field.fieldType === 'textarea') {
    return (
      <Form.Item name={name} rules={rules}>
        <Input.TextArea
          autoSize={{ minRows: depth === 1 ? 5 : 3, maxRows: 8 }}
          disabled={isReadonly || field.editable === false}
          placeholder={`请填写${field.title}相关内容`}
        />
      </Form.Item>
    );
  }

  if (field.fieldType === 'input') {
    return (
      <Form.Item name={name} rules={rules}>
        <Input
          disabled={isReadonly || field.editable === false}
          placeholder={`请填写${field.title}`}
        />
      </Form.Item>
    );
  }

  if (field.fieldType === 'editableTable') {
    return <EditableTableField field={field} name={name} />;
  }

  return import.meta.env.DEV ? (
    <Alert
      message={`暂不支持字段类型：${field.fieldType || '未配置'}`}
      showIcon
      type="warning"
    />
  ) : null;
};

export default FieldRenderer;
