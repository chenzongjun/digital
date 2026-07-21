import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Form, message } from 'antd';
import {
  FLAT_REPORT_SECTIONS,
  REPORT_SECTIONS,
  SELECTION_PROCESS_SECTION_ID,
} from '../../constants/report-sections';

const CONTENT_SCROLL_OFFSET = 20;
const ReportPageContext = createContext(null);

const getInitialValues = () => {
  const selectionProcessSection = REPORT_SECTIONS.find(
    (section) => section.sectionId === SELECTION_PROCESS_SECTION_ID,
  );
  const sections = {};

  FLAT_REPORT_SECTIONS.forEach((section) => {
    if (section.parentType === 'section' && section.fieldType === 'richText') {
      return;
    }

    if (section.fieldType === 'editableTable') {
      sections[section.sectionId] = {
        rows: [{
          rowId: 'selection-criteria-row-1',
          supplier: undefined,
          brand: undefined,
          quote: undefined,
          score: undefined,
        }],
      };
      return;
    }

    if (section.fieldType === 'richText') {
      sections[section.sectionId] = {
        content: `<p>这里是“${section.title}”的示例富文本内容。</p>`,
      };
      return;
    }

    if (section.fieldType) {
      sections[section.sectionId] = {
        content: `这里是“${section.title}”的示例内容，用于验证配置化字段渲染。`,
      };
    }
  });

  sections[SELECTION_PROCESS_SECTION_ID] = {
    children: (selectionProcessSection?.children || []).map((section) => ({
      sectionId: section.sectionId,
      title: section.title,
      content: `<p>这里是“${section.title}”的示例富文本内容。</p>`,
    })),
  };

  return {
    ownerId: 'zhangsan',
    sections,
  };
};

const getErrorSectionId = (fieldName, form) => {
  if (!Array.isArray(fieldName) || fieldName[0] !== 'sections') {
    return null;
  }

  const sectionId = fieldName[1];

  if (
    sectionId === SELECTION_PROCESS_SECTION_ID
    && fieldName[2] === 'children'
    && Number.isInteger(fieldName[3])
  ) {
    return form.getFieldValue([
      'sections',
      SELECTION_PROCESS_SECTION_ID,
      'children',
      fieldName[3],
      'sectionId',
    ]) || SELECTION_PROCESS_SECTION_ID;
  }

  return sectionId;
};

export const ReportPageProvider = ({ mode, children }) => {
  const [form] = Form.useForm();
  const initialValues = useMemo(getInitialValues, []);
  const [activeSectionId, setActiveSectionId] = useState(
    REPORT_SECTIONS[0].sectionId,
  );
  const [isDirectoryCollapsed, setIsDirectoryCollapsed] = useState(false);
  const contentScrollRef = useRef(null);
  const isReadonly = mode === 'detail' || mode === 'approval';

  const scrollToSection = useCallback((sectionId, behavior = 'smooth') => {
    const container = contentScrollRef.current;
    const sectionElement = document.getElementById(`report-section-${sectionId}`);

    if (!container || !sectionElement) {
      return;
    }

    const containerTop = container.getBoundingClientRect().top;
    const sectionTop = sectionElement.getBoundingClientRect().top;

    container.scrollTo({
      behavior,
      top: container.scrollTop + sectionTop - containerTop - CONTENT_SCROLL_OFFSET,
    });
    setActiveSectionId(sectionId);
  }, []);

  const handleCancel = useCallback(() => {
    form.resetFields();
    setActiveSectionId(REPORT_SECTIONS[0].sectionId);
    scrollToSection(REPORT_SECTIONS[0].sectionId, 'auto');
    message.info('已恢复示例初始值');
  }, [form, scrollToSection]);

  const handleSave = useCallback(() => {
    message.success('报告已暂存（示例）');
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      await form.validateFields();
      message.success('报告已提交（示例）');
    } catch (errorInfo) {
      const firstErrorName = errorInfo?.errorFields?.[0]?.name;
      const sectionId = getErrorSectionId(firstErrorName, form);

      if (sectionId) {
        setActiveSectionId(sectionId);
        requestAnimationFrame(() => {
          scrollToSection(sectionId);
        });
      }

      message.error('请先完成必填项');
    }
  }, [form, scrollToSection]);

  const contextValue = useMemo(
    () => ({
      mode,
      isReadonly,
      form,
      initialValues,
      handleCancel,
      handleSave,
      handleSubmit,
      activeSectionId,
      setActiveSectionId,
      isDirectoryCollapsed,
      setIsDirectoryCollapsed,
      contentScrollRef,
      scrollToSection,
    }),
    [
      activeSectionId,
      form,
      handleCancel,
      handleSave,
      handleSubmit,
      initialValues,
      isDirectoryCollapsed,
      isReadonly,
      mode,
      scrollToSection,
    ],
  );

  return (
    <ReportPageContext.Provider value={contextValue}>
      <Form component={false} form={form} initialValues={initialValues} layout="vertical">
        {children}
      </Form>
    </ReportPageContext.Provider>
  );
};

export const useReportPage = () => {
  const contextValue = useContext(ReportPageContext);

  if (!contextValue) {
    throw new Error('useReportPage must be used within ReportPageProvider');
  }

  return contextValue;
};
