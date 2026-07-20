import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { Form, message } from 'antd'
import { FLAT_REPORT_SECTIONS } from '../../constants/report-sections'

// 默认值为 null，便于在组件脱离 Provider 时尽早发现使用错误。
const ReportPageContext = createContext(null)

const getInitialValues = () => {
  return {
    ownerId: 'zhangsan',
    sections: Object.fromEntries(
      FLAT_REPORT_SECTIONS.map(section => [section.sectionId, { content: `这里是“${section.title}”的示例内容，用于验证右侧填写区域的独立纵向滚动。` }]),
    ),
  }
}

export const ReportPageProvider = ({ mode, children }) => {
  const [form] = Form.useForm()
  const initialValues = useMemo(getInitialValues, [])
  // 用户手动收起目录的状态。
  const [isDirectoryCollapsed, setIsDirectoryCollapsed] = useState(false)

  // 右侧报告区是唯一的滚动容器，目录和页面本身不参与滚动。
  const contentScrollRef = useRef(null)
  // 详情和审批模式复用同一页面，但禁止编辑表单项。
  const isReadonly = mode === 'detail' || mode === 'approval'

  const handleCancel = useCallback(() => {
    form.resetFields()
    message.info('已恢复示例初始值')
  }, [form])

  const handleSave = useCallback(() => {
    // Draft saving intentionally skips required-field validation in this layout-only phase.
    message.success('报告已暂存（示例）')
  }, [])

  const handleSubmit = useCallback(async () => {
    try {
      await form.validateFields()
      message.success('报告已提交（示例）')
    } catch {
      message.error('请先完成必填项')
    }
  }, [form])

  const contextValue = useMemo(
    () => ({
      // 页面基础状态：供页头、底部操作栏和字段渲染组件共同使用。
      mode,
      isReadonly,
      // 表单状态和操作集中提供给页面布局与底部操作栏。
      form,
      initialValues,
      handleCancel,
      handleSave,
      handleSubmit,
      // 目录与报告区联动状态。
      isDirectoryCollapsed,
      setIsDirectoryCollapsed,
      // Anchor 通过该引用监听并滚动右侧报告区。
      contentScrollRef,
    }),
    [form, handleCancel, handleSave, handleSubmit, initialValues, isDirectoryCollapsed, isReadonly, mode],
  )

  return (
    <ReportPageContext.Provider value={contextValue}>
      <Form component={false} form={form} initialValues={initialValues} layout='vertical'>
        {children}
      </Form>
    </ReportPageContext.Provider>
  )
}

export const useReportPage = () => {
  // 页面内组件通过该 Hook 获取共享状态，避免逐层透传 props。
  const contextValue = useContext(ReportPageContext)

  if (!contextValue) {
    // 明确提示 Provider 缺失，方便排查页面组件被单独使用的情况。
    throw new Error('useReportPage must be used within ReportPageProvider')
  }

  return contextValue
}
