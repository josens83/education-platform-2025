# UI Component Library

Education Platform 2025 Design System

## Design Philosophy

- **집중 (Focus)**: Clean UI that doesn't distract from learning
- **따뜻함 (Warmth)**: Welcoming feel with warm color palette
- **신뢰 (Trust)**: Premium education service quality
- **효율 (Efficiency)**: Intuitive navigation and quick access

## Components

### Button

Versatile button component with multiple variants and sizes.

```tsx
import { Button } from '@/components/ui';

// Primary button
<Button variant="primary">
  Start Learning
</Button>

// Secondary button with icon
<Button
  variant="secondary"
  leftIcon={<StarIcon />}
>
  Achievements
</Button>

// Loading state
<Button variant="primary" loading>
  Submitting...
</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
```

### Card

Container component with hover and interactive variants.

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui';

<Card variant="hover">
  <CardHeader>
    <CardTitle>Chapter 1: Introduction</CardTitle>
    <CardDescription>Learn the basics of web development</CardDescription>
  </CardHeader>

  <CardContent>
    <p>This chapter covers HTML, CSS, and JavaScript fundamentals.</p>
  </CardContent>

  <CardFooter>
    <Button>Continue Reading</Button>
  </CardFooter>
</Card>

// Interactive card (clickable)
<Card variant="interactive" onClick={() => navigate('/book/1')}>
  Book content...
</Card>

// Glass morphism (special effects)
<Card variant="glass">
  Frosted glass effect
</Card>
```

### Input

Form input with error states, icons, and helper text.

```tsx
import { Input } from '@/components/ui';

// Basic input
<Input
  label="Email"
  placeholder="Enter your email"
  type="email"
/>

// With icon
<Input
  label="Search"
  leftIcon={<SearchIcon />}
  placeholder="Search books..."
/>

// Error state
<Input
  label="Password"
  type="password"
  error
  errorMessage="Password must be at least 8 characters"
/>

// Helper text
<Input
  label="Username"
  helperText="Choose a unique username"
/>
```

### Badge

Status indicators and achievement badges.

```tsx
import { Badge, AchievementBadge } from '@/components/ui';

// Status badges
<Badge variant="primary">New</Badge>
<Badge variant="success">Completed</Badge>
<Badge variant="warning">In Progress</Badge>

// With icon
<Badge variant="accent" icon={<StarIcon />}>
  Premium
</Badge>

// With dot indicator
<Badge variant="primary" dot>
  3 New Messages
</Badge>

// Achievement badge (gamification)
<AchievementBadge
  title="7 Day Streak"
  description="Completed lessons for 7 days in a row"
  icon="🔥"
  variant="gold"
/>

// Locked achievement
<AchievementBadge
  title="Master Reader"
  description="Read 100 books"
  icon="📚"
  variant="silver"
  locked
/>
```

### ProgressBar

Linear and circular progress indicators.

```tsx
import { ProgressBar, CircularProgress } from '@/components/ui';

// Linear progress
<ProgressBar
  value={65}
  label="Book Progress"
  showPercentage
  variant="primary"
/>

// Different variants
<ProgressBar value={80} variant="success" />
<ProgressBar value={45} variant="accent" />

// Circular progress
<CircularProgress
  value={75}
  size={120}
  variant="primary"
  showPercentage
/>
```

## Animation Components

### FadeIn

Fade in elements when they enter the viewport.

```tsx
import { FadeIn } from '@/components/ui';

<FadeIn delay={100} duration={500}>
  <h1>Welcome to Education Platform</h1>
</FadeIn>

// With slide up effect
<FadeIn yOffset={30}>
  <p>This content fades in with a slide up animation</p>
</FadeIn>

// Trigger every time (not just once)
<FadeIn once={false}>
  <div>Animates every time it enters viewport</div>
</FadeIn>
```

### SlideIn

Slide in elements from any direction.

```tsx
import { SlideIn } from '@/components/ui';

// Slide from left
<SlideIn direction="left">
  <img src="hero.jpg" />
</SlideIn>

// Slide from right with delay
<SlideIn direction="right" delay={200}>
  <Card>...</Card>
</SlideIn>

// Slide from bottom
<SlideIn direction="down" offset={40}>
  <Button>Call to Action</Button>
</SlideIn>
```

### Stagger

Staggered animations for lists and grids.

```tsx
import { Stagger } from '@/components/ui';

// Stagger fade in
<Stagger animation="fade" staggerDelay={100}>
  {books.map(book => (
    <BookCard key={book.id} book={book} />
  ))}
</Stagger>

// Stagger slide up
<Stagger animation="slide-up" staggerDelay={80}>
  <Feature1 />
  <Feature2 />
  <Feature3 />
</Stagger>

// Stagger scale
<Stagger animation="scale" initialDelay={300}>
  {achievements.map(achievement => (
    <AchievementBadge key={achievement.id} {...achievement} />
  ))}
