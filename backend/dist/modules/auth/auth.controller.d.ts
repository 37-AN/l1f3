import { AuthService, LoginDto, RegisterDto, PasswordChangeDto } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto, req: any): Promise<{
        user: import("./interfaces/user.interface").SafeUser;
        accessToken: string;
        refreshToken: string;
    }>;
    register(dto: RegisterDto, req: any): Promise<{
        user: import("./interfaces/user.interface").SafeUser;
        accessToken: string;
        refreshToken: string;
    }>;
    logout(req: any): Promise<{
        message: string;
    }>;
    changePassword(dto: PasswordChangeDto, req: any): Promise<{
        message: string;
    }>;
    enableMFA(req: any): Promise<{
        message: string;
    }>;
    disableMFA(req: any): Promise<{
        message: string;
    }>;
    refreshToken(dto: {
        refreshToken: string;
    }, req: any): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    }>;
}
