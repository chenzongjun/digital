import {
  DownloadOutlined,
  EyeOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { Button, Empty, message, Space, Upload } from 'antd';
import { useEffect, useRef } from 'react';
import { useReportPage } from './ReportPageContext';
import {
  getAttachmentAcceptValue,
  getAttachmentFieldConfig,
  normalizeAttachmentFile,
  validateAttachmentFile,
} from './attachment-field-utils';
import { uploadReportAttachment } from './report-upload-adapter';

const { Dragger } = Upload;

const getFileList = (value) => (Array.isArray(value) ? value : []);
const isBlobUrl = (url) => String(url || '').startsWith('blob:');

const AttachmentField = ({ field, onChange, value }) => {
  const { isReadonly } = useReportPage();
  const attachmentConfig = getAttachmentFieldConfig(field);
  const fileList = getFileList(value);
  const blobUrlsRef = useRef(new Set());
  const accept = getAttachmentAcceptValue(attachmentConfig.accept);
  const canUpload = !isReadonly && attachmentConfig.editable;

  useEffect(() => {
    const nextBlobUrls = new Set(
      fileList.filter((file) => isBlobUrl(file.url)).map((file) => file.url),
    );

    blobUrlsRef.current.forEach((url) => {
      if (!nextBlobUrls.has(url)) {
        URL.revokeObjectURL(url);
      }
    });

    blobUrlsRef.current = nextBlobUrls;
  }, [fileList]);

  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  const showValidationError = (file, reason) => {
    const validationResult = validateAttachmentFile(file, attachmentConfig);

    if (
      !validationResult.isValid
      && (!reason || validationResult.reason === reason)
    ) {
      message.error(`${file.name}：${validationResult.message}`);
    }

    return validationResult.isValid;
  };

  const handleBeforeUpload = (file) => {
    return showValidationError(file) ? true : Upload.LIST_IGNORE;
  };

  const handleChange = ({ fileList: changedFileList }) => {
    onChange?.(changedFileList.map(normalizeAttachmentFile));
  };

  const handleDrop = (event) => {
    Array.from(event.dataTransfer.files).forEach((file) => {
      showValidationError(file, 'type');
    });
  };

  const renderUploadItem = (originNode, file) => (
    <div className="attachment-field__item">
      <div className="attachment-field__item-content">{originNode}</div>
      {file.status === 'done' && file.url && (
        <Space className="attachment-field__item-actions" size={4}>
          <Button
            aria-label={`预览${file.name}`}
            href={file.url}
            icon={<EyeOutlined />}
            rel="noopener noreferrer"
            size="small"
            target="_blank"
            type="link"
          >
            预览
          </Button>
          <Button
            aria-label={`下载${file.name}`}
            download={file.name}
            href={file.url}
            icon={<DownloadOutlined />}
            rel="noopener noreferrer"
            size="small"
            type="link"
          >
            下载
          </Button>
        </Space>
      )}
    </div>
  );

  const showUploadList = {
    showDownloadIcon: false,
    showPreviewIcon: false,
    showRemoveIcon: canUpload,
  };

  if (!canUpload) {
    if (!fileList.length) {
      return (
        <Empty
          className="attachment-field__empty"
          description="暂无附件"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }

    return (
      <div className="attachment-field attachment-field--readonly">
        <Upload
          disabled
          fileList={fileList}
          itemRender={renderUploadItem}
          openFileDialogOnClick={false}
          showUploadList={showUploadList}
        />
      </div>
    );
  }

  return (
    <div className="attachment-field">
      <Dragger
        accept={accept}
        beforeUpload={handleBeforeUpload}
        customRequest={uploadReportAttachment}
        fileList={fileList}
        itemRender={renderUploadItem}
        multiple={attachmentConfig.multiple}
        onChange={handleChange}
        onDrop={handleDrop}
        showUploadList={showUploadList}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
        <p className="ant-upload-hint">
          支持多文件上传，单个文件不超过 {attachmentConfig.maxSizeMB} MB
        </p>
      </Dragger>
    </div>
  );
};

export default AttachmentField;
