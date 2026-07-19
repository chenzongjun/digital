export const REPORT_SECTIONS = [
  {
    sectionId: 'requirement-description',
    title: '一、需求描述',
    tooltip: '请填写本次采购的业务背景、目标及范围。',
  },
  {
    sectionId: 'selection-plan',
    title: '二、选型方案',
    children: [
      {
        sectionId: 'selection-plan-description',
        title: '（一）选型方案描述',
      },
      {
        sectionId: 'selection-evaluation-criteria',
        title: '（二）选型评价标准',
      },
    ],
  },
  {
    sectionId: 'selection-process',
    title: '三、选型过程',
    children: [
      {
        sectionId: 'requirement-confirmation',
        title: '（一）需求确认',
      },
      {
        sectionId: 'research',
        title: '（二）寻源',
      },
      {
        sectionId: 'supplier-response',
        title: '（三）供应商响应',
      },
      {
        sectionId: 'poc-test',
        title: '（四）需求匹配及 POC 测试',
      },
      {
        sectionId: 'compliance-analysis',
        title: '（五）合规分析',
      },
      {
        sectionId: 'relationship-analysis',
        title: '（六）关联关系分析',
      },
    ],
  },
  {
    sectionId: 'employee-risk-assessment',
    title: '四、员工风险评估',
  },
  {
    sectionId: 'pre-negotiation-review',
    title: '五、项目签约情况前置调查',
  },
  {
    sectionId: 'selection-conclusion',
    title: '六、选型结论',
    children: [
      {
        sectionId: 'preliminary-conclusion',
        title: '（一）选型初步结论',
      },
      {
        sectionId: 'result-review',
        title: '（二）选型结果评审',
      },
    ],
  },
  {
    sectionId: 'attachments',
    title: '七、附录',
  },
];

export const flattenReportSections = (sections = REPORT_SECTIONS, depth = 1) => {
  return sections.flatMap(({ children, ...section }) => [
    { ...section, depth },
    ...(children ? flattenReportSections(children, depth + 1) : []),
  ]);
};

export const FLAT_REPORT_SECTIONS = flattenReportSections();
