import { Button, Form, Select } from 'antd';
import { useReportPage } from './ReportPageContext';

const OWNER_OPTIONS = [
  { label: '张三', value: 'zhangsan' },
  { label: '李四', value: 'lisi' },
  { label: '王五', value: 'wangwu' },
];

const ReportFooter = () => {
  const { handleCancel, handleSave, handleSubmit, isReadonly } = useReportPage();

  if (isReadonly) {
    return null;
  }

  return (
    <footer className="report-footer">
      <Form.Item
        className="report-footer__owner"
        label="选型负责人"
        name="ownerId"
        rules={[{ required: true, message: '请选择选型负责人' }]}
      >
        <Select allowClear options={OWNER_OPTIONS} placeholder="请选择" />
      </Form.Item>
      <div className="report-footer__actions">
        <Button onClick={handleCancel}>取消</Button>
        <Button onClick={handleSave}>暂存</Button>
        <Button type="primary" onClick={handleSubmit}>
          提交
        </Button>
      </div>
    </footer>
  );
};

export default ReportFooter;
