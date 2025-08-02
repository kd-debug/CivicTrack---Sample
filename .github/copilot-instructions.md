# CivicTrack - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
CivicTrack is a citizen engagement platform that allows users to report local civic issues such as road damage, garbage, water leaks, and other community problems. The application features GPS-based issue visibility, real-time tracking, map integration, and admin moderation capabilities.

## Key Features
- **Location-based Visibility**: Issues are only visible within a 3-5 km radius
- **Quick Issue Reporting**: Support for photos, categories, anonymous/verified reporting
- **Issue Categories**: Roads, Lighting, Water Supply, Cleanliness, Public Safety, Obstructions
- **Status Tracking**: Real-time status updates with notifications
- **Map Integration**: Interactive map with filtering capabilities
- **Moderation System**: Spam detection and admin review functionality
- **Admin Dashboard**: Analytics and user management

## Technical Stack
- **Frontend**: React with Vite
- **Routing**: React Router DOM
- **Maps**: Leaflet with React-Leaflet
- **Icons**: Lucide React
- **Styling**: CSS modules with easy theme customization
- **State Management**: React Context API
- **Date Handling**: date-fns

## Code Style Guidelines
- Use functional components with hooks
- Implement proper error boundaries
- Create reusable UI components
- Use CSS modules for styling to enable easy theme switching
- Implement responsive design principles
- Follow accessibility best practices
- Use semantic HTML elements
- Implement proper loading states and error handling

## Project Structure
- `/src/components/` - Reusable UI components
- `/src/pages/` - Main application pages
- `/src/context/` - React context providers
- `/src/hooks/` - Custom React hooks
- `/src/utils/` - Utility functions
- `/src/services/` - API and external service integrations
- `/src/styles/` - Global styles and theme configurations
- `/src/constants/` - Application constants and configuration

## Development Priorities
1. Modular component architecture for easy UI/UX updates
2. Responsive design that works on mobile and desktop
3. Performance optimization for map rendering
4. Accessibility compliance
5. Easy theme customization system
6. Scalable state management
7. Proper error handling and user feedback
