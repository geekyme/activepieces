import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { ProjectUsageHistoryResponse } from '@activepieces/shared'
import { platformMustBeOwnedByCurrentUser, platformMustHaveFeatureEnabled } from '../authentication/ee-authorization'
import { analyticsService } from './analytics.service'
import { piecesAnalyticsService } from './pieces-analytics.service'

export const analyticsModule: FastifyPluginAsyncTypebox = async (app) => {
    app.addHook('preHandler', platformMustBeOwnedByCurrentUser)
    app.addHook('preHandler', platformMustHaveFeatureEnabled((platform) => platform.plan.analyticsEnabled))
    await piecesAnalyticsService(app.log).init()
    await app.register(analyticsController, { prefix: '/v1/analytics' })
}

const analyticsController: FastifyPluginAsyncTypebox = async (app) => {

    app.get('/', async (request) => {
        const { platform } = request.principal
        return analyticsService(request.log).generateReport(platform.id)
    })

    app.get('/projects/usage-history', {
        schema: {
            querystring: Type.Object({
                months: Type.Optional(Type.Number({ minimum: 1, maximum: 24, default: 6 }))
            }),
            response: {
                200: ProjectUsageHistoryResponse
            }
        }
    }, async (request) => {
        const { platform } = request.principal
        const { months = 6 } = request.query
        return analyticsService(request.log).getProjectUsageHistory(platform.id, months)
    })
}