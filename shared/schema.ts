import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  fullName: text("full_name"),
  role: text("role").default("user"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  dueDate: text("due_date"),
  progress: integer("progress").default(0),
});

export const dailyReports = pgTable("daily_reports", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  userId: integer("user_id").notNull(),
  date: text("date").notNull(),
  weather: jsonb("weather"),
  progress: text("progress"),
  status: text("status").default("draft"),
  notes: text("notes"),
  materials: text("materials"),
  equipment: text("equipment"),
  safety: text("safety"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  date: text("date").notNull(), 
  workers: jsonb("workers"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const issues = pgTable("issues", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").default("medium"),
  status: text("status").default("open"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(), 
  reportId: integer("report_id"), 
  title: text("title"),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  status: text("status").default("draft"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const surveyQuestions = pgTable("survey_questions", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  category: text("category"),
  orderIndex: integer("order_index").notNull(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const surveyResponses = pgTable("survey_responses", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name"),
  company: text("company"),
  phone: text("phone"),
  answers: jsonb("answers").notNull(), // JSON array of {questionId: number, answer: boolean}
  createdAt: timestamp("created_at").defaultNow(),
});

export const questionnaires = pgTable("questionnaires", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  responses: jsonb("responses").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emailCampaigns = pgTable("email_campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  status: text("status").default("draft"),
  sentCount: integer("sent_count").default(0),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  role: true,
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  dueDate: true,
  progress: true,
});

export const insertDailyReportSchema = createInsertSchema(dailyReports).pick({
  projectId: true,
  userId: true,
  date: true,
  weather: true,
  progress: true,
  status: true,
  notes: true,
  materials: true,
  equipment: true,
  safety: true,
});

export const insertAttendanceSchema = createInsertSchema(attendance).pick({
  projectId: true,
  date: true,
  workers: true,
});

export const insertIssueSchema = createInsertSchema(issues).pick({
  projectId: true,
  title: true,
  description: true,
  priority: true,
  status: true,
  createdBy: true,
});

export const insertPhotoSchema = createInsertSchema(photos).pick({
  projectId: true,
  reportId: true,
  title: true,
  description: true,
  imageUrl: true,
  createdBy: true,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).pick({
  title: true,
  content: true,
  status: true,
  createdBy: true,
});

export const insertSurveyQuestionSchema = createInsertSchema(surveyQuestions).pick({
  question: true,
  category: true,
  orderIndex: true,
  active: true,
});

export const insertSurveyResponseSchema = createInsertSchema(surveyResponses).pick({
  email: true,
  name: true,
  company: true,
  phone: true,
  answers: true,
});

export const insertQuestionnaireSchema = createInsertSchema(questionnaires).pick({
  email: true,
  responses: true,
});

export const insertEmailCampaignSchema = createInsertSchema(emailCampaigns).pick({
  name: true,
  subject: true,
  content: true,
  status: true,
  createdBy: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type InsertDailyReport = z.infer<typeof insertDailyReportSchema>;
export type DailyReport = typeof dailyReports.$inferSelect;

export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Attendance = typeof attendance.$inferSelect;

export type InsertIssue = z.infer<typeof insertIssueSchema>;
export type Issue = typeof issues.$inferSelect;

export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
export type Photo = typeof photos.$inferSelect;

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

export type InsertSurveyQuestion = z.infer<typeof insertSurveyQuestionSchema>;
export type SurveyQuestion = typeof surveyQuestions.$inferSelect;

export type InsertSurveyResponse = z.infer<typeof insertSurveyResponseSchema>;
export type SurveyResponse = typeof surveyResponses.$inferSelect;

export type InsertQuestionnaire = z.infer<typeof insertQuestionnaireSchema>;
export type Questionnaire = typeof questionnaires.$inferSelect;

export type InsertEmailCampaign = z.infer<typeof insertEmailCampaignSchema>;
export type EmailCampaign = typeof emailCampaigns.$inferSelect;
