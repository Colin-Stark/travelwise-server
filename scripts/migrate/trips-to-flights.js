const mongoose = require('mongoose');
require('dotenv').config();
const { Flight } = require('../../database/schema');

async function migrate() {
    const uri = process.env.MONGO_CONNECTION_STRING;
    if (!uri) {
        console.error('MONGO_CONNECTION_STRING not set in environment');
        process.exit(1);
    }
    await mongoose.connect(uri);
    console.log('Connected to MongoDB for migration');

    const tripsCollection = mongoose.connection.db.collection('trips');
    const trips = await tripsCollection.find({}).toArray();
    if (!trips || trips.length === 0) {
        console.log('No trip documents found to migrate');
        await mongoose.disconnect();
        return;
    }

    console.log(`Migrating ${trips.length} trip documents to flights collection`);
    const bulk = Flight.collection.initializeUnorderedBulkOp();
    trips.forEach((t) => {
        // Map trip doc directly into Flight doc
        const doc = Object.assign({}, t);
        delete doc._id; // allow Mongo to generate new _id for flights
        bulk.insert(doc);
    });

    if (bulk.length > 0) {
        await bulk.execute();
        console.log('Migration completed: inserted flight documents');
    }

    // Optionally, drop the trips collection
    // await mongoose.connection.db.dropCollection('trips');
    // console.log('Dropped trips collection');

    await mongoose.disconnect();
    console.log('Disconnected');
}

migrate().catch(err => {
    console.error('Migration error:', err);
    process.exit(1);
});
