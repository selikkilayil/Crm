# Unified Stylesheet Documentation

This document provides a comprehensive guide to using the unified stylesheet system in the CRM application.

## Overview

The unified stylesheet (`unified.css`) provides a consistent set of CSS classes that can be used across all components in the application. This approach ensures:

- **Design Consistency**: All components use the same styling patterns
- **Easy Maintenance**: Change styles in one place to update the entire application
- **Mobile-First Design**: All styles are responsive and touch-friendly
- **Accessibility**: Built-in accessibility features and proper contrast ratios
- **Performance**: Optimized CSS with minimal duplication

## Quick Start

The stylesheet is automatically imported in `layout.tsx` and available throughout the application.

```tsx
// No need to import - styles are globally available
<button className="btn btn-primary">Click me</button>
```

## Button System

### Basic Buttons

```tsx
// Primary button (main actions)
<button className="btn btn-primary">Save</button>

// Secondary button (secondary actions)
<button className="btn btn-secondary">Cancel</button>

// Success button (positive actions)
<button className="btn btn-success">Approve</button>

// Warning button (caution actions)
<button className="btn btn-warning">Warning</button>

// Danger button (destructive actions)
<button className="btn btn-danger">Delete</button>

// Outline button (subtle actions)
<button className="btn btn-outline">View Details</button>

// Ghost button (minimal actions)
<button className="btn btn-ghost">Close</button>
```

### Button Sizes

```tsx
// Small button
<button className="btn btn-primary btn-sm">Small</button>

// Default button
<button className="btn btn-primary">Default</button>

// Large button
<button className="btn btn-primary btn-lg">Large</button>

// Extra large button
<button className="btn btn-primary btn-xl">Extra Large</button>
```

### Icon Buttons

```tsx
// Square icon button (44x44px minimum for touch)
<button className="btn-icon btn-primary">
  <svg>...</svg>
</button>
```

## Form System

### Form Groups

```tsx
<div className="form-group">
  <label className="form-label form-label-required">Email</label>
  <input type="email" className="form-input" />
  <div className="form-help">We'll never share your email</div>
</div>
```

### Form Controls

```tsx
// Text input
<input type="text" className="form-input" />

// Text input with error
<input type="text" className="form-input form-input-error" />

// Select dropdown
<select className="form-select">
  <option>Choose...</option>
</select>

// Textarea
<textarea className="form-textarea"></textarea>

// Checkbox
<input type="checkbox" className="form-checkbox" />

// Radio button
<input type="radio" className="form-radio" />
```

### Form Messages

```tsx
// Error message
<div className="form-error">This field is required</div>

// Help text
<div className="form-help">Enter your full name</div>
```

## Card System

### Basic Cards

```tsx
// Simple card
<div className="card">
  <div className="card-body">
    <h3 className="card-title">Card Title</h3>
    <p className="card-subtitle">Card subtitle</p>
    <p>Card content goes here.</p>
  </div>
</div>

// Card with header and footer
<div className="card">
  <div className="card-header">
    <h3 className="card-title">Header Title</h3>
  </div>
  <div className="card-body">
    Content goes here.
  </div>
  <div className="card-footer">
    <button className="btn btn-primary">Action</button>
  </div>
</div>
```

### Interactive Cards

```tsx
// Hoverable card
<div className="card-hover">
  <div className="card-body">Hover me!</div>
</div>

// Clickable card
<div className="card-interactive" onClick={handleClick}>
  <div className="card-body">Click me!</div>
</div>
```

## Modal System

### Basic Modal

```tsx
<div className="modal-overlay">
  <div className="modal-container modal-lg">
    <div className="modal-header">
      <h2 className="modal-title">Modal Title</h2>
      <button className="modal-close" onClick={onClose}>
        <svg>...</svg>
      </button>
    </div>
    <div className="modal-body">
      Modal content goes here.
    </div>
    <div className="modal-footer">
      <button className="btn btn-secondary">Cancel</button>
      <button className="btn btn-primary">Save</button>
    </div>
  </div>
</div>
```

### Modal Sizes

```tsx
// Small modal
<div className="modal-container modal-sm">...</div>

// Medium modal (default)
<div className="modal-container modal-md">...</div>

// Large modal
<div className="modal-container modal-lg">...</div>

// Extra large modal
<div className="modal-container modal-xl">...</div>

// Full width modal
<div className="modal-container modal-full">...</div>
```

## Status Badges

```tsx
// Primary badge
<span className="badge badge-primary">Active</span>

// Success badge
<span className="badge badge-success">Completed</span>

// Warning badge
<span className="badge badge-warning">Pending</span>

// Danger badge
<span className="badge badge-danger">Failed</span>

// Gray badge
<span className="badge badge-gray">Draft</span>

// Other colors
<span className="badge badge-purple">Purple</span>
<span className="badge badge-indigo">Indigo</span>
<span className="badge badge-pink">Pink</span>
```

