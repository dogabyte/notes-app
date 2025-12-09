/**
 * Utility functions for the Notes application
 */

import {
  UI_CONSTANTS,
  VALIDATION_RULES,
} from "../config/constants";
import { ValidationError } from "../types";

/**
 * Format date to readable string
 */
export const formatDate =
  (
    date:
      | string
      | Date,
  ): string => {
    try {
      const dateObj =
        typeof date ===
        "string"
          ? new Date(
              date,
            )
          : date;

      if (
        isNaN(
          dateObj.getTime(),
        )
      ) {
        return "Invalid date";
      }

      const now =
        new Date();
      const diffInMs =
        now.getTime() -
        dateObj.getTime();
      const diffInMinutes =
        Math.floor(
          diffInMs /
            (1000 *
              60),
        );
      const diffInHours =
        Math.floor(
          diffInMinutes /
            60,
        );
      const diffInDays =
        Math.floor(
          diffInHours /
            24,
        );

      // Less than a minute ago
      if (
        diffInMinutes <
        1
      ) {
        return "Just now";
      }

      // Less than an hour ago
      if (
        diffInMinutes <
        60
      ) {
        return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
      }

      // Less than a day ago
      if (
        diffInHours <
        24
      ) {
        return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
      }

      // Less than a week ago
      if (
        diffInDays <
        7
      ) {
        return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
      }

      // Format as date
      return dateObj.toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month:
            "short",
          day: "numeric",
        },
      );
    } catch (error) {
      console.error(
        "Error formatting date:",
        error,
      );
      return "Invalid date";
    }
  };

/**
 * Format date to relative time string
 */
export const formatRelativeTime =
  (
    date:
      | string
      | Date,
  ): string => {
    try {
      const dateObj =
        typeof date ===
        "string"
          ? new Date(
              date,
            )
          : date;

      if (
        isNaN(
          dateObj.getTime(),
        )
      ) {
        return "Invalid date";
      }

      const now =
        new Date();
      const rtf =
        new Intl.RelativeTimeFormat(
          "en",
          {
            numeric:
              "auto",
          },
        );
      const diffInSeconds =
        Math.floor(
          (dateObj.getTime() -
            now.getTime()) /
            1000,
        );

      if (
        Math.abs(
          diffInSeconds,
        ) <
        60
      ) {
        return rtf.format(
          diffInSeconds,
          "second",
        );
      }

      const diffInMinutes =
        Math.floor(
          diffInSeconds /
            60,
        );
      if (
        Math.abs(
          diffInMinutes,
        ) <
        60
      ) {
        return rtf.format(
          diffInMinutes,
          "minute",
        );
      }

      const diffInHours =
        Math.floor(
          diffInMinutes /
            60,
        );
      if (
        Math.abs(
          diffInHours,
        ) <
        24
      ) {
        return rtf.format(
          diffInHours,
          "hour",
        );
      }

      const diffInDays =
        Math.floor(
          diffInHours /
            24,
        );
      if (
        Math.abs(
          diffInDays,
        ) <
        30
      ) {
        return rtf.format(
          diffInDays,
          "day",
        );
      }

      const diffInMonths =
        Math.floor(
          diffInDays /
            30,
        );
      if (
        Math.abs(
          diffInMonths,
        ) <
        12
      ) {
        return rtf.format(
          diffInMonths,
          "month",
        );
      }

      const diffInYears =
        Math.floor(
          diffInMonths /
            12,
        );
      return rtf.format(
        diffInYears,
        "year",
      );
    } catch (error) {
      console.error(
        "Error formatting relative time:",
        error,
      );
      return formatDate(
        date,
      );
    }
  };

/**
 * Truncate text to specified length
 */
export const truncateText =
  (
    text: string,
    maxLength: number = 100,
  ): string => {
    if (
      text.length <=
      maxLength
    ) {
      return text;
    }

    return (
      text
        .substring(
          0,
          maxLength,
        )
        .trim() +
      "..."
    );
  };

/**
 * Sanitize HTML to prevent XSS attacks
 */
export const sanitizeHtml =
  (
    html: string,
  ): string => {
    const temp =
      document.createElement(
        "div",
      );
    temp.textContent =
      html;
    return temp.innerHTML;
  };

/**
 * Escape special characters in string for use in regex
 */
