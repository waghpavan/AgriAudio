const express = require("express");
const fs = require("fs");
const puppeteer = require("puppeteer");
const twilio = require("twilio");
const bodyParser = require("body-parser");
const gTTS = require("gtts"); // Google TTS Alternative

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Twilio Client
const client = twilio("ACa30a9f9eb1dc45bd9e15bb7d2909d93f", "2a6a8a3a4881b3d34832e5d5b70fdc1c");

// Function to Generate Audio using gTTS (Google TTS)
async function generateAudio(text) {
    return new Promise((resolve, reject) => {
        const tts = new gTTS(text, "en");
        tts.save("tts_output.wav", (err) => {
            if (err) reject(err);
            console.log("TTS audio generated successfully.");
            resolve();
        });
    });
}

// Function to Make a Call and Play Audio
async function makeCall(phoneNumber) {
    const call = await client.calls.create({
        from: "+18723276507",
        to: phoneNumber,
        twiml: `<Response><Play>tts_output.wav</Play></Response>`,
    });

    console.log("Call initiated:", call.sid);
}

// Function to Send SMS
async function sendSMS(phoneNumber, message) {
    const sms = await client.messages.create({
        body: message,
        from: "+18723276507",
        to: phoneNumber,
    });

    console.log("SMS sent:", sms.sid);
}

// API Route to Trigger Call + SMS
app.post("/notify", async (req, res) => {
    const {phoneNumber, message} = req.body; // Replace with your message

    if (!phoneNumber || !message) {
        return res.status(400).send({ error: "Phone number and message are required!" });
    }

    try {
        await generateAudio(message);
        await makeCall(phoneNumber);
        await sendSMS(phoneNumber, message);
        res.send({ success: "Call and SMS sent!" });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send({ error: "Failed to send notification" });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`); // Call the notify function to test it immediately
});
