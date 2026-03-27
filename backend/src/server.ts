import app from "./app";
import { prisma } from "./config/database";

const PORT = process.env.PORT || 4000;

const start = async () => {
  try {
    await prisma.$connect();
    console.log("Database connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();
