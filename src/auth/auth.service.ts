import { Injectable } from "@nestjs/common";

@Injectable({})
export class AuthService {
	signup() {
		return { 'mgs': 'Hello' }
	}
	signin() {
		return { 'mgs': 'Hello' }
	}

}