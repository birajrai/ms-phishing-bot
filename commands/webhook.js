const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, InteractionResponseFlags } = require('discord.js');

module.exports = {
    name: 'webhook',
    description: 'Update webhook URL',
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('webhookModal')
            .setTitle('Update Webhook URL');

        const webhookInput = new TextInputBuilder()
            .setCustomId('webhookUrl')
            .setLabel('Enter new webhook URL')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const firstActionRow = new ActionRowBuilder().addComponents(webhookInput);
        modal.addComponents(firstActionRow);

        await interaction.showModal(modal);
    }
}; 