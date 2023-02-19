/* eslint-disable */
import type { Translation } from '../i18n-types'

const pt_BR: Translation = {
	GUARDS: {
		DISABLED_COMMAND: 'Este comando está atualmente desativado.',
		MAINTENANCE: 'Este bot está atualmente no modo de manutenção',
		GUILD_ONLY: 'Este comando só pode ser usado em um servidor',
		NSFW: 'Este comando só pode ser usado em um canal NSFW',
	},
	ERRORS: {
		UNKNOWN: 'ocorreu Um Erro Desconhecido',
	},
	COMMANDS: {
		INVITE: {
			DESCRIPTION: 'convide O Bot Para O Seu Servidor!',
			EMBED: {
				TITLE: 'Convide-me no seu servidor!',
				DESCRIPTION: '[Clique aqui]({link}) para me convidar!',
			},
		},
		PREFIX: {
			NAME: 'prefix',
			DESCRIPTION: 'Altere o prefixo do bot.',
			OPTIONS: {
				PREFIX: {
					NAME: 'new_prefix',
					DESCRIPTION: 'O novo prefixo do bot.',
				},
			},
			EMBED: {
				DESCRIPTION: 'Prefixo alterado para `{prefix}`.',
			},
		},
		MAINTENANCE: {
			DESCRIPTION: 'Defina o modo de manutenção do bot.',
			EMBED: {
				DESCRIPTION: 'Modo de manutenção definido como `{state}`.',
			},
		},
		STATS: {
			DESCRIPTION: 'Obtenha algumas estatísticas sobre o bot.',
			HEADERS: {
				COMMANDS: 'Comandos',
				GUILDS: 'Servidores',
				ACTIVE_USERS: 'Usuários ativos',
				USERS: 'Usuários',
			},
		},
		HELP: {
			DESCRIPTION: 'Obtenha ajuda global sobre o bot e seus comandos',
			EMBED: {
				TITLE: 'Painel de ajuda',
				CATEGORY_TITLE: '{category} Comandos',
			},
			SELECT_MENU: {
				TITLE: 'Select a category',
				CATEGORY_DESCRIPTION: '{category} comandos',
			},
		},
		PING: {
			DESCRIPTION: 'Pong!',
			MESSAGE: '{member} Pong! A mensagem de ida e volta levou {time}ms.{heartbeat}',
		},
	},
}

export default pt_BR