export const escapeRegex =
  (
    string: string,
  ): string => {
    return string.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&",
    );
  };

/**
 * Debounce function to limit rapid function calls
 */
export const debounce =
  <
    T extends
      (
        ...args: unknown[]
      ) => unknown,
  >(
    func: T,
    wait: number = UI_CONSTANTS.DEBOUNCE_DELAY,
  ): ((
    ...args: Parameters<T>
  ) => void) => {
    let timeout: NodeJS.Timeout;

    return (
      ...args: Parameters<T>
    ) => {
      clearTimeout(
        timeout,
      );
      timeout =
        setTimeout(
          () =>
            func(
              ...args,
            ),
          wait,
        );
    };
  };

/**
 * Throttle function to limit function calls to once per interval
 */
export const throttle =
  <
    T extends
      (
        ...args: unknown[]
      ) => unknown,
  >(
    func: T,
    limit: number,
  ): ((
    ...args: Parameters<T>
  ) => void) => {
    let inThrottle: boolean;

    return (
      ...args: Parameters<T>
    ) => {
      if (
        !inThrottle
      ) {
        func(
          ...args,
        );
        inThrottle = true;
        setTimeout(
          () =>
            (inThrottle = false),
          limit,
        );
      }
    };
  };

/**
 * Generate a unique ID
 */
export const generateId =
  (): string => {
    return (
      Math.random()
        .toString(
          36,
        )
        .substring(
          2,
        ) +
      Date.now().toString(
        36,
      )
    );
  };

/**
 * Check if a string is a valid email
 */
export const isValidEmail =
  (
    email: string,
  ): boolean => {
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(
      email,
    );
  };

/**
 * Validate note title
 */
export const validateTitle =
  (
    title: string,
  ): ValidationError | null => {
    const trimmedTitle =
      title.trim();

    if (
      !trimmedTitle &&
      VALIDATION_RULES
        .TITLE
        .required
    ) {
      return {
        field:
          "title",
        message:
          "Title is required",
      };
    }

    if (
      trimmedTitle.length <
      VALIDATION_RULES
        .TITLE
        .minLength
    ) {
      return {
        field:
          "title",
        message: `Title must be at least ${VALIDATION_RULES.TITLE.minLength} character long`,
      };
    }

    if (
      trimmedTitle.length >
      VALIDATION_RULES
        .TITLE
        .maxLength
    ) {
      return {
        field:
          "title",
        message: `Title cannot exceed ${VALIDATION_RULES.TITLE.maxLength} characters`,
      };
    }

    return null;
  };

/**
 * Validate note content
 */
export const validateContent =
  (
    content: string,
  ): ValidationError | null => {
    const trimmedContent =
      content.trim();

    if (
      !trimmedContent &&
      VALIDATION_RULES
        .CONTENT
        .required
    ) {
      return {
        field:
          "content",
        message:
          "Content is required",
      };
    }

    if (
      trimmedContent.length <
      VALIDATION_RULES
        .CONTENT
        .minLength
    ) {
      return {
        field:
          "content",
        message: `Content must be at least ${VALIDATION_RULES.CONTENT.minLength} character long`,
      };
    }

    if (
      trimmedContent.length >
      VALIDATION_RULES
        .CONTENT
        .maxLength
    ) {
      return {
        field:
          "content",
        message: `Content cannot exceed ${VALIDATION_RULES.CONTENT.maxLength} characters`,
      };
    }

    return null;
  };

/**
 * Validate note data
 */
export const validateNoteData =
  (data: {
    title: string;
    content: string;
  }): ValidationError[] => {
    const errors: ValidationError[] =
      [];

    const titleError =
      validateTitle(
        data.title,
      );
    if (
      titleError
    ) {
      errors.push(
        titleError,
      );
    }

    const contentError =
      validateContent(
        data.content,
      );
    if (
      contentError
    ) {
      errors.push(
        contentError,
      );
    }

    return errors;
  };

/**
 * Copy text to clipboard
 */
