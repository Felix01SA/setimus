import { Controller, UseBefore, Get, Post, BodyParams } from '@tsed/common'

import { BaseController } from '@utils/classes'
import { resolveDependency } from '@utils/functions'
import { EmbedBuilder } from 'discord.js'
import { Client } from 'discordx'
import { prisma } from '@utils/functions'

@Controller('/forms')
export class FormsController extends BaseController {
    private client: Client

    constructor() {
        super()

        resolveDependency(Client).then((client) => {
            this.client = client
        })
    }

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
            where: { discordTag: discordTag! },
        })

        if (existsForm)
            return { type: 'error', message: 'Usuário já cadastrado' }

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

        if (channel?.isTextBased()) channel.send({ embeds: [embed] })

        return { form: form }
    }

    @Get('/test')
    async default() {
        const body = {
            status: 'ok',
        }

        return body
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