</Stagger>
```

## Animation Hooks

### useInView

Detect when an element enters the viewport.

```tsx
import { useInView } from '@/hooks/useAnimation';

function MyComponent() {
  const { ref, isInView, hasBeenInView } = useInView();

  return (
    <div ref={ref}>
      {isInView && <p>I'm visible!</p>}
    </div>
  );
}
```

### useCountUp

Animated number counting (for statistics, gamification).

```tsx
import { useCountUp } from '@/hooks/useAnimation';

function Stats() {
  const count = useCountUp(1000, 2000); // Count to 1000 over 2 seconds

  return <h2>{count} Books Read</h2>;
}
```

### usePrefersReducedMotion

Respect user's motion preferences for accessibility.

```tsx
import { usePrefersReducedMotion } from '@/hooks/useAnimation';

function AnimatedComponent() {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return <StaticComponent />;
  }

  return <AnimatedComponent />;
}
```

## Color Palette

### Primary (Warm Indigo)
- Main CTA: `bg-primary-500` (#6366F1)
- Active state: `bg-primary-600` (#4F46E5)
- Light background: `bg-primary-100`
- Dark text: `text-primary-800`

### Secondary (Amber)
- Achievement badges: `bg-secondary-400` (#FBBF24)
- Accent elements: `bg-secondary-500`
- Light background: `bg-secondary-100`

### Accent (Teal)
- Completion indicators: `bg-accent-400` (#2DD4BF)
- Positive feedback: `bg-accent-500`
- Light background: `bg-accent-100`

### State Colors
- Success: `bg-success`, `text-success-dark`
- Warning: `bg-warning`, `text-warning-dark`
- Error: `bg-error`, `text-error-dark`
- Info: `bg-info`, `text-info-dark`

## Typography

### Font Families
- Sans-serif (UI): `font-sans` - Pretendard Variable
- Serif (Reading): `font-serif` - Source Serif 4
- Monospace (Code): `font-mono` - JetBrains Mono

### Reading-Optimized Typography
```tsx
// For book content
<div className="prose-reading">
  <p>Long-form reading content...</p>
</div>

// Individual settings
<p className="font-serif text-lg leading-loose tracking-reading max-w-65ch">
  Optimized for comfortable reading
</p>
```

## Spacing

### Section Spacing
- Tight: `section-tight` (3rem / 48px)
- Normal: `section-normal` (5rem / 80px)
- Loose: `section-loose` (8rem / 128px)
- Spacious: `section-spacious` (12rem / 192px)

```tsx
<section className="section-normal">
  Content with normal spacing
</section>
```

## Utility Classes

### Micro-interactions
```tsx
// Interactive scale
<div className="interactive">
  Scales slightly on hover and click
</div>

// Interactive lift
<div className="interactive-lift">
  Lifts up with shadow on hover
</div>
```

### Text Gradients
```tsx
// Primary gradient
<h1 className="text-gradient-primary">
  Education Platform 2025
</h1>

// Warm gradient (secondary to accent)
<h2 className="text-gradient-warm">
  Start Learning Today
</h2>
```

### Focus Management
```tsx
// Accessible focus ring
<button className="focus-visible-ring">
  Keyboard accessible
</button>
```

## Best Practices

1. **Use semantic HTML**: Always use appropriate HTML elements
2. **Accessibility first**: Include ARIA labels, keyboard navigation
3. **Respect reduced motion**: All animations respect `prefers-reduced-motion`
4. **Mobile-first**: Start with mobile design, scale up
5. **Consistent spacing**: Use design tokens for spacing
6. **Color contrast**: Ensure WCAG AAA compliance
7. **Performance**: Lazy load heavy components
8. **Dark mode**: All components support dark mode

## Examples

### Book Card with All Features

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, ProgressBar, Button, FadeIn } from '@/components/ui';

function BookCard({ book }) {
  return (
    <FadeIn>
      <Card variant="hover">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle>{book.title}</CardTitle>
            <Badge variant="accent">{book.level}</Badge>
          </div>
          <CardDescription>{book.author}</CardDescription>
        </CardHeader>

        <CardContent>
          <ProgressBar
            value={book.progress}
            showPercentage
            variant="primary"
            label="Reading Progress"
          />
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button variant="primary">Continue Reading</Button>
          <Button variant="ghost">Details</Button>
        </CardFooter>
      </Card>
    </FadeIn>
  );
}
```

### Achievement Section

```tsx
import { Stagger, AchievementBadge } from '@/components/ui';

function Achievements({ achievements }) {
  return (
    <section className="section-normal">
      <h2 className="text-3xl font-bold text-gradient-primary mb-8">
        Your Achievements
      </h2>

      <Stagger animation="scale" staggerDelay={100}>
        {achievements.map(achievement => (
          <AchievementBadge
            key={achievement.id}
            title={achievement.title}
            description={achievement.description}
            icon={achievement.icon}
            variant={achievement.tier}
            locked={!achievement.unlocked}
          />
        ))}
      </Stagger>
    </section>
  );
}
```
