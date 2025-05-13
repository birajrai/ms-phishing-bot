const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'setup',
    description: 'Shows verification button',
    async execute(interaction) {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('verify')
                    .setLabel('Verify')
                    .setStyle(ButtonStyle.Primary)
            );

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Welcome to Our Server!')
            .setDescription(`Welcome to our new and growing server! We're a tight-knit, dungeon-focused community, and we'd love for you to join us on our journey. Our previous Discord, which had a lot more members, was terminated, so this is our fresh start. If you enjoy the server, we'd really appreciate you spreading the word. 💙`)
            .addFields(
                { name: '🛡️ Why Verify?', value: 'Verification helps us confirm you\'re a real player, not a bot, and lets us assign important roles like **Class Roles**, **Catacomb-Level Roles**, and **Verified Roles**. It\'s also a critical layer of security in case of a raid.' },
                { name: '⏳ Quick and Easy', value: 'The process takes just **30-50 seconds**, and then you\'ll be ready to explore with us.' },
                { name: '🔑 Why Use a Code?', value: 'The code connects your Minecraft account directly to our server, confirming your account ownership so we can properly assign roles.' },
                { name: '📜 Rules', value: 'We primarily enforce the [Discord Community Guidelines](https://discord.com/guidelines), but actions like scamming or other morally questionable behavior can also lead to punishment, including a permanent ban. Keep it clean, keep it fair.' },
                { name: '🚀 Ready to Join?', value: 'Click the button below to complete verification and get started. Welcome to the squad!' }
            )
            .setFooter({ text: 'Click the button below to verify' });

        // Send message to the channel instead of as a reply
        await interaction.channel.send({
            embeds: [embed],
            components: [row]
        });

        // Acknowledge the command to prevent timeout
        await interaction.reply({ content: 'Verification button sent.', flags: 64 });
    }
};
