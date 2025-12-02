# TravelWise Backend API

A comprehensive backend API for TravelWise, a travel planning and expense tracking application built with Node.js, Express, and MongoDB.

## 🚀 Overview

TravelWise is a full-featured travel management platform that helps users plan trips and flights, track expenses, manage itineraries, and discover local businesses. This backend API provides all the necessary endpoints to power the TravelWise mobile and web applications.

## ✨ Features

### 🔐 Authentication & User Management
- User registration and login with secure JWT authentication
- Password hashing with bcrypt
- User profile management with preferences (currency, language, timezone)

### ✈️ Flight Management
- Create, update, and delete flights (top-level flight documents)
- Flight status tracking (planned, active, completed, canceled)
- Destination management with location data

### 📅 Itinerary Planning
-- Create detailed itineraries for each flight (trip container)
- Add activities, transportation, lodging, food, and notes
- Time-based scheduling with start/end times
- Cost tracking per itinerary item

### 💰 Expense Tracking & Budgeting
- Track expenses by category (food, transport, lodging, tickets, other)
- Multi-currency support
- Budget setting with alert thresholds
- Automatic budget overspend notifications
- Receipt storage and management

### 🏨 Booking Integrations
- Flight, hotel, car rental, and tour bookings
- Third-party API integrations
- Booking confirmation and voucher management

### 🏪 Local Business Discovery
- Search local businesses (restaurants, attractions, shops, services)
-- Save businesses to flights
- Business ratings and contact information
- Location-based search

### 🔔 Notifications
- Budget alerts and reminders
- Payment notifications
- Custom notifications via email, SMS, or push

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js v5.1.0
- **Database**: MongoDB with Mongoose ODM
- **Password Hashing**: bcrypt
- **Environment**: dotenv
- **Linting**: ESLint
- **Deployment**: Render

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB instance
- npm or yarn package manager

## 🚀 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Colin-Stark/travelwise-server.git
   cd travelwise-server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

   Configure your `.env` file:
   ```env
   MONGO_CONNECTION_STRING=your_mongodb_connection_string
   PORT=3000
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

   The server will start on `http://localhost:3000` with hot reload enabled.

## 📚 API Documentation

### Base URL
```
https://travelwise-server.vercel.app/
```

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | User registration |
| POST | `/login` | User login |

### Flight Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/flights` | Create a new flight (formerly trip)
| POST | `/flights/list` | List flights (filter by userId/email)
| POST | `/flights/get/:id` | Get flight by ID
| POST | `/flights/update/:id` | Update flight
| POST | `/flights/delete/:id` | Delete flight

### Itinerary Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/flights/:id/itineraries` | Get flight itineraries |
| POST | `/flights/:id/itineraries` | Create itinerary |
| PATCH | `/itineraries/:id` | Update itinerary |
| DELETE | `/itineraries/:id` | Delete itinerary |

### Expense Tracking

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/flights/:id/expenses` | Get flight expenses |
| POST | `/flights/:id/expenses` | Add expense |
| PATCH | `/expenses/:id` | Update expense |
| DELETE | `/expenses/:id` | Delete expense |
| POST | `/flights/:id/expenses/summary` | Get expense summary |

### Budget Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/flights/:id/budget` | Get flight budget |
| POST | `/flights/:id/budget` | Set/update budget |
| POST | `/flights/:id/budget/alerts` | Get budget alerts |

### Local Businesses

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/businesses/search` | Search businesses |
| POST | `/flights/:id/saved-businesses` | Save business to flight |
| POST | `/flights/:id/saved-businesses` | Get saved businesses |
| DELETE | `/saved-businesses/:id` | Remove saved business |

## 🗄️ Database Schema

### Core Collections

- **Users**: User accounts with authentication and preferences
-- **Flights**: Flight (trip container) information with destinations and dates
-- **Itineraries**: Detailed flight schedules and activities
- **Expenses**: Expense tracking with categories and amounts
- **Budgets**: Budget management with alerts
- **Bookings**: Travel bookings and reservations
- **Businesses**: Local business information
- **Notifications**: User notifications and alerts

### Key Relationships

- User → Flights (1:N)
-- Flight → Itineraries (1:N)
-- Flight → Expenses (1:N)
-- Flight → Budget (1:1)
- User → Saved Businesses (M:N via junction table)

## 🔧 Development

### Available Scripts

```bash
npm start          # Start development server with hot reload
npm run lint       # Run ESLint
npm run lint:fix   # Fix ESLint issues automatically
```

### Project Structure

```
travelwise-server/
├── database/
│   └── schema.js          # MongoDB schemas and models
├── routes/
│   ├── signup/
│   │   └── index.js       # Authentication routes
│   └── ...                # Other route modules
├── index.js               # Main application entry point
├── package.json           # Dependencies and scripts
├── vercel.json            # Deployment config
├── eslint.config.mjs      # ESLint configuration
└── README.md             # This file
```

## 🚀 Deployment

### Vercel Deployment

1. **Connect your GitHub repository to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Create a new project
   - Connect your GitHub repo

2. **Configure the project**
   - Set build command: `npm install`
   - Set start command: `npm start`
   - Add environment variables: `MONGO_CONNECTION_STRING`, `JWT_SECRET`, `NODE_ENV=production`

3. **Deploy**
   - Vercel will automatically deploy on pushes to main branch

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_CONNECTION_STRING` | MongoDB connection string | Yes |
| `PORT` | Server port (default: 3000) | No |

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run tests with coverage
npm run test:coverage
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow ESLint configuration
- Write clear commit messages
- Add tests for new features
- Update documentation as needed
- Use meaningful variable and function names

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Collins Olokpedje** - *Initial work* - [Colin-Stark](https://github.com/Colin-Stark)

## 🙏 Acknowledgments

- Express.js team for the amazing framework
- MongoDB team for the robust database
- All contributors and the open-source community

## 📞 Support

If you have any questions or need help, please:

1. Check the [Issues](https://github.com/Colin-Stark/travelwise-server/issues) page
2. Create a new issue with detailed information
3. Contact the maintainers

---

**Happy Traveling with TravelWise! ✈️**
