/**
 * API service for notes management
 * Handles all HTTP requests to the backend API
 */

import axios, { AxiosError, AxiosResponse } from "axios";
import {
  Note,
  CreateNoteData,
  UpdateNoteData,
  ApiError,
  PaginatedResponse,
  NoteFilters,
} from "../types";
import {
  API_CONFIG,
  HTTP_STATUS,
  ERROR_MESSAGES,
} from "../config/constants";

/**
 * API Response interface for standardized backend responses
 */
interface BackendResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{
    field: string;
    message: string;
    value?: unknown;
  }>;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
}

/**
 * Create axios instance with default configuration
 */
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true", // For development with ngrok
  },
});

/**
 * Request interceptor for adding auth tokens and logging
 */
api.interceptors.request.use(
  (config) => {
    // Add timestamp for debugging
    (config as any).metadata = {
      startTime: new Date().getTime(),
    };

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for handling responses and errors
 */
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Calculate request duration
    const duration = new Date().getTime() - (response.config as any).metadata?.startTime;

    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.status} in ${duration}ms`);
    }

    return response;
  },
  (error: AxiosError) => {
    if (import.meta.env.DEV) {
      console.error("❌ API Error:", error.response?.status, error.message);
    }

    return Promise.reject(error);
  }
);

/**
 * Enhanced error handler with proper typing and retry logic
 */
const handleError = (error: unknown): never => {
  let apiError: ApiError;

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<BackendResponse<unknown>>;

    // Handle network errors
    if (!axiosError.response) {
      apiError = {
        message: ERROR_MESSAGES.NETWORK_ERROR,
        code: "NETWORK_ERROR",
        status: 0,
        timestamp: new Date().toISOString(),
      };
    } else {
      const { status, data } = axiosError.response;

      // Extract error message from backend response
      const message = data?.message || data?.errors?.[0]?.message || getStatusMessage(status) || ERROR_MESSAGES.SERVER_ERROR;

      apiError = {
        message,
        code: getErrorCode(status),
        status,
        details: data?.errors || [],
        timestamp: new Date().toISOString(),
      };
    }
  } else {
    // Handle non-axios errors
    apiError = {
      message: error instanceof Error ? error.message : "Unknown error occurred",
      code: "UNKNOWN_ERROR",
      status: 0,
      timestamp: new Date().toISOString(),
    };
  }

  throw apiError;
};

/**
 * Get error code based on HTTP status
 */
const getErrorCode = (status: number): string => {
  switch (status) {
    case HTTP_STATUS.BAD_REQUEST:
      return "BAD_REQUEST";
    case HTTP_STATUS.UNAUTHORIZED:
      return "UNAUTHORIZED";
    case HTTP_STATUS.FORBIDDEN:
      return "FORBIDDEN";
    case HTTP_STATUS.NOT_FOUND:
      return "NOT_FOUND";
    case HTTP_STATUS.CONFLICT:
      return "CONFLICT";
    case HTTP_STATUS.UNPROCESSABLE_ENTITY:
      return "VALIDATION_ERROR";
    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      return "SERVER_ERROR";
    case HTTP_STATUS.SERVICE_UNAVAILABLE:
      return "SERVICE_UNAVAILABLE";
    default:
      return "HTTP_ERROR";
  }
};

/**
 * Get human-readable error message based on HTTP status
 */
const getStatusMessage = (status: number): string => {
  switch (status) {
    case HTTP_STATUS.BAD_REQUEST:
      return ERROR_MESSAGES.VALIDATION_ERROR;
    case HTTP_STATUS.UNAUTHORIZED:
      return ERROR_MESSAGES.UNAUTHORIZED;
    case HTTP_STATUS.NOT_FOUND:
      return ERROR_MESSAGES.NOT_FOUND;
    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      return ERROR_MESSAGES.SERVER_ERROR;
    case HTTP_STATUS.SERVICE_UNAVAILABLE:
      return ERROR_MESSAGES.SERVER_ERROR;
    default:
      return ERROR_MESSAGES.SERVER_ERROR;
  }
};

/**
 * Retry failed requests with exponential backoff
 */
const retryRequest = async <T>(requestFn: () => Promise<T>, attempts: number = API_CONFIG.RETRY_ATTEMPTS): Promise<T> => {
  for (let i = 0; i < attempts; i++) {
    try {
      return await requestFn();
    } catch (error) {
      if (i === attempts - 1) throw error;

      // Don't retry on client errors (4xx)
      if (axios.isAxiosError(error) && error.response?.status && error.response.status >= 400 && error.response.status < 500) {
        throw error;
      }

      // Wait before retrying with exponential backoff
      const delay = API_CONFIG.RETRY_DELAY * Math.pow(2, i);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error("Max retry attempts reached");
};

/**
 * Get all notes with optional filtering and pagination
 */
export const getNotes = async (filters?: NoteFilters): Promise<PaginatedResponse<Note[]>> => {
  try {
    const params: Record<string, unknown> = {};

    if (filters) {
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;
      if (filters.search) params.search = filters.search;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.sortOrder) params.sortOrder = filters.sortOrder;
      if (filters.archived !== undefined) params.archived = filters.archived;
    }

    const response = await retryRequest(() =>
      api.get<BackendResponse<Note[]>>("/notes", { params })
    );

    const { data, pagination } = response.data;

    return {
      data: data || [],
      pagination: pagination || {
        currentPage: 1,
        totalPages: 1,
        totalCount: Array.isArray(data) ? data.length : 0,
        hasNextPage: false,
        hasPrevPage: false,
        limit: 20,
      },
    };
  } catch (error) {
    console.error("Error fetching notes:", error);
    return handleError(error);
  }
};

/**
 * Get a single note by ID
 */
export const getNoteById = async (id: string): Promise<Note> => {
  try {
    const response = await retryRequest(() =>
      api.get<BackendResponse<Note>>(`/notes/${id}`)
    );

    if (!response.data.data) {
      throw new Error(ERROR_MESSAGES.NOT_FOUND);
    }

    return response.data.data;
  } catch (error) {
    console.error(`Error fetching note ${id}:`, error);
    return handleError(error);
  }
};

/**
 * Create a new note
 */
export const createNote = async (data: CreateNoteData): Promise<Note> => {
  try {
    const response = await retryRequest(() =>
      api.post<BackendResponse<Note>>("/notes", data)
    );

    if (!response.data.data) {
      throw new Error(ERROR_MESSAGES.CREATE_NOTE_ERROR);
    }

    return response.data.data;
  } catch (error) {
    console.error("Error creating note:", error);
    return handleError(error);
  }
};

/**
 * Update an existing note
 */
export const updateNote = async (id: string, data: UpdateNoteData): Promise<Note> => {
  try {
    const response = await retryRequest(() =>
      api.put<BackendResponse<Note>>(`/notes/${id}`, data)
    );

    if (!response.data.data) {
      throw new Error(ERROR_MESSAGES.UPDATE_NOTE_ERROR);
    }

    return response.data.data;
  } catch (error) {
    console.error(`Error updating note ${id}:`, error);
    return handleError(error);
  }
};

/**
 * Delete a note
 */
export const deleteNote = async (id: string): Promise<void> => {
  try {
    await retryRequest(() => api.delete(`/notes/${id}`));
  } catch (error) {
    console.error(`Error deleting note ${id}:`, error);
    return handleError(error);
  }
};

/**
 * Search notes with text query
 */
export const searchNotes = async (query: string, limit?: number): Promise<Note[]> => {
  try {
    const params: Record<string, unknown> = { q: query };
    if (limit) params.limit = limit;

    const response = await retryRequest(() =>
      api.get<BackendResponse<Note[]>>("/notes/search", { params })
    );

    return response.data.data || [];
  } catch (error) {
    console.error("Error searching notes:", error);
    return handleError(error);
  }
};

/**
 * Toggle archive status of a note
 */
export const toggleArchiveNote = async (id: string): Promise<Note> => {
  try {
    const response = await retryRequest(() =>
      api.patch<BackendResponse<Note>>(`/notes/${id}/archive`)
    );

    if (!response.data.data) {
      throw new Error(ERROR_MESSAGES.UPDATE_NOTE_ERROR);
    }

    return response.data.data;
  } catch (error) {
    console.error(`Error toggling archive status for note ${id}:`, error);
    return handleError(error);
  }
};
