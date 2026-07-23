import { Button, Form, Select } from 'antd';
import { useReportPage } from './ReportPageContext';

const OWNER_OPTIONS = [
  { label: '张三', value: 'zhangsan' },
  { label: '李四', value: 'lisi' },
  { label: '王五', value: 'wangwu' },
];

const getOwnerLabel = (ownerId) => (
  OWNER_OPTIONS.find((option) => option.value === ownerId)?.label || ownerId || '--'
);

const ReportFooter = () => {
  const { handleCancel, handleSave, handleSubmit, isReadonly } = useReportPage();

  return (
    <footer className="report-footer">
      {isReadonly ? (
        <Form.Item
          className="report-footer__owner"
          label="选型负责人"
          shouldUpdate={(previousValues, currentValues) => previousValues.ownerId !== currentValues.ownerId}
        >
          {({ getFieldValue }) => (
            <span className="report-footer__owner-value">
              {getOwnerLabel(getFieldValue('ownerId'))}
            </span>
          )}
        </Form.Item>
      ) : (
        <Form.Item
          className="report-footer__owner"
          label="选型负责人"
          name="ownerId"
          rules={[{ required: true, message: '请选择选型负责人' }]}
        >
          <Select allowClear options={OWNER_OPTIONS} placeholder="请选择" />
        </Form.Item>
      )}
      {!isReadonly && (
        <div className="report-footer__actions">
          <Button onClick={handleCancel}>取消</Button>
          <Button onClick={handleSave}>暂存</Button>
          <Button type="primary" onClick={handleSubmit}>
            提交
          </Button>
        </div>
      )}
    </footer>
  );
};

export default ReportFooter;
