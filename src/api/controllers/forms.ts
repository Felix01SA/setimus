import {
    Controller,
    Get,
    Post,
    BodyParams,
    PathParams,
    Res,
} from '@tsed/common'

import { BaseController } from '@utils/classes'
import { resolveDependency } from '@utils/functions'
import {
    ActionRowBuilder,
    APIEmbedField,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    EmbedBuilder,
    MessageActionRowComponentBuilder,
} from 'discord.js'
import { ButtonComponent, Client, Discord } from 'discordx'
import { addDays } from 'date-fns'
import { prisma } from '@utils/functions'
import { Returns } from '@tsed/schema'
import { Unauthorized } from '@tsed/exceptions'

@Controller('/forms')
@Discord()
export class FormsController extends BaseController {
    private client: Client

    constructor() {
        super()

        resolveDependency(Client).then((client) => {
            this.client = client
        })
    }

    @Returns(401, Unauthorized)
    @Post('/create')
    async store(
        @BodyParams()
        {
            competitive,
            discordTag,
            gameId,
            gameTag,
            name,
            phoneNumber,
        }: BodyProps
    ) {
        const existsForm = await prisma.forms.findUnique({
            where: { discordTag },
        })

        if (existsForm)
            throw new Unauthorized('UID ou Discord Tag já cadastradas')

        const form = await prisma.forms.create({
            data: {
                competitive: competitive,
                discordTag: discordTag,
                name: name,
                phoneNumber: phoneNumber,
                gameId: gameId,
                gameTag: gameTag,
            },
        })

        const embed = new EmbedBuilder().setTitle('Novo recruta!').addFields(
                {
                    name: 'Nome',
                    value: form.name,
                },
                {
                    name: 'DiscordTag',
                    value: form.discordTag,
                    inline: true,
                },
                {
                    name: 'UID',
                    value: form.gameId,
                },
                {
                    name: 'Game Tag',
                    value: form.gameTag,
                },
                {
                    name: 'Numero',
                    value: `[WhatsApp](https://wa.me/55${form.phoneNumber}) (${form.phoneNumber})`,
                },
                {
                    name: 'Competitivo',
                    value: form.competitive ? 'Sim' : 'Não',
                    inline: true,
                }
            ),
            buttonRow =
                new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                    new ButtonBuilder()
                        .setCustomId('recruiter')
                        .setLabel('Recrutar')
                        .setStyle(ButtonStyle.Secondary)
                )
        const savedGuild = process.env.TEST_GUILD_ID,
            databaseGuild = await prisma.guild.findUnique({
                where: {
                    id: savedGuild,
                },
                select: {
                    formsChannel: true,
                },
            }),
            channel = this.client.channels.cache.find(
                (c) => c.id === databaseGuild?.formsChannel!
            )

        if (channel?.isTextBased())
            channel.send({ embeds: [embed], components: [buttonRow] })

