/**
 * Main Application Component
 * Entry point for the Notes application with proper error handling and state management
 */

import React, { useState, useCallback, useMemo } from "react";
import { Note, CreateNoteData, UpdateNoteData } from "./types";
import { NoteForm } from "./components/NoteForm";
import { NoteCard } from "./components/NoteCard";
import { ErrorMessage } from "./components/ErrorMessage";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { useNotes } from "./hooks/useNotes";
import { ERROR_MESSAGES } from "./config/constants";

function App() {
  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use custom hooks for data management
  const {
    notes,
    isLoading,
    error,
    createNote,
    updateNote,
    deleteNote,
    refreshNotes,
    clearError,
  } = useNotes();

  // Memoized computed values
  const isEditing = useMemo(() => editingId !== null, [editingId]);
  const notesArray = useMemo(
    () => (Array.isArray(notes) ? notes : []),
    [notes],
  );

  /**
   * Handle form submission for creating or updating notes
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!title.trim() || !content.trim()) {
        setSubmitError(ERROR_MESSAGES.TITLE_REQUIRED);
        return;
      }

      try {
        setIsSubmitting(true);
        setSubmitError(null);

        const noteData = {
          title: title.trim(),
          content: content.trim(),
        };

        if (editingId) {
          await updateNote(editingId, noteData as UpdateNoteData);
        } else {
          await createNote(noteData as CreateNoteData);
        }

        // Reset form
        setTitle("");
        setContent("");
        setEditingId(null);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : ERROR_MESSAGES.CREATE_NOTE_ERROR;
        setSubmitError(errorMessage);
        console.error("Error saving note:", err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [title, content, editingId, createNote, updateNote],
  );

  /**
   * Handle editing a note
   */
  const handleEdit = useCallback((note: Note) => {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setSubmitError(null);
  }, []);

  /**
   * Handle deleting a note
   */
  const handleDelete = useCallback(
    async (id: string) => {
      if (!window.confirm("Are you sure you want to delete this note?")) {
        return;
      }

      try {
        await deleteNote(id);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : ERROR_MESSAGES.DELETE_NOTE_ERROR;
        setSubmitError(errorMessage);
        console.error("Error deleting note:", err);
      }
    },
    [deleteNote],
  );

  /**
   * Handle canceling edit mode
   */
  const handleCancel = useCallback(() => {
    setEditingId(null);
    setTitle("");
    setContent("");
    setSubmitError(null);
  }, []);

  /**
   * Handle dismissing errors
   */
  const handleDismissError = useCallback(() => {
    clearError();
    setSubmitError(null);
  }, [clearError]);

  // Show loading spinner
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Notes App</h1>
          <p className="text-gray-400 text-sm md:text-base">
            Create, edit, and organize your notes
          </p>
        </header>

        {/* Error Messages */}
        {error && (
          <ErrorMessage
            message={error}
            dismissible
            onDismiss={handleDismissError}
            title="Failed to load notes"
          />
        )}

        {submitError && (
          <ErrorMessage
            message={submitError}
            dismissible
            onDismiss={() => setSubmitError(null)}
            title="Submission Error"
          />
        )}

        {/* Note Form */}
        <NoteForm
          title={title}
          content={content}
          isEditing={isEditing}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onTitleChange={(e) => setTitle(e.target.value)}
          onContentChange={(e) => setContent(e.target.value)}
          onCancel={handleCancel}
        />

        {/* Notes Grid */}
        <div className="space-y-4">
          {notesArray.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg mb-2">No notes yet</p>
              <p className="text-sm">Create your first note above</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-300">
                  Your Notes ({notesArray.length})
                </h2>
                <button
                  onClick={refreshNotes}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  disabled={isLoading}
                >
                  Refresh
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {notesArray.map((note: Note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
