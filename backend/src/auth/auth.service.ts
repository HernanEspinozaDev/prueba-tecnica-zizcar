import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private usersService: UsersService
    ) { }

    /**
     * VALIDACIÓN DE CREDENCIALES
     * ---------------------------------------------------
     * Verifica si el usuario existe y si la contraseña coincide.
     * - Retorna el usuario si todo es correcto.
     * - Lanza excepciones si falla (404 o 401).
     */
    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(email);

        if (!user) {
            throw new NotFoundException('El usuario no existe');
        }

        const isMatch = await bcrypt.compare(pass, user.password);
        if (!isMatch) {
            throw new UnauthorizedException('Contraseña incorrecta');
        }

        const { password, ...result } = user;
        return result;
    }

    /**
     * GENERACIÓN DE TOKEN (Login)
     * ---------------------------------------------------
     * Genera un JWT (JSON Web Token) firmado para el usuario validado.
     */
    async login(user: any) {
        const payload = { username: user.email, sub: user.id, email: user.email };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
