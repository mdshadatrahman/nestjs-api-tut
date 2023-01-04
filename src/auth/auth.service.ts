import { ForbiddenException, Injectable } from "@nestjs/common";
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from "./dto";

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
	async signin(dto: AuthDto) {
		//find the user by email
		const user = await this.prisma.user.findFirst({ //findUnique
			where: {
				email: dto.email
			}
		});

		//if user does not exist, throw an exception
		if (!user) throw new ForbiddenException(
			'Invalid credentials',
		);

		//compare password
		const pwMatches = await argon.verify(user.hash, dto.password);

		//if password incorrect, throw an exception
		if (!pwMatches) throw new ForbiddenException(
			'Invalid credentials',
		);
		delete user.hash;

		//send back the user
		return user;
	}

}