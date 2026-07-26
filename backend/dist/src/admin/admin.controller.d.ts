import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    create(createAdminDto: CreateAdminDto): Promise<{
        id: string;
        email: string;
        resetPasswordToken: string | null;
        name: string;
        resetPasswordExpires: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
        id: string;
        email: string;
        resetPasswordToken: string | null;
        name: string;
        resetPasswordExpires: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}
