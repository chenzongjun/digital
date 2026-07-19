import { useCallback, useMemo, useState } from 'react';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Button, Menu, Tooltip } from 'antd';
import { REPORT_SECTIONS } from '../../constants/report-sections';
import { useReportPage } from './ReportPageContext';

const getParentSectionIds = (sections) => {
  return sections.flatMap((section) => (
    section.children ? [section.sectionId, ...getParentSectionIds(section.children)] : []
  ));
};

const renderMenuNodes = (sections, handleNavigate) => {
  return sections.map((section) => {
    if (section.children) {
      return (
        <Menu.SubMenu
          key={section.sectionId}
          title={section.title}
          onTitleClick={() => handleNavigate(section.sectionId)}
        >
          {renderMenuNodes(section.children, handleNavigate)}
        </Menu.SubMenu>
      );
    }

    return (
      <Menu.Item key={section.sectionId}>
        {section.title}
      </Menu.Item>
    );
  });
};

const ReportDirectory = ({ isCollapsed = false, canCollapse = true, onNavigate }) => {
  const {
    activeSectionId,
    isDirectoryCollapsed,
    setIsDirectoryCollapsed,
    scrollToSection,
  } = useReportPage();
  const [openKeys, setOpenKeys] = useState(() => getParentSectionIds(REPORT_SECTIONS));

  const handleNavigate = useCallback((sectionId) => {
    scrollToSection(sectionId);
    onNavigate?.();
  }, [onNavigate, scrollToSection]);

  const menuNodes = useMemo(
    () => renderMenuNodes(REPORT_SECTIONS, handleNavigate),
    [handleNavigate],
  );

  const handleMenuClick = ({ key }) => {
    handleNavigate(key);
  };

  const handleToggleDirectory = () => {
    setIsDirectoryCollapsed(!isDirectoryCollapsed);
  };

  return (
    <aside className="report-directory" aria-label="报告目录导航">
      <div className="report-directory__header">
        {!isCollapsed && <strong>目录导航</strong>}
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
      <Menu
        className="report-directory__menu"
        inlineCollapsed={isCollapsed}
        mode="inline"
        openKeys={isCollapsed ? [] : openKeys}
        selectedKeys={[activeSectionId]}
        onClick={handleMenuClick}
        onOpenChange={setOpenKeys}
      >
        {menuNodes}
      </Menu>
    </aside>
  );
};

export default ReportDirectory;
