import { Data } from '@entities'
import { Database } from '@services'
import { resolveDependency } from '@utils/functions'
import { ModelData } from '@entities'

/**
 * Get the maintenance state of the bot.
 */
export const isInMaintenance = async (): Promise<boolean> => {
    const database = new ModelData()

    const maintenance = await database.get('maintenance')

    // const db = await resolveDependency(Database)
    // const dataRepository = db.get(Data)
    // const maintenance = await dataRepository.get('maintenance')

    return maintenance
}

/**
 * Set the maintenance state of the bot.
 */
export const setMaintenance = async (maintenance: boolean) => {
    // const db = await resolveDependency(Database)
    // const dataRepository = db.get(Data)
    // await dataRepository.set('maintenance', maintenance)

    const database = new ModelData()
    await database.set('maintenance', maintenance)
}
