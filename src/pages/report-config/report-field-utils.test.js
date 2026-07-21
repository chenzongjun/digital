import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getReadonlyFieldValue,
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

test('富文本判空保留文本和媒体内容', () => {
  assert.equal(isRichTextEmpty('<p><br></p>'), true);
  assert.equal(isRichTextEmpty('<p>&nbsp;</p>'), true);
  assert.equal(isRichTextEmpty('<p><strong>报告内容</strong></p>'), false);
  assert.equal(isRichTextEmpty('<p><img src="example.png" alt="附件" /></p>'), false);
});
