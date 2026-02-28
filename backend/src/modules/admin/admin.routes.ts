import Elysia, { t } from 'elysia'
import { requireOwner } from '../auth/auth.middleware.ts'
import { UserModel } from '../../models/user.model.ts'
import { SiteModel } from '../../models/site.model.ts'
import { EventModel } from '../../models/event.model.ts'
import { SessionModel } from '../../models/session.model.ts'

export const adminRoutes = new Elysia({ prefix: '/admin', tags: ['Admin'] })
  .use(requireOwner())

  // GET /admin/users
  .get(
    '/users',
    async () => {
      try {
        const users = await UserModel.find({})
          .select('-passwordHash -passwordResetToken -twoFactorSecret')
          .lean()
        return {
          success: true,
          data: users.map(u => ({
            id: u._id.toString(),
            name: u.name,
            email: u.email,
            role: u.role,
            isVerified: u.isVerified,
            createdAt: u.createdAt,
          })),
          meta: { total: users.length },
        }
      } catch (err: any) {
        set.status = 500
        return {
          success: false,
          error: { code: 'FETCH_FAILED', message: err.message },
        }
      }
    },
    { detail: { summary: 'Tüm kullanıcıları listele' } }
  )

  // DELETE /admin/users/:userId
  .delete(
    '/users/:userId',
    async ({params, set}) => {
      try {
        const user = await UserModel.findByIdAndDelete(params.userId)
        if (!user) {
          set.status = 404
          return {
            success: false,
            error: { code: 'USER_NOT_FOUND', message: 'Kullanıcı bulunamadı.' },
          }
        }
        return { success: true, data: { message: 'Kullanıcı silindi.' } }
      } catch (err: any) {
        set.status = 500
        return {
          success: false,
          error: { code: 'DELETE_FAILED', message: err.message },
        }
      }
    },
    {
      params: t.Object({ userId: t.String() }),
      detail: { summary: 'Kullanıcı sil' },
    }
  )

  // GET /admin/stats — platform istatistikleri
  .get(
    '/stats',
    async () => {
      try {
        const [totalUsers, totalSites, totalEvents, totalSessions] = await Promise.all([
          UserModel.countDocuments(),
          SiteModel.countDocuments({ deletedAt: null }),
          EventModel.estimatedDocumentCount(),
          SessionModel.estimatedDocumentCount(),
        ])

        return {
          success: true,
          data: {
            users: totalUsers,
            sites: totalSites,
            events: totalEvents,
            sessions: totalSessions,
            timestamp: new Date().toISOString(),
          },
        }
      } catch (err: any) {
        set.status = 500
        return {
          success: false,
          error: { code: 'STATS_FAILED', message: err.message },
        }
      }
    },
    { detail: { summary: 'Platform istatistikleri' } }
  )
