/**
 * Core Note interface representing a note entity
 */
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isArchived?: boolean;
  tags?: string[];
}

/**
 * Data required to create a new note
 */
export interface CreateNoteData {
  title: string;
  content: string;
  tags?: string[];
}

/**
 * Data that can be updated in an existing note
 */
export interface UpdateNoteData {
  title?: string;
  content?: string;
  tags?: string[];
  isArchived?: boolean;
}

/**
 * API Error interface for standardized error handling
 */
export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: Array<{
    field: string;
    message: string;
    value?: unknown;
  }>;
  timestamp: string;
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ApiError[];
}

/**
 * Paginated response interface
 */
export interface PaginatedResponse<T> {
  data: T;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
}

/**
 * Filters for note queries
 */
export interface NoteFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "createdAt" | "updatedAt" | "title";
  sortOrder?: "asc" | "desc";
  archived?: boolean;
  tags?: string[];
}

/**
 * Sort options for notes
 */
export type SortOption = {
  label: string;
  value: string;
  sortBy: "createdAt" | "updatedAt" | "title";
  sortOrder: "asc" | "desc";
};

/**
 * Loading states for async operations
 */
export type LoadingState = "idle" | "loading" | "success" | "error";

/**
 * Toast notification types
 */
export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
  timestamp: number;
}

/**
 * Form validation error interface
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Form state interface
 */
export interface FormState<T> {
  values: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
}

/**
 * Application theme interface
 */
export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

/**
 * User preferences interface
 */
export interface UserPreferences {
  theme: "light" | "dark" | "system";
  language: string;
  notesPerPage: number;
  defaultSortBy: "createdAt" | "updatedAt" | "title";
  defaultSortOrder: "asc" | "desc";
  autoSave: boolean;
  showPreview: boolean;
}

/**
 * Application state interface
 */
export interface AppState {
  notes: Note[];
  currentNote: Note | null;
  isLoading: boolean;
  error: string | null;
  filters: NoteFilters;
  preferences: UserPreferences;
  toasts: Toast[];
}

/**
 * Component props interfaces
 */
export interface BaseComponentProps {
  className?: string;
  testId?: string;
}

export interface NoteFormProps extends BaseComponentProps {
  note?: Note;
  isEditing: boolean;
  onSubmit: (data: CreateNoteData | UpdateNoteData) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export interface NoteCardProps extends BaseComponentProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onArchive?: (id: string) => void;
  showActions?: boolean;
}

/**
 * Hook return types
 */
export interface UseNotesReturn {
  notes: Note[];
  loading: boolean;
  error: string | null;
  createNote: (data: CreateNoteData) => Promise<Note>;
  updateNote: (id: string, data: UpdateNoteData) => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;
  refreshNotes: () => Promise<void>;
}

export interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isSubmitting: boolean;
  handleChange: (field: keyof T, value: T[keyof T]) => void;
  handleBlur: (field: keyof T) => void;
  handleSubmit: (
    onSubmit: (values: T) => void | Promise<void>,
  ) => Promise<void>;
  reset: () => void;
  setValues: (values: Partial<T>) => void;
  setErrors: (errors: Partial<Record<keyof T, string>>) => void;
}
