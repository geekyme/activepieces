import { repoFactory } from '../core/db/repo-factory'
import { AIUsageEntity } from './ai-usage-entity'

export const aiUsageRepo = repoFactory(AIUsageEntity)