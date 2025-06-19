# Activity Timeline with Interactive Minimap

A modern React/Next.js application with Django backend that displays an interactive activity timeline with navigation capabilities. Built as a comprehensive solution for visualizing customer activity events and touchpoints.

## 🚀 Implementation Summary

This application was built following the requirements outlined in `CANDIDATE_INSTRUCTIONS.md`, creating a single-page application with two main components:

1. **Activity Timeline Table** - An infinite scroll table displaying activity events
2. **Interactive Navigation Minimap** - A line chart showing activity volume over time with navigation capabilities

## 🛠 Technologies Used

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS v4** - Modern utility-first CSS framework
- **Recharts** - Interactive chart library for the timeline visualization
- **Lucide React** - Modern icon library
- **date-fns** - Date manipulation and formatting
- **react-intersection-observer** - Infinite scroll implementation

### Backend
- **Django 5.2** - Python web framework
- **SQLite** - Database (with pre-populated sample data)
- **django-cors-headers** - CORS support for API access

### Testing & Development
- **Jest** - JavaScript testing framework
- **Testing Library** - React component testing utilities
- **ESLint** - Code linting and quality assurance

## 🎯 Core Functionality Implemented

### ✅ Activity Timeline Table
- **Infinite scroll loading** - Efficient handling of large datasets with 50 items per page
- **Direction indicators** - Blue arrows for outbound, red arrows for inbound activities
- **Date navigation support** - Jump to specific dates from minimap clicks
- **Gap indicators** - Visual separators showing time gaps between activities (e.g., "5 day gap")
- **People information** - Displays first person with overflow indicators (+1, +2, etc.)
- **Team, channel, and status** - Color-coded information with appropriate icons
- **Real-time date range tracking** - Syncs visible range with minimap

### ✅ Interactive Navigation Minimap
- **Line chart visualization** - Shows daily count of inbound activities (`direction: "IN"`)
- **Orange touchpoint markers** - Circular markers for first touchpoint per person
- **Blue range indicators** - Two vertical bars showing currently visible date range
- **Click-to-navigate** - Jump to any date by clicking on the chart
- **Real-time synchronization** - Bars update smoothly as user scrolls the table
- **Responsive positioning** - Markers positioned to avoid overlap with date labels

### ✅ Backend API Enhancements
- **Paginated events endpoint** - `/api/events/` with date navigation support
- **Timeline data endpoint** - `/api/timeline/` for chart visualization
- **CORS configuration** - Proper cross-origin support
- **Error handling** - Graceful handling of invalid requests
- **Query optimization** - Efficient database queries with proper indexing

## 📋 Detailed Features

### User Interface
- **Modern Design** - Clean, professional interface with consistent spacing
- **Loading States** - Spinner indicators during data fetching
- **Error Handling** - User-friendly error messages with retry functionality
- **Responsive Design** - Works across desktop and mobile devices
- **Accessibility** - Proper ARIA labels and keyboard navigation support

### Performance Optimizations
- **Infinite Scroll** - Loads data incrementally for better performance
- **Memoized Calculations** - Efficient re-rendering with React.useMemo
- **Debounced Events** - Smooth interactions without performance issues
- **Optimized Queries** - Backend pagination reduces server load

## 🏃‍♂️ Getting Started

### Prerequisites
- Python 3.8+
- Node.js 18+
- npm or yarn

### Backend Setup
```bash
cd server

# Create virtual environment (recommended)
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run development server
python manage.py runserver 8000
```

The Django server will be available at `http://localhost:8000/`

### Frontend Setup
```bash
cd client

# Install dependencies
npm install

# Run development server
npm run dev
```

The Next.js application will be available at `http://localhost:3000/`

