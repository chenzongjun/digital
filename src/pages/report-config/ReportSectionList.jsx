import { QuestionCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { REPORT_SECTIONS } from '../../constants/report-sections';
import FieldRenderer from './FieldRenderer';
import RichTextSectionField from './RichTextSectionField';

const ReportSection = ({ depth, section }) => {
  const hasRichTextSectionChildren = section.children?.some(
    (childSection) => childSection.parentType === 'section'
      && childSection.fieldType === 'richText',
  );

  return (
    <section
      className={`report-section report-section--depth-${depth}`}
      id={`report-section-${section.sectionId}`}
    >
      <header className="report-section__header">
        <div className="report-section__title">
          <h2>{section.title}</h2>
          {section.tooltip && (
            <Tooltip title={section.tooltip}>
              <QuestionCircleOutlined className="report-section__tooltip-icon" />
            </Tooltip>
          )}
        </div>
      </header>
      {hasRichTextSectionChildren ? (
        <RichTextSectionField section={section} />
      ) : (
        <>
          {section.fieldType && <FieldRenderer depth={depth} field={section} />}
          {section.children?.map((childSection) => (
            <ReportSection
              depth={depth + 1}
              key={childSection.sectionId}
              section={childSection}
            />
          ))}
        </>
      )}
    </section>
  );
};

const ReportSectionList = () => {
  return (
    <div className="report-section-list">
      {REPORT_SECTIONS.map((section) => (
        <ReportSection depth={1} key={section.sectionId} section={section} />
      ))}
    </div>
  );
};

export default ReportSectionList;
