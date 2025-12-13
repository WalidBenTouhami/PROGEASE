require('dotenv').config({ path: './.env' });

console.log('MONGODB_URI:', process.env.MONGODB_URI);

// [NINJA REFACTOR] Check for all required environment variables before running tests. Log clear errors if any are missing. Add comments for maintainers.
