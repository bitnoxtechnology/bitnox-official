import "dotenv/config";
import mongoose from "mongoose";
import BlogModel from "./models/blog.model";
import ProjectModel from "./models/project.model";
import TestimonialModel from "./models/testimonial.model";
import UserModel from "./models/user.model";
import { seedBlogs, seedProjects, seedTestimonials } from "./data";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("Error: MONGO_URI is not set. Add it to your .env file.");
  process.exit(1);
}

async function seed() {
  await mongoose.connect(MONGO_URI!, { dbName: "bitnox-official" });
  console.log("Connected to database.\n");

  // Find an existing user or create a seed admin for blog authorship
  const existingUser = await UserModel.findOne();
  const user =
    existingUser ??
    (await new UserModel({
      name: "bitnox admin",
      email: "admin@bitnoxsolution.com",
    }).save());

  console.log(`Using author: ${user.email}`);

  // Clear existing seed collections
  await Promise.all([
    BlogModel.deleteMany({}),
    ProjectModel.deleteMany({}),
    TestimonialModel.deleteMany({}),
  ]);
  console.log("Cleared blogs, projects, and testimonials.\n");

  // Seed blogs — use collection.insertMany to bypass the slug middleware
  // since slugs are already set in the seed data
  await BlogModel.collection.insertMany(
    seedBlogs.map((blog) => ({
      ...blog,
      author: user._id,
      createdAt: blog.publishedAt,
      updatedAt: new Date(),
    }))
  );
  console.log(`✓ Seeded ${seedBlogs.length} blogs.`);

  // Seed projects — stagger createdAt by one week per entry
  await ProjectModel.collection.insertMany(
    seedProjects.map((project, i) => ({
      ...project,
      createdAt: new Date(
        Date.now() - (seedProjects.length - i) * 7 * 24 * 60 * 60 * 1000
      ),
      updatedAt: new Date(),
    }))
  );
  console.log(`✓ Seeded ${seedProjects.length} projects.`);

  // Seed testimonials — createdAt comes from each testimonial entry
  await TestimonialModel.collection.insertMany(
    seedTestimonials.map((t) => ({
      ...t,
      updatedAt: new Date(),
    }))
  );
  console.log(`✓ Seeded ${seedTestimonials.length} testimonials.`);

  await mongoose.disconnect();
  console.log("\nDatabase seeded successfully.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
