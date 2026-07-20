import { Fragment, useEffect, useMemo, useState } from 'react';
import {
  CaretDownOutlined,
  CaretRightOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Anchor, Button, Form, Tooltip } from 'antd';
import {
  REPORT_SECTIONS,
  SELECTION_PROCESS_SECTION_ID,
} from '../../constants/report-sections';
import { useReportPage } from './ReportPageContext';
import { getNumberedSectionTitle } from './report-field-utils';

const CONTENT_SCROLL_OFFSET = 20;
const RICH_TEXT_LIST_NAME = [
  'sections',
  SELECTION_PROCESS_SECTION_ID,
  'children',
];

const getExpandableSectionIds = (sections) => sections.flatMap((section) => (
  section.children?.length
    ? [section.sectionId, ...getExpandableSectionIds(section.children)]
    : []
));

const getFlatSectionIds = (sections) => sections.flatMap((section) => [
  section.sectionId,
  ...(section.children ? getFlatSectionIds(section.children) : []),
]);

const getInitialRichTextSections = () => {
  const selectionProcessSection = REPORT_SECTIONS.find(
    (section) => section.sectionId === SELECTION_PROCESS_SECTION_ID,
  );

  return selectionProcessSection?.children || [];
};

const getDirectorySections = (richTextSections) => {
  return REPORT_SECTIONS.map((section) => {
    if (section.sectionId !== SELECTION_PROCESS_SECTION_ID) {
      return section;
    }

    return {
      ...section,
      children: richTextSections
        .filter((richTextSection) => Boolean(richTextSection?.sectionId))
        .map((richTextSection, index) => ({
          sectionId: richTextSection.sectionId,
          title: getNumberedSectionTitle(richTextSection.title, index),
        })),
    };
  });
};

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
          <Fragment key={`${section.sectionId}-branch`}>
            <Button
              key={`${section.sectionId}-toggle`}
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
                key={`${section.sectionId}-children`}
              >
                {renderAnchorLinks(section.children, expandedSectionIds, handleToggleSection)}
              </div>
            )}
          </Fragment>
        )}
      </Anchor.Link>
    );
  })
);

const ReportDirectory = ({ canCollapse = true }) => {
  const {
    activeSectionId,
    contentScrollRef,
    form,
    isDirectoryCollapsed,
    scrollToSection,
    setActiveSectionId,
    setIsDirectoryCollapsed,
  } = useReportPage();
  const watchedRichTextSections = Form.useWatch(RICH_TEXT_LIST_NAME, form);
  const richTextSections = watchedRichTextSections || getInitialRichTextSections();
  const directorySections = useMemo(
    () => getDirectorySections(richTextSections),
    [richTextSections],
  );
  const sectionIds = useMemo(
    () => getFlatSectionIds(directorySections),
    [directorySections],
  );
  const sectionIdKey = sectionIds.join('|');
  const [expandedSectionIds, setExpandedSectionIds] = useState(
    () => getExpandableSectionIds(REPORT_SECTIONS),
  );

  useEffect(() => {
    const currentSectionIds = sectionIdKey.split('|').filter(Boolean);

    if (!currentSectionIds.includes(activeSectionId)) {
      const fallbackSectionId = currentSectionIds.includes(SELECTION_PROCESS_SECTION_ID)
        ? SELECTION_PROCESS_SECTION_ID
        : currentSectionIds[0];

      if (fallbackSectionId) {
        setActiveSectionId(fallbackSectionId);
      }
    }
  }, [activeSectionId, sectionIdKey, setActiveSectionId]);

  useEffect(() => {
    const container = contentScrollRef.current;
    const observedSectionIds = sectionIdKey.split('|').filter(Boolean);

    if (!container || !observedSectionIds.length) {
      return undefined;
    }

    let animationFrameId;

    const updateActiveSection = () => {
      const containerTop = container.getBoundingClientRect().top;
      let nextActiveSectionId = observedSectionIds[0];

      observedSectionIds.some((sectionId) => {
        const sectionElement = document.getElementById(`report-section-${sectionId}`);

        if (!sectionElement) {
          return false;
        }

        const sectionTop = sectionElement.getBoundingClientRect().top - containerTop;

        if (sectionTop <= CONTENT_SCROLL_OFFSET + 1) {
          nextActiveSectionId = sectionId;
          return false;
        }

        return true;
      });

      setActiveSectionId((currentSectionId) => (
        currentSectionId === nextActiveSectionId
          ? currentSectionId
          : nextActiveSectionId
      ));
    };

    const handleScroll = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(updateActiveSection);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    updateActiveSection();

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('scroll', handleScroll);
    };
  }, [contentScrollRef, sectionIdKey, setActiveSectionId]);

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

  const handleAnchorClick = (event, link) => {
    event.preventDefault();
    const sectionId = link.href.replace('#report-section-', '');
    scrollToSection(sectionId);
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
          getCurrentAnchor={() => (
            activeSectionId ? `#report-section-${activeSectionId}` : ''
          )}
          targetOffset={CONTENT_SCROLL_OFFSET}
          onClick={handleAnchorClick}
        >
          {renderAnchorLinks(directorySections, expandedSectionIds, handleToggleSection)}
        </Anchor>
      </div>
    </aside>
  );
};

export default ReportDirectory;
