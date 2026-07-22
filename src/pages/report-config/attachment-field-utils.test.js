import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DEFAULT_ATTACHMENT_ACCEPT,
  DEFAULT_ATTACHMENT_FIELD_NAME,
  DEFAULT_ATTACHMENT_MAX_SIZE_MB,
  DEFAULT_ATTACHMENT_MULTIPLE,
  getAttachmentFieldConfig,
  normalizeAttachmentFile,
  validateAttachmentFile,
} from './attachment-field-utils.js';

const MEGABYTE_IN_BYTES = 1024 * 1024;
const attachmentField = {
  accept: ['.pdf', '.doc', '.docx', '.jpg', '.zip'],
  maxSizeMB: 20,
};

test('附件字段提供完整默认配置', () => {
  const defaultConfig = getAttachmentFieldConfig();

  assert.deepEqual(defaultConfig.accept, DEFAULT_ATTACHMENT_ACCEPT);
  assert.equal(DEFAULT_ATTACHMENT_FIELD_NAME, 'files');
  assert.equal(defaultConfig.editable, true);
  assert.equal(defaultConfig.fieldName, DEFAULT_ATTACHMENT_FIELD_NAME);
  assert.equal(defaultConfig.maxSizeMB, DEFAULT_ATTACHMENT_MAX_SIZE_MB);
  assert.equal(defaultConfig.multiple, DEFAULT_ATTACHMENT_MULTIPLE);
});

test('附件字段保留显式配置值', () => {
  const configuredField = getAttachmentFieldConfig({
    accept: [],
    editable: false,
    fieldName: 'supportingFiles',
    maxSizeMB: 0,
    multiple: false,
  });

  assert.deepEqual(configuredField.accept, []);
  assert.equal(configuredField.editable, false);
  assert.equal(configuredField.fieldName, 'supportingFiles');
  assert.equal(configuredField.maxSizeMB, 0);
  assert.equal(configuredField.multiple, false);
});

test('缺省配置仍会校验默认文件类型和大小', () => {
  assert.equal(
    validateAttachmentFile(
      { name: 'selection-report.pdf', size: MEGABYTE_IN_BYTES, type: '' },
    ).isValid,
    true,
  );
  assert.equal(
    validateAttachmentFile(
      { name: 'run-script.exe', size: MEGABYTE_IN_BYTES, type: '' },
    ).reason,
    'type',
  );
  assert.equal(
    validateAttachmentFile(
      { name: 'selection-report.pdf', size: 20 * MEGABYTE_IN_BYTES + 1, type: '' },
    ).reason,
    'size',
  );
});

test('附件校验允许配置中的文件扩展名', () => {
  const result = validateAttachmentFile(
    { name: 'selection-report.pdf', size: MEGABYTE_IN_BYTES, type: 'application/pdf' },
    attachmentField,
  );

  assert.equal(result.isValid, true);
});

test('附件扩展名校验不区分大小写', () => {
  const result = validateAttachmentFile(
    { name: 'selection-report.PDF', size: MEGABYTE_IN_BYTES, type: 'application/pdf' },
    attachmentField,
  );

  assert.equal(result.isValid, true);
});

test('附件校验允许没有 MIME 类型的 Office 文件', () => {
  const result = validateAttachmentFile(
    { name: 'selection-report.docx', size: MEGABYTE_IN_BYTES, type: '' },
    attachmentField,
  );

  assert.equal(result.isValid, true);
});

test('附件校验拒绝未配置的文件类型', () => {
  const result = validateAttachmentFile(
    { name: 'run-script.exe', size: MEGABYTE_IN_BYTES, type: 'application/octet-stream' },
    attachmentField,
  );

  assert.equal(result.isValid, false);
  assert.match(result.message, /仅支持/);
});

test('附件校验拒绝超过大小上限的文件', () => {
  const result = validateAttachmentFile(
    { name: 'selection-report.pdf', size: 20 * MEGABYTE_IN_BYTES + 1, type: 'application/pdf' },
    attachmentField,
  );

  assert.equal(result.isValid, false);
  assert.match(result.message, /不能超过 20 MB/);
});

test('附件校验允许大小恰好等于上限的文件', () => {
  const result = validateAttachmentFile(
    { name: 'selection-report.pdf', size: 20 * MEGABYTE_IN_BYTES, type: 'application/pdf' },
    attachmentField,
  );

  assert.equal(result.isValid, true);
});

test('上传响应会归一化为可序列化的附件元数据', () => {
  const originFileObj = { name: 'selection-report.pdf' };
  const normalizedFile = normalizeAttachmentFile({
    uid: 'upload-1',
    name: 'selection-report.pdf',
    status: 'done',
    size: MEGABYTE_IN_BYTES,
    type: 'application/pdf',
    originFileObj,
    percent: 100,
    response: {
      fileId: 'attachment-1',
      name: 'stored-report.pdf',
      size: MEGABYTE_IN_BYTES,
      type: 'application/pdf',
      url: 'blob:attachment-1',
    },
  });

  assert.deepEqual(normalizedFile, {
    uid: 'upload-1',
    fileId: 'attachment-1',
    name: 'stored-report.pdf',
    status: 'done',
    size: MEGABYTE_IN_BYTES,
    type: 'application/pdf',
    url: 'blob:attachment-1',
  });
  assert.equal('originFileObj' in normalizedFile, false);
  assert.equal('response' in normalizedFile, false);
  assert.equal('percent' in normalizedFile, false);
});
