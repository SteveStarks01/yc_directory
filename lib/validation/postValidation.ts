import { z } from 'zod';

// Post type validation
export const postTypeSchema = z.enum(['text', 'update', 'milestone', 'question', 'announcement'], {
  errorMap: () => ({ message: 'Please select a valid post type' }),
});

// Tag validation
export const tagSchema = z
  .string()
  .min(1, 'Tag cannot be empty')
  .max(20, 'Tag must be 20 characters or less')
  .regex(/^[a-zA-Z0-9\s-_]+$/, 'Tag can only contain letters, numbers, spaces, hyphens, and underscores')
  .transform(str => str.trim().toLowerCase());

// Content validation
export const contentSchema = z
  .string()
  .min(1, 'Post content is required')
  .max(280, 'Post content must be 280 characters or less')
  .transform(str => str.trim());

// Community post creation schema
export const createPostSchema = z.object({
  content: contentSchema,
  postType: postTypeSchema,
  tags: z
    .array(tagSchema)
    .max(5, 'Maximum 5 tags allowed')
    .optional()
    .default([]),
  images: z
    .array(z.string().url('Invalid image URL'))
    .max(4, 'Maximum 4 images allowed')
    .optional()
    .default([]),
});

// Comment validation schema
export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment content is required')
    .max(500, 'Comment must be 500 characters or less')
    .transform(str => str.trim()),
  parentComment: z
    .string()
    .optional(),
});

// Reaction validation schema
export const reactionSchema = z.object({
  reactionType: z.enum(['like', 'heart', 'fire', 'idea', 'celebrate', 'clap', 'rocket', 'hundred'], {
    errorMap: () => ({ message: 'Invalid reaction type' }),
  }),
});

// Client-side validation helpers
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type ReactionInput = z.infer<typeof reactionSchema>;

/**
 * Validate post content with detailed error messages
 */
export function validatePostContent(content: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic validation
  if (!content.trim()) {
    errors.push('Post content is required');
    return { isValid: false, errors, warnings };
  }

  // Character count validation
  const charCount = Array.from(content.trim()).length;
  if (charCount > 280) {
    errors.push(`Content is ${charCount - 280} characters over the 280 character limit`);
  } else if (charCount > 250) {
    warnings.push(`Approaching character limit (${280 - charCount} characters remaining)`);
  }

  // Content quality checks
  if (content.trim().length < 10) {
    warnings.push('Consider adding more detail to your post');
  }

  // Check for excessive caps
  const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
  if (capsRatio > 0.5 && content.length > 20) {
    warnings.push('Consider using less capital letters for better readability');
  }

  // Check for excessive punctuation
  const punctuationRatio = (content.match(/[!?]{2,}/g) || []).length;
  if (punctuationRatio > 2) {
    warnings.push('Consider reducing excessive punctuation');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate tags with detailed feedback
 */
export function validateTags(tags: string[]): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  validTags: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const validTags: string[] = [];

  if (tags.length > 5) {
    errors.push('Maximum 5 tags allowed');
  }

  tags.forEach((tag, index) => {
    try {
      const validTag = tagSchema.parse(tag);
      if (!validTags.includes(validTag)) {
        validTags.push(validTag);
      } else {
        warnings.push(`Duplicate tag "${tag}" removed`);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.push(`Tag ${index + 1}: ${error.errors[0].message}`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    validTags,
  };
}

/**
 * Real-time validation for form fields
 */
export function validateField(
  fieldName: keyof CreatePostInput,
  value: any
): {
  isValid: boolean;
  error?: string;
  warning?: string;
} {
  try {
    switch (fieldName) {
      case 'content':
        contentSchema.parse(value);
        const validation = validatePostContent(value);
        return {
          isValid: validation.isValid,
          error: validation.errors[0],
          warning: validation.warnings[0],
        };

      case 'postType':
        postTypeSchema.parse(value);
        return { isValid: true };

      case 'tags':
        const tagValidation = validateTags(value || []);
        return {
          isValid: tagValidation.isValid,
          error: tagValidation.errors[0],
          warning: tagValidation.warnings[0],
        };

      default:
        return { isValid: true };
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        error: error.errors[0].message,
      };
    }
    return {
      isValid: false,
      error: 'Validation error',
    };
  }
}

/**
 * Comprehensive form validation
 */
export function validatePostForm(data: Partial<CreatePostInput>): {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
  data?: CreatePostInput;
} {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};

  try {
    const validatedData = createPostSchema.parse(data);
    
    // Additional content validation
    const contentValidation = validatePostContent(validatedData.content);
    if (!contentValidation.isValid) {
      errors.content = contentValidation.errors[0];
    } else if (contentValidation.warnings.length > 0) {
      warnings.content = contentValidation.warnings[0];
    }

    // Additional tag validation
    if (validatedData.tags && validatedData.tags.length > 0) {
      const tagValidation = validateTags(validatedData.tags);
      if (!tagValidation.isValid) {
        errors.tags = tagValidation.errors[0];
      } else if (tagValidation.warnings.length > 0) {
        warnings.tags = tagValidation.warnings[0];
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.errors.forEach(err => {
        const field = err.path[0] as string;
        errors[field] = err.message;
      });
    }

    return {
      isValid: false,
      errors,
      warnings,
    };
  }
}

export default {
  createPostSchema,
  createCommentSchema,
  reactionSchema,
  validatePostContent,
  validateTags,
  validateField,
  validatePostForm,
};
