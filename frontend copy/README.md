# VoteX Frontend

A modern React frontend for the VoteX decentralized voting platform.

## Features

- **Dashboard**: Overview of election status, candidates, and quick actions
- **Voting**: Cast votes for candidates (requires wallet connection)
- **Results**: Live election results with charts and detailed statistics
- **Admin Panel**: Manage candidates, authorize voters, and control elections

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running on port 5000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp env.example .env
```

3. Update the API URL in `.env` if needed:
```
REACT_APP_API_URL=http://localhost:5000/api
```

### Running the Application

1. Start the development server:
```bash
npm start
```

2. Open [http://localhost:3001](http://localhost:3001) to view it in the browser.

### Building for Production

```bash
npm run build
```

This builds the app for production to the `build` folder.

## API Integration

The frontend communicates with the backend through a centralized API service (`src/services/api.ts`). To change the API endpoint for deployment:

1. Update the `REACT_APP_API_URL` environment variable
2. Or modify the `API_BASE_URL` constant in `src/services/api.ts`

## Technologies Used

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **Lucide React** for icons
- **React Hot Toast** for notifications

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Main application pages
├── services/           # API service layer
├── hooks/              # Custom React hooks
└── App.tsx             # Main application component
```

## Features Overview

### Dashboard
- Election status overview
- Quick action buttons
- Candidate preview
- Real-time statistics

### Admin Panel
- Add/remove candidates
- Authorize voters
- End elections
- View current candidates with vote counts

### Voting
- Check vote eligibility
- Select candidates
- Cast votes (requires wallet integration)
- Vote status tracking

### Results
- Live results display
- Interactive charts
- Winner announcement
- Detailed statistics table
- Real-time updates

## Deployment

For production deployment:

1. Update the API URL in your environment variables
2. Build the application: `npm run build`
3. Deploy the `build` folder to your hosting service

The application is designed to work with any backend URL, making it easy to deploy to different environments.