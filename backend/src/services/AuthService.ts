import { UserRepository } from "../repositories/UserRepository";
import { comparePassword } from "../utils/password";
import { generateToken } from "../utils/jwt";

const userRepo = new UserRepository();

function sanitizeUserForClient(user: any) {
  if (!user) return user;
  const { passwordHash, ...rest } = user;

  if (rest.employee) {
    const { documentId, ...employeeRest } = rest.employee;
    rest.employee = employeeRest;
  }

  return rest;
}

export class AuthService {
  async login(email: string, password: string) {
    const normalizedEmail = email.trim();
    const user = await userRepo.findByEmail(normalizedEmail);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    if (user.role !== "superadmin") {
      if (!user.companyId || !user.company) {
        throw new Error("Company not found");
      }
      if (user.company.status !== "active") {
        throw new Error("Company is not active");
      }
      if (user.role === "employee") {
        if (!user.employee || user.employee.status !== "active") {
          throw new Error("Employee is inactive");
        }
      }
    }

    const token = generateToken({
      userId: user.id,
      companyId: user.companyId,
      role: user.role,
      employeeId: user.employeeId
    });

    return { token, user: sanitizeUserForClient(user) };
  }

  async me(userId: string) {
    const user = await userRepo.findById(userId);
    if (!user) throw new Error("User not found");
    return sanitizeUserForClient(user);
  }
}
