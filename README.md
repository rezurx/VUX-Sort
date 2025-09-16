# VUX Sort - Standalone Card Sorting Tool

A standalone card sorting application extracted from the Vision-UX platform. This tool allows researchers to create, conduct, and analyze card sorting studies with an intuitive interface and comprehensive analytics.

## Features

### Study Management
- **Create Studies**: Design card sorting studies with custom cards and categories
- **Study Settings**: Configure participant limits, card shuffling, progress indicators, and more
- **Study Duplication**: Quickly create variations of existing studies
- **Import/Export**: Import cards via CSV or manually add them

### Participant Experience
- **Drag & Drop Interface**: Intuitive card sorting with visual feedback
- **Mobile Responsive**: Works seamlessly on desktop, tablet, and mobile devices
- **Progress Tracking**: Optional progress indicators and completion feedback
- **Accessible Design**: WCAG-compliant interface with proper ARIA labels

### Analytics & Insights
- **Card Similarity Matrix**: Visual heatmap showing how often cards are grouped together
- **Category Analysis**: Frequency analysis of category usage across participants
- **Export Results**: Download data in CSV or JSON formats
- **Real-time Stats**: Participant count, completion rates, and duration metrics

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Visualizations**: D3.js for similarity matrix and analytics
- **Icons**: Lucide React
- **Data Export**: PapaParse for CSV handling
- **Build Tool**: Vite

## Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

1. Navigate to the project directory:
```bash
cd "HFE Work/VUX-Sort"
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to the displayed local URL (typically `http://localhost:5173`)

### Building for Production

```bash
npm run build
```

The built files will be available in the `dist` directory.

## Usage

### Creating a Study

1. Click "Create Study" from the dashboard
2. Enter study name and description
3. Add cards by typing text and clicking "Add Card"
4. Add categories for participants to sort cards into
5. Configure study settings (participant limits, shuffling, etc.)
6. Save the study

### Running a Study

1. From the dashboard, click the "Start" button on a study
2. Share the participant interface with your participants
3. Participants drag cards into categories
4. Results are automatically saved upon completion

### Analyzing Results

1. Click "Analytics" on a study with collected data
2. View overview statistics (participant count, duration, etc.)
3. Explore the card similarity matrix to see grouping patterns
4. Analyze category usage frequency
5. Export results for further analysis

## Data Storage

The application uses browser localStorage to persist data. This means:
- Studies and results are saved locally in your browser
- No server setup required
- Data persists between browser sessions
- Clearing browser data will remove studies and results

For production use, consider integrating with a backend service for data persistence and sharing.

## File Structure

```
src/
├── components/           # React components
│   ├── Analytics.tsx     # Analytics dashboard
│   ├── Dashboard.tsx     # Main dashboard
│   ├── ParticipantCardSort.tsx  # Card sorting interface
│   ├── ParticipantComplete.tsx  # Completion screen
│   ├── SimilarityMatrix.tsx     # D3 similarity visualization
│   └── StudyCreator.tsx         # Study creation interface
├── analytics/           # Analytics utilities
│   └── index.ts         # Similarity analysis, clustering
├── types/              # TypeScript type definitions
│   └── index.ts        # Core types (Study, Card, Result, etc.)
├── utils/              # Utility functions
│   └── index.ts        # Export, storage, validation utilities
├── App.tsx             # Main application component
├── main.tsx           # React app entry point
└── index.css          # Global styles with Tailwind
```

## Key Features Extracted from Vision-UX

This standalone tool includes the following features from the original Vision-UX platform:

- Complete card sorting workflow (create → conduct → analyze)
- Drag-and-drop interface with mobile support
- Card similarity matrix with D3.js visualizations
- Category frequency analysis
- Data export capabilities (CSV/JSON)
- Responsive design with Tailwind CSS
- TypeScript for type safety
- Local data persistence

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Contributing

1. Follow the existing code style and TypeScript conventions
2. Add proper type definitions for new features
3. Ensure responsive design works on all device sizes
4. Test drag-and-drop functionality across browsers
5. Update this README for any new features

## License

This project is extracted from the Vision-UX platform and maintains the same licensing terms.