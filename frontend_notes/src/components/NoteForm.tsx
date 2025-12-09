/**
 * NoteForm Component
 * Form for creating and editing notes with validation and accessibility
 */

import React, { useRef, useEffect } from "react";
import { PlusCircle, Save, X, Loader2 } from "lucide-react";
import { VALIDATION_RULES } from "../config/constants";

interface NoteFormProps {
  title: string;
  content: string;
  isEditing: boolean;
  isSubmitting?: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onCancel: () => void;
  className?: string;
  testId?: string;
}

export function NoteForm({
  title,
  content,
  isEditing,
  isSubmitting = false,
  onSubmit,
  onTitleChange,
  onContentChange,
  onCancel,
  className = "",
  testId = "note-form",
}: NoteFormProps) {
  const titleInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus title input when form loads or when editing changes
  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditing]);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  // Character counts
  const titleLength = title.trim().length;
  const contentLength = content.trim().length;

  // Validation states
  const isTitleValid =
    titleLength > 0 && titleLength <= VALIDATION_RULES.TITLE.maxLength;
  const isContentValid =
    contentLength > 0 && contentLength <= VALIDATION_RULES.CONTENT.maxLength;
  const isFormValid = isTitleValid && isContentValid && !isSubmitting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onSubmit(e);
    }
  };

  return (
    <section
      className={`mb-8 bg-gray-800 rounded-lg shadow-lg overflow-hidden ${className}`}
      aria-labelledby="form-heading"
    >
      <div className="bg-gray-700 px-6 py-4">
        <h2
          id="form-heading"
          className="text-lg font-semibold text-white flex items-center gap-2"
        >
          {isEditing ? (
            <>
              <Save size={20} className="text-blue-400" />
              Edit Note
            </>
          ) : (
            <>
              <PlusCircle size={20} className="text-green-400" />
              Create New Note
            </>
          )}
        </h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-6 space-y-6"
        data-testid={testId}
        noValidate
      >
        {/* Title Input */}
        <div className="space-y-2">
          <label
            htmlFor="note-title"
            className="block text-sm font-medium text-gray-300"
          >
            Title
            <span className="text-red-400 ml-1" aria-label="required">
              *
            </span>
          </label>
          <input
            ref={titleInputRef}
            id="note-title"
            type="text"
            placeholder="Enter note title..."
            value={title}
            onChange={onTitleChange}
            className={`w-full bg-gray-700 text-white px-4 py-3 rounded-md border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              !isTitleValid && titleLength > 0
                ? "border-red-500 focus:border-red-500"
                : "border-gray-600 focus:border-blue-500"
            }`}
            maxLength={VALIDATION_RULES.TITLE.maxLength}
            required
            disabled={isSubmitting}
            aria-describedby="title-help title-count"
            aria-invalid={!isTitleValid && titleLength > 0}
          />
          <div className="flex justify-between items-center text-xs">
            <span
              id="title-help"
              className={`${!isTitleValid && titleLength > 0 ? "text-red-400" : "text-gray-400"}`}
            >
              {titleLength === 0
                ? "Title is required"
                : titleLength > VALIDATION_RULES.TITLE.maxLength
                  ? "Title is too long"
                  : "Enter a descriptive title for your note"}
            </span>
            <span
              id="title-count"
              className={`${titleLength > VALIDATION_RULES.TITLE.maxLength ? "text-red-400" : "text-gray-400"}`}
            >
              {titleLength}/{VALIDATION_RULES.TITLE.maxLength}
            </span>
          </div>
        </div>

        {/* Content Textarea */}
        <div className="space-y-2">
          <label
            htmlFor="note-content"
            className="block text-sm font-medium text-gray-300"
          >
            Content
            <span className="text-red-400 ml-1" aria-label="required">
              *
            </span>
          </label>
          <textarea
            ref={textareaRef}
            id="note-content"
            placeholder="Write your note content here..."
            value={content}
            onChange={onContentChange}
            className={`w-full bg-gray-700 text-white px-4 py-3 rounded-md border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[120px] ${
              !isContentValid && contentLength > 0
                ? "border-red-500 focus:border-red-500"
                : "border-gray-600 focus:border-blue-500"
            }`}
            maxLength={VALIDATION_RULES.CONTENT.maxLength}
            required
            disabled={isSubmitting}
            aria-describedby="content-help content-count"
            aria-invalid={!isContentValid && contentLength > 0}
            rows={4}
          />
          <div className="flex justify-between items-center text-xs">
            <span
              id="content-help"
              className={`${!isContentValid && contentLength > 0 ? "text-red-400" : "text-gray-400"}`}
            >
              {contentLength === 0
                ? "Content is required"
                : contentLength > VALIDATION_RULES.CONTENT.maxLength
                  ? "Content is too long"
                  : "Write the main content of your note"}
            </span>
            <span
              id="content-count"
              className={`${contentLength > VALIDATION_RULES.CONTENT.maxLength ? "text-red-400" : "text-gray-400"}`}
            >
              {contentLength}/{VALIDATION_RULES.CONTENT.maxLength}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="submit"
            disabled={!isFormValid}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
              isFormValid
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
            aria-describedby="submit-help"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                {isEditing ? <Save size={20} /> : <PlusCircle size={20} />}
                {isEditing ? "Update Note" : "Create Note"}
              </>
            )}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 disabled:text-gray-500 text-white px-6 py-3 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              <X size={20} />
              Cancel
            </button>
          )}
        </div>

        <div id="submit-help" className="sr-only">
          {!isFormValid &&
            "Please fill in all required fields with valid data to submit the form"}
        </div>
      </form>
    </section>
  );
}
