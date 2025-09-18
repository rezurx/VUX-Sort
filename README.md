# VUX Sort - Information Architecture Evaluation Platform

A comprehensive Information Architecture evaluation platform featuring advanced card sorting, tree testing, and analytics capabilities. Evolved from a standalone tool into a professional-grade research platform with AI-powered orchestration and enterprise analytics.

## Features

### Study Management
- **Multiple IA Methods**: Closed card sorting, open card sorting, tree testing, reverse card sorting
- **Rich Content Support**: Image and icon integration for enhanced card sorting
- **Bulk Data Upload**: CSV import with validation and template downloads
- **Professional Participant Management**: Unique invite codes, demographics collection, status tracking
- **Study Settings**: Configure participant limits, card shuffling, progress indicators, and more
- **Study Duplication**: Quickly create variations of existing studies

### Participant Experience
- **Drag & Drop Interface**: Intuitive card sorting with visual feedback
- **Mobile Responsive**: Works seamlessly on desktop, tablet, and mobile devices
- **Progress Tracking**: Optional progress indicators and completion feedback
- **Accessible Design**: WCAG-compliant interface with proper ARIA labels

### Advanced Analytics & Insights 🆕
- **Agreement Scores**: Statistical analysis of card placement consistency across participants
- **Participant Journey Tracking**: Real-time movement logging with behavioral pattern analysis
- **Card Metadata & Tagging**: Cross-study tracking with performance analytics
- **Enhanced Export Options**: Professional CSV, Excel, PDF, and JSON reports
- **Similarity Matrix**: Visual heatmap showing card relationships and clustering
- **Dendrogram Visualization**: Hierarchical clustering analysis with D3.js
- **Category Analysis**: Frequency analysis and consensus identification
- **Tree Testing Analytics**: Success rates, path analysis, and navigation efficiency

### Task Orchestration System 🆕
- **Intelligent Development Coordination**: AI-powered task routing to specialized agents
- **6 Specialized Agents**: Analytics, UI/UX, Collaboration, Participant Management, Integration, and Card Sorting specialists
- **Quality Assurance**: Automated validation with comprehensive quality gates
- **Performance Monitoring**: Real-time metrics and system health tracking

## 🆕 Phase 1A Features (December 2024)

### Enhanced Export System
- **Multi-format Reports**: Professional CSV, Excel, PDF, and JSON exports
- **Configurable Options**: Include/exclude metadata, demographics, timestamps
- **Excel Workbooks**: Multi-sheet analysis with category frequency and tree testing metrics
- **PDF Reports**: Research-grade reports with tables, charts, and statistical analysis

### Agreement Scores Analytics
- **Card-to-Card Analysis**: Statistical consistency measurement across participants
- **Category Consensus**: Identification of high/low agreement categories
- **Automatic Insights**: Problematic cards and consensus categories detection
- **Interactive Visualization**: Sortable tables and heatmap integration

### Participant Journey Tracking
- **Real-time Movement Logging**: Timestamped card placement and movement tracking
- **Journey Phase Analysis**: Initial, exploration, refinement, finalization patterns
- **Behavioral Insights**: Convergence analysis and hesitation pattern detection
- **Performance Metrics**: Card difficulty assessment based on movement patterns

### Card Metadata & Tagging System
- **Cross-Study Tracking**: Cards tracked and analyzed across multiple studies
- **Tag Categories**: 7 predefined categories (Navigation, Content, Feature, etc.)
- **Performance Analytics**: Volatility indexing and trend analysis
- **Advanced Search**: Tag-based filtering and card discovery capabilities

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Visualizations**: D3.js for similarity matrix and analytics
- **Icons**: Lucide React
- **Data Export**: Multi-format exports (CSV, Excel, PDF, JSON) with XLSX and jsPDF
- **Rich Content**: Image and icon support for enhanced card sorting
- **Build Tool**: Vite
- **Task Orchestration**: Intelligent AI agent coordination system

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
- AI-powered task orchestration system for development coordination

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
- `npm run orchestrator:test` - Run orchestrator test suite
- `npm run orchestrator:demo` - Run orchestrator usage demo

### Contributing

1. Follow the existing code style and TypeScript conventions
2. Add proper type definitions for new features
3. Ensure responsive design works on all device sizes
4. Test drag-and-drop functionality across browsers
5. Update this README for any new features

## License

This project is extracted from the Vision-UX platform and maintains the same licensing terms.