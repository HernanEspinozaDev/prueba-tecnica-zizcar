import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnModuleInit {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    /**
     * INICIALIZACIÓN DEL MÓDULO (Database Seeding)
     * ---------------------------------------------------
     * Este método se ejecuta automáticamente al arrancar la aplicación.
     * Su propósito es garantizar que siempre exista un usuario administrador.
     * 1. Verifica si el usuario existe.
     * 2. Si no existe, lo crea con contraseña hasheada.
     */
    async onModuleInit() {
        const adminEmail = 'hernan.espinoza.dev@gmail.com';
        const exists = await this.usersRepository.findOneBy({ email: adminEmail });

        if (!exists) {
            // Hash de contraseña con Bcrypt (Salt rounds: 10)
            const hashedPassword = await bcrypt.hash('Admin123', 10);

            const admin = this.usersRepository.create({
                email: adminEmail,
                password: hashedPassword,
            });
            await this.usersRepository.save(admin);
            this.logger.log(`🌱 Usuario Admin creado automáticamente: ${adminEmail}`);
        } else {
            this.logger.log(`✅ Usuario Admin ya existe: ${adminEmail}`);
        }
    }

    async findOne(email: string): Promise<User | undefined> {
        return this.usersRepository.findOneBy({ email });
    }
}
