import { Context } from 'koa';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';

export class UserController {
    static async getUserById(ctx: Context) {
        try {
            const { id } = ctx.params;
            const currentUser = ctx.state.user;

            if (currentUser.role !== UserRole.ADMIN && currentUser.id !== id) {
                ctx.status = 403;
                ctx.body = { error: 'Access denied' };
                return;
            }

            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOne({ where: { id } });

            if (!user) {
                ctx.status = 404;
                ctx.body = { error: 'User not found' };
                return;
            }

            const { password: _, ...userWithoutPassword } = user;

            ctx.status = 200;
            ctx.body = { user: userWithoutPassword };
        } catch (error: any) {
            ctx.status = 500;
            ctx.body = { error: error.message };
        }
    }

    static async getAllUsers(ctx: Context) {
        try {
            const userRepository = AppDataSource.getRepository(User);
            const users = await userRepository.find();

            const usersWithoutPassword = users.map(user => {
                const { password: _, ...userWithoutPassword } = user;
                return userWithoutPassword;
            });

            ctx.status = 200;
            ctx.body = { users: usersWithoutPassword };
        } catch (error: any) {
            ctx.status = 500;
            ctx.body = { error: error.message };
        }
    }

    static async blockUser(ctx: Context) {
        try {
            const { id } = ctx.params;
            const currentUser = ctx.state.user;

            if (currentUser.role !== UserRole.ADMIN && currentUser.id !== id) {
                ctx.status = 403;
                ctx.body = { error: 'Access denied' };
                return;
            }

            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOne({ where: { id } });

            if (!user) {
                ctx.status = 404;
                ctx.body = { error: 'User not found' };
                return;
            }

            user.isBlock = true;
            await userRepository.save(user);

            const { password: _, ...userWithoutPassword } = user;

            ctx.status = 200;
            ctx.body = {
                message: 'User blocked successfully',
                user: userWithoutPassword,
            };
        } catch (error: any) {
            ctx.status = 500;
            ctx.body = { error: error.message };
        }
    }
}
