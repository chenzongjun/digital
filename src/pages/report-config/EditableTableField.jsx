import {
  DeleteOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import {
  Button,
  Checkbox,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Space,
  Table,
  Tooltip,
  Typography,
} from 'antd';
import { useReportPage } from './ReportPageContext';
import {
  createTemporaryId,
  DEFAULT_DATE_FORMAT,
  getFieldRules,
  getReadonlyTableValue,
  isEmptyFieldValue,
  parseDatePickerValue,
} from './report-field-utils';

const RESERVED_CONTROL_PROPS = new Set([
  'value',
  'onChange',
  'disabled',
  'options',
  'mode',
]);
const DEFAULT_COLUMN_WIDTH = 220;
const ACTION_COLUMN_WIDTH = 96;

const getEmptyRow = (columns) => {
  return columns.reduce(
    (row, column) => ({ ...row, [column.name]: undefined }),
    { rowId: createTemporaryId('table-row') },
  );
};

const getTableScrollWidth = (columns, hasActionColumn) => {
  const columnsWidth = columns.reduce(
    (total, column) => total + (column.width || DEFAULT_COLUMN_WIDTH),
    0,
  );

  return columnsWidth + (hasActionColumn ? ACTION_COLUMN_WIDTH : 0);
};

const getComponentProps = (componentProps = {}) => {
  return Object.fromEntries(
    Object.entries(componentProps).filter(([name]) => !RESERVED_CONTROL_PROPS.has(name)),
  );
};

const StringDatePicker = ({ value, onChange, ...componentProps }) => {
  const format = componentProps.format || DEFAULT_DATE_FORMAT;
  const parsedValue = isEmptyFieldValue(value)
    ? null
    : parseDatePickerValue(value, format);

  return (
    <DatePicker
      {...componentProps}
      format={format}
      value={parsedValue?.isValid() ? parsedValue : null}
      onChange={(dateValue, dateString) => {
        onChange?.(dateValue ? dateString : undefined);
      }}
    />
  );
};

const ReadonlyTableCell = ({ column, value }) => {
  const displayValue = getReadonlyTableValue(column, value);
  const isEmpty = isEmptyFieldValue(value);

  return (
    <Typography.Text
      className={`editable-table-field__readonly-value${isEmpty ? ' report-field-value--empty' : ''}`}
      ellipsis={isEmpty ? true : { tooltip: displayValue }}
    >
      {displayValue}
    </Typography.Text>
  );
};

const renderColumnControl = (column) => {
  const componentProps = getComponentProps(column.componentProps);
  const disabled = column.editable === false || column.componentProps?.disabled === true;
  const controlProps = { ...componentProps, disabled };

  const controlMap = {
    input: <Input {...controlProps} />,
    inputNumber: <InputNumber {...controlProps} />,
    textArea: <Input.TextArea {...controlProps} />,
    DatePicker: <StringDatePicker {...controlProps} />,
    radio: <Radio.Group {...controlProps} options={column.options || []} />,
    checkbox: <Checkbox.Group {...controlProps} options={column.options || []} />,
    select: <Select {...controlProps} options={column.options || []} />,
    multipleSelect: (
      <Select {...controlProps} mode="multiple" options={column.options || []} />
    ),
  };

  if (controlMap[column.fieldType]) {
    return controlMap[column.fieldType];
  }

  return import.meta.env.DEV
    ? <span className="report-field-error">暂不支持表格字段类型：{column.fieldType}</span>
    : null;
};

const renderColumnTitle = (column) => (
  <span className="editable-table-field__column-title">
    {column.required && (
      <span aria-hidden="true" className="editable-table-field__required-mark">
        *
      </span>
    )}
    <span>{column.title}</span>
    {column.tooltip && (
      <Tooltip title={column.tooltip} trigger={['hover', 'focus']}>
        <QuestionCircleOutlined
          aria-label={`${column.title}说明`}
          className="editable-table-field__tooltip-icon"
          role="img"
          tabIndex={0}
        />
      </Tooltip>
    )}
  </span>
);

const EditableTableField = ({ field, name }) => {
  const { isReadonly } = useReportPage();
  const columns = field.columns || [];

  if (isReadonly) {
    const tableColumns = columns.map((column, columnIndex) => ({
      dataIndex: column.name,
      ellipsis: true,
      fixed: column.fixed ?? (columnIndex === 0 ? 'left' : undefined),
      title: renderColumnTitle(column),
      width: column.width || DEFAULT_COLUMN_WIDTH,
      render: (value) => <ReadonlyTableCell column={column} value={value} />,
    }));

    return (
      <Form.Item noStyle shouldUpdate>
        {({ getFieldValue }) => (
          <div className="editable-table-field editable-table-field--readonly">
            <Table
              bordered
              columns={tableColumns}
              dataSource={getFieldValue(name) || []}
              locale={{ emptyText: '--' }}
              pagination={false}
              rowKey="rowId"
              scroll={{ x: getTableScrollWidth(columns, false) }}
              tableLayout="fixed"
            />
          </div>
        )}
      </Form.Item>
    );
  }

  return (
    <Form.List name={name}>
      {(rows, { add, remove }) => {
        const tableColumns = columns.map((column, columnIndex) => ({
          dataIndex: column.name,
          fixed: column.fixed ?? (columnIndex === 0 ? 'left' : undefined),
          title: renderColumnTitle(column),
          width: column.width || DEFAULT_COLUMN_WIDTH,
          render: (_, row) => (
            <Form.Item
              name={[row.name, column.name]}
              rules={getFieldRules(column, `请填写${column.title}`)}
            >
              {column.fieldType === 'text'
                ? <ReadonlyTableCell column={column} />
                : renderColumnControl(column)}
            </Form.Item>
          ),
        }));

        if (!isReadonly) {
          tableColumns.push({
            align: 'center',
            fixed: 'right',
            key: 'actions',
            title: '操作',
            width: ACTION_COLUMN_WIDTH,
            render: (_, row) => (
              <Space size={0}>
                <Tooltip title="在此行后新增一行">
                  <Button
                    aria-label="在此行后新增一行"
                    icon={<PlusOutlined />}
                    type="text"
                    onClick={() => add(getEmptyRow(columns), row.name + 1)}
                  />
                </Tooltip>
                <Tooltip title="删除此行">
                  <Button
                    aria-label="删除此行"
                    danger
                    icon={<DeleteOutlined />}
                    type="text"
                    onClick={() => remove(row.name)}
                  />
                </Tooltip>
              </Space>
            ),
          });
        }

        return (
          <div className="editable-table-field">
            <Table
              bordered
              columns={tableColumns}
              dataSource={rows}
              locale={{ emptyText: '暂无评价数据' }}
              pagination={false}
              rowKey="key"
              scroll={{ x: getTableScrollWidth(columns, true) }}
              tableLayout="fixed"
            />
            {rows.map((row) => (
              <Form.Item key={row.key} hidden name={[row.name, 'rowId']}>
                <Input />
              </Form.Item>
            ))}
          </div>
        );
      }}
    </Form.List>
  );
};

export default EditableTableField;
