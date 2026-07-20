export const SELECTION_PROCESS_SECTION_ID = 'selection-process';

export const REPORT_SECTIONS = [
  {
    sectionId: 'requirement-description',
    title: '一、需求描述',
    fieldType: 'textarea',
    required: true,
    editable: true,
    tooltip: '请填写本次采购的业务背景、目标及范围。',
  },
  {
    sectionId: 'selection-plan',
    title: '二、选型方案',
    children: [
      {
        sectionId: 'selection-plan-description',
        title: '（一）选型方案描述',
        fieldType: 'textarea',
        editable: true,
      },
      {
        sectionId: 'selection-evaluation-criteria',
        title: '（二）选型评价标准',
        fieldType: 'editableTable',
        fieldName: 'rows',
        columns: [
          {
            name: 'supplier',
            title: '供应商',
            fieldType: 'input',
            placeholder: '请输入供应商',
          },
          {
            name: 'brand',
            title: '品牌',
            fieldType: 'input',
            placeholder: '请输入品牌',
          },
          {
            name: 'quote',
            title: '报价（万元）',
            fieldType: 'input',
            placeholder: '请输入报价（万元）',
          },
          {
            name: 'score',
            title: '评分',
            fieldType: 'input',
            placeholder: '请输入评分',
          },
        ],
      },
    ],
  },
  {
    sectionId: SELECTION_PROCESS_SECTION_ID,
    title: '三、选型过程',
    children: [
      {
        sectionId: 'requirement-confirmation',
        title: '需求确认',
        parentType: 'section',
        fieldType: 'richText',
        editable: true,
        richTextDeletableFlag: false,
        richTextModifiableFlag: false,
      },
      {
        sectionId: 'research',
        title: '寻源',
        parentType: 'section',
        fieldType: 'richText',
        editable: true,
        richTextDeletableFlag: true,
        richTextModifiableFlag: true,
      },
      {
        sectionId: 'supplier-response',
        title: '供应商响应',
        parentType: 'section',
        fieldType: 'richText',
        editable: true,
        richTextDeletableFlag: true,
        richTextModifiableFlag: true,
      },
      {
        sectionId: 'poc-test',
        title: '需求匹配及 POC 测试',
        parentType: 'section',
        fieldType: 'richText',
        editable: true,
        richTextDeletableFlag: true,
        richTextModifiableFlag: true,
      },
      {
        sectionId: 'compliance-analysis',
        title: '合规分析',
        parentType: 'section',
        fieldType: 'richText',
        editable: true,
        richTextDeletableFlag: true,
        richTextModifiableFlag: true,
      },
      {
        sectionId: 'relationship-analysis',
        title: '关联关系分析',
        parentType: 'section',
        fieldType: 'richText',
        editable: true,
        richTextDeletableFlag: true,
        richTextModifiableFlag: true,
      },
    ],
  },
  {
    sectionId: 'employee-risk-assessment',
    title: '四、员工风险评估',
    fieldType: 'textarea',
    editable: true,
  },
  {
    sectionId: 'pre-negotiation-review',
    title: '五、项目签约情况前置调查',
    fieldType: 'textarea',
    editable: true,
  },
  {
    sectionId: 'selection-conclusion',
    title: '六、选型结论',
    fieldType: 'textarea',
    editable: true,
    children: [
      {
        sectionId: 'preliminary-conclusion',
        title: '（一）选型初步结论',
        fieldType: 'textarea',
        editable: true,
      },
      {
        sectionId: 'result-review',
        title: '（二）选型结果评审',
        fieldType: 'textarea',
        editable: true,
      },
    ],
  },
  {
    sectionId: 'attachments',
    title: '七、附录',
    fieldType: 'textarea',
    editable: true,
  },
];

export const flattenReportSections = (sections = REPORT_SECTIONS, depth = 1) => {
  return sections.flatMap(({ children, ...section }) => [
    { ...section, depth },
    ...(children ? flattenReportSections(children, depth + 1) : []),
  ]);
};

export const FLAT_REPORT_SECTIONS = flattenReportSections();
