/**
 * Notes Routes
 * Defines all note-related API endpoints with validation middleware
 */

import express from "express";
import * as controller from "../controllers/notesController.js";
import {
  validateCreateNote,
  validateUpdateNote,
  validateNoteId,
  sanitizeRequestBody,
} from "../middleware/validation.js";

const router = express.Router();

// Apply request body sanitization to all routes
router.use(sanitizeRequestBody);

// GET /api/notes - Get all notes with optional filtering and pagination
router.get("/", controller.getNotes);

// GET /api/notes/search - Search notes (must be before /:id route)
router.get("/search", controller.searchNotes);

// GET /api/notes/:id - Get a single note by ID
router.get("/:id", validateNoteId, controller.getNoteById);

// POST /api/notes - Create a new note
router.post("/", validateCreateNote, controller.createNote);

// PUT /api/notes/:id - Update an existing note
router.put("/:id", validateUpdateNote, controller.updateNote);

// PATCH /api/notes/:id/archive - Toggle archive status of a note
router.patch("/:id/archive", validateNoteId, controller.toggleArchiveNote);

// DELETE /api/notes/:id - Delete a note
router.delete("/:id", validateNoteId, controller.deleteNote);

export default router;
