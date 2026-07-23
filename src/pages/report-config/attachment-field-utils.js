const MEGABYTE_IN_BYTES = 1024 * 1024;

export const DEFAULT_ATTACHMENT_ACCEPT = Object.freeze([
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.zip',
  '.rar',
  '.7z',
]);
export const DEFAULT_ATTACHMENT_FIELD_NAME = 'files';
export const DEFAULT_ATTACHMENT_MAX_SIZE_MB = 100;
export const DEFAULT_ATTACHMENT_MAX_TOTAL_SIZE_MB = 300;
export const DEFAULT_ATTACHMENT_MULTIPLE = true;

export const getAttachmentFieldConfig = (field = {}) => ({
  ...field,
  accept: field.accept ?? DEFAULT_ATTACHMENT_ACCEPT,
  editable: field.editable ?? true,
  fieldName: field.fieldName ?? DEFAULT_ATTACHMENT_FIELD_NAME,
  maxSizeMB: field.maxSizeMB ?? DEFAULT_ATTACHMENT_MAX_SIZE_MB,
  maxTotalSizeMB:
    field.maxTotalSizeMB ?? DEFAULT_ATTACHMENT_MAX_TOTAL_SIZE_MB,
  multiple: field.multiple ?? DEFAULT_ATTACHMENT_MULTIPLE,
});

const getAcceptedTypes = (accept) => {
  if (Array.isArray(accept)) {
    return accept.map((type) => type.trim().toLowerCase()).filter(Boolean);
  }

  return String(accept || '')
    .split(',')
    .map((type) => type.trim().toLowerCase())
    .filter(Boolean);
};

const getFileExtension = (fileName = '') => {
  const extensionStart = fileName.lastIndexOf('.');

  return extensionStart >= 0 ? fileName.slice(extensionStart).toLowerCase() : '';
};

const isAcceptedFileType = (file, acceptedTypes) => {
  if (!acceptedTypes.length) {
    return true;
  }

  const fileExtension = getFileExtension(file.name);
  const mimeType = String(file.type || '').toLowerCase();

  return acceptedTypes.some((acceptedType) => {
    if (acceptedType.startsWith('.')) {
      return acceptedType === fileExtension;
    }

    if (acceptedType.endsWith('/*')) {
      return mimeType.startsWith(acceptedType.slice(0, -1));
    }

    return acceptedType === mimeType;
  });
};

export const getAttachmentAcceptValue = (accept) => {
  return getAcceptedTypes(accept).join(',');
};

export const validateAttachmentFile = (file, field) => {
  const attachmentConfig = getAttachmentFieldConfig(field);
  const acceptedTypes = getAcceptedTypes(attachmentConfig.accept);

  if (!isAcceptedFileType(file, acceptedTypes)) {
    return {
      isValid: false,
      message: `仅支持 ${acceptedTypes.join('、')} 格式的文件`,
      reason: 'type',
    };
  }

  const maxSizeMB = Number(attachmentConfig.maxSizeMB);
  const maxSize = maxSizeMB * MEGABYTE_IN_BYTES;

  if (maxSizeMB > 0 && file.size > maxSize) {
    return {
      isValid: false,
      message: `单个文件大小不能超过 ${maxSizeMB} MB`,
      reason: 'size',
    };
  }

  return { isValid: true };
};

const getAttachmentFilesSize = (files = []) => {
  return files.reduce((totalSize, file) => {
    if (file.status === 'error') {
      return totalSize;
    }

    const fileSize = Number(file.size);

    return totalSize + (Number.isFinite(fileSize) ? fileSize : 0);
  }, 0);
};

export const getAttachmentRemainingSizeMB = (files, field) => {
  const attachmentConfig = getAttachmentFieldConfig(field);
  const maxTotalSizeMB = Number(attachmentConfig.maxTotalSizeMB);

  if (maxTotalSizeMB <= 0) {
    return null;
  }

  const remainingSize = Math.max(
    maxTotalSizeMB * MEGABYTE_IN_BYTES - getAttachmentFilesSize(files),
    0,
  );

  return Math.floor((remainingSize / MEGABYTE_IN_BYTES) * 100) / 100;
};

export const validateAttachmentBatch = (
  files,
  existingFiles,
  field,
) => {
  const attachmentConfig = getAttachmentFieldConfig(field);
  const maxTotalSizeMB = Number(attachmentConfig.maxTotalSizeMB);
  const maxTotalSize = maxTotalSizeMB * MEGABYTE_IN_BYTES;
  const totalSize = getAttachmentFilesSize(existingFiles)
    + getAttachmentFilesSize(files);

  if (maxTotalSizeMB > 0 && totalSize > maxTotalSize) {
    return {
      isValid: false,
      message: `所有文件总大小不能超过 ${maxTotalSizeMB} MB`,
      reason: 'totalSize',
    };
  }

  return { isValid: true };
};

export const normalizeAttachmentFile = (file) => {
  const response = file.response || {};
  const normalizedFile = {
    uid: file.uid || response.fileId || file.fileId,
    fileId: response.fileId || file.fileId,
    name: response.name || file.name,
    status: file.status,
    size: response.size ?? file.size,
    type: response.type || file.type,
    url: response.url || file.url,
  };

  if (file.status === 'uploading' && Number.isFinite(file.percent)) {
    normalizedFile.percent = file.percent;
  }

  return Object.fromEntries(
    Object.entries(normalizedFile).filter(([, value]) => value !== undefined),
  );
};
