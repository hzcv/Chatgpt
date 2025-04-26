const Insta = require("@ber4tbey/insta.js");
const { Configuration, OpenAIApi } = require("openai");
const client = new Insta.Client();

const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);
const OWNER_IDS = process.env.OWNER_IDS.split(',');
let lastMessageTime = 0; // Track last message timestamp

// Message queue system
const messageQueue = [];
let isProcessing = false;

async function processQueue() {
    if (isProcessing || messageQueue.length === 0) return;
    
    isProcessing = true;
    const { chat, content } = messageQueue.shift();
    
    try {
        await chat.sendMessage(content);
        lastMessageTime = Date.now();
    } catch (error) {
        console.error('Message send error:', error);
    }
    
    // Add 1-second delay between messages
    setTimeout(() => {
        isProcessing = false;
        processQueue();
    }, 1000);
}

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
            // Add group response to queue
            messageQueue.push({
                chat: message.chat,
                content: `${mention} OYY MSG MT KR VRNA TERI MAA XHOD DUNGA 🤱😆`
            });
            return processQueue();
        }

        // Handle DMs
        if (['hi', 'hello', 'hey'].some(greet => message.content.toLowerCase().includes(greet))) {
            messageQueue.push({
                chat: message.chat,
                content: `${mention} What's up! HRSS built this — hit up his Instagram!: https://instagram.com/1.0hrsss`
            });
            return processQueue();
        }

        // Generate AI response
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: message.content }],
            temperature: 0.7,
        });

        messageQueue.push({
            chat: message.chat,
            content: response.data.choices[0].message.content
        });
        processQueue();

    } catch (error) {
        console.error('Error:', error);
        messageQueue.push({
            chat: message.chat,
            content: '⚠️ Kuch toh gadbad hai daya!'
        });
        processQueue();
    }
});

client.login(process.env.INSTA_USERNAME, process.env.INSTA_PASSWORD);
