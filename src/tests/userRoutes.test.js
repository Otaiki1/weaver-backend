const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../src/app");
const User = require("../../src/models/User");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

beforeAll(async () => {
    // Start an in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
    // Close database connection and stop the in-memory server
    await mongoose.connection.close();
    await mongoServer.stop();
});

describe("User API Endpoints", () => {
    beforeEach(async () => {
        // Clear the database before each test
        await User.deleteMany();
    });

    test("Should register a new user", async () => {
        const response = await request(app).post("/api/register").send({
            address: "0x123",
            username: "TestUser",
        });

        expect(response.status).toBe(201);
        expect(response.body.user).toHaveProperty("_id");
        expect(response.body.user.username).toBe("TestUser");
    });

    test("Should prevent duplicate user registration", async () => {
        // Create a user before sending another request with the same address
        await User.create({ address: "0x123", username: "TestUser" });

        const response = await request(app).post("/api/register").send({
            address: "0x123",
            username: "TestUser",
        });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("User already exists");
    });

    test("Should retrieve user profile", async () => {
        await User.create({ address: "0x123", username: "TestUser" });

        const response = await request(app).get("/api/profile/0x123");

        expect(response.status).toBe(200);
        expect(response.body.username).toBe("TestUser");
    });

    test("Should return error when retrieving a non-existent profile", async () => {
        const response = await request(app).get("/api/profile/0x999");

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("User not found");
    });

    test("Should retrieve all users", async () => {
        await User.create([
            { address: "0x123", username: "User1", score: 10 },
            { address: "0x456", username: "User2", score: 20 },
        ]);

        const response = await request(app).get("/api/users");

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
        expect(response.body[0]).toHaveProperty("address");
        expect(response.body[0]).toHaveProperty("username");
        expect(response.body[0]).toHaveProperty("score");
    });
});
