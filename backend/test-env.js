require('dotenv').config({ path: './.env' });

console.log('MONGO_URI:', process.env.MONGO_URI);

// [NINJA REFACTOR] Check for all required environment variables before running tests. Log clear errors if any are missing. Add comments for maintainers.