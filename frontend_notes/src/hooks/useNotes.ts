/**
 * Custom hook for managing notes state and operations
 */

import {
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  Note,
  CreateNoteData,
  UpdateNoteData,
  NoteFilters,
  PaginatedResponse,
  ApiError,
  LoadingState,
} from "../types";
import {
  getNotes,
  createNote as apiCreateNote,
  updateNote as apiUpdateNote,
  deleteNote as apiDeleteNote,
  searchNotes,
  toggleArchiveNote,
} from "../services/api";
import { ERROR_MESSAGES } from "../config/constants";

interface UseNotesOptions {
  initialFilters?: NoteFilters;
  autoFetch?: boolean;
}

export const useNotes =
  (
    options: UseNotesOptions = {},
  ) => {
    const {
      initialFilters = {},
      autoFetch = true,
    } =
      options;

    // State
    const [
      notes,
      setNotes,
    ] =
      useState<
        Note[]
      >(
        [],
      );
    const [
      pagination,
      setPagination,
    ] =
      useState(
        {
          currentPage: 1,
          totalPages: 1,
          totalCount: 0,
          hasNextPage: false,
          hasPrevPage: false,
          limit: 20,
        },
      );
    const [
      filters,
      setFilters,
    ] =
      useState<NoteFilters>(
        initialFilters,
      );
    const [
      loadingState,
      setLoadingState,
    ] =
      useState<LoadingState>(
        "idle",
      );
    const [
      error,
      setError,
    ] =
      useState<
        | string
        | null
      >(
        null,
      );
    const [
      isRefreshing,
      setIsRefreshing,
    ] =
      useState(
        false,
      );

    // Computed values
    const isLoading =
      loadingState ===
      "loading";
    const isIdle =
      loadingState ===
      "idle";
    const hasError =
      loadingState ===
      "error";

    // Clear error when filters change
    useEffect(() => {
      if (
        error
      ) {
        setError(
          null,
        );
      }
    }, [
      filters,
      error,
    ]);

    /**
     * Fetch notes with current filters
     */
    const fetchNotes =
      useCallback(async () => {
        try {
          setLoadingState(
            "loading",
          );
          setError(
            null,
          );

          const response: PaginatedResponse<
            Note[]
          > =
            await getNotes(
              filters,
            );

          setNotes(
            response.data,
          );
          setPagination(
            response.pagination,
          );
          setLoadingState(
            "success",
          );
        } catch (err) {
          const apiError =
            err as ApiError;
          setError(
            apiError.message ||
              ERROR_MESSAGES.FETCH_NOTES_ERROR,
          );
          setLoadingState(
            "error",
          );
          console.error(
            "Error fetching notes:",
            err,
          );
        }
      }, [
        filters,
      ]);

    /**
     * Refresh notes data
     */
    const refreshNotes =
      useCallback(async () => {
        try {
          setIsRefreshing(
            true,
          );
          setError(
            null,
          );

          const response: PaginatedResponse<
            Note[]
          > =
            await getNotes(
              filters,
            );

          setNotes(
            response.data,
          );
          setPagination(
            response.pagination,
          );
        } catch (err) {
          const apiError =
            err as ApiError;
          setError(
            apiError.message ||
              ERROR_MESSAGES.FETCH_NOTES_ERROR,
          );
          console.error(
            "Error refreshing notes:",
            err,
          );
        } finally {
          setIsRefreshing(
            false,
          );
        }
      }, [
        filters,
      ]);

    /**
     * Create a new note
     */
    const createNote =
      useCallback(
        async (
          data: CreateNoteData,
        ): Promise<Note> => {
          try {
            const newNote =
              await apiCreateNote(
                data,
              );

            // Add to the beginning of the list
            setNotes(
              (
                prevNotes,
              ) => [
                newNote,
                ...prevNotes,
              ],
            );

            // Update pagination count
            setPagination(
              (
                prev,
              ) => ({
                ...prev,
                totalCount:
                  prev.totalCount +
                  1,
              }),
            );

            return newNote;
          } catch (err) {
            const apiError =
              err as ApiError;
            throw new Error(
              apiError.message ||
                ERROR_MESSAGES.CREATE_NOTE_ERROR,
            );
          }
        },
        [],
      );

    /**
     * Update an existing note
     */
    const updateNote =
      useCallback(
        async (
          id: string,
          data: UpdateNoteData,
        ): Promise<Note> => {
          try {
            const updatedNote =
              await apiUpdateNote(
                id,
                data,
              );

            // Update the note in the list
            setNotes(
              (
                prevNotes,
              ) =>
                prevNotes.map(
                  (
                    note,
                  ) =>
                    note.id ===
                    id
                      ? updatedNote
                      : note,
                ),
            );

            return updatedNote;
          } catch (err) {
            const apiError =
              err as ApiError;
            throw new Error(
              apiError.message ||
                ERROR_MESSAGES.UPDATE_NOTE_ERROR,
            );
          }
        },
        [],
      );

    /**
     * Delete a note
     */
    const deleteNote =
      useCallback(
        async (
          id: string,
        ): Promise<void> => {
          try {
            await apiDeleteNote(
              id,
            );

            // Remove from the list
            setNotes(
              (
                prevNotes,
              ) =>
                prevNotes.filter(
                  (
                    note,
                  ) =>
                    note.id !==
                    id,
                ),
            );

            // Update pagination count
            setPagination(
              (
                prev,
              ) => ({
                ...prev,
                totalCount:
                  prev.totalCount -
                  1,
              }),
            );
          } catch (err) {
            const apiError =
              err as ApiError;
            throw new Error(
              apiError.message ||
                ERROR_MESSAGES.DELETE_NOTE_ERROR,
            );
          }
        },
        [],
      );

    /**
     * Toggle archive status of a note
     */
    const archiveNote =
      useCallback(
        async (
          id: string,
        ): Promise<Note> => {
          try {
            const updatedNote =
              await toggleArchiveNote(
                id,
              );

            // Update the note in the list
            setNotes(
              (
                prevNotes,
              ) =>
                prevNotes.map(
                  (
                    note,
                  ) =>
                    note.id ===
                    id
                      ? updatedNote
                      : note,
                ),
            );

            return updatedNote;
          } catch (err) {
            const apiError =
              err as ApiError;
            throw new Error(
              apiError.message ||
                ERROR_MESSAGES.UPDATE_NOTE_ERROR,
            );
          }
        },
        [],
      );

    /**
     * Search notes
     */
    const searchNotesQuery =
      useCallback(
        async (
          query: string,
        ): Promise<
          Note[]
        > => {
          try {
            return await searchNotes(
              query,
            );
          } catch (err) {
            const apiError =
              err as ApiError;
            throw new Error(
              apiError.message ||
                ERROR_MESSAGES.FETCH_NOTES_ERROR,
            );
          }
        },
        [],
      );

    /**
     * Update filters
     */
    const updateFilters =
      useCallback(
        (
          newFilters: Partial<NoteFilters>,
        ) => {
          setFilters(
            (
              prev,
            ) => ({
              ...prev,
              ...newFilters,
            }),
          );
        },
        [],
      );

    /**
     * Reset filters to initial state
     */
    const resetFilters =
      useCallback(() => {
        setFilters(
          initialFilters,
        );
      }, [
        initialFilters,
      ]);

    /**
     * Go to specific page
     */
    const goToPage =
      useCallback(
        (
          page: number,
        ) => {
          updateFilters(
            {
              page,
            },
          );
        },
        [
          updateFilters,
        ],
      );

    /**
     * Go to next page
     */
    const nextPage =
      useCallback(() => {
        if (
          pagination.hasNextPage
        ) {
          goToPage(
            pagination.currentPage +
              1,
          );
        }
      }, [
        pagination.hasNextPage,
        pagination.currentPage,
        goToPage,
      ]);

    /**
     * Go to previous page
     */
    const previousPage =
      useCallback(() => {
        if (
          pagination.hasPrevPage
        ) {
          goToPage(
            pagination.currentPage -
              1,
          );
        }
      }, [
        pagination.hasPrevPage,
        pagination.currentPage,
        goToPage,
      ]);

    /**
     * Clear error
     */
    const clearError =
      useCallback(() => {
        setError(
          null,
        );
        if (
          hasError
        ) {
          setLoadingState(
            "idle",
          );
        }
      }, [
        hasError,
      ]);

    // Auto-fetch on mount and when filters change
    useEffect(() => {
      if (
        autoFetch
      ) {
        fetchNotes();
      }
    }, [
      fetchNotes,
      autoFetch,
    ]);

    return {
      // Data
      notes,
      pagination,
      filters,

      // State
      isLoading,
      isIdle,
      hasError,
      isRefreshing,
      error,
      loadingState,

      // Operations
      createNote,
      updateNote,
      deleteNote,
      archiveNote,
      searchNotes:
        searchNotesQuery,

      // Data management
      fetchNotes,
      refreshNotes,

      // Filter management
      updateFilters,
      resetFilters,

      // Pagination
      goToPage,
      nextPage,
      previousPage,

      // Error handling
      clearError,
    };
  };
