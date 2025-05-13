const { REST, Routes } = require('discord.js');

module.exports = {
    name: 'refresh',
    description: 'Refresh slash commands',
    async execute(interaction) {
        // Defer the reply immediately to prevent timeout
        await interaction.deferReply({ ephemeral: true });
        
        const { client } = interaction;
        const rest = new REST({ version: '10' }).setToken(client.token);
        
        try {
            console.log('Started refreshing application (/) commands.');
            const commands = Array.from(client.commands.values()).map(command => ({
                name: command.name,
                description: command.description
            }));
            
            await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: commands }
            );
            
            await interaction.editReply({
                content: 'Successfully reloaded application (/) commands.'
            });
        } catch (error) {
            console.error('Error refreshing slash commands:', error);
            await interaction.editReply({
                content: 'Error refreshing slash commands.'
            });
        }
    }
}; 