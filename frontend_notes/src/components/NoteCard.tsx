/**
 * NoteCard Component
 * Displays individual note with actions and proper accessibility
 */

import { useState, useCallback } from "react";
import { Pencil, Trash2, Copy, Archive, MoreVertical } from "lucide-react";
import { Note } from "../types";
import { formatDate, truncateText, copyToClipboard } from "../utils";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onArchive?: (id: string) => void;
  className?: string;
  showActions?: boolean;
  maxContentLength?: number;
  testId?: string;
}

export function NoteCard({
  note,
  onEdit,
  onDelete,
  onArchive,
  className = "",
  showActions = true,
  maxContentLength = 150,
  testId = "note-card",
}: NoteCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleEdit = useCallback(() => {
    onEdit(note);
    setShowMenu(false);
  }, [note, onEdit]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm("Are you sure you want to delete this note?")) {
      return;
    }

    try {
      setIsDeleting(true);
      await onDelete(note.id);
    } catch (error) {
      console.error("Error deleting note:", error);
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  }, [note.id, onDelete]);

  const handleArchive = useCallback(async () => {
    if (onArchive) {
      try {
        await onArchive(note.id);
        setShowMenu(false);
      } catch (error) {
        console.error("Error archiving note:", error);
      }
    }
  }, [note.id, onArchive]);

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(`${note.title}\n\n${note.content}`);
    setCopySuccess(success);
    setShowMenu(false);

    if (success) {
      setTimeout(() => setCopySuccess(false), 2000);
    }
  }, [note.title, note.content]);

  const truncatedContent = truncateText(note.content, maxContentLength);
  const isContentTruncated = note.content.length > maxContentLength;

  return (
    <article
      className={`bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-gray-750 group ${
        isDeleting ? "opacity-50 pointer-events-none" : ""
      } ${note.isArchived ? "opacity-75 border-l-4 border-yellow-500" : ""} ${className}`}
      data-testid={testId}
      role="article"
      aria-labelledby={`note-title-${note.id}`}
      aria-describedby={`note-content-${note.id} note-meta-${note.id}`}
    >
      {/* Note Header */}
      <div className="p-6 pb-4">
        <div className="flex justify-between items-start mb-3">
          <h3
            id={`note-title-${note.id}`}
            className="text-lg font-semibold text-white line-clamp-2 flex-1 mr-2"
            title={note.title}
          >
            {note.title}
          </h3>

          {showActions && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-all duration-200 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={`More actions for ${note.title}`}
                aria-expanded={showMenu}
                aria-haspopup="true"
              >
                <MoreVertical size={16} />
              </button>

              {showMenu && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />

                  {/* Menu */}
                  <div
                    className="absolute right-0 top-full mt-2 w-48 bg-gray-700 rounded-md shadow-lg z-20 border border-gray-600"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby={`note-menu-${note.id}`}
                  >
                    <div className="py-1">
                      <button
                        onClick={handleEdit}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
                        role="menuitem"
                      >
                        <Pencil size={14} />
                        Edit Note
                      </button>

                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
                        role="menuitem"
                      >
                        <Copy size={14} />
                        {copySuccess ? "Copied!" : "Copy Content"}
                      </button>

                      {onArchive && (
                        <button
                          onClick={handleArchive}
                          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
                          role="menuitem"
                        >
                          <Archive size={14} />
                          {note.isArchived ? "Unarchive" : "Archive"}
                        </button>
                      )}

                      <hr className="border-gray-600 my-1" />

                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors disabled:opacity-50"
                        role="menuitem"
                      >
                        <Trash2 size={14} />
                        {isDeleting ? "Deleting..." : "Delete Note"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {note.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30"
              >
                {tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="inline-block px-2 py-1 text-xs bg-gray-600 text-gray-300 rounded-full">
                +{note.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Note Content */}
      <div className="px-6 pb-4">
        <p
          id={`note-content-${note.id}`}
          className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap"
          title={isContentTruncated ? note.content : undefined}
        >
          {truncatedContent}
          {isContentTruncated && (
            <span className="text-blue-400 cursor-pointer hover:text-blue-300 ml-1">
              ...read more
            </span>
          )}
        </p>
      </div>

      {/* Note Footer */}
      <div
        id={`note-meta-${note.id}`}
        className="px-6 pb-6 flex justify-between items-center text-xs text-gray-400"
      >
        <div className="flex flex-col gap-1">
          <time
            dateTime={note.createdAt}
            title={`Created: ${new Date(note.createdAt).toLocaleString()}`}
          >
            Created {formatDate(note.createdAt)}
          </time>
          {note.updatedAt !== note.createdAt && (
            <time
              dateTime={note.updatedAt}
              title={`Updated: ${new Date(note.updatedAt).toLocaleString()}`}
              className="text-gray-500"
            >
              Updated {formatDate(note.updatedAt)}
            </time>
          )}
        </div>

        {note.isArchived && (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-yellow-500/20 text-yellow-300 rounded-full border border-yellow-500/30">
            <Archive size={12} />
            Archived
          </span>
        )}
      </div>

      {/* Quick Actions (visible on hover) */}
      {showActions && (
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
          <button
            onClick={handleEdit}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            aria-label={`Edit ${note.title}`}
            title="Edit Note"
          >
            <Pencil size={14} />
          </button>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            aria-label={`Delete ${note.title}`}
            title="Delete Note"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </article>
  );
}
