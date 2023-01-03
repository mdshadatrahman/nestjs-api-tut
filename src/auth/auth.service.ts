import { AuthDto } from './dto/auth.dto';
import { PrismaService } from './../prisma/prisma.service';
import { Injectable } from "@nestjs/common";
import * as argon from 'argon2';

@Injectable({})
export class AuthService {
	constructor(private prisma: PrismaService) { }
	async signup(dto: AuthDto) {
		//generate the password hash
		const hash = await argon.hash(dto.password);

		//save the new user in the database
		const user = await this.prisma.user.create({
			data: {
				email: dto.email,
				hash,
			},
		});

		delete user.hash;

		//return the saved user
		return user;
	}
	signin() {
		return { 'mgs': 'Hello' }
	}

}