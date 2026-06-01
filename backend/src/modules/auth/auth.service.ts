import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../config/db";
import { RegisterDto, LoginDto, AuthResponse } from "../../types/auth.types";
import { AppError } from "../../middleware/errorHandler";

/**
 * Service to manage authentication flows.
 */
export class AuthService {
  /**
   * Registers a new user after validation.
   */
  async register(data: RegisterDto): Promise<AuthResponse> {
    const { username, email, password } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new AppError("Email is already registered", 400);
      }
      throw new AppError("Username is already taken", 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user to database
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword
      }
    });

    // Create JWT Token
    const token = this.generateToken(user.id, user.username, user.email);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    };
  }

  /**
   * Validates credentials and logs user in.
   */
  async login(data: LoginDto): Promise<AuthResponse> {
    const { email, password } = data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    // Create JWT Token
    const token = this.generateToken(user.id, user.username, user.email);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    };
  }

  /**
   * Generates JWT token.
   */
  private generateToken(id: string, username: string, email: string): string {
    const secret = process.env.JWT_SECRET || "supersecret";
    return jwt.sign({ id, username, email }, secret, {
      expiresIn: "30d"
    });
  }
}