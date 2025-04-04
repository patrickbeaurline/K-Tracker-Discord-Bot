import { Client, Events, GatewayIntentBits, TextChannel, Collection, Message } from 'discord.js';
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, //allows client to access discord servers
        GatewayIntentBits.GuildMessages, //allows client to access messages within those servers
        GatewayIntentBits.MessageContent, // allows client to access message content
    ]
})

//event listener that verifies the bot has successfully connected to the server its installed in
client.once(Events.ClientReady, async (readyClient) => {
    console.log(`Logged in as ${readyClient.user?.tag}`);
});

//event listener for when messages are created.
client.on(Events.MessageCreate, async (message) => {
    console.log(`${message.author.tag} said ${message.content}`);

    if (message.content === "!leaderboard") {
        const channel = message.guild?.channels.cache.find(
            (ch) => ch.name === "cash-winners-✅" && ch.isTextBased()
        ) as TextChannel;

        if (!channel) {
            return message.reply("Couldn't find #cash-winners channel")
        }

        const now = new Date();
        const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));

        const leaderboard: Record<string, number> = {};

        let lastMessageId;
        let done = false;

        while (!done) {
            const options: any = { limit: 100 };
            if (lastMessageId) options.before = lastMessageId;
            const messages = await channel.messages.fetch(options) as unknown as Collection<string, Message<true>>;


            if (messages.size === 0) break;

            for (const msg of messages.values()) {
                if (msg.createdAt < oneMonthAgo) {
                    done = true;
                    break;
                }

                const imageCount = msg.attachments.filter(att => typeof att.contentType === "string" && att.contentType.startsWith("image/")).size;

                if (imageCount > 0) {
                    const userId = msg.author.tag;
                    leaderboard[userId] = (leaderboard[userId] || 0) + imageCount;
                }
            }
            lastMessageId = messages.last()?.id;


        }

        const sorted = Object.entries(leaderboard)
            .sort(([, a], [, b]) => b - a)
            .map(([user, count], index) => `${index + 1}. ${user} — ${count} win(s)`)
            .join("\n");
        
        
        message.channel.send({
            content: sorted.length ? `🏆 **Cash Winners Leaderboard** 🏆\n\n${sorted}` : "No image entries in the last month.",
        })

    }
});

//initializes the call
await client.login(process.env.DISCORD_BOT_TOKEN);

