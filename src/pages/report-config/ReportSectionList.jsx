import { QuestionCircleOutlined } from '@ant-design/icons';
import { Form, Input, Tooltip } from 'antd';
import { FLAT_REPORT_SECTIONS } from '../../constants/report-sections';
import { useReportPage } from './ReportPageContext';

const SECTION_ORDER_PREFIX_PATTERN = /^(?:[一二三四五六七八九十]+、|（[一二三四五六七八九十]+）)\s*/;

const ReportSection = ({ section }) => {
  const { isReadonly } = useReportPage();
  // 校验提示沿用章节标题正文，不重复展示章节序号。
  const sectionName = section.title.replace(SECTION_ORDER_PREFIX_PATTERN, '');

  return (
    <section
      className={`report-section report-section--depth-${section.depth}`}
      id={`report-section-${section.sectionId}`}
    >
      <header className="report-section__header">
        <div className="report-section__title">
          <h2>{section.title}</h2>
          {/* tooltip 由后续报告配置决定，存在时才展示帮助入口。 */}
          {section.tooltip && (
            <Tooltip title={section.tooltip}>
              <QuestionCircleOutlined className="report-section__tooltip-icon" />
            </Tooltip>
          )}
        </div>
      </header>
      <Form.Item
        name={['sections', section.sectionId, 'content']}
        rules={section.required ? [{
          required: true,
          whitespace: true,
          message: `请填写${sectionName}`,
        }] : undefined}
      >
        <Input.TextArea
          autoSize={{ minRows: section.depth === 1 ? 5 : 3, maxRows: 8 }}
          disabled={isReadonly}
          placeholder={`请填写${section.title}相关内容`}
        />
      </Form.Item>
    </section>
  );
};

const ReportSectionList = () => {
  return (
    <div className="report-section-list">
      {FLAT_REPORT_SECTIONS.map((section) => (
        <ReportSection key={section.sectionId} section={section} />
      ))}
    </div>
  );
};

export default ReportSectionList;