### Running Tests
```bash
cd client

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📡 API Endpoints

### Activity Events
- `GET /api/events/` - Paginated activity events
  - **Query params**: `customer_org_id`, `account_id`, `page`, `page_size`, `date`
  - **Response**: Events, person data, and pagination info

### Timeline Data
- `GET /api/timeline/` - Timeline chart data
  - **Query params**: `customer_org_id`, `account_id`
  - **Response**: Daily activity counts and first touchpoint markers

### Legacy Endpoints (for reference)
- `GET /api/events/random/` - Random activity events (development/testing)
- `GET /api/people/random/` - Random persons (development/testing)

## 🗂 Project Structure

```
├── client/                 # Next.js frontend
│   ├── app/               # App router pages and layout
│   ├── components/        # React components
│   │   ├── ActivityMinimap.tsx
│   │   └── ActivityTimelineTable.tsx
│   ├── lib/              # Utilities and API service
│   │   ├── api.ts        # API service functions
│   │   └── utils.ts      # Utility functions
│   ├── types/            # TypeScript type definitions
│   │   └── activity.ts
│   ├── tests/        # Unit tests
│   │   ├── components/   # Component tests
│   │   ├── lib/         # Utility tests
│   │   └── setup.ts     # Test configuration
│   └── package.json
├── server/                # Django backend
│   ├── api/              # Main API app
│   │   ├── models.py     # Data models
│   │   ├── views.py      # API endpoints
│   │   └── urls.py       # URL routing
│   ├── config/           # Django settings
│   ├── data/             # Sample data files
│   └── requirements.txt
└── README.md
```

## 🧪 Testing Strategy

### Component Testing
- **Unit Tests** - Individual component functionality
- **Integration Tests** - Component interaction and data flow
- **Mocking** - API calls and external dependencies
- **Coverage** - Minimum 70% coverage threshold

### API Testing
- **HTTP Requests** - Proper request formatting and parameters
- **Error Handling** - Network failures and API errors
- **Response Parsing** - Correct data transformation

### Utility Testing
- **Date Formatting** - Various date format scenarios
- **Styling Helpers** - CSS class name generation
- **Performance** - Debouncing and optimization utilities

## 🚧 Implementation Approach & Decisions

### Time Management
- **Total time spent**: ~2 hours core development + 1 hour testing/documentation
- **Prioritization**: Core functionality first, then polish and testing
- **AI Tools Used**: Leveraged Claude for rapid development and comprehensive testing

### Technical Decisions
1. **Component Architecture** - Separation of concerns with clear prop interfaces
2. **State Management** - React hooks with minimal global state
3. **API Design** - RESTful endpoints with efficient pagination
4. **Styling Approach** - Tailwind CSS for consistent, maintainable styles
5. **Testing Strategy** - Comprehensive unit tests with good coverage

### Performance Considerations
- **Infinite Scroll** - Prevents loading all data at once
- **Memoized Calculations** - Reduces unnecessary re-renders
- **Efficient Queries** - Database optimization with proper filtering
- **Component Optimization** - React.memo and useCallback where appropriate

## 📝 Code Quality Features

### Documentation
- **Comprehensive Comments** - Every function and component block documented
- **Type Safety** - Full TypeScript implementation with strict types
- **JSDoc Comments** - Detailed parameter and return value documentation
- **README Updates** - Complete documentation of all features and changes

### Testing Coverage
- **Component Tests** - Full coverage of UI components and user interactions
- **API Tests** - Complete testing of HTTP requests and error handling
- **Utility Tests** - All helper functions thoroughly tested
- **Mock Strategy** - Proper mocking of external dependencies

### Best Practices
- **Error Boundaries** - Graceful error handling throughout the app
- **Loading States** - Consistent loading indicators across components
- **Accessibility** - Proper ARIA labels and semantic HTML
- **Performance** - Optimized rendering and data fetching

## 🔧 Development Notes

### Architecture Decisions
- **Component Separation** - Clear boundaries between minimap and table
- **Data Flow** - Unidirectional data flow with callback props
- **Error Handling** - Comprehensive error states with recovery options
- **Testing Strategy** - Focus on functionality and user interactions

### Performance Optimizations
- **Lazy Loading** - Components load data on demand
- **Memory Management** - Efficient cleanup of event listeners
- **Bundle Optimization** - Code splitting and tree shaking
- **Caching Strategy** - Intelligent data caching for better UX

## 🎯 Future Enhancement Ideas

### High Priority
- **Real-time Updates** - WebSocket integration for live data
- **Advanced Filtering** - More sophisticated search and filter options
- **Export Functionality** - CSV/PDF export capabilities
- **User Preferences** - Customizable pagination and display options

### Medium Priority
- **Enhanced Analytics** - More chart types and visualization options
- **Collaboration Features** - Comments and annotations on activities
- **Mobile App** - Native mobile application
- **Integration APIs** - Connect with CRM and marketing tools

### Low Priority
- **Themes** - Dark mode and custom color schemes
- **Advanced Search** - Full-text search across activity descriptions
- **Reporting** - Automated report generation and scheduling
- **AI Insights** - Machine learning-powered activity analysis
