import { useEffect, useMemo } from 'react';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Form, Grid, Layout, message } from 'antd';
import { FLAT_REPORT_SECTIONS } from '../../constants/report-sections';
import ReportDirectory from './ReportDirectory';
import ReportFooter from './ReportFooter';
import { ReportPageProvider, useReportPage } from './ReportPageContext';
import ReportSectionList from './ReportSectionList';

const { Header, Content, Sider } = Layout;

const getInitialValues = () => {
  return {
    ownerId: 'zhangsan',
    sections: Object.fromEntries(
      FLAT_REPORT_SECTIONS.map((section) => [
        section.sectionId,
        { content: `这里是“${section.title}”的示例内容，用于验证右侧填写区域的独立纵向滚动。` },
      ]),
    ),
  };
};

const ReportPageContent = () => {
  const [form] = Form.useForm();
  const screens = Grid.useBreakpoint();
  const {
    contentScrollRef,
    isDirectoryCollapsed,
    isReadonly,
    setIsDirectoryCollapsed,
  } = useReportPage();
  const isCompact = !screens.xl;
  const initialValues = useMemo(getInitialValues, []);

  useEffect(() => {
    // 进入紧凑宽度时默认收起目录，但用户仍可通过侧栏按钮再次展开。
    setIsDirectoryCollapsed(isCompact);
  }, [isCompact, setIsDirectoryCollapsed]);

  const handleCancel = () => {
    form.resetFields();
    message.info('已恢复示例初始值');
  };

  const handleSave = () => {
    // Draft saving intentionally skips required-field validation in this layout-only phase.
    message.success('报告已暂存（示例）');
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      message.success('报告已提交（示例）');
    } catch {
      message.error('请先完成必填项');
    }
  };

  return (
    <Form className="report-page" form={form} initialValues={initialValues} layout="vertical">
      <Header className="report-page__header">
        <div className="report-page__title">
          <ArrowLeftOutlined aria-hidden="true" />
          <strong>服务器采购项目 A</strong>
        </div>
        <span className="report-page__mode">{isReadonly ? '只读查看' : '编辑中'}</span>
      </Header>
      <Layout className="report-page__body" hasSider>
        <Sider
          className="report-page__sider"
          collapsed={isDirectoryCollapsed}
          collapsedWidth={64}
          theme="light"
          width={260}
        >
          <ReportDirectory isCollapsed={isDirectoryCollapsed} />
        </Sider>
        <Layout className="report-page__workspace">
          <Content ref={contentScrollRef} className="report-content-scroll">
            <ReportSectionList />
          </Content>
          <ReportFooter onCancel={handleCancel} onSave={handleSave} onSubmit={handleSubmit} />
        </Layout>
      </Layout>
    </Form>
  );
};

const ReportConfigPage = ({ mode }) => {
  return (
    <ReportPageProvider mode={mode}>
      <ReportPageContent />
    </ReportPageProvider>
  );
};

export default ReportConfigPage;