        return { form: form }
    }

    @Get('/test')
    async default() {
        const body = {
            status: 'ok',
        }

        return body
    }

    @ButtonComponent({ id: 'recruiter' })
    async recruiterButton(interaction: ButtonInteraction) {
        const recruiter = interaction.user

        const messageEmbed = new EmbedBuilder()
            .setAuthor({
                name: recruiter.username,
                iconURL: recruiter.displayAvatarURL(),
            })
            .setDescription(
                `Este recruta está sobre a responsabilidade de ${recruiter}`
            )
            .setTitle('Recrutamento em andamento :clock1:')
            .addFields({ name: 'ID responsável', value: recruiter.id })

        let tag = ''
        interaction.message.embeds.map((embed) => {
            messageEmbed.addFields(embed.fields)
            const embedTag = embed.fields.find((f) => f.name === 'DiscordTag')
            tag = embedTag?.value!
        })

        const member = interaction.guild?.members.cache.find(
            (member) => member.user.tag === tag
        )

        const buttonRow =
            new ActionRowBuilder<MessageActionRowComponentBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('approved')
                        .setLabel('Aprovado')
                        .setStyle(ButtonStyle.Primary)
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('reproved')
                        .setLabel('Reprovado')
                        .setStyle(ButtonStyle.Danger)
                )

        await interaction.update({
            embeds: [messageEmbed],
            components: [buttonRow],
            content: `${member ?? ''}`,
        })
    }

    @ButtonComponent({ id: 'approved' })
    async approvedButton(interaction: ButtonInteraction) {
        const member = interaction.user
        let recruiterId = '',
            recruteTag = ''

        const guild = await prisma.guild.findUnique({
            where: { id: interaction.guild?.id },
            select: {
                memberRole: true,
            },
        })

        const messageEmbed = new EmbedBuilder()
            .setAuthor({
                name: member.username,
                iconURL: member.displayAvatarURL(),
            })
            .setTitle('Recrutamento Finalizado :white_check_mark:')
            .setColor('Green')

        const embedFields: APIEmbedField[] = []

        interaction.message.embeds.map((embed) => {
            const recruiterField = embed.fields.find(
                (f) => f.name === 'ID responsável'
            )
            const recruteField = embed.fields.find(
                (f) => f.name === 'DiscordTag'
            )
            recruiterId = recruiterField?.value!
            recruteTag = recruteField?.value!

            embed.fields.map((field) => embedFields.push(field))
            messageEmbed.setDescription(embed.description)
        })

        const recruiter = interaction.guild?.members.cache.find(
            (member) => member.user.id === recruiterId
        )

        if (member.id !== recruiter?.id)
            return interaction.reply({
                content: `O responsável por este recrutamento é ${recruiter}`,
                ephemeral: true,
            })

        await interaction.update({
            embeds: [messageEmbed.addFields(embedFields)],
            components: [],
        })
        messageEmbed.setDescription(
            'Suas habilidades foram reconhecidas, você agora é um membro da SETIMUS.\nLeia nossas regras e seja um exemplo.\nTorne-se uma lenda, amedronte seus inimigos e dê inspiração e coragem ao seus aliados'
        )
        const recrute = interaction.guild?.members.cache.find(
            (member) => member.user.tag === recruteTag
        )
        const role = interaction.guild?.roles.cache.get(guild?.memberRole!)

        if (recrute) {
            await recrute?.send({ embeds: [messageEmbed.setFields([])] })
            recrute.roles.add(role!)
        }
    }

    @ButtonComponent({ id: 'reproved' })
    async reprovedButton(interaction: ButtonInteraction) {
        const member = interaction.user
        let recruiterId = '',
            recruteTag = ''

        const embedFields: APIEmbedField[] = []
        const messageEmbed = new EmbedBuilder()
            .setAuthor({
                name: member.username,
                iconURL: member.displayAvatarURL(),
            })
            .setColor('Red')
            .setTimestamp(new Date())
            .setTitle('Recrutamento finalizado :x:')

        interaction.message.embeds.map((embed) => {
            embed.fields.map((field) => embedFields.push(field))
            messageEmbed.setDescription(embed.description)
            const recruiterField = embed.fields.find(
                (field) => field.name === 'ID responsável'
            )
            const recruteField = embed.fields.find(
                (field) => field.name === 'DiscordTag'
            )
            recruteTag = recruteField?.value!
            recruiterId = recruiterField?.value!
        })

        const recruiter = interaction.guild?.members.cache.find(
            (member) => member.user.id === recruiterId
        )

        if (member.id !== recruiter?.id)
            return interaction.reply({
                content: `O responsável por este recrutamento é ${recruiter}`,
                ephemeral: true,
            })

        await interaction.update({
            embeds: [messageEmbed.addFields(embedFields)],
            components: [],
            content: '',
        })

        const recrute = interaction.guild?.members.cache.find(
            (member) => member.user.tag === recruteTag
        )
        messageEmbed
            .setDescription(
                'No momento suas habilidades não são o suficiente para entrar na **SETIMUS**.\nMas não se preocupe, você pode treinar e tentar novamente.\nPara isso terá a reenviar o formulário na data descrita abaixo.'
            )
            .setFields([])

        messageEmbed.addFields({
            name: 'Nova tentativa',
            value: addDays(new Date(), 7).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            }),
        })

        const buttonRow =
            new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                new ButtonBuilder()
                    .setLabel('SETIMUS SITE')
                    .setURL('https://se7imus.vercel.app')
                    .setStyle(ButtonStyle.Link)
            )

        if (recrute) {
            await recrute.send({
                embeds: [messageEmbed],
                components: [buttonRow],
            })
            recrute.kick()
        }
    }
}

type BodyProps = {
    name: string
    discordTag: string
    gameTag: string
    gameId: string
    phoneNumber: string
    competitive: boolean
}
