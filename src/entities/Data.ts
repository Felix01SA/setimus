import {
    Entity,
    EntityRepositoryType,
    PrimaryKey,
    Property,
} from '@mikro-orm/core'
import { EntityRepository } from '@mikro-orm/sqlite'
import { prisma } from '@utils/functions'

import { CustomBaseEntity } from './BaseEntity'

/**
 * Default data for the Data table (dynamic EAV key/value pattern)
 */
export const defaultData = {
    maintenance: false,
    lastMaintenance: Date.now(),
    lastStartup: Date.now(),
}

type DataType = keyof typeof defaultData

// ===========================================
// ================= Entity ==================
// ===========================================

@Entity({ customRepository: () => DataRepository })
export class Data extends CustomBaseEntity {
    [EntityRepositoryType]?: DataRepository

    @PrimaryKey()
    key!: string

    @Property()
    value: string = ''
}

// ===========================================
// =========== Custom Repository =============
// ===========================================

export class DataRepository extends EntityRepository<Data> {
    async get<T extends DataType>(key: T): Promise<typeof defaultData[T]> {
        const data = await this.findOne({ key })

        return JSON.parse(data!.value)
    }

    async set<T extends DataType>(
        key: T,
        value: typeof defaultData[T]
    ): Promise<void> {
        const data = await this.findOne({ key })

        if (!data) {
            const newData = new Data()
            newData.key = key
            newData.value = JSON.stringify(value)

            await this.persistAndFlush(newData)
        } else {
            data.value = JSON.stringify(value)
            await this.flush()
        }
    }

    async add<T extends DataType>(
        key: T,
        value: typeof defaultData[T]
    ): Promise<void> {
        const data = await this.findOne({ key })

        if (!data) {
            const newData = new Data()
            newData.key = key
            newData.value = JSON.stringify(value)

            await this.persistAndFlush(newData)
        }
    }
}

export class ModelData {
    async get<T extends DataType>(key: T): Promise<typeof defaultData[T]> {
        const data = await prisma.data.findUnique({
            where: {
                key: key,
            },
        })

        if (!data) return JSON.parse('false')

        return JSON.parse(data.value!)
    }

    async set<T extends DataType>(
        key: T,
        value: typeof defaultData[T]
    ): Promise<void> {
        await prisma.data.upsert({
            create: {
                key,
                value: JSON.stringify(value),
            },
            update: {
                value: JSON.stringify(value),
            },
            where: {
                key,
            },
        })
    }
}
