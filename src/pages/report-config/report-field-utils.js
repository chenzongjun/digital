import moment from 'moment';

const CHINESE_DIGITS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

export const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD';

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

export const isEmptyFieldValue = (value) => (
  value === undefined
  || value === null
  || (Array.isArray(value) && value.length === 0)
  || (typeof value === 'string' && value.trim() === '')
);

export const getReadonlyFieldValue = (value) => (
  isEmptyFieldValue(value) ? '--' : String(value)
);

export const parseDatePickerValue = (value, format = DEFAULT_DATE_FORMAT) => {
  if (moment.isMoment(value)) {
    return value;
  }

  return moment(value, [format, moment.ISO_8601], true);
};

const getOptionLabel = (options, value) => {
  const matchedOption = (options || []).find((option) => option.value === value);

  return matchedOption ? matchedOption.label : value;
};

export const getReadonlyTableValue = (column, value) => {
  if (isEmptyFieldValue(value)) {
    return '--';
  }

  if (column.fieldType === 'DatePicker') {
    const format = column.componentProps?.format || DEFAULT_DATE_FORMAT;
    const dateValue = parseDatePickerValue(value, format);

    return dateValue.isValid() ? dateValue.format(format) : String(value);
  }

  if (['radio', 'checkbox', 'select', 'multipleSelect'].includes(column.fieldType)) {
    const values = Array.isArray(value) ? value : [value];

    return values
      .map((optionValue) => String(getOptionLabel(column.options, optionValue)))
      .join('、');
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item)).join('、');
  }

  return String(value);
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

  if (/<(?:img|video|iframe|table)\b/i.test(html)) {
    return false;
  }

  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .trim()
    .length === 0;
};

export const getRichTextRules = (sectionConfig, sectionTitle) => {
  const configuredRules = sectionConfig?.rules || [];
  const title = sectionTitle || sectionConfig?.title || '章节内容';

  return [
    {
      validator: (_, value) => (
        isRichTextEmpty(value)
          ? Promise.reject(new Error(`请填写${title}`))
          : Promise.resolve()
      ),
    },
    ...configuredRules,
  ];
};
