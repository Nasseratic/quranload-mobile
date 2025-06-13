# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

QuranLoad is a React Native mobile application built with Expo that serves as a Quran learning platform. The app provides audio recording capabilities, real-time chat, assignments, and Mushaf (Quran text) viewing functionality for both students and teachers.

## Technology Stack

- **React Native** with **Expo SDK 52** for cross-platform mobile development
- **TypeScript** for type safety and better development experience
- **Tamagui** for UI components and styling system
- **Convex** for real-time backend, database, and push notifications
- **Supabase** for additional backend services
- **React Navigation** for navigation
- **React Query (@tanstack/react-query)** for server state management
- **React Hook Form** and **Formik** for form handling
- **Expo AV** and **ffmpeg-kit-react-native** for audio recording and processing

## Commands

### Development

- `npm install` - Install dependencies
- `npm start` - Start Expo development server with Tamagui native target
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device
- `npm run web` - Run web version

### Code Quality

- `npm run check-types` - Check TypeScript types
- `npm run lint` - Run ESLint on TypeScript files in src/
- `npm run lint-fix` - Auto-fix ESLint issues
- `npm run prettier-check` - Check code formatting

## Architecture

### Frontend Structure

- **App.tsx**: Main entry point with providers (Tamagui, Convex, React Query, Auth)
- **src/screens/**: Screen components organized by user role (student/, teacher/, auth/, account/, chat/, mushaf/)
- **src/components/**: Reusable UI components built with Tamagui
- **src/navigation/**: React Navigation configuration with role-based routing
- **src/contexts/**: React contexts for global state (auth context)
- **src/api/**: Convex client setup and API interceptors
- **src/services/**: Business logic services for different domains
- **src/hooks/**: Custom React hooks (audio management, deep links, app status)

### Backend Architecture (Convex)

- **convex/schema.ts**: Database schema with tables for messages, conversations, feature flags, user info
- **convex/services/**: Backend functions organized by domain (messages, user, support, feature flags, push notifications)
- Real-time capabilities with Convex subscriptions
- Feature flag system for gradual rollouts
- Push notification integration with Expo

### Key Features

1. **Role-based Navigation**: Different screens and flows for Students vs Teachers
2. **Audio Recording**: Quran recitation recording with audio processing pipeline
3. **Real-time Chat**: Both normal chat and support chat functionality
4. **Mushaf Reader**: Quran text viewing with custom Arabic fonts (600+ QCF font files)
5. **Assignment System**: Teacher-created assignments with student submissions
6. **Internationalization**: Multi-language support using i18n-js

### State Management

- **Server State**: React Query for API calls and caching
- **Global State**: React contexts (primarily auth state)
- **Real-time Data**: Convex subscriptions for live updates
- **Local Storage**: AsyncStorage for persistent data

### Important Files

- **tamagui.config.ts**: UI library configuration
- **src/api/convex.tsx**: Convex client setup with environment-specific URLs
- **src/contexts/auth.tsx**: Authentication context and user management
- **src/navigation/Nav.tsx**: Main navigation component with conditional routing
- **convex/schema.ts**: Database schema definitions

## Development Notes

### Tamagui Usage

- Use Tamagui components for consistent styling across the app
- Follow the theme configuration in tamagui.config.ts
- Utilize responsive design features and built-in tokens

### Convex Integration

- Backend functions are called via useCvxQuery and useCvxMutation hooks
- Real-time features use Convex subscriptions
- Feature flags are managed through Convex backend

### Audio Functionality

- Uses Expo AV for audio recording and playback
- Audio processing with ffmpeg-kit-react-native
- Custom audio duration formatting and fragment concatenation utilities

### Fonts and Assets

- Extensive collection of Quran-specific fonts (QCF2001-QCF2604) for proper Arabic text rendering
- Quran page images (1-405) for Mushaf display
- Custom icons and Lottie animations

### Build Configuration

- EAS Build for development and production builds
- Development builds available for testing on both platforms
- OTA updates configured with Expo Updates
- Sentry integration for error tracking
