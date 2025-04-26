// bot.js
const Insta = require("@ber4tbey/insta.js");
const { Configuration, OpenAIApi } = require("openai");
const client = new Insta.Client();
require('dotenv').config();

const config = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(config);
const OWNER_IDS = process.env.OWNER_IDS.split(',');

client.on('connected', () => {
    console.log(`✅ ${client.user.username} is ready!`);
});

client.on('messageCreate', async (message) => {
    try {
        if (message.author.id === client.user.id || OWNER_IDS.includes(message.author.id)) return;
        
        message.markSeen();
        const isGroup = message.chat.isGroup;
        const mention = isGroup ? `@${message.author.username} ` : '';

        if (isGroup) {
            return message.chat.sendMessage(`${mention} OYY MSG MT KR VRNA TERI MAA CH0D DUNGA 🤱😆`);
        }

        if (['hi', 'hello', 'hey'].some(greet => message.content.toLowerCase().includes(greet))) {
            return message.chat.sendMessage(`${mention} What's up! HRSS built this — hit up his Instagram!: https://instagram.com/1.0hrsss`);
        }

        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: message.content }],
            temperature: 0.7,
        });

        message.chat.sendMessage(response.data.choices[0].message.content);

    } catch (error) {
        console.error('Error:', error);
        message.chat.sendMessage('⚠️ Kuch toh gadbad hai daya!');
    }
});

client.login(process.env.INSTA_USERNAME, process.env.INSTA_PASSWORD);
