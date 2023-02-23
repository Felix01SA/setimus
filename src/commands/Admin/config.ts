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
    Role,
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
        channel: Channel,
        @SlashOption({
            name: 'cargo_membro',
            type: ApplicationCommandOptionType.Role,
        })
        role: Role,
        interaction: CommandInteraction,
        client: Client,
        { localize }: InteractionData
    ) {
        const savedGuild = await prisma.guild.findUnique({
            where: {
                id: interaction.guild?.id!,
            },
        })

        let message = ``
        if (channel && role) {
            message = `Canal de formulários alterado para ${channel} e cargo de membro alterado para ${role} no servidor ${interaction.guild?.name}`
        } else if (channel) {
            message = `Canal de formulários alterado para ${channel} no servidor ${interaction.guild?.name}`
        } else if (role) {
            message = `Cargo de membro alterado para ${role} no servidor ${interaction.guild?.name}`
        }

        if (channel || role) {
            await prisma.guild
                .update({
                    where: { id: interaction.guild?.id! },
                    data: {
                        formsChannel:
                            channel.id || savedGuild?.formsChannel || null,
                        memberRole: role.id || savedGuild?.memberRole || null,
                    },
                })
                .then(() => {
                    interaction.followUp({
                        content: message,
                    })
                })
                .catch(() => {
                    interaction.followUp({
                        content: 'Ocorreu um erro ao salvar os dados...',
                        ephemeral: true,
                    })
                })
        } else {
            message = `Nenhuma informação provida... Nada alterado`
            interaction.followUp({
                content: message,
            })
        }
    }
}
