import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, Space, Table, Tooltip } from 'antd';
import { useReportPage } from './ReportPageContext';
import {
  createTemporaryId,
  getFieldRules,
  getReadonlyFieldValue,
  isEmptyFieldValue,
} from './report-field-utils';

const getEmptyRow = (columns) => {
  return columns.reduce(
    (row, column) => ({ ...row, [column.name]: undefined }),
    { rowId: createTemporaryId('table-row') },
  );
};

const renderColumnControl = (column, isReadonly) => {
  if (column.fieldType === 'input') {
    return (
      <Input
        disabled={isReadonly || column.editable === false}
        placeholder={column.placeholder}
      />
    );
  }

  return import.meta.env.DEV
    ? <span className="report-field-error">暂不支持表格字段类型：{column.fieldType}</span>
    : null;
};

const EditableTableField = ({ field, name }) => {
  const { isReadonly } = useReportPage();
  const columns = field.columns || [];

  if (isReadonly) {
    const tableColumns = columns.map((column, columnIndex) => ({
      dataIndex: column.name,
      fixed: column.fixed ?? (columnIndex === 0 ? 'left' : undefined),
      title: column.title,
      width: column.width || 220,
      render: (value) => (
        <span className={isEmptyFieldValue(value) ? 'report-field-value--empty' : undefined}>
          {getReadonlyFieldValue(value)}
        </span>
      ),
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
              scroll={{ x: 'max-content' }}
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
          title: column.title,
          width: column.width || 220,
          render: (_, row) => (
            <Form.Item
              name={[row.name, column.name]}
              rules={getFieldRules(column, `请填写${column.title}`)}
            >
              {renderColumnControl(column, isReadonly)}
            </Form.Item>
          ),
        }));

        if (!isReadonly) {
          tableColumns.push({
            align: 'center',
            fixed: 'right',
            key: 'actions',
            title: '操作',
            width: 96,
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
              scroll={{ x: 'max-content' }}
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
