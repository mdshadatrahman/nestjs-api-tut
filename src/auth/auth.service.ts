import { AuthDto } from './dto/auth.dto';
import { PrismaService } from './../prisma/prisma.service';
import { ForbiddenException, Injectable } from "@nestjs/common";
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

@Injectable({})
export class AuthService {
	constructor(private prisma: PrismaService) { }
	async signup(dto: AuthDto) {
		//generate the password hash
		const hash = await argon.hash(dto.password);

		//save the new user in the database

		try {
			const user = await this.prisma.user.create({
				data: {
					email: dto.email,
					hash,
				},
			});

			delete user.hash;

			//return the saved user
			return user;

		} catch (error) {
			if (error instanceof PrismaClientKnownRequestError) {
				if (error.code === 'P2002') {
					throw new ForbiddenException('Credentials taken');
				}
			} else {
				throw error;
			}
		}
	}
	signin() {
		return { 'mgs': 'Hello' }
	}

}