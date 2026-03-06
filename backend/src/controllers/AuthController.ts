import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json(result);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  }

  async me(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      
      const user = await authService.me(userId);
      res.json(user);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
