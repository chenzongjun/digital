export const SELECTION_PROCESS_SECTION_ID = 'selection-process';

const RECOMMENDATION_OPTIONS = [
  { label: '推荐', value: 'recommended' },
  { label: '不推荐', value: 'not-recommended' },
];

const CAPABILITY_OPTIONS = [
  { label: '实施', value: 'implementation' },
  { label: '运维', value: 'operations' },
  { label: '培训', value: 'training' },
];

const SUPPLIER_TYPE_OPTIONS = [
  { label: '原厂', value: 'manufacturer' },
  { label: '代理商', value: 'agent' },
];

const REVIEWER_OPTIONS = [
  { label: '采购部', value: 'procurement' },
  { label: '技术部', value: 'technology' },
  { label: '财务部', value: 'finance' },
];

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
            name: 'summary',
            title: '方案摘要',
            fieldType: 'text',
            width: 240,
            tooltip: '该列仅用于展示，不提供编辑控件。',
          },
          {
            name: 'supplier',
            title: '供应商',
            fieldType: 'input',
            required: true,
            componentProps: {
              maxLength: 50,
              placeholder: '请输入供应商',
            },
          },
          {
            name: 'quote',
            title: '报价（万元）',
            fieldType: 'inputNumber',
            width: 180,
            componentProps: {
              min: 0,
              precision: 2,
              placeholder: '请输入报价',
            },
          },
          {
            name: 'remark',
            title: '评价说明',
            fieldType: 'textArea',
            width: 260,
            componentProps: {
              autoSize: { minRows: 1, maxRows: 3 },
              maxLength: 200,
              placeholder: '请输入评价说明',
            },
          },
          {
            name: 'deliveryDate',
            title: '预计交付日期',
            fieldType: 'DatePicker',
            width: 180,
            componentProps: {
              allowClear: true,
              format: 'YYYY-MM-DD',
              placeholder: '请选择日期',
            },
          },
          {
            name: 'recommendation',
            title: '是否推荐',
            fieldType: 'radio',
            width: 190,
            options: RECOMMENDATION_OPTIONS,
          },
          {
            name: 'capabilities',
            title: '服务能力',
            fieldType: 'checkbox',
            width: 260,
            options: CAPABILITY_OPTIONS,
          },
          {
            name: 'supplierType',
            title: '供应商类型',
            fieldType: 'select',
            width: 190,
            options: SUPPLIER_TYPE_OPTIONS,
            componentProps: {
              allowClear: true,
              placeholder: '请选择类型',
            },
          },
          {
            name: 'reviewers',
            title: '参与评审部门',
            fieldType: 'multipleSelect',
            width: 240,
            options: REVIEWER_OPTIONS,
            componentProps: {
              allowClear: true,
              placeholder: '请选择评审部门',
            },
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
