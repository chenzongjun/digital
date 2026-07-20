import { useEffect } from 'react'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { Grid, Layout } from 'antd'
import ReportDirectory from './ReportDirectory'
import ReportFooter from './ReportFooter'
import { ReportPageProvider, useReportPage } from './ReportPageContext'
import ReportSectionList from './ReportSectionList'

const { Header, Content, Sider } = Layout

const ReportPageContent = () => {
  const screens = Grid.useBreakpoint()
  const { contentScrollRef, isDirectoryCollapsed, isReadonly, setIsDirectoryCollapsed } = useReportPage()
  const isCompact = !screens.xl

  useEffect(() => {
    // 进入紧凑宽度时默认收起目录，但用户仍可通过侧栏按钮再次展开。
    setIsDirectoryCollapsed(isCompact)
  }, [isCompact, setIsDirectoryCollapsed])

  return (
    <div className='report-page'>
      <Header className='report-page__header'>
        <div className='report-page__title'>
          <ArrowLeftOutlined aria-hidden='true' />
          <strong>服务器采购项目 A</strong>
        </div>
        <span className='report-page__mode'>{isReadonly ? '只读查看' : '编辑中'}</span>
      </Header>
      <Layout className='report-page__body' hasSider>
        <Sider
          className={`report-page__sider${isDirectoryCollapsed ? ' report-page__sider--collapsed' : ''}`}
          theme='light'
          width={260}
        >
          <ReportDirectory isCollapsed={isDirectoryCollapsed} />
        </Sider>
        <Layout className='report-page__workspace'>
          <Content ref={contentScrollRef} className='report-content-scroll'>
            <ReportSectionList />
          </Content>
          <ReportFooter />
        </Layout>
      </Layout>
    </div>
  )
}

const ReportConfigPage = ({ mode }) => {
  return (
    <ReportPageProvider mode={mode}>
      <ReportPageContent />
    </ReportPageProvider>
  )
}

export default ReportConfigPage
