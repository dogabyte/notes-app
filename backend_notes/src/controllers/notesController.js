/**
 * Notes Controller
 * Handles all note-related HTTP requests and business logic
 */

import { Note } from "../models/Note.js";
import {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "../config/constants.js";

/**
 * Retrieves all notes with optional filtering and pagination
 * @route GET /api/notes
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const getNotes = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 50,
      sortBy = "createdAt",
      sortOrder = "desc",
      archived = "false",
      search = "",
    } = req.query;

    // Build query filter
    const filter = {
      isArchived: archived === "true",
    };

    // Add text search if provided
    if (search.trim()) {
      filter.$text = { $search: search };
    }

    // Build sort object
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [notes, totalCount] = await Promise.all([
      Note.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Note.countDocuments(filter),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: notes,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Creates a new note
 * @route POST /api/notes
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const createNote = async (req, res, next) => {
  try {
    const { title, content, tags = [] } = req.body;

    // Create new note instance
    const noteData = {
      title: title?.trim(),
      content: content?.trim(),
      tags: Array.isArray(tags)
        ? tags.map((tag) => tag.trim()).filter(Boolean)
        : [],
    };

    const note = new Note(noteData);
    const savedNote = await note.save();

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: SUCCESS_MESSAGES.NOTE_CREATED,
      data: savedNote,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Updates an existing note by ID
 * @route PUT /api/notes/:id
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const updateNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, tags, isArchived } = req.body;

    // Build update object with only provided fields
    const updateData = {};

    if (title !== undefined) {
      updateData.title = title.trim();
    }

    if (content !== undefined) {
      updateData.content = content.trim();
    }

    if (Array.isArray(tags)) {
      updateData.tags = tags.map((tag) => tag.trim()).filter(Boolean);
    }

    if (isArchived !== undefined) {
      updateData.isArchived = Boolean(isArchived);
    }

    const updatedNote = await Note.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
      lean: false, // Return mongoose document for proper transformation
    });

    if (!updatedNote) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.NOTE_NOT_FOUND,
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.NOTE_UPDATED,
      data: updatedNote,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Deletes a note by ID
 * @route DELETE /api/notes/:id
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const deleteNote = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedNote = await Note.findByIdAndDelete(id);

    if (!deletedNote) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.NOTE_NOT_FOUND,
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.NOTE_DELETED,
      data: {
        id: deletedNote.id,
        title: deletedNote.title,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Retrieves a single note by ID
 * @route GET /api/notes/:id
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const getNoteById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const note = await Note.findById(id).lean();

    if (!note) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.NOTE_NOT_FOUND,
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: note,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Archives/unarchives a note
 * @route PATCH /api/notes/:id/archive
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const toggleArchiveNote = async (req, res, next) => {
  try {
    const { id } = req.params;

    const note = await Note.findById(id);

    if (!note) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.NOTE_NOT_FOUND,
      });
    }

    // Toggle archive status
    note.isArchived = !note.isArchived;
    const updatedNote = await note.save();

    const action = updatedNote.isArchived ? "archived" : "unarchived";

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Note ${action} successfully`,
      data: updatedNote,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Searches notes using text search
 * @route GET /api/notes/search
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const searchNotes = async (req, res, next) => {
  try {
    const { q: query, limit = 10 } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Search query is required",
      });
    }

    const notes = await Note.searchNotes(query.trim())
      .limit(parseInt(limit))
      .lean();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: notes,
      meta: {
        query: query.trim(),
        resultsCount: notes.length,
      },
    });
  } catch (err) {
    next(err);
  }
};
