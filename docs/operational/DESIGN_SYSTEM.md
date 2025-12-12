# Hanzi Dojo Design System

This document defines the visual design patterns for Hanzi Dojo. All frontend changes should follow these conventions.

## Typography

- **All section headers:** `font-heading` (Bungee font)
- **Size hierarchy:** 3xl (page) > 2xl (form) > xl (section) > lg (card)
- **Body text:** Default sans-serif (DM Sans)

### Examples
```tsx
// Page title
<h1 className="font-heading text-3xl text-gray-900">Practice Demo</h1>

// Section header
<h2 className="font-heading text-2xl text-gray-900">My Characters</h2>

// Card header
<h3 className="font-heading text-lg text-gray-900">Drill Proficiency</h3>

// Metric card header (on colored background)
<h3 className="font-heading text-sm opacity-80 tracking-wide">Total Points</h3>
```

## Buttons

| Purpose | Class |
|---------|-------|
| Primary (submit, delete, exit) | `ninja-button ninja-button-fire` |
| Secondary (lookup, info) | `ninja-button ninja-button-lightning` |
| Training CTA | `ninja-button ninja-button-gold` |
| Utility (reset, toggle) | `bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors` |

### Examples
```tsx
// Primary action (delete, exit training)
<button className="ninja-button ninja-button-fire">Delete</button>

// Secondary action (dictionary lookup)
<button className="ninja-button ninja-button-lightning">Lookup</button>

// Utility button
<button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors">
  Reset Session
</button>
```

## Focus States

- **Form inputs:** `focus:border-ninja-blue focus:ring-2 focus:ring-ninja-blue/20`

### Example
```tsx
<input
  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-ninja-blue focus:ring-2 focus:ring-ninja-blue/20 focus:outline-none"
/>
```

## Background Gradients

- **Full-screen backgrounds (auth, training):** `bg-gradient-to-r from-ninja-red-dark via-ninja-red to-ninja-orange`

### Example
```tsx
<div className="min-h-screen bg-gradient-to-r from-ninja-red-dark via-ninja-red to-ninja-orange">
  {/* Content */}
</div>
```

## Color Palette

Defined in `tailwind.config.js`:

| Token | Hex | Usage |
|-------|-----|-------|
| `ninja-red` | #f90000 | Primary fire color |
| `ninja-red-dark` | #b30000 | Darker fire shade |
| `ninja-orange` | #ff6600 | Fire gradient accent |
| `ninja-blue` | #0095fc | Lightning element, focus states |
| `ninja-gold` | #FFD700 | Gold element, rewards |
| `ninja-gold-dark` | #DAA520 | Darker gold shade |
| `ninja-black` | #1a1a1a | Text on gold backgrounds |

## Reference Implementation

See `src/components/DemoDashboard.tsx` for the canonical Ninjago theme example. This component demonstrates:
- Proper `font-heading` usage on all headers
- Colorful metric cards with gradient backgrounds
- Consistent spacing and sizing

## When to Use What

| Scenario | Pattern |
|----------|---------|
| Page loads with fire gradient | AuthScreen, TrainingMode |
| Section needs visual hierarchy | Use `font-heading` + size scale |
| User performs destructive action | `ninja-button-fire` |
| User performs lookup/info action | `ninja-button-lightning` |
| Toggle/reset utility buttons | Gray utility button style |
| Form input receives focus | Blue focus ring |
