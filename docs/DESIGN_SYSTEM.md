# MBA Laundry Express - Design System

## 🎨 Premium UI/UX System
**Version:** 2.0.0-premium  
**Value:** Rp 100.000.000

---

## 📁 Structure

```
src/design-system/
├── tokens/           # Design tokens
├── components/       # UI components
├── animations/       # Animation utilities
└── index.ts         # Main exports
```

---

## 🎯 Design Tokens

### Colors

```typescript
import { colors } from "@/design-system";

// Brand colors
colors.ruby[500]      // Primary red
colors.sapphire[500]  // Secondary blue
colors.teal[500]      // Accent teal

// Semantic colors
colors.semantic.success.DEFAULT
colors.semantic.error.DEFAULT
colors.semantic.warning.DEFAULT
colors.semantic.info.DEFAULT

// Dark mode
colors.darkMode["bg-primary"]
colors.darkMode["text-primary"]
```

### Typography

```typescript
import { typography, fontSize, fontWeight } from "@/design-system";

// Typography presets
typography["display-xl"]
typography["h1"]
typography["body-lg"]
typography["label"]
```

### Spacing

```typescript
import { tokens } from "@/design-system";

// Space scale (4px base)
tokens.space[4]      // 1rem (16px)
tokens.space[8]      // 2rem (32px)

// Border radius
tokens.radius.card   // 1.5rem (24px)
tokens.radius.button // 0.75rem (12px)

// Shadows
tokens.shadow.card
tokens.shadow.cardHover
```

---

## 🧩 Components

### Button

```tsx
import { Button } from "@/design-system";

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>
<Button variant="success">Success</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// States
<Button isLoading>Loading</Button>
<Button disabled>Disabled</Button>

// With icons
<Button leftIcon={<Icon />}>With Icon</Button>
<Button rightIcon={<Icon />}>With Icon</Button>
```

### Card

```tsx
import { Card, CardImage, CardBadge } from "@/design-system";

// Basic card
<Card>Content</Card>

// Variants
<Card variant="elevated">Elevated</Card>
<Card variant="outlined">Outlined</Card>
<Card variant="ghost">Ghost</Card>

// With hover effects
<Card hoverLift hoverGlow>Interactive</Card>

// With image
<Card>
  <CardImage src="..." alt="..." aspectRatio="video" />
  Content
</Card>

// With badge
<CardBadge variant="primary">New</CardBadge>
```

### Skeleton

```tsx
import { Skeleton, SkeletonCard, SkeletonText } from "@/design-system";

// Basic skeleton
<Skeleton variant="text" width={200} height={20} />

// Card skeleton
<SkeletonCard hasImage textLines={3} />

// Text skeleton
<SkeletonText lines={3} />

// List skeleton
<SkeletonList items={5} hasAvatar />

// Grid skeleton
<SkeletonGrid items={6} columns={3} />
```

### Modal

```tsx
import { Modal, ConfirmModal } from "@/design-system";

// Basic modal
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  description="Modal description"
>
  Content
</Modal>

// Confirm modal
<ConfirmModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  message="Are you sure?"
  onConfirm={handleConfirm}
  confirmText="Yes, delete"
  confirmVariant="danger"
/>
```

### Toast

```tsx
import { toast, ToastContainer } from "@/design-system";

// Add ToastContainer to root layout
<ToastContainer position="top-right" />

// Show toast
toast.success("Success!", "Operation completed");
toast.error("Error!", "Something went wrong");
toast.warning("Warning!", "Please check your input");
toast.info("Info", "New update available");
```

### Form Components

```tsx
import { Input, Select, Checkbox, Textarea } from "@/design-system";

// Input
<Input
  label="Email"
  placeholder="Enter email"
  helperText="We'll never share your email"
  error={errors.email}
  leftIcon={<MailIcon />}
/>

// Select
<Select
  label="Category"
  options={[
    { value: "1", label: "Option 1" },
    { value: "2", label: "Option 2" },
  ]}
/>

// Checkbox
<Checkbox
  label="I agree to terms"
  helperText="Please read our terms"
/>

// Textarea
<Textarea
  label="Description"
  placeholder="Enter description"
  rows={4}
/>
```

### Tabs

```tsx
import { Tabs, TabPanel } from "@/design-system";

const tabs = [
  { id: "tab1", label: "Tab 1", icon: <Icon /> },
  { id: "tab2", label: "Tab 2", badge: 3 },
];

<Tabs
  tabs={tabs}
  activeTab={activeTab}
  onChange={setActiveTab}
  variant="default" // default | pills | underline | buttons
/>

<TabPanel id="tab1" activeTab={activeTab}>
  Content 1
</TabPanel>
```

