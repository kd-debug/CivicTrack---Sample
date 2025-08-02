# CivicTrack

A citizen engagement platform that empowers communities to report and track local civic issues such as road damage, garbage, water leaks, and other municipal problems.

## 🌟 Features

### Core Functionality
- **Location-based Visibility**: Issues are only visible within a 3-5 km radius based on GPS or manual location
- **Quick Issue Reporting**: Users can report issues with title, description, photos (up to 3), and category selection
- **Anonymous or Verified Reporting**: Support for both anonymous and verified user reporting
- **Real-time Status Tracking**: Track issue resolution with detailed status history and timestamps
- **Interactive Map Mode**: View all issues as pins on a map with filtering capabilities
- **Advanced Filtering**: Filter issues by status, category, and distance

### Issue Categories
- 🛣️ **Roads**: Potholes, obstructions
- 💡 **Lighting**: Broken or flickering lights  
- 💧 **Water Supply**: Leaks, low pressure
- 🗑️ **Cleanliness**: Overflowing bins, garbage
- ⚠️ **Public Safety**: Open manholes, exposed wiring
- 🌳 **Obstructions**: Fallen trees, debris

### Safety & Moderation
- **Spam Detection**: Users can flag inappropriate or spam reports
- **Auto-moderation**: Reports flagged by multiple users are auto-hidden pending review
- **Admin Dashboard**: Review and manage flagged issues, access analytics

### Admin Features
- Issue management and status updates
- User management and moderation
- Analytics dashboard showing:
  - Total issues posted
  - Most reported categories
  - Resolution metrics
- Ban/suspend user capabilities

## 🚀 Technology Stack

- **Frontend**: React 18 with Vite
- **Routing**: React Router DOM
- **Maps**: Leaflet with React-Leaflet
- **Icons**: Lucide React
- **Styling**: CSS Custom Properties (CSS Variables) for easy theming
- **State Management**: React Context API with useReducer
- **Date Handling**: date-fns

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.jsx       # Main navigation header
│   ├── Sidebar.jsx      # Filters and navigation sidebar
│   └── IssueCard.jsx    # Individual issue display card
├── pages/               # Main application pages
│   └── HomePage.jsx     # Main dashboard page
├── context/             # React context providers
│   └── AppContext.jsx   # Global application state
├── hooks/               # Custom React hooks
│   └── index.js         # Utility hooks (geolocation, file upload, etc.)
├── utils/               # Utility functions
│   └── index.js         # Helper functions (distance calculation, validation, etc.)
├── services/            # API and external service integrations
│   └── mockData.js      # Sample data and mock API functions
├── constants/           # Application constants
│   └── index.js         # App-wide constants and enums
└── styles/              # Global styles and theme configurations
```

## 🎨 Theming System

The application uses CSS Custom Properties (CSS Variables) for easy theme customization:

```css
:root {
  --primary-color: #3b82f6;
  --secondary-color: #06b6d4;
  --success-color: #10b981;
  --error-color: #ef4444;
  --warning-color: #f59e0b;
  /* ... more theme variables */
}
```

Switch to dark theme by adding `data-theme="dark"` to the HTML element.

## 🛠️ Development Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd civictrack
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🗺️ Map Integration

The project is prepared for map integration using Leaflet. The map component will display:
- Issue locations as interactive pins
- User's current location
- Filtering capabilities
- Distance-based visibility

## 🔧 Configuration

### Location Settings
- Default location: Delhi, India (28.6139, 77.2090)
- Visibility radius: 5 km (configurable)
- Auto-hide threshold: 3 flags

### File Upload
- Maximum photos per report: 3
- Maximum file size: 5MB
- Supported formats: Images only

## 🚀 Future Enhancements

### Phase 1 (Core Features)
- [ ] Implement React-Leaflet map integration
- [ ] Add issue reporting form
- [ ] Implement user authentication
- [ ] Add photo upload functionality
- [ ] Create admin dashboard

### Phase 2 (Advanced Features)
- [ ] Push notifications
- [ ] Real-time updates with WebSockets
- [ ] PWA (Progressive Web App) support
- [ ] Offline functionality
- [ ] Email notifications

### Phase 3 (Integrations)
- [ ] Government API integrations
- [ ] Social media sharing
- [ ] Analytics dashboard
- [ ] Mobile app development

## 🤝 Contributing

This is a hackathon project designed for easy extension and customization. The modular architecture allows for:

1. **Easy UI/UX Updates**: All styling uses CSS variables for quick theme changes
2. **Component Modularity**: Each component is self-contained and reusable
3. **Scalable State Management**: Context API setup ready for complex state requirements
4. **API Ready**: Mock data service can be easily replaced with real API calls

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👥 Team

Built for hackathon by developers passionate about civic engagement and community improvement.

---

**CivicTrack** - Empowering citizens to build better communities, one report at a time. 🏙️+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
