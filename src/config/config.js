require("dotenv").config();
//exports all necessary config files
module.exports = {
    port: process.env.PORT || 3000,
    mongoUri: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET,
    starknetProvider: process.env.STARKNET_PROVIDER,
    contractAddress: process.env.CONTRACT_ADDRESS,
};