### Accordion

```tsx
import { Accordion, FAQAccordion } from "@/design-system";

const items = [
  { id: "1", title: "Question 1", content: "Answer 1" },
  { id: "2", title: "Question 2", content: "Answer 2" },
];

<Accordion
  items={items}
  variant="separated" // default | separated | bordered
  allowMultiple
/>

// FAQ variant
<FAQAccordion
  items={[
    { question: "Q1", answer: "A1" },
    { question: "Q2", answer: "A2" },
  ]}
/>
```

### Spin Wheel

```tsx
import { SpinWheel } from "@/design-system";

const prizes = [
  { id: "1", label: "10% Off", value: 10, color: "#DC2626" },
  { id: "2", label: "Free Gift", value: 0, color: "#2563EB", rare: true },
];

<SpinWheel
  prizes={prizes}
  onSpinEnd={(prize) => console.log(prize)}
  remainingSpins={3}
/>
```

### Bottom Navigation

```tsx
import { BottomNav, FAB } from "@/design-system";

const navItems = [
  { id: "home", label: "Home", icon: <HomeIcon /> },
  { id: "search", label: "Search", icon: <SearchIcon />, badge: 2 },
];

<BottomNav
  items={navItems}
  activeId={activeTab}
  onChange={setActiveTab}
/>

<FAB
  icon={<PlusIcon />}
  label="Add new"
  onClick={() => {}}
  variant="primary"
/>
```

---

## ✨ Animations

### Motion Variants

```tsx
import { fade, slide, staggerContainer, staggerItem } from "@/design-system";

// Fade animation
<motion.div
  initial="hidden"
  animate="visible"
  exit="exit"
  variants={fade.up}
>
  Content
</motion.div>

// Stagger children
<motion.div
  variants={staggerContainer}
  initial="hidden"
  animate="visible"
>
  {items.map((item) => (
    <motion.div key={item.id} variants={staggerItem}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

### Animation Hooks

```tsx
import {
  useHoverScale,
  usePress,
  useInView,
  useCountUp,
  useRipple,
} from "@/design-system";

// Hover scale
const { scale, handlers } = useHoverScale(1.05);

// Press effect
const { isPressed, handlers: pressHandlers } = usePress();

// In view detection
const { ref, isInView } = useInView<HTMLDivElement>();

// Count up animation
const { count, startAnimation } = useCountUp(1000, 2000);

// Ripple effect
const { ripples, createRipple } = useRipple();
```

### Page Transitions

```tsx
import { PageTransition, ScrollReveal } from "@/design-system";

// Page transition
<PageTransition variant="fade">
  <YourPage />
</PageTransition>

// Scroll reveal
<ScrollReveal direction="up" delay={0.2}>
  <YourComponent />
</ScrollReveal>
```

---

## 🎨 Usage Examples

### Complete Form

```tsx
import { Button, Input, Select, Checkbox } from "@/design-system";

function ContactForm() {
  return (
    <Card variant="elevated" className="max-w-md mx-auto">
      <form className="space-y-4">
        <Input
          label="Name"
          placeholder="Your name"
          required
        />
        <Input
          label="Email"
          type="email"
          placeholder="your@email.com"
          required
        />
        <Select
          label="Subject"
          options={[
            { value: "general", label: "General Inquiry" },
            { value: "support", label: "Support" },
          ]}
        />
        <Checkbox
          label="Subscribe to newsletter"
        />
        <Button fullWidth type="submit">
          Send Message
        </Button>
      </form>
    </Card>
  );
}
```

### Loading States

```tsx
import { Skeleton, Button } from "@/design-system";

function ProductList({ isLoading, products }) {
  if (isLoading) {
    return <SkeletonGrid items={6} columns={3} />;
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      {products.map((product) => (
        <Card key={product.id} hoverLift>
          <img src={product.image} alt={product.name} />
          <h3>{product.name}</h3>
          <Button size="sm">Add to Cart</Button>
        </Card>
      ))}
    </div>
  );
}
```

---

## 📱 Responsive Design

All components are fully responsive and work on:
- Mobile (320px+)
- Tablet (768px+)
- Desktop (1024px+)
- Large screens (1440px+)

---

## 🌙 Dark Mode

All components support dark mode automatically via Tailwind's `dark:` classes.

```tsx
// Toggle dark mode
document.documentElement.classList.toggle("dark");
```

---

## ♿ Accessibility

- WCAG 2.1 AA compliant
- Keyboard navigation
- Screen reader support
- Focus management
- Reduced motion support

---

## 🚀 Performance

- Tree-shakeable exports
- Lazy loading ready
- Optimized animations
- Minimal bundle size
