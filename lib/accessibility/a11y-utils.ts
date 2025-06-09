/**
 * Accessibility utilities for the community platform
 * Ensures WCAG 2.1 AA compliance and enhanced user experience
 */

// ARIA live region announcements
export class LiveAnnouncer {
  private static instance: LiveAnnouncer;
  private liveRegion: HTMLElement | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.createLiveRegion();
    }
  }

  static getInstance(): LiveAnnouncer {
    if (!LiveAnnouncer.instance) {
      LiveAnnouncer.instance = new LiveAnnouncer();
    }
    return LiveAnnouncer.instance;
  }

  private createLiveRegion() {
    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.setAttribute('aria-relevant', 'additions text');
    this.liveRegion.className = 'sr-only';
    this.liveRegion.id = 'live-announcer';
    document.body.appendChild(this.liveRegion);
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    if (!this.liveRegion) return;

    this.liveRegion.setAttribute('aria-live', priority);
    this.liveRegion.textContent = message;

    // Clear after announcement to allow repeated messages
    setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = '';
      }
    }, 1000);
  }
}

// Focus management utilities
export const focusUtils = {
  // Trap focus within an element
  trapFocus: (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  },

  // Restore focus to previous element
  restoreFocus: (previousElement: HTMLElement | null) => {
    if (previousElement && typeof previousElement.focus === 'function') {
      previousElement.focus();
    }
  },

  // Get next focusable element
  getNextFocusable: (currentElement: HTMLElement, direction: 'next' | 'previous' = 'next') => {
    const focusableElements = Array.from(
      document.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ) as HTMLElement[];

    const currentIndex = focusableElements.indexOf(currentElement);
    if (currentIndex === -1) return null;

    const nextIndex = direction === 'next' 
      ? (currentIndex + 1) % focusableElements.length
      : (currentIndex - 1 + focusableElements.length) % focusableElements.length;

    return focusableElements[nextIndex];
  },
};

// Keyboard navigation utilities
export const keyboardUtils = {
  // Handle arrow key navigation
  handleArrowNavigation: (
    e: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onIndexChange: (index: number) => void
  ) => {
    let newIndex = currentIndex;

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        newIndex = (currentIndex + 1) % items.length;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        newIndex = (currentIndex - 1 + items.length) % items.length;
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = items.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    onIndexChange(newIndex);
    items[newIndex]?.focus();
  },

  // Handle escape key
  handleEscape: (callback: () => void) => {
    return (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        callback();
      }
    };
  },

  // Handle enter/space activation
  handleActivation: (callback: () => void) => {
    return (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        callback();
      }
    };
  },
};

// Screen reader utilities
export const screenReaderUtils = {
  // Generate descriptive text for reactions
  getReactionDescription: (reactionType: string, count: number, isActive: boolean) => {
    const reactionNames: Record<string, string> = {
      like: 'like',
      heart: 'love',
      fire: 'fire',
      idea: 'idea',
      celebrate: 'celebration',
      clap: 'clap',
      rocket: 'rocket',
      hundred: 'hundred percent',
    };

    const name = reactionNames[reactionType] || reactionType;
    const countText = count === 1 ? '1 reaction' : `${count} reactions`;
    const statusText = isActive ? 'You reacted with' : 'React with';
    
    return `${statusText} ${name}. ${countText}.`;
  },

  // Generate post description
  getPostDescription: (post: any) => {
    const author = post.author?.role || 'Community member';
    const type = post.postType || 'post';
    const time = new Date(post.createdAt).toLocaleDateString();
    const reactionCount = Object.values(post.reactions || {}).reduce((sum: number, count: any) => sum + count, 0);
    
    return `${type} by ${author} from ${time}. ${reactionCount} reactions, ${post.commentCount || 0} comments.`;
  },

  // Generate comment description
  getCommentDescription: (comment: any) => {
    const author = comment.author?.role || 'Community member';
    const time = new Date(comment.createdAt).toLocaleDateString();
    const level = comment.threadLevel > 0 ? `, thread level ${comment.threadLevel}` : '';
    
    return `Comment by ${author} from ${time}${level}.`;
  },
};

// Color contrast utilities
export const contrastUtils = {
  // Check if color combination meets WCAG AA standards
  meetsContrastRequirement: (foreground: string, background: string, level: 'AA' | 'AAA' = 'AA') => {
    // This is a simplified version - in production, use a proper color contrast library
    const requiredRatio = level === 'AAA' ? 7 : 4.5;
    // Implementation would calculate actual contrast ratio
    return true; // Placeholder
  },

  // Get high contrast alternative
  getHighContrastColor: (color: string, isDark: boolean = false) => {
    // Return high contrast alternatives
    return isDark ? '#ffffff' : '#000000';
  },
};

// Motion and animation utilities
export const motionUtils = {
  // Check if user prefers reduced motion
  prefersReducedMotion: () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Get appropriate animation duration
  getAnimationDuration: (defaultDuration: number) => {
    return motionUtils.prefersReducedMotion() ? 0 : defaultDuration;
  },

  // Apply motion-safe classes
  getMotionSafeClasses: (animationClasses: string, staticClasses: string = '') => {
    return motionUtils.prefersReducedMotion() ? staticClasses : animationClasses;
  },
};

// ARIA attributes helpers
export const ariaUtils = {
  // Generate unique IDs for ARIA relationships
  generateId: (prefix: string = 'a11y') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Create ARIA describedby relationship
  createDescribedBy: (elementId: string, descriptionId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      const existingDescribedBy = element.getAttribute('aria-describedby');
      const newDescribedBy = existingDescribedBy 
        ? `${existingDescribedBy} ${descriptionId}`
        : descriptionId;
      element.setAttribute('aria-describedby', newDescribedBy);
    }
  },

  // Create ARIA labelledby relationship
  createLabelledBy: (elementId: string, labelId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.setAttribute('aria-labelledby', labelId);
    }
  },

  // Set ARIA expanded state
  setExpanded: (elementId: string, isExpanded: boolean) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.setAttribute('aria-expanded', isExpanded.toString());
    }
  },
};

// High-level accessibility helpers
export const a11yHelpers = {
  // Announce dynamic content changes
  announceChange: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    LiveAnnouncer.getInstance().announce(message, priority);
  },

  // Setup accessible modal
  setupModal: (modalElement: HTMLElement, triggerElement: HTMLElement) => {
    const cleanup = focusUtils.trapFocus(modalElement);
    
    const handleEscape = keyboardUtils.handleEscape(() => {
      cleanup();
      focusUtils.restoreFocus(triggerElement);
    });

    document.addEventListener('keydown', handleEscape);
    
    return () => {
      cleanup();
      document.removeEventListener('keydown', handleEscape);
    };
  },

  // Setup accessible dropdown
  setupDropdown: (
    triggerElement: HTMLElement,
    dropdownElement: HTMLElement,
    onClose: () => void
  ) => {
    const dropdownId = ariaUtils.generateId('dropdown');
    dropdownElement.id = dropdownId;
    triggerElement.setAttribute('aria-haspopup', 'true');
    triggerElement.setAttribute('aria-controls', dropdownId);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        triggerElement.focus();
      }
    };

    dropdownElement.addEventListener('keydown', handleKeyDown);
    
    return () => {
      dropdownElement.removeEventListener('keydown', handleKeyDown);
    };
  },
};

export default {
  LiveAnnouncer,
  focusUtils,
  keyboardUtils,
  screenReaderUtils,
  contrastUtils,
  motionUtils,
  ariaUtils,
  a11yHelpers,
};
