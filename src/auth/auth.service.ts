import { ConfigService } from '@nestjs/config/dist';
import { ForbiddenException, Injectable } from "@nestjs/common";
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from "./dto";
import { JwtService } from '@nestjs/jwt';

@Injectable({})
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private jwt: JwtService,
		private config: ConfigService,
	) { }
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

			return this.signToken(user.id, user.email);


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
		console.log(user);


		return this.signToken(user.id, user.email);
	}

	signToken(
		userId: number,
		email: string,
	): Promise<string> {
		const payload = {
			sun: userId,
			email,
		};
		const secret = this.config.get('JWT_SECRET');

		return this.jwt.signAsync(payload, {
			expiresIn: '15m',
			secret,
		});
	}

}