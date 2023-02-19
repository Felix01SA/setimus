import { Client, MetadataStorage, SelectMenuComponent } from 'discordx'
import { Category } from '@discordx/utilities'
import {
    ActionRowBuilder,
    APISelectMenuOption,
    ApplicationCommandOptionType,
    Channel,
    CommandInteraction,
    EmbedBuilder,
    Interaction,
    SelectMenuBuilder,
    SelectMenuInteraction,
} from 'discord.js'
import { PrismaClient } from '@prisma/client'

import { Discord, Slash, SlashOption } from '@decorators'
import { Disabled, Guard, Maintenance, UserPermissions } from '@guards'
import { concatParameters } from '@tsed/schema'
import { getColor, validString } from '@utils/functions'

const prisma = new PrismaClient()

type Categories = {
    name: string
    description: string
}

@Discord()
@Category('Admin')
export default class ConfigCommand {
    private readonly _categories: Map<string, Categories[]> = new Map()

    @Slash({
        name: 'config',
        description: 'Configure o servidor',
    })
    @Guard(Disabled, UserPermissions(['Administrator']))
    async config(
        @SlashOption({
            name: 'canal_formularios',
            type: ApplicationCommandOptionType.Channel,
        })
        channel: Channel | undefined,
        interaction: CommandInteraction,
        client: Client,
        { localize }: InteractionData
    ) {
        if (!channel)
            return interaction.reply({ content: 'ops', ephemeral: true })

        await prisma.guild
            .update({
                where: { id: interaction.guild?.id },
                data: {
                    formsChannel: channel!.id,
                },
            })
            .then((guild) => {
                interaction.followUp({
                    content: `Canal de formulários alterado para ${channel} no servidor ${interaction.client.guilds.cache.get(
                        guild.id
                    )}`,
                })
            })
    }
}
