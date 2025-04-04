import { Client, Events, GatewayIntentBits } from 'discord.js';

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
});

//initializes the call
await client.login(process.env.DISCORD_BOT_TOKEN);

