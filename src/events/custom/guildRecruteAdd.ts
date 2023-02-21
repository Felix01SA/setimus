import { ArgsOf, Client } from 'discordx'

import { On, Discord } from '@decorators'
import { getColor, prisma, syncUser } from '@utils/functions'
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    MessageActionRowComponentBuilder,
} from 'discord.js'

@Discord()
export default class GuildRecruteAddEvent {
    // =============================
    // ========= Handlers ==========
    // =============================

    @On('guildRecruteAdd')
    async guildRecruteAddHandler(
        [member]: ArgsOf<'guildMemberAdd'>,
        client: Client
    ) {
        const messageEmbed = new EmbedBuilder()
            .setColor(getColor('primary'))
            .setAuthor({
                name: client.user?.username!,
                iconURL: client.user?.displayAvatarURL(),
            })
            .setTitle('Estamos quase lá!')
            .setDescription(
                'Seu formulário foi recebido e logo um recrutador entrará em contato.\nEssa é a ultima etapa para que você se torne um membro da **SETIMUS**'
            )
            .setTimestamp(new Date())

        await member.send({ embeds: [messageEmbed] })

        await syncUser(member.user)
    }

    @On('guildRecruteRemove')
    async guildRecruteRemoveHandler(
        [member]: ArgsOf<'guildMemberAdd'>,
        client: Client
    ) {
        const messageEmbed = new EmbedBuilder()
            .setColor('Red')
            .setAuthor({
                name: client.user?.username!,
                iconURL: client.user?.displayAvatarURL(),
            })
            .setTitle(
                'Ops! :eyes:. Não encontrei seu formulário para o recrutamento...'
            )
            .setDescription(
                'Olá sou o moderador de recrutamentos da **SETIMUS**.\nNós somos uma comunidade privada e temos alguns passos para você seguir antes de entrar na comunidade.\nPrimeiro vc precisa preencher o formulário de inscrição lá no nosso site (Botão abaixo).\nDepois vem o recrutamento, um pequeno teste pra vermos suas habilidades e se você se sair bem será um membro dá **SETIMUS**.'
            )
            .setTimestamp(new Date())

        const buttonRow =
            new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                new ButtonBuilder()
                    .setURL('https://se7imus.vercel.app')
                    .setLabel('SETIMUS SITE')
                    .setStyle(ButtonStyle.Link)
            )

        member.kick()
        await member.send({ embeds: [messageEmbed], components: [buttonRow] })
    }

    // =============================
    // ========== Emitter ==========
    // =============================

    @On('guildMemberAdd')
    async guildRecruteAddEmitter(
        [member]: ArgsOf<'guildMemberAdd'>,
        client: Client
    ) {
        const form = await prisma.forms.findUnique({
            where: { discordTag: member.user.tag },
        })

        if (!form) return client.emit('guildRecruteRemove', member, client)

        client.emit('guildRecruteAdd', member, client)
    }
}
