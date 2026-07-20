const CHINESE_DIGITS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

let temporaryIdSeed = 0;

export const createTemporaryId = (prefix) => {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }

  temporaryIdSeed += 1;
  return `${prefix}-${Date.now()}-${temporaryIdSeed}`;
};

export const getFieldRules = (field, defaultMessage) => {
  const configuredRules = field.rules || [];

  if (!field.required) {
    return configuredRules.length ? configuredRules : undefined;
  }

  return [
    {
      required: true,
      whitespace: true,
      message: defaultMessage,
    },
    ...configuredRules,
  ];
};

const getChineseNumber = (number) => {
  if (number < 10) {
    return CHINESE_DIGITS[number];
  }

  if (number < 20) {
    return `十${number === 10 ? '' : CHINESE_DIGITS[number % 10]}`;
  }

  if (number < 100) {
    const units = number % 10 ? CHINESE_DIGITS[number % 10] : '';
    return `${CHINESE_DIGITS[Math.floor(number / 10)]}十${units}`;
  }

  return String(number);
};

export const getNumberedSectionTitle = (title, index) => {
  return `（${getChineseNumber(index + 1)}）${title || '未命名章节'}`;
};

export const getSectionOrderPrefix = (index) => {
  return `（${getChineseNumber(index + 1)}）`;
};

export const isRichTextEmpty = (html) => {
  if (!html) {
    return true;
  }

  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .trim()
    .length === 0;
};
