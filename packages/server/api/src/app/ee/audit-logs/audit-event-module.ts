import { ListAuditEventsRequest } from '@activepieces/ee-shared'
import {
    assertNotNullOrUndefined,
} from '@activepieces/shared'
import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { platformMustBeOwnedByCurrentUser, platformMustHaveFeatureEnabled } from '../authentication/ee-authorization'
import { auditLogService } from './audit-event-service'

export const auditEventModule: FastifyPluginAsyncTypebox = async (app) => {
    app.addHook('preHandler', platformMustHaveFeatureEnabled((platform) => platform.auditLogEnabled))
    app.addHook('preHandler', platformMustBeOwnedByCurrentUser)
    await app.register(auditEventController, { prefix: '/v1/audit-events' })
}

const auditEventController: FastifyPluginAsyncTypebox = async (app) => {
    app.get(
        '/',
        {
            schema: {
                querystring: ListAuditEventsRequest,
            },
        },
        async (request) => {
            const platformId = request.principal.platform.id
            assertNotNullOrUndefined(platformId, 'platformId')
            return auditLogService.list({
                platformId,
                cursorRequest: request.query.cursor ?? null,
                limit: request.query.limit ?? 20,
                userEmail: request.query.userEmail,
            })
        },
    )
}
