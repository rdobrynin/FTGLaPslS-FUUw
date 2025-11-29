import { Context, Next } from 'koa';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';

interface JwtPayload {
    id: string;
    email: string;
    role: UserRole;
}

export const authMiddleware = async (ctx: Context, next: Next) => {
    try {
        const token = ctx.headers.authorization?.split(' ')[1];

        if (!token) {
            ctx.status = 401;
            ctx.body = { error: 'Token not provided' };
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id: decoded.id } });

        if (!user || !user.isBlock) {
            ctx.status = 401;
            ctx.body = { error: 'User not found or blocked' };
            return;
        }

        ctx.state.user = user;
        await next();
    } catch (error) {
        ctx.status = 401;
        ctx.body = { error: 'Invalid token' };
    }
};

export const adminMiddleware = async (ctx: Context, next: Next) => {
    if (ctx.state.user.role !== UserRole.ADMIN) {
        ctx.status = 403;
        ctx.body = { error: 'Admin access required' };
        return;
    }
    await next();
};
