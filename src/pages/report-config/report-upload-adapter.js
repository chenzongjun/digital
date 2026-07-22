import { createTemporaryId } from './report-field-utils';

const MOCK_PROGRESS_INTERVAL = 160;
const MOCK_PROGRESS_STEP = 20;

export const uploadReportAttachment = ({
  file,
  onError,
  onProgress,
  onSuccess,
}) => {
  let progress = 0;
  let timerId;
  let isAborted = false;

  const uploadNextChunk = () => {
    if (isAborted) {
      return;
    }

    try {
      progress = Math.min(progress + MOCK_PROGRESS_STEP, 100);
      onProgress?.({ percent: progress });

      if (progress === 100) {
        onSuccess?.({
          fileId: createTemporaryId('attachment-file'),
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file),
        });
        return;
      }

      timerId = setTimeout(uploadNextChunk, MOCK_PROGRESS_INTERVAL);
    } catch (error) {
      onError?.(error);
    }
  };

  timerId = setTimeout(uploadNextChunk, MOCK_PROGRESS_INTERVAL);

  return {
    abort: () => {
      isAborted = true;
      clearTimeout(timerId);
    },
  };
};
