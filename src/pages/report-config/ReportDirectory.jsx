import { useState } from 'react';
import {
  CaretDownOutlined,
  CaretRightOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Anchor, Button, Tooltip } from 'antd';
import { REPORT_SECTIONS } from '../../constants/report-sections';
import { useReportPage } from './ReportPageContext';

const CONTENT_SCROLL_OFFSET = 20;

const getExpandableSectionIds = (sections) => sections.flatMap((section) => (
  section.children?.length
    ? [section.sectionId, ...getExpandableSectionIds(section.children)]
    : []
));

const renderAnchorLinks = (sections, expandedSectionIds, handleToggleSection) => (
  sections.map((section) => {
    const hasChildren = Boolean(section.children?.length);
    const isExpanded = expandedSectionIds.includes(section.sectionId);

    return (
      <Anchor.Link
        className={`report-directory__link${hasChildren ? ' report-directory__link--parent' : ''}`}
        key={section.sectionId}
        href={`#report-section-${section.sectionId}`}
        title={section.title}
      >
        {hasChildren && (
          <>
            <Button
              aria-controls={`report-directory-children-${section.sectionId}`}
              aria-expanded={isExpanded}
              aria-label={`${isExpanded ? '收起' : '展开'}${section.title}`}
              className="report-directory__section-toggle"
              icon={isExpanded ? <CaretDownOutlined /> : <CaretRightOutlined />}
              type="text"
              onClick={(event) => handleToggleSection(event, section.sectionId)}
            />
            {isExpanded && (
              <div
                className="report-directory__children"
                id={`report-directory-children-${section.sectionId}`}
              >
                {renderAnchorLinks(section.children, expandedSectionIds, handleToggleSection)}
              </div>
            )}
          </>
        )}
      </Anchor.Link>
    );
  })
);

const ReportDirectory = ({ canCollapse = true }) => {
  const {
    contentScrollRef,
    isDirectoryCollapsed,
    setIsDirectoryCollapsed,
  } = useReportPage();
  const [expandedSectionIds, setExpandedSectionIds] = useState(
    () => getExpandableSectionIds(REPORT_SECTIONS),
  );

  const handleToggleDirectory = () => {
    setIsDirectoryCollapsed(!isDirectoryCollapsed);
  };

  const handleToggleSection = (event, sectionId) => {
    event.preventDefault();
    event.stopPropagation();
    setExpandedSectionIds((currentSectionIds) => (
      currentSectionIds.includes(sectionId)
        ? currentSectionIds.filter((currentSectionId) => currentSectionId !== sectionId)
        : [...currentSectionIds, sectionId]
    ));
  };

  return (
    <aside className="report-directory" aria-label="报告目录导航">
      <div className="report-directory__header">
        {!isDirectoryCollapsed && <strong>目录导航</strong>}
        {canCollapse && (
          <Tooltip title={isDirectoryCollapsed ? '展开目录' : '收起目录'}>
            <Button
              aria-label={isDirectoryCollapsed ? '展开目录' : '收起目录'}
              className="report-directory__toggle"
              icon={isDirectoryCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              type="text"
              onClick={handleToggleDirectory}
            />
          </Tooltip>
        )}
      </div>
      <div className="report-directory__anchor-container" hidden={isDirectoryCollapsed}>
        <Anchor
          affix={false}
          className="report-directory__anchor"
          getContainer={() => contentScrollRef.current}
          targetOffset={CONTENT_SCROLL_OFFSET}
        >
          {renderAnchorLinks(REPORT_SECTIONS, expandedSectionIds, handleToggleSection)}
        </Anchor>
      </div>
    </aside>
  );
};

export default ReportDirectory;
