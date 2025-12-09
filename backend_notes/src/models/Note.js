import mongoose from "mongoose";
import { VALIDATION } from "../config/constants.js";

/**
 * Note Schema Definition
 * Represents a note with title, content, and timestamps
 */
const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [
        VALIDATION.NOTE.TITLE_MIN_LENGTH,
        `Title must be at least ${VALIDATION.NOTE.TITLE_MIN_LENGTH} character long`,
      ],
      maxlength: [
        VALIDATION.NOTE.TITLE_MAX_LENGTH,
        `Title cannot exceed ${VALIDATION.NOTE.TITLE_MAX_LENGTH} characters`,
      ],
      index: true, // Index for search optimization
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
      minlength: [
        VALIDATION.NOTE.CONTENT_MIN_LENGTH,
        `Content must be at least ${VALIDATION.NOTE.CONTENT_MIN_LENGTH} character long`,
      ],
      maxlength: [
        VALIDATION.NOTE.CONTENT_MAX_LENGTH,
        `Content cannot exceed ${VALIDATION.NOTE.CONTENT_MAX_LENGTH} characters`,
      ],
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true, // Index for filtering archived/active notes
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (tags) {
          return tags.length <= 10; // Maximum 10 tags per note
        },
        message: "A note cannot have more than 10 tags",
      },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
    toJSON: {
      transform(doc, ret) {
        // Convert _id to id and remove MongoDB-specific fields
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform(doc, ret) {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Create compound index for efficient querying
noteSchema.index({ createdAt: -1, isArchived: 1 });

// Create text index for full-text search on title and content
noteSchema.index({ title: "text", content: "text" });

// Instance methods
noteSchema.methods.archive = function () {
  this.isArchived = true;
  return this.save();
};

noteSchema.methods.unarchive = function () {
  this.isArchived = false;
  return this.save();
};

// Static methods
noteSchema.statics.findActive = function () {
  return this.find({ isArchived: false }).sort({ createdAt: -1 });
};

noteSchema.statics.findArchived = function () {
  return this.find({ isArchived: true }).sort({ createdAt: -1 });
};

noteSchema.statics.searchNotes = function (query) {
  return this.find(
    {
      $text: { $search: query },
      isArchived: false,
    },
    { score: { $meta: "textScore" } },
  ).sort({ score: { $meta: "textScore" } });
};

// Pre-save middleware for additional validation
noteSchema.pre("save", function (next) {
  // Ensure title and content are not just whitespace
  if (this.title && this.title.trim().length === 0) {
    return next(new Error("Title cannot be empty or just whitespace"));
  }
  if (this.content && this.content.trim().length === 0) {
    return next(new Error("Content cannot be empty or just whitespace"));
  }
  next();
});

export const Note = mongoose.model("Note", noteSchema);
