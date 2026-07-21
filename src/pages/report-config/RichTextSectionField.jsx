import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, Tooltip } from 'antd';
import RichTextEditor from './RichTextEditor';
import { useReportPage } from './ReportPageContext';
import {
  createTemporaryId,
  getSectionOrderPrefix,
  isRichTextEmpty,
} from './report-field-utils';

const createRichTextSection = () => ({
  sectionId: createTemporaryId('rich-text-section'),
  title: '新章节',
  content: '',
});

const getRichTextRules = (sectionConfig) => {
  const configuredRules = sectionConfig?.rules || [];

  if (!sectionConfig?.required) {
    return configuredRules.length ? configuredRules : undefined;
  }

  return [
    {
      validator: (_, value) => (
        isRichTextEmpty(value)
          ? Promise.reject(new Error(`请填写${sectionConfig.title}`))
          : Promise.resolve()
      ),
    },
    ...configuredRules,
  ];
};

const RichTextSectionViewer = ({ richTextSections }) => (
  <div className="rich-text-section-list">
    {richTextSections.map((richTextSection, index) => {
      const isEmpty = isRichTextEmpty(richTextSection.content);

      return (
        <section
          className="report-section report-section--depth-2 rich-text-section"
          id={`report-section-${richTextSection.sectionId}`}
          key={richTextSection.sectionId}
        >
          <header className="rich-text-section__header">
            <div className="rich-text-section__title">
              <span className="rich-text-section__order">
                {getSectionOrderPrefix(index)}
              </span>
              <strong>{richTextSection.title || '未命名章节'}</strong>
            </div>
          </header>
          {isEmpty ? (
            <div className="rich-text-viewer rich-text-viewer--empty">--</div>
          ) : (
            <div
              className="rich-text-viewer"
              dangerouslySetInnerHTML={{ __html: richTextSection.content }}
            />
          )}
        </section>
      );
    })}
  </div>
);

const RichTextSectionField = ({ section }) => {
  const {
    activeSectionId,
    form,
    isReadonly,
    scrollToSection,
    setActiveSectionId,
  } = useReportPage();
  const richTextListName = ['sections', section.sectionId, 'children'];
  const richTextSections = Form.useWatch(richTextListName, form) || [];

  if (isReadonly) {
    return (
      <Form.Item noStyle shouldUpdate>
        {({ getFieldValue }) => (
          <RichTextSectionViewer
            richTextSections={getFieldValue(richTextListName) || []}
          />
        )}
      </Form.Item>
    );
  }

  const getSectionConfig = (sectionId) => {
    return section.children?.find((item) => item.sectionId === sectionId);
  };

  const handleAdd = (add, insertIndex) => {
    const newSection = createRichTextSection();
    add(newSection, insertIndex);
    setActiveSectionId(newSection.sectionId);

    requestAnimationFrame(() => {
      scrollToSection(newSection.sectionId);
    });
  };

  const handleRemove = (remove, index) => {
    const removedSection = richTextSections[index];
    const fallbackSection = richTextSections[index + 1]
      || richTextSections[index - 1]
      || section;

    remove(index);

    if (removedSection?.sectionId === activeSectionId) {
      setActiveSectionId(fallbackSection.sectionId);
      requestAnimationFrame(() => {
        scrollToSection(fallbackSection.sectionId);
      });
    }
  };

  return (
    <Form.List name={richTextListName}>
      {(fields, { add, remove }) => (
        <div className="rich-text-section-list">
          {fields.map((field, index) => {
            const sectionValue = richTextSections[field.name] || {};
            const sectionConfig = getSectionConfig(sectionValue.sectionId);
            const canEditContent = !isReadonly && sectionConfig?.editable !== false;
            const canModifyTitle = !isReadonly
              && sectionConfig?.richTextModifiableFlag !== false;
            const canDelete = !isReadonly
              && sectionConfig?.richTextDeletableFlag !== false;

            return (
              <section
                className="report-section report-section--depth-2 rich-text-section"
                id={`report-section-${sectionValue.sectionId}`}
                key={field.key}
              >
                <header className="rich-text-section__header">
                  <div className="rich-text-section__title">
                    <span className="rich-text-section__order">
                      {getSectionOrderPrefix(index)}
                    </span>
                    {canModifyTitle ? (
                      <Form.Item
                        name={[field.name, 'title']}
                        rules={[{
                          required: true,
                          whitespace: true,
                          message: '请填写章节标题',
                        }]}
                      >
                        <Input
                          aria-label={`第${index + 1}个富文章节标题`}
                          placeholder="请输入章节标题"
                        />
                      </Form.Item>
                    ) : (
                      <>
                        <Form.Item
                          hidden
                          name={[field.name, 'title']}
                          rules={[{ required: true, message: '请填写章节标题' }]}
                        >
                          <Input />
                        </Form.Item>
                        <strong>{sectionValue.title || '未命名章节'}</strong>
                      </>
                    )}
                  </div>
                  {!isReadonly && (
                    <div className="rich-text-section__actions">
                      <Tooltip title="在当前章节后新增">
                        <Button
                          aria-label="在当前章节后新增"
                          icon={<PlusOutlined />}
                          onClick={() => handleAdd(add, field.name + 1)}
                        />
                      </Tooltip>
                      {canDelete && (
                        <Tooltip title="删除此章节">
                          <Button
                            aria-label="删除此章节"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemove(remove, field.name)}
                          />
                        </Tooltip>
                      )}
                    </div>
                  )}
                </header>
                <Form.Item hidden name={[field.name, 'sectionId']}>
                  <Input />
                </Form.Item>
                <Form.Item
                  className="rich-text-section__content"
                  name={[field.name, 'content']}
                  rules={getRichTextRules(sectionConfig)}
                >
                  <RichTextEditor disabled={!canEditContent} />
                </Form.Item>
              </section>
            );
          })}
          {!isReadonly && (
            <Button
              icon={<PlusOutlined />}
              type="primary"
              onClick={() => handleAdd(add)}
            >
              添加富文本章节
            </Button>
          )}
        </div>
      )}
    </Form.List>
  );
};

export default RichTextSectionField;