## Table System

```tsx
<div className="table-container">
  <table className="table">
    <thead className="table-header">
      <tr>
        <th className="table-header-cell">Name</th>
        <th className="table-header-cell">Email</th>
        <th className="table-header-cell">Status</th>
      </tr>
    </thead>
    <tbody>
      <tr className="table-row">
        <td className="table-cell">John Doe</td>
        <td className="table-cell">john@example.com</td>
        <td className="table-cell">
          <span className="badge badge-success">Active</span>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

## Loading States

```tsx
// Loading spinner
<div className="loading-spinner loading-spinner-md"></div>

// Loading overlay
<div className="loading-overlay">
  <div className="loading-spinner loading-spinner-lg"></div>
</div>

// Full screen loading
<div className="loading-overlay-full">
  <div className="loading-spinner loading-spinner-lg"></div>
</div>
```

## Empty States

```tsx
<div className="empty-state">
  <div className="empty-state-icon">
    <svg>...</svg>
  </div>
  <h3 className="empty-state-title">No items found</h3>
  <p className="empty-state-description">
    Get started by creating your first item.
  </p>
  <button className="btn btn-primary">Create Item</button>
</div>
```

## Navigation

```tsx
// Active navigation link
<a href="/dashboard" className="nav-link nav-link-active">
  Dashboard
</a>

// Inactive navigation link
<a href="/settings" className="nav-link nav-link-inactive">
  Settings
</a>
```

## Responsive Grid

```tsx
// 3-column responsive grid
<div className="grid-responsive">
  <div className="card">Item 1</div>
  <div className="card">Item 2</div>
  <div className="card">Item 3</div>
</div>

// 2-column responsive grid
<div className="grid-responsive-2">
  <div className="card">Item 1</div>
  <div className="card">Item 2</div>
</div>

// 4-column responsive grid
<div className="grid-responsive-4">
  <div className="card">Item 1</div>
  <div className="card">Item 2</div>
  <div className="card">Item 3</div>
  <div className="card">Item 4</div>
</div>
```

## Utility Classes

### Text Colors

```tsx
<p className="text-primary">Primary text (Black)</p>
<p className="text-secondary">Secondary text (Dark gray)</p>
<p className="text-muted">Muted text (Medium gray)</p>
<p className="text-light">Light text (Light gray)</p>
```

**Note:** The unified stylesheet automatically overrides common Tailwind gray text classes to use our design tokens:
- `text-gray-900`, `text-gray-800`, `text-gray-700` → Black text
- `text-gray-600`, `text-gray-500` → Dark gray text  
- `text-gray-400` → Medium gray text
- `text-gray-300` → Light gray text

### Containers

```tsx
<div className="container-sm">Small container</div>
<div className="container-md">Medium container</div>
<div className="container-lg">Large container</div>
```

### Mobile Utilities

```tsx
<div className="mobile-hidden">Hidden on mobile</div>
<div className="mobile-only">Visible only on mobile</div>
<div className="touch-target">Touch-friendly target</div>
```

### Accessibility

```tsx
// Screen reader only text
<span className="sr-only">Screen reader only</span>

// Skip link
<a href="#main" className="skip-link">Skip to main content</a>

// Focus-visible only
<button className="focus-visible-only">Button</button>
```

## Animations

```tsx
// Fade in animation
<div className="fade-in">Content</div>

// Slide in animation
<div className="slide-in">Content</div>
```

## Print Styles

```tsx
// Hidden when printing
<div className="no-print">Not printed</div>

// Visible only when printing
<div className="print-only">Print only</div>
```

## Design Tokens

The stylesheet uses CSS custom properties (variables) for consistency:

```css
/* Use design tokens in custom CSS */
.custom-element {
  color: var(--text-color-primary);
  background: var(--color-primary);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
}
```

## Best Practices

1. **Always use unified classes** instead of writing custom Tailwind classes
2. **Combine classes** for complex styling: `btn btn-primary btn-lg`
3. **Use semantic naming** for better code readability
4. **Test on mobile** - all styles are touch-friendly
5. **Consider accessibility** - proper contrast and focus states are built-in
6. **Use design tokens** for custom CSS to maintain consistency

## Migration Guide

To migrate existing components:

1. Replace button classes with `btn btn-*` variants
2. Replace form classes with `form-*` variants
3. Replace card classes with `card*` variants
4. Replace modal classes with `modal-*` variants
5. Test responsiveness and accessibility

## Customization

To customize the design system:

1. Edit `/src/styles/unified.css`
2. Modify CSS custom properties in `:root`
3. Update component classes as needed
4. Test across all components

The unified stylesheet provides a solid foundation for consistent, maintainable, and accessible UI components across the entire CRM application.