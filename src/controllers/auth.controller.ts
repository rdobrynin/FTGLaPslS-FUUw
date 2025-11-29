import { Context } from 'koa';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';
import { redisClient } from '../config/redis';

export class AuthController {
    static async register(ctx: Context) {
        try {
            const { firstName, lastName, middleName, birthDate, email, password, role } = ctx.request.body as any;

            if (!firstName || !lastName || !middleName || !birthDate || !email || !password) {
                ctx.status = 400;
                ctx.body = { error: 'All fields are required' };
                return;
            }

            const userRepository = AppDataSource.getRepository(User);
            const existingUser = await userRepository.findOne({ where: { email } });

            if (existingUser) {
                ctx.status = 409;
                ctx.body = { error: 'Email already exists' };
                return;
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const user = userRepository.create({
                firstName,
                lastName,
                middleName,
                birthDate: new Date(birthDate),
                email,
                password: hashedPassword,
                role: role === 'admin' ? UserRole.ADMIN : UserRole.USER,
                isActive: true,
            });

            await userRepository.save(user);

            const { password: _, ...userWithoutPassword } = user;

            ctx.status = 201;
            ctx.body = {
                message: 'User registered successfully',
                user: userWithoutPassword,
            };
        } catch (error: any) {
            ctx.status = 500;
            ctx.body = { error: error.message };
        }
    }

    static async login(ctx: Context) {
        try {
            const { email, password } = ctx.request.body as any;

            if (!email || !password) {
                ctx.status = 400;
                ctx.body = { error: 'Email and password are required' };
                return;
            }

            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOne({ where: { email } });

            if (!user) {
                ctx.status = 401;
                ctx.body = { error: 'Invalid credentials' };
                return;
            }

            if (!user.isBlock) {
                ctx.status = 403;
                ctx.body = { error: 'User is blocked' };
                return;
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                ctx.status = 401;
                ctx.body = { error: 'Invalid credentials' };
                return;
            }

            const jwtSecret = process.env.JWT_SECRET;

            if (!jwtSecret) {
                throw new Error('JWT_SEC environment variable is not set.');
            }

            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                jwtSecret,
                { expiresIn: '24h' }
            );

            // await redisClient.set(`session:${user.id}`, token, { EX: 86400 });

            const { password: _, ...userWithoutPassword } = user;

            ctx.status = 200;
            ctx.body = {
                message: 'Login successful',
                token,
                user: userWithoutPassword,
            };
        } catch (error: any) {
            ctx.status = 500;
            ctx.body = { error: error.message };
        }
    }
}
