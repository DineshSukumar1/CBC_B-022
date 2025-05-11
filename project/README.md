# Agricultural App with MongoDB

This project has been updated to use MongoDB for data storage with JSON files as fallback.

## Setup Instructions

### Prerequisites
- Node.js and npm
- MongoDB installed locally or MongoDB Atlas account
- TypeScript

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure MongoDB:
   - For local MongoDB: Make sure MongoDB is running on your machine
   - For MongoDB Atlas: Create a `.env` file in the project root with:
```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>
```

### Database Seeding

To seed the database with mock data:

```bash
npm run seed-db
```

This will populate the MongoDB database with all the mock data from the JSON files.

## Data Structure

The application uses the following data models:

- Crops
- Weather data
- Tutorials
- Government Schemes

All data is fetched from MongoDB first, with a fallback to JSON files if the MongoDB connection fails or returns no data.

## Development

Start the development server:

```bash
npm run dev
```

## Architecture

- `/models`: MongoDB schemas
- `/services`: Data access services with MongoDB integration
- `/config`: MongoDB connection configuration
- `/scripts`: Database seeding and utilities
- `/data`: JSON files for fallback data 