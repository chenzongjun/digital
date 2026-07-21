import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getRichTextRules,
  getReadonlyFieldValue,
  getReadonlyTableValue,
  isEmptyFieldValue,
  isRichTextEmpty,
} from './report-field-utils.js';

test('查看态空字段统一展示占位符', () => {
  [undefined, null, '', '   '].forEach((value) => {
    assert.equal(isEmptyFieldValue(value), true);
    assert.equal(getReadonlyFieldValue(value), '--');
  });
});

test('查看态保留有效字段内容和数字零', () => {
  assert.equal(getReadonlyFieldValue('第一行\n第二行'), '第一行\n第二行');
  assert.equal(getReadonlyFieldValue(0), '0');
});

test('表格查看态将空数组展示为占位符并保留数字零', () => {
  assert.equal(getReadonlyTableValue({ fieldType: 'checkbox' }, []), '--');
  assert.equal(getReadonlyTableValue({ fieldType: 'inputNumber' }, 0), '0');
});

test('表格查看态为普通数组使用统一分隔符', () => {
  assert.equal(
    getReadonlyTableValue({ fieldType: 'text' }, ['第一项', '第二项']),
    '第一项、第二项',
  );
});

test('表格查看态按配置格式化日期并回退无效值', () => {
  const dateColumn = {
    fieldType: 'DatePicker',
    componentProps: { format: 'YYYY年MM月DD日' },
  };

  assert.equal(getReadonlyTableValue(dateColumn, '2026-07-21'), '2026年07月21日');
  assert.equal(getReadonlyTableValue(dateColumn, '待确认'), '待确认');
});

test('表格查看态将选项值映射为单选和多选标签', () => {
  const options = [
    { label: '采购部', value: 'procurement' },
    { label: '技术部', value: 'technology' },
  ];

  assert.equal(
    getReadonlyTableValue({ fieldType: 'select', options }, 'procurement'),
    '采购部',
  );
  assert.equal(
    getReadonlyTableValue(
      { fieldType: 'multipleSelect', options },
      ['procurement', 'technology'],
    ),
    '采购部、技术部',
  );
});

test('表格查看态为未配置选项回退原始值', () => {
  const column = {
    fieldType: 'checkbox',
    options: [{ label: '实施', value: 'implementation' }],
  };

  assert.equal(
    getReadonlyTableValue(column, ['implementation', 'legacy-value']),
    '实施、legacy-value',
  );
});

test('富文本判空保留文本和媒体内容', () => {
  assert.equal(isRichTextEmpty('<p><br></p>'), true);
  assert.equal(isRichTextEmpty('<p>&nbsp;</p>'), true);
  assert.equal(isRichTextEmpty('<p><strong>报告内容</strong></p>'), false);
  assert.equal(isRichTextEmpty('<p><img src="example.png" alt="附件" /></p>'), false);
});

test('富文本为空时触发章节校验', async () => {
  const [requiredRule] = getRichTextRules({}, '寻源');

  await assert.rejects(
    requiredRule.validator(undefined, '<p><br></p>'),
    /请填写寻源/,
  );
  await assert.doesNotReject(
    requiredRule.validator(undefined, '<p>供应商信息</p>'),
  );
});