export const copyToClipboard =
  async (
    text: string,
  ): Promise<boolean> => {
    try {
      if (
        navigator.clipboard &&
        window.isSecureContext
      ) {
        await navigator.clipboard.writeText(
          text,
        );
        return true;
      } else {
        // Fallback for older browsers
        const textArea =
          document.createElement(
            "textarea",
          );
        textArea.value =
          text;
        textArea.style.position =
          "absolute";
        textArea.style.left =
          "-999999px";
        document.body.appendChild(
          textArea,
        );
        textArea.select();
        document.execCommand(
          "copy",
        );
        document.body.removeChild(
          textArea,
        );
        return true;
      }
    } catch (error) {
      console.error(
        "Failed to copy text:",
        error,
      );
      return false;
    }
  };

/**
 * Download text as file
 */
export const downloadAsFile =
  (
    content: string,
    filename: string,
    mimeType: string = "text/plain",
  ): void => {
    try {
      const blob =
        new Blob(
          [
            content,
          ],
          {
            type: mimeType,
          },
        );
      const url =
        URL.createObjectURL(
          blob,
        );
      const link =
        document.createElement(
          "a",
        );

      link.href =
        url;
      link.download =
        filename;
      link.style.display =
        "none";

      document.body.appendChild(
        link,
      );
      link.click();
      document.body.removeChild(
        link,
      );

      URL.revokeObjectURL(
        url,
      );
    } catch (error) {
      console.error(
        "Failed to download file:",
        error,
      );
    }
  };

/**
 * Format file size in bytes to human readable format
 */
export const formatFileSize =
  (
    bytes: number,
  ): string => {
    if (
      bytes ===
      0
    )
      return "0 Bytes";

    const k = 1024;
    const sizes =
      [
        "Bytes",
        "KB",
        "MB",
        "GB",
        "TB",
      ];
    const i =
      Math.floor(
        Math.log(
          bytes,
        ) /
          Math.log(
            k,
          ),
      );

    return (
      parseFloat(
        (
          bytes /
          Math.pow(
            k,
            i,
          )
        ).toFixed(
          2,
        ),
      ) +
      " " +
      sizes[
        i
      ]
    );
  };

/**
 * Check if device is mobile
 */
export const isMobile =
  (): boolean => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
  };

/**
 * Check if device supports touch
 */
export const isTouchDevice =
  (): boolean => {
    return (
      "ontouchstart" in
        window ||
      navigator.maxTouchPoints >
        0
    );
  };

/**
 * Get preferred color scheme
 */
export const getPreferredColorScheme =
  ():
    | "light"
    | "dark" => {
    if (
      typeof window !==
        "undefined" &&
      window.matchMedia
    ) {
      return window.matchMedia(
        "(prefers-color-scheme: dark)",
      )
        .matches
        ? "dark"
        : "light";
    }
    return "light";
  };

/**
 * Create a delay promise
 */
export const delay =
  (
    ms: number,
  ): Promise<void> => {
    return new Promise(
      (
        resolve,
      ) =>
        setTimeout(
          resolve,
          ms,
        ),
    );
  };

/**
 * Retry async operation with exponential backoff
 */
export const retryWithBackoff =
  async <
    T,
  >(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000,
  ): Promise<T> => {
    let lastError: unknown;

    for (
      let attempt = 0;
      attempt <=
      maxRetries;
      attempt++
    ) {
      try {
        return await operation();
      } catch (error) {
        lastError =
          error;

        if (
          attempt ===
          maxRetries
        ) {
          throw error;
        }

        const delayMs =
          baseDelay *
          Math.pow(
            2,
            attempt,
          );
        await delay(
          delayMs,
        );
      }
    }

    throw lastError;
  };

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export const isEmpty =
  (
    value: unknown,
  ): boolean => {
    if (
      value ==
      null
    )
      return true;

    if (
      typeof value ===
      "string"
    )
      return (
        value.trim()
          .length ===
        0
      );

    if (
      Array.isArray(
        value,
      )
    )
      return (
        value.length ===
        0
      );

    if (
      typeof value ===
      "object"
    ) {
      return (
        Object.keys(
          value as Record<
            string,
            unknown
          >,
        )
          .length ===
        0
      );
    }

    return false;
  };

/**
 * Deep clone an object
 */
export const deepClone =
  <T>(
    obj: T,
  ): T => {
    if (
      obj ===
        null ||
      typeof obj !==
        "object"
    )
      return obj;

    if (
      obj instanceof
      Date
    )
      return new Date(
        obj.getTime(),
      ) as unknown as T;

    if (
      Array.isArray(
        obj,
      )
    ) {
      return obj.map(
        (
          item,
        ) =>
          deepClone(
            item,
          ),
      ) as unknown as T;
    }

    const cloned =
      {} as T;
    for (const key in obj) {
      if (
        Object.prototype.hasOwnProperty.call(
          obj,
          key,
        )
      ) {
        cloned[
          key
        ] =
          deepClone(
            obj[
              key
            ],
          );
      }
    }

    return cloned;
  };

