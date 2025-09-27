# QuranLoad UI (QUI)

The **QUI** package centralises the reusable, purely-presentational UI widgets that we
found across `src/components`. While feature components that embed business logic
remain in their original folders, any primitives that can be styled with Tamagui now
live here to make gradual migration easier.

## Mapping the existing shared components

| Existing component | Notes from the audit | Equivalent in QUI |
| --- | --- | --- |
| `components/buttons/ActionBtn` | Pure CTA button with loading + disabled states | `QUIButton` (`visual="primary"`) |
| `components/buttons/TextButton` | Text-only secondary action | `QUIButton` (`visual="link"`) |
| `components/buttons/IconButton` | Circular icon trigger with size options | `QUIIconButton` |
| `components/Typography` | Typeface scale backed by `styles/typographies` | `Typography`, `Heading`, `Subheading` |
| `components/Card` | Bordered container with spacing | `Card`, `CardHeader`, `CardContent`, `CardFooter` |
| `components/Spacer` | Horizontal/vertical gap helpers | `Spacer`, `Spacer.Vertical`, `Spacer.Horizontal` |
| `components/Loader` | (visual only) future candidate for QUI spinner | Covered by `QUIButton` loading state & Tamagui `Spinner` |
| `components/forms` controls | Form field wrappers with minimal logic | `QUIInput`, `QUITextArea` |

Additional new abstractions such as `ListItem` and `Badge` were created after
reviewing list-based UIs (`AssignmentItem`, `TeamItem`, `SubscriptionCard`) to
encapsulate repeating layout patterns.

## Theme and tokens

`QUI` defines a QuranLoad-specific Tamagui theme that mirrors the design tokens in
`constants/Colors` and `constants/GeneralConstants`. The theme exposes `QUI_THEME_NAMES`
(`"qui_light"` and `"qui_dark"`) and adds typography, colour, spacing, radius, size,
and z-index tokens so the new primitives can rely purely on design tokens.

`QUIProvider` should wrap the application root. It wires Tamagui up with the
extended config and exposes a convenient default theme hook so future migrations can
switch themes without editing `App.tsx`.
