import { useCallback } from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Form, Input, Tooltip } from 'antd';
import { FLAT_REPORT_SECTIONS } from '../../constants/report-sections';
import { useReportPage } from './ReportPageContext';

const ReportSection = ({ section }) => {
  const { isReadonly, registerSection } = useReportPage();
  const sectionRef = useCallback(
    (sectionNode) => registerSection(section.sectionId, sectionNode),
    [registerSection, section.sectionId],
  );
  const fieldLabel = section.depth === 1 ? '项目说明' : '补充说明';

  return (
    <section
      ref={sectionRef}
      className={`report-section report-section--depth-${section.depth}`}
      data-section-id={section.sectionId}
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
      <Form.Item label={fieldLabel} name={['sections', section.sectionId, 'content']}>
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
