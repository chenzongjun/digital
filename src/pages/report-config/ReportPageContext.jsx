import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { FLAT_REPORT_SECTIONS } from '../../constants/report-sections';

// 默认值为 null，便于在组件脱离 Provider 时尽早发现使用错误。
const ReportPageContext = createContext(null);

// 目录定位后，章节标题距离滚动容器顶部保留的视觉间距。
const CONTENT_SCROLL_OFFSET = 20;

export const ReportPageProvider = ({ mode, children }) => {
  // 当前位于可视区域的章节 ID，同时作为目录 Menu 的选中项。
  const [activeSectionId, setActiveSectionId] = useState(FLAT_REPORT_SECTIONS[0].sectionId);
  // 宽屏下用户手动收起目录的状态。
  const [isDirectoryCollapsed, setIsDirectoryCollapsed] = useState(false);
  // 移动端目录由 Drawer 承载，此状态控制其显示与隐藏。
  const [isDirectoryDrawerOpen, setIsDirectoryDrawerOpen] = useState(false);
  // 章节挂载或卸载时递增，用于让 IntersectionObserver 重新订阅最新 DOM 节点。
  const [sectionVersion, setSectionVersion] = useState(0);

  // 右侧报告区是唯一的滚动容器，目录和页面本身不参与滚动。
  const contentScrollRef = useRef(null);
  // 保存 sectionId 与对应 DOM 节点的映射，目录定位时可直接查询目标节点。
  const sectionNodesRef = useRef(new Map());
  // 详情和审批模式复用同一页面，但禁止编辑表单项。
  const isReadonly = mode === 'detail' || mode === 'approval';

  const registerSection = useCallback((sectionId, sectionNode) => {
    // ReportSection 的 ref 回调会在挂载时传入节点、卸载时传入 null。
    const previousNode = sectionNodesRef.current.get(sectionId);

    // 节点首次挂载或被替换后，登记最新节点并通知观察器重新订阅。
    if (sectionNode && previousNode !== sectionNode) {
      sectionNodesRef.current.set(sectionId, sectionNode);
      setSectionVersion((version) => version + 1);
    }

    // 章节被删除或条件渲染隐藏时，清除过期节点，避免观察器持有无效引用。
    if (!sectionNode && previousNode) {
      sectionNodesRef.current.delete(sectionId);
      setSectionVersion((version) => version + 1);
    }
  }, []);

  const scrollToSection = useCallback((sectionId) => {
    // 由目录点击触发：根据 sectionId 找到右侧报告区中的目标章节。
    const scrollContainer = contentScrollRef.current;
    const sectionNode = sectionNodesRef.current.get(sectionId);

    // 首次渲染尚未完成或配置中不存在该章节时，不执行滚动。
    if (!scrollContainer || !sectionNode) {
      return;
    }

    // 两个 top 都相对于浏览器视口，做差后得到章节相对报告滚动容器的距离。
    const containerTop = scrollContainer.getBoundingClientRect().top;
    const sectionTop = sectionNode.getBoundingClientRect().top;

    // 点击目录后立即更新选中态，等待滚动观察器下一次回调时再进行校正。
    setActiveSectionId(sectionId);
    scrollContainer.scrollTo({
      // 使用当前 scrollTop 叠加相对距离，避免误滚动浏览器页面。
      top: Math.max(0, scrollContainer.scrollTop + sectionTop - containerTop - CONTENT_SCROLL_OFFSET),
      behavior: 'smooth',
    });
  }, []);

  useEffect(() => {
    const scrollContainer = contentScrollRef.current;

    // 不支持 IntersectionObserver 时仍保留目录点击定位能力，仅不做滚动自动高亮。
    if (!scrollContainer || !window.IntersectionObserver) {
      return undefined;
    }

    // 监听右侧滚动区中的章节，使滚动位置成为目录选中态的唯一来源。
    const observer = new IntersectionObserver(
      (entries) => {
        // 同一时刻可能有多个章节进入可视区，取最靠近滚动区顶部的章节作为当前章节。
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((firstEntry, secondEntry) => firstEntry.boundingClientRect.top - secondEntry.boundingClientRect.top);

        if (visibleEntries[0]) {
          setActiveSectionId(visibleEntries[0].target.dataset.sectionId);
        }
      },
      {
        // 明确指定右侧报告区为观察根节点，而不是整个浏览器窗口。
        root: scrollContainer,
        // 将有效观察区收窄到容器上方区域，避免页面底部章节过早抢占目录选中态。
        rootMargin: '-12% 0px -72% 0px',
        threshold: 0,
      },
    );

    // sectionVersion 改变表示章节 DOM 集合有变化，重新订阅当前全部章节。
    sectionNodesRef.current.forEach((sectionNode) => observer.observe(sectionNode));

    // Provider 卸载或章节集合变化前释放观察器，避免重复监听。
    return () => observer.disconnect();
  }, [sectionVersion]);

  const contextValue = useMemo(
    () => ({
      // 页面基础状态：供页头、底部操作栏和字段渲染组件共同使用。
      mode,
      isReadonly,
      // 目录与报告区联动状态。
      activeSectionId,
      setActiveSectionId,
      isDirectoryCollapsed,
      setIsDirectoryCollapsed,
      isDirectoryDrawerOpen,
      setIsDirectoryDrawerOpen,
      // 跨组件共享的滚动容器与章节注册、定位方法。
      contentScrollRef,
      registerSection,
      scrollToSection,
    }),
    [
      activeSectionId,
      isDirectoryCollapsed,
      isDirectoryDrawerOpen,
      isReadonly,
      mode,
      registerSection,
      scrollToSection,
    ],
  );

  return <ReportPageContext.Provider value={contextValue}>{children}</ReportPageContext.Provider>;
};

export const useReportPage = () => {
  // 页面内组件通过该 Hook 获取共享状态，避免逐层透传 props。
  const contextValue = useContext(ReportPageContext);

  if (!contextValue) {
    // 明确提示 Provider 缺失，方便排查页面组件被单独使用的情况。
    throw new Error('useReportPage must be used within ReportPageProvider');
  }

  return contextValue;
};