/**
 * Compare two objects for equality
 */
export const isEqual =
  (
    a: unknown,
    b: unknown,
  ): boolean => {
    if (
      a ===
      b
    )
      return true;

    if (
      a ==
        null ||
      b ==
        null
    )
      return (
        a ===
        b
      );

    if (
      typeof a !==
      typeof b
    )
      return false;

    if (
      typeof a !==
      "object"
    )
      return false;

    if (
      Array.isArray(
        a,
      ) !==
      Array.isArray(
        b,
      )
    )
      return false;

    if (
      Array.isArray(
        a,
      )
    ) {
      const arrA =
        a as unknown[];
      const arrB =
        b as unknown[];
      if (
        arrA.length !==
        arrB.length
      )
        return false;
      return arrA.every(
        (
          item,
          index,
        ) =>
          isEqual(
            item,
            arrB[
              index
            ],
          ),
      );
    }

    const objA =
      a as Record<
        string,
        unknown
      >;
    const objB =
      b as Record<
        string,
        unknown
      >;
    const keysA =
      Object.keys(
        objA,
      );
    const keysB =
      Object.keys(
        objB,
      );

    if (
      keysA.length !==
      keysB.length
    )
      return false;

    return keysA.every(
      (
        key,
      ) =>
        Object.prototype.hasOwnProperty.call(
          objB,
          key,
        ) &&
        isEqual(
          objA[
            key
          ],
          objB[
            key
          ],
        ),
    );
  };

/**
 * Get nested object property safely
 */
export const getNestedProperty =
  (
    obj: Record<
      string,
      unknown
    >,
    path: string,
    defaultValue: unknown = undefined,
  ): unknown => {
    const keys =
      path.split(
        ".",
      );
    let result: unknown =
      obj;

    for (const key of keys) {
      if (
        result ==
          null ||
        typeof result !==
          "object"
      ) {
        return defaultValue;
      }
      result =
        (
          result as Record<
            string,
            unknown
          >
        )[
          key
        ];
    }

    return result !==
      undefined
      ? result
      : defaultValue;
  };

/**
 * Set nested object property safely
 */
export const setNestedProperty =
  (
    obj: Record<
      string,
      unknown
    >,
    path: string,
    value: unknown,
  ): void => {
    const keys =
      path.split(
        ".",
      );
    const lastKey =
      keys.pop();

    if (
      !lastKey
    )
      return;

    let current: Record<
      string,
      unknown
    > =
      obj;

    for (const key of keys) {
      if (
        !(
          key in
          current
        ) ||
        typeof current[
          key
        ] !==
          "object" ||
        current[
          key
        ] ==
          null
      ) {
        current[
          key
        ] =
          {};
      }
      current =
        current[
          key
        ] as Record<
          string,
          unknown
        >;
    }

    current[
      lastKey
    ] =
      value;
  };

/**
 * Remove HTML tags from string
 */
export const stripHtml =
  (
    html: string,
  ): string => {
    const temp =
      document.createElement(
        "div",
      );
    temp.innerHTML =
      html;
    return (
      temp.textContent ||
      temp.innerText ||
      ""
    );
  };

/**
 * Capitalize first letter of a string
 */
export const capitalize =
  (
    str: string,
  ): string => {
    if (
      !str
    )
      return str;
    return (
      str
        .charAt(
          0,
        )
        .toUpperCase() +
      str
        .slice(
          1,
        )
        .toLowerCase()
    );
  };

/**
 * Convert camelCase to kebab-case
 */
export const camelToKebab =
  (
    str: string,
  ): string => {
    return str
      .replace(
        /([a-z])([A-Z])/g,
        "$1-$2",
      )
      .toLowerCase();
  };

/**
 * Convert kebab-case to camelCase
 */
export const kebabToCamel =
  (
    str: string,
  ): string => {
    return str.replace(
      /-([a-z])/g,
      (
        _,
        letter,
      ) =>
        letter.toUpperCase(),
    );
  };
