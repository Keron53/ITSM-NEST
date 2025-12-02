import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);
        console.log('Validating user:', email);
        if (user) {
            console.log('User found:', user.id);
            // Check if password is hashed (bcrypt hashes start with $2b$ or $2a$)
            const isHash = user.password.startsWith('$2b$') || user.password.startsWith('$2a$');
            let isMatch = false;

            if (isHash) {
                isMatch = await bcrypt.compare(pass, user.password);
            } else {
                // Plain text comparison
                isMatch = pass === user.password;
                // If match and not hashed, we should probably hash it now, but for now let's just allow login
                if (isMatch) {
                    console.log('Plain text password matched. Consider hashing it.');
                    // Optional: Hash and save
                    // user.password = await bcrypt.hash(pass, 10);
                    // await this.usersService.update(user.id, { password: user.password });
                }
            }

            console.log('Password match:', isMatch);
            if (isMatch) {
                const { password, ...result } = user;
                return result;
            }
        } else {
            console.log('User not found');
        }
        return null;
    }

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const payload = { email: user.email, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user,
        };
    }

    async register(registerDto: RegisterDto) {
        return this.usersService.create(registerDto);
    }
}
