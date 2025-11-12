const mongoose = require('mongoose');

// Embedded Schemas
const preferencesSchema = new mongoose.Schema({
    currency: { type: String, default: 'CAD' },
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'EST' },
    marketingOptIn: { type: Boolean, default: false }
});

const locationSchema = new mongoose.Schema({
    country: { type: String, required: true },
    city: { type: String, required: true }
});

const itineraryItemSchema = new mongoose.Schema({
    type: { type: String, enum: ['activity', 'transport', 'lodging', 'food', 'note'], required: true },
    name: { type: String, required: true },
    startTime: { type: Date },
    endTime: { type: Date },
    placeId: { type: String },
    address: { type: String },
    cost: { type: Number },
    currency: { type: String, default: 'USD' },
    confirmationCode: { type: String },
    notes: { type: String }
});

const contactSchema = new mongoose.Schema({
    phone: { type: String },
    email: { type: String },
    website: { type: String }
});

// Emergency Contact Schema
const emergencyContactSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    relationship: { type: String, required: true }, // e.g., 'spouse', 'parent', 'friend', 'doctor'
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String },
    isPrimary: { type: Boolean, default: false }, // Mark as primary emergency contact
    notes: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Itinerary Schemas
const scheduleLocationSchema = new mongoose.Schema({
    data_id: { type: String },
    title: { type: String, required: true },
    place_id: { type: String },
    rating: { type: Number },
    reviews: { type: Number },
    type: { type: String },
    address: { type: String },
    open_state: { type: String },
    description: { type: String },
    service_options: {
        onsite_services: { type: Boolean }
    },
    user_review: { type: String },
    thumbnail: { type: String },
    serpapi_thumbnail: { type: String },
    time: { type: String },
    duration: { type: Number }
});

const scheduleSchema = new mongoose.Schema({
    day: { type: Date, required: true },
    locations: [scheduleLocationSchema]
});

const flightSchema = new mongoose.Schema({
    departure_token: { type: String }
});

const userItinerarySchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    id: { type: Number, unique: true },
    gl: { type: String },
    title: { type: String, required: true },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    country: { type: String, required: true },
    city: { type: String, required: true },
    description: { type: String },
    img: { type: String },
    flight: flightSchema,
    schedules: [scheduleSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Main Schemas
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    phone: { type: String, required: false, },
    preferences: { type: preferencesSchema, default: {} },
    otp: { type: String, required: false },
    otpexpirydate: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const tripSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    destination: { type: locationSchema, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['planned', 'active', 'completed', 'canceled'], default: 'planned' },
    tags: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const itinerarySchema = new mongoose.Schema({
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
    title: { type: String, required: true },
    items: [itineraryItemSchema],
    notes: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const expenseSchema = new mongoose.Schema({
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, enum: ['food', 'transport', 'lodging', 'tickets', 'other'], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    date: { type: Date, required: true },
    paymentMethod: { type: String, enum: ['cash', 'card', 'other'], default: 'card' },
    merchant: { type: String },
    receiptUrl: { type: String },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const budgetSchema = new mongoose.Schema({
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
    plannedTotal: { type: Number, required: true },
    alertThresholdPct: { type: Number, default: 80 },
    actualTotal: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now }
});

const budgetAlertSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
    type: { type: String, enum: ['overspend', 'warning', 'info'], required: true },
    message: { type: String, required: true },
    thresholdValue: { type: Number },
    createdAt: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
});

const bookingSchema = new mongoose.Schema({
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
    type: { type: String, enum: ['flight', 'hotel', 'car', 'train', 'tour'], required: true },
    provider: { type: String, required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    bookedAt: { type: Date, default: Date.now },
    confirmationCode: { type: String },
    details: { type: mongoose.Schema.Types.Mixed },
    voucherUrl: { type: String }
});

const businessSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, enum: ['restaurant', 'attraction', 'shop', 'service'], required: true },
    location: { type: locationSchema, required: true },
    rating: { type: Number, min: 0, max: 5 },
    contact: { type: contactSchema },
    tags: [{ type: String }]
});

const savedBusinessSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    note: { type: String },
    createdAt: { type: Date, default: Date.now }
});

// Indexes
// userSchema.index({ email: 1 }); // Removed: unique: true already creates this index
tripSchema.index({ userId: 1, startDate: 1 });
itinerarySchema.index({ tripId: 1 });
expenseSchema.index({ tripId: 1, date: 1 });
expenseSchema.index({ userId: 1, date: 1 });
budgetAlertSchema.index({ userId: 1, createdAt: 1 });
bookingSchema.index({ tripId: 1, type: 1 });
savedBusinessSchema.index({ userId: 1, tripId: 1, businessId: 1 }, { unique: true });
businessSchema.index({ name: 'text', tags: 'text' });

// Emergency Contact Index
emergencyContactSchema.index({ userId: 1 });

// User Itinerary Index
userItinerarySchema.index({ user_id: 1 });

// Models
const User = mongoose.model('User', userSchema);
const Trip = mongoose.model('Trip', tripSchema);
const Itinerary = mongoose.model('Itinerary', itinerarySchema);
const Expense = mongoose.model('Expense', expenseSchema);
const Budget = mongoose.model('Budget', budgetSchema);
const BudgetAlert = mongoose.model('BudgetAlert', budgetAlertSchema);
const Booking = mongoose.model('Booking', bookingSchema);
const Business = mongoose.model('Business', businessSchema);
const SavedBusiness = mongoose.model('SavedBusiness', savedBusinessSchema);
const EmergencyContact = mongoose.model('EmergencyContact', emergencyContactSchema);
const UserItinerary = mongoose.models.UserItinerary || mongoose.model('UserItinerary', userItinerarySchema);

// Export models
module.exports = {
    User,
    Trip,
    Itinerary,
    Expense,
    Budget,
    BudgetAlert,
    Booking,
    Business,
    SavedBusiness,
    EmergencyContact,
    UserItinerary
};
