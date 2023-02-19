import { User as DUser } from 'discord.js'
import { Client } from 'discordx'

import { Guild, User } from '@entities'
import { Database, Logger, Stats } from '@services'
import { resolveDependencies, resolveDependency } from '@utils/functions'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Add a active user to the database if doesn't exist.
 * @param user
 */
export const syncUser = async (user: DUser) => {
    const [db, stats, logger] = await resolveDependencies([
        Database,
        Stats,
        Logger,
    ])

    const userRepo = db.get(User)

    const userData = await userRepo.findOne({
        id: user.id,
    })

    if (!userData) {
        // add user to the db
        const newUser = new User()
        newUser.id = user.id
        await userRepo.persistAndFlush(newUser)

        // record new user both in logs and stats
        stats.register('NEW_USER', user.id)
        logger.logNewUser(user)
    }

    // using prisma
}

/**
 * Sync a guild with the database.
 * @param guildId
 * @param client
 */
export const syncGuild = async (guildId: string, client: Client) => {
    const [db, stats, logger] = await resolveDependencies([
        Database,
        Stats,
        Logger,
    ])

    const fetchedGuild = await client.guilds.fetch(guildId).catch(() => null)

    // using Prisma
    const guild = await prisma.guild.findUnique({
        where: {
            id: guildId,
        },
        select: {
            deleted: true,
        },
    })

    if (!guild) {
        await prisma.guild
            .create({
                data: {
                    id: guildId,
                },
            })
            .then((guild) => {
                stats.register('NEW_GUILD', guild.id)
                logger.logGuild('NEW_GUILD', guild.id)
            })
    } else if (guild) {
        if (guild.deleted) {
            await prisma.guild
                .update({
                    where: {
                        id: guildId,
                    },
                    data: {
                        deleted: false,
                    },
                })
                .then((guild) => {
                    stats.register('RECOVER_GUILD', guild.id)
                    logger.logGuild('RECOVER_GUILD', guild.id)
                })
        }
    } else if (!fetchedGuild) {
        await prisma.guild
            .update({
                where: {
                    id: guildId,
                },
                data: {
                    deleted: true,
                },
            })
            .then((guild) => {
                stats.register('DELETE_GUILD', guild.id)
                logger.logGuild('DELETE_GUILD', guild.id)
            })
    }

    // const guildRepo = db.get(Guild),
    //     guildData = await guildRepo.findOne({ id: guildId, deleted: false })

    // //Verifique se esta guilda existe no banco de dados, se não o cria (ou a recupera dos excluídos)
    // if (!guildData) {
    //     const deletedGuildData = await guildRepo.findOne({
    //         id: guildId,
    //         deleted: true,
    //     })

    //     if (deletedGuildData) {
    //         // recover deleted guild

    //         deletedGuildData.deleted = false
    //         await guildRepo.persistAndFlush(deletedGuildData)

    //         stats.register('RECOVER_GUILD', guildId)
    //         logger.logGuild('RECOVER_GUILD', guildId)
    //     } else {
    //         // create new guild

    //         const newGuild = new Guild()
    //         newGuild.id = guildId
    //         await guildRepo.persistAndFlush(newGuild)

    //         stats.register('NEW_GUILD', guildId)
    //         logger.logGuild('NEW_GUILD', guildId)
    //     }
    // } else if (!fetchedGuild) {
    //     // A guilda é excluída, mas ainda existe no banco de dados

    //     guildData.deleted = true
    //     await guildRepo.persistAndFlush(guildData)

    //     stats.register('DELETE_GUILD', guildId)
    //     logger.logGuild('DELETE_GUILD', guildId)
    // }
}

/**
 * Sync all guilds with the database.
 * @param client
 */
export const syncAllGuilds = async (client: Client) => {
    // const db = await resolveDependency(Database)

    // add missing guilds
    const guilds = client.guilds.cache
    for (const guild of guilds) {
        await syncGuild(guild[1].id, client)
    }

    // remove deleted guilds
    // const guildRepo = db.get(Guild)
    // const guildsData = await guildRepo.getActiveGuilds()
    // for (const guildData of guildsData) {
    //     await syncGuild(guildData.id, client)
    // }

    // using Prisma
    const guildsDB = await prisma.guild.findMany({
        where: {
            deleted: false,
        },
    })
    for (const guild of guildsDB) {
        await syncGuild(guild.id, client)
    }
}
