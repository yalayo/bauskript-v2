import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import multer from "multer";
import path from "path";
import { read, utils } from "xlsx";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { 
  insertProjectSchema, 
  insertDailyReportSchema, 
  insertAttendanceSchema, 
  insertIssueSchema,
  insertPhotoSchema,
  insertBlogPostSchema,
  insertQuestionnaireSchema,
  insertEmailCampaignSchema,
  insertContactSchema,
  insertEmailSchema,
  insertSurveyQuestionSchema,
  insertSurveyResponseSchema,
  bulkContactSchema,
  type BulkContact,
  type BulkImportStats
} from "@shared/schema";
import Stripe from "stripe";
import { z } from "zod";

// Configure Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
let stripe: Stripe | undefined;

if (stripeSecretKey) {
  stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2023-10-16" as any,
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Projects routes
  app.get("/api/projects", async (req, res, next) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/projects/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (project) {
        res.json(project);
      } else {
        res.status(404).json({ message: "Project not found" });
      }
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/projects", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        next(error);
      }
    }
  });

  app.patch("/api/projects/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(id, validatedData);
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        next(error);
      }
    }
  });

  // Daily Reports routes
  // Routes with "/api/reports" prefix (original)
  app.get("/api/reports", async (req, res, next) => {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      let reports;
      
      if (projectId) {
        reports = await storage.getDailyReportsByProject(projectId);
      } else {
        reports = await storage.getDailyReports();
      }
      
      res.json(reports);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/reports/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const report = await storage.getDailyReport(id);
      if (report) {
        res.json(report);
      } else {
        res.status(404).json({ message: "Report not found" });
      }
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/reports", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const validatedData = insertDailyReportSchema.parse(req.body);
      const report = await storage.createDailyReport(validatedData);
      res.status(201).json(report);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        next(error);
      }
    }
  });

  app.patch("/api/reports/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const id = parseInt(req.params.id);
      const validatedData = insertDailyReportSchema.partial().parse(req.body);
      const report = await storage.updateDailyReport(id, validatedData);
      res.json(report);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        next(error);
      }
    }
  });
  
  // Routes with "/api/daily-reports" prefix (for consistent naming)
  app.get("/api/daily-reports", async (req, res, next) => {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      let reports;
      
      if (projectId) {
        reports = await storage.getDailyReportsByProject(projectId);
      } else {
        reports = await storage.getDailyReports();
      }
      
      res.json(reports);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/daily-reports/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const report = await storage.getDailyReport(id);
      if (report) {
        res.json(report);
      } else {
        res.status(404).json({ message: "Report not found" });
      }
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/daily-reports", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const validatedData = insertDailyReportSchema.parse(req.body);
      const report = await storage.createDailyReport(validatedData);
      res.status(201).json(report);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        next(error);
      }
    }
  });

  app.patch("/api/daily-reports/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const id = parseInt(req.params.id);
      const validatedData = insertDailyReportSchema.partial().parse(req.body);
      const report = await storage.updateDailyReport(id, validatedData);
      res.json(report);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        next(error);
      }
    }
  });

  // Attendance routes
  app.get("/api/attendance", async (req, res, next) => {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      let records;
      
      if (projectId) {
        records = await storage.getAttendanceByProject(projectId);
      } else {
        records = await storage.getAttendanceRecords();
      }
      
      res.json(records);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/attendance/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const record = await storage.getAttendanceRecord(id);
      if (record) {
        res.json(record);
      } else {
        res.status(404).json({ message: "Attendance record not found" });
      }
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/attendance", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const validatedData = insertAttendanceSchema.parse(req.body);
      const record = await storage.createAttendanceRecord(validatedData);
      res.status(201).json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        next(error);
      }
    }
  });

  // Issues routes
  app.get("/api/issues", async (req, res, next) => {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      let issues;
      
      if (projectId) {
        issues = await storage.getIssuesByProject(projectId);
      } else {
        issues = await storage.getIssues();
      }
      
      res.json(issues);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/issues/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const issue = await storage.getIssue(id);
      if (issue) {
        res.json(issue);
      } else {
        res.status(404).json({ message: "Issue not found" });
      }
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/issues", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const validatedData = insertIssueSchema.parse({
        ...req.body,
        createdBy: req.user?.id,
      });
      const issue = await storage.createIssue(validatedData);
      res.status(201).json(issue);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        next(error);
      }
    }
  });

  app.patch("/api/issues/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const id = parseInt(req.params.id);
      const validatedData = insertIssueSchema.partial().parse(req.body);
      const issue = await storage.updateIssue(id, validatedData);
      res.json(issue);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        next(error);
      }
    }
  });

  // Photos routes
  app.get("/api/photos", async (req, res, next) => {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      let photos;
      
      if (projectId) {
        photos = await storage.getPhotosByProject(projectId);
      } else {
        photos = await storage.getPhotos();
      }
      
      res.json(photos);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/photos/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const photo = await storage.getPhoto(id);
      if (photo) {
        res.json(photo);
      } else {
        res.status(404).json({ message: "Photo not found" });
      }
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/photos", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const validatedData = insertPhotoSchema.parse({
        ...req.body,
        createdBy: req.user?.id,
      });
      const photo = await storage.createPhoto(validatedData);
      res.status(201).json(photo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        next(error);
      }
    }
  });

  // Blog posts routes
  app.get("/api/blog", async (req, res, next) => {
    try {
      const posts = await storage.getBlogPosts();
      res.json(posts);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/blog/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getBlogPost(id);
      if (post) {
        res.json(post);
      } else {
        res.status(404).json({ message: "Blog post not found" });
      }
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/blog", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const validatedData = insertBlogPostSchema.parse({
        ...req.body,
        createdBy: req.user?.id,
      });
      const post = await storage.createBlogPost(validatedData);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        next(error);
      }
    }
  });

  app.patch("/api/blog/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const id = parseInt(req.params.id);
      const validatedData = insertBlogPostSchema.partial().parse(req.body);
      const post = await storage.updateBlogPost(id, validatedData);
      res.json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        next(error);
      }
    }
  });

  app.delete("/api/blog/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const id = parseInt(req.params.id);
      await storage.deleteBlogPost(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });
  
  // AI Blog Content Generation Routes
  app.post("/api/blog/generate-from-topic", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { topicType, title } = req.body;
      
      if (!topicType || !title) {
        return res.status(400).json({ message: "Topic type and title are required" });
      }
      
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      
      // Initialize the Google Generative AI API with the key from environment
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: "Gemini API key not configured" });
      }
      
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      // Create a prompt based on the topic type and title
      let prompt = `Write a comprehensive, well-structured, and SEO-optimized blog post about "${title}" for a construction company's website. `;
      
      switch (topicType) {
        case "construction-tips":
          prompt += `Focus on practical tips, techniques, and best practices in construction. Include specific examples, address common challenges, and offer actionable advice for readers.`;
          break;
        case "industry-trends":
          prompt += `Discuss current trends, innovations, and future directions in the construction industry. Analyze how these trends impact projects, businesses, and the workforce. Include statistics and expert insights where relevant.`;
          break;
        case "project-management":
          prompt += `Focus on effective project management strategies in construction. Cover topics like scheduling, resource allocation, team coordination, and risk management. Provide practical advice for project managers.`;
          break;
        case "safety-guide":
          prompt += `Create a comprehensive safety guide for construction sites. Cover essential safety protocols, equipment usage, regulatory compliance, and emergency procedures. Emphasize the importance of a safety-first culture.`;
          break;
        case "sustainability":
          prompt += `Explore sustainable building practices, materials, and technologies. Discuss environmental benefits, regulatory requirements, and the long-term value of green construction approaches.`;
          break;
        case "cost-saving":
          prompt += `Share effective cost-saving strategies for construction projects. Include tips on material selection, resource optimization, efficient scheduling, and avoiding common budget pitfalls.`;
          break;
        case "client-guide":
          prompt += `Create a helpful guide for clients working with construction companies. Explain key processes, timeframes, common terminology, and what to expect throughout different project phases.`;
          break;
        default:
          prompt += `Include an introduction, main body with key points, and a conclusion. Use appropriate headings, subheadings, and keep paragraphs concise and readable.`;
      }
      
      prompt += `\n\nFormat the post with:
      1. A compelling title (different from the provided title if you can improve it)
      2. An engaging introduction
      3. 3-5 main sections with proper headings
      4. Bullet points where appropriate
      5. A conclusion with key takeaways
      6. Make the content approximately 800-1000 words
      
      Return the response in the following format:
      TITLE: [Your generated title]
      
      [The full blog post content]`;
      
      // Generate content using Gemini
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract title and content from the generated text
      const titleMatch = text.match(/TITLE:\s*(.+?)(?:\n\n|\n)/);
      const generatedTitle = titleMatch ? titleMatch[1].trim() : title;
      
      // Remove the "TITLE:" part to get only the content
      const content = text.replace(/TITLE:\s*(.+?)(?:\n\n|\n)/, "").trim();
      
      res.json({
        title: generatedTitle,
        content: content,
      });
    } catch (error) {
      console.error("Error generating blog content from topic:", error);
      res.status(500).json({ message: "Failed to generate content", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  
  app.post("/api/blog/generate-from-prompt", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { prompt } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }
      
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      
      // Initialize the Google Generative AI API with the key from environment
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: "Gemini API key not configured" });
      }
      
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      // Enhance the user's prompt with additional instructions for better formatting
      const enhancedPrompt = `${prompt}\n\nFormat your response as a well-structured blog post with:
      1. A compelling title 
      2. An engaging introduction
      3. Main body with proper sections and headings
      4. Bullet points where appropriate
      5. A conclusion with key takeaways
      
      Return the response in the following format:
      TITLE: [Your generated title]
      
      [The full blog post content]`;
      
      // Generate content using Gemini
      const result = await model.generateContent(enhancedPrompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract title and content from the generated text
      const titleMatch = text.match(/TITLE:\s*(.+?)(?:\n\n|\n)/);
      const title = titleMatch ? titleMatch[1].trim() : "Generated Blog Post";
      
      // Remove the "TITLE:" part to get only the content
      const content = text.replace(/TITLE:\s*(.+?)(?:\n\n|\n)/, "").trim();
      
      res.json({
        title,
        content,
      });
    } catch (error) {
      console.error("Error generating blog content from custom prompt:", error);
      res.status(500).json({ message: "Failed to generate content", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Questionnaire routes
  app.post("/api/questionnaire", async (req, res, next) => {
    try {
      const validatedData = insertQuestionnaireSchema.parse(req.body);
      const questionnaire = await storage.createQuestionnaire(validatedData);
      res.status(201).json(questionnaire);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        next(error);
      }
    }
  });

  app.get("/api/questionnaires", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user?.role !== "admin") return res.sendStatus(403);

    try {
      const questionnaires = await storage.getQuestionnaires();
      res.json(questionnaires);
    } catch (error) {
      next(error);
    }
  });

  // Survey Questions routes
  app.get("/api/survey-questions", async (req, res, next) => {
    try {
      const category = req.query.category as string | undefined;
      let questions;
      
      if (category) {
        questions = await storage.getSurveyQuestionsByCategory(category);
      } else {
        questions = await storage.getSurveyQuestions();
      }
      
      // Only return active questions for public consumption
      const activeQuestions = questions.filter(q => q.active);
      
      res.json(activeQuestions);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/survey-questions/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const question = await storage.getSurveyQuestion(id);
      if (question) {
        res.json(question);
      } else {
        res.status(404).json({ message: "Survey question not found" });
      }
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/survey-questions", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user?.role !== "admin") return res.sendStatus(403);
    
    try {
      const validatedData = insertSurveyQuestionSchema.parse(req.body);
      const question = await storage.createSurveyQuestion(validatedData);
      res.status(201).json(question);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        next(error);
      }
    }
  });
  
  app.patch("/api/survey-questions/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user?.role !== "admin") return res.sendStatus(403);
    
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertSurveyQuestionSchema.partial().parse(req.body);
      const question = await storage.updateSurveyQuestion(id, validatedData);
      res.json(question);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        next(error);
      }
    }
  });
  
  app.delete("/api/survey-questions/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user?.role !== "admin") return res.sendStatus(403);
    
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSurveyQuestion(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });
  
  // Survey Responses routes
  app.post("/api/survey-responses", async (req, res, next) => {
    try {
      const validatedData = insertSurveyResponseSchema.parse(req.body);
      const response = await storage.createSurveyResponse(validatedData);
      res.status(201).json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        next(error);
      }
    }
  });
  
  app.get("/api/survey-responses", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user?.role !== "admin") return res.sendStatus(403);
    
    try {
      const responses = await storage.getSurveyResponses();
      res.json(responses);
    } catch (error) {
      next(error);
    }
  });
  
  // Survey Analytics API
  app.get("/api/survey-analytics", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user?.role !== "admin") return res.sendStatus(403);
    
    try {
      const analytics = await storage.getSurveyAnalytics();
      res.json(analytics);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/survey-analytics/:questionId", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user?.role !== "admin") return res.sendStatus(403);
    
    try {
      const questionId = parseInt(req.params.questionId);
      const analytics = await storage.getSurveyAnalyticsByQuestionId(questionId);
      res.json(analytics);
    } catch (error) {
      next(error);
    }
  });
  


  // Email campaigns routes
  app.get("/api/email-campaigns", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const campaigns = await storage.getEmailCampaigns();
      res.json(campaigns);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/email-campaigns/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const id = parseInt(req.params.id);
      const campaign = await storage.getEmailCampaign(id);
      if (campaign) {
        res.json(campaign);
      } else {
        res.status(404).json({ message: "Email campaign not found" });
      }
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/email-campaigns", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const validatedData = insertEmailCampaignSchema.parse({
        ...req.body,
        createdBy: req.user?.id,
      });
      const campaign = await storage.createEmailCampaign(validatedData);
      res.status(201).json(campaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        next(error);
      }
    }
  });

  app.patch("/api/email-campaigns/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const id = parseInt(req.params.id);
      const validatedData = insertEmailCampaignSchema.partial().parse(req.body);
      const campaign = await storage.updateEmailCampaign(id, validatedData);
      res.json(campaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        next(error);
      }
    }
  });

  // Contacts routes
  app.get("/api/contacts", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/contacts/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const id = parseInt(req.params.id);
      const contact = await storage.getContact(id);
      if (contact) {
        res.json(contact);
      } else {
        res.status(404).json({ message: "Contact not found" });
      }
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/contacts", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const validatedData = insertContactSchema.parse({
        ...req.body,
        createdById: req.user?.id,
      });
      const contact = await storage.createContact(validatedData);
      res.status(201).json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        next(error);
      }
    }
  });

  app.patch("/api/contacts/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const id = parseInt(req.params.id);
      const validatedData = insertContactSchema.partial().parse(req.body);
      const contact = await storage.updateContact(id, validatedData);
      res.json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        next(error);
      }
    }
  });

  app.delete("/api/contacts/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const id = parseInt(req.params.id);
      await storage.deleteContact(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });
  
  // Configure multer for Excel file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB limit
    },
    fileFilter: (req, file, cb) => {
      // Check and accept common Excel MIME types
      const acceptableMimeTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/octet-stream',
        'application/x-zip-compressed',
        'application/zip'
      ];
      
      // Accept Excel file extensions
      const fileExtension = path.extname(file.originalname).toLowerCase();
      const validExtension = /\.(xlsx|xls)$/.test(fileExtension);
      
      if (validExtension) {
        return cb(null, true);
      }
      
      cb(new Error("Error: File upload only supports Excel files (.xlsx, .xls)"));
    }
  });

  // Bulk import contacts from Excel file
  app.post("/api/contacts/import", upload.single("file"), async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Read Excel file
      const workbook = read(req.file.buffer);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const data = utils.sheet_to_json(worksheet);
      
      if (!data || data.length === 0) {
        return res.status(400).json({ message: "Excel file is empty or has invalid format" });
      }
      
      // Process each row and extract contacts
      const contacts: BulkContact[] = [];
      console.log("Excel data format:", JSON.stringify(data[0])); // Log first row for debugging
      
      for (const row of data) {
        try {
          // Using type assertion to work with the row data
          const typedRow = row as Record<string | number, any>;
          
          // Try different ways to extract the email
          let email = null;
          
          // Check common Excel formats
          if ("B" in typedRow) {
            email = typedRow["B"];
          } else if ("Email" in typedRow || "EMAIL" in typedRow || "email" in typedRow) {
            email = typedRow["Email"] || typedRow["EMAIL"] || typedRow["email"];
          } else if (1 in typedRow) {
            email = typedRow[1];
          } else {
            // Try to scan all properties for an email-like value
            for (const key in typedRow) {
              const value = typedRow[key];
              if (value && typeof value === 'string' && value.includes('@')) {
                email = value;
                break;
              }
            }
          }
          
          // Skip if no valid email
          if (!email || typeof email !== 'string' || !email.includes('@')) {
            continue;
          }
          
          // Try to extract category/type
          let category = null;
          if ("A" in typedRow) {
            category = typedRow["A"];
          } else if ("Category" in typedRow || "CATEGORY" in typedRow || "Type" in typedRow || "TYPE" in typedRow) {
            category = typedRow["Category"] || typedRow["CATEGORY"] || typedRow["Type"] || typedRow["TYPE"];
          } else if (0 in typedRow) {
            category = typedRow[0];
          }
          
          // Try to extract company
          let company = null;
          if ("C" in typedRow) {
            company = typedRow["C"];
          } else if ("Company" in typedRow || "COMPANY" in typedRow || "Organization" in typedRow) {
            company = typedRow["Company"] || typedRow["COMPANY"] || typedRow["Organization"];
          } else if (2 in typedRow) {
            company = typedRow[2];
          }
          
          contacts.push({
            email: email.trim(),
            category: category ? String(category).trim() : undefined,
            company: company ? String(company).trim() : undefined
          });
        } catch (err) {
          console.warn("Error processing row:", err);
          // Continue to next row if there's an error with current row
          continue;
        }
      }
      
      console.log(`Extracted ${contacts.length} contacts from Excel file`);
      
      // Send to storage to process
      const importResult = await storage.bulkImportContacts(contacts, req.user!.id);
      
      // Return result statistics
      res.status(200).json({
        message: `Imported ${importResult.imported} contacts successfully`,
        stats: importResult
      });
      
    } catch (error) {
      console.error("Error processing Excel file:", error);
      res.status(500).json({ message: "Error processing Excel file", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Reusing the upload configuration defined above for Excel files

  // Excel contacts upload route
  app.post("/api/contacts/upload", upload.single("file"), async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user?.role !== "admin") return res.sendStatus(403);
    
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Parse Excel file
      const workbook = read(req.file.buffer);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = utils.sheet_to_json(sheet, { header: 1 });
      
      // Process rows (skip header row if it exists)
      const typedData = data as any[]; // Type assertion for the data array
      const startRow = typedData[0] && typedData[0][0] === "A" || typedData[0] && typedData[0][0] === "Email" ? 1 : 0;
      const importedContacts = [];
      const errors = [];
      
      for (let i = startRow; i < typedData.length; i++) {
        const row = typedData[i] as any[];
        if (!row || !row[1] || typeof row[1] !== 'string') continue; // Skip if no email
        
        try {
          const contactData = {
            email: row[1].toString().trim(),
            category: row[2] ? row[2].toString().trim() : null,
            firstName: null,
            lastName: null,
            company: null,
            position: null,
            phone: null,
            status: "active",
            source: "excel-import",
            notes: null,
            fromBulkUpload: true,
            scheduledForProcessing: false,
            createdById: req.user?.id
          };
          
          const contact = await storage.createContact(contactData);
          importedContacts.push(contact);
        } catch (error) {
          // Skip duplicates (unique constraint on email)
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push({ row: i + 1, email: row[1], error: errorMessage });
        }
      }
      
      res.status(201).json({ 
        message: `Imported ${importedContacts.length} contacts`,
        imported: importedContacts.length,
        errors: errors,
        contacts: importedContacts
      });
    } catch (error) {
      console.error("Excel import error:", error);
      next(error);
    }
  });

  // Email processor route - marks contacts as scheduled for sending
  app.post("/api/contacts/schedule-processing", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user?.role !== "admin") return res.sendStatus(403);
    
    try {
      const { campaignId } = req.body;
      
      if (!campaignId) {
        return res.status(400).json({ message: "Campaign ID is required" });
      }
      
      // Get campaign to check if it exists
      const campaign = await storage.getEmailCampaign(parseInt(campaignId));
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      // Get contacts that are from bulk upload and not yet scheduled
      const contacts = await storage.getBulkContactsForProcessing();
      
      // Mark them as scheduled
      if (contacts.length > 0) {
        await storage.markContactsForProcessing(contacts.map(c => c.id));
        
        res.json({ 
          message: `Scheduled ${contacts.length} contacts for processing`,
          scheduledCount: contacts.length,
          contacts: contacts
        });
      } else {
        res.json({ 
          message: "No contacts available for scheduling",
          scheduledCount: 0,
          contacts: []
        });
      }
    } catch (error) {
      next(error);
    }
  });

  // Email processing endpoint - sends one email every time it's called
  app.post("/api/process-email", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user?.role !== "admin") return res.sendStatus(403);
    
    try {
      const { campaignId } = req.body;
      
      if (!campaignId) {
        return res.status(400).json({ message: "Campaign ID is required" });
      }
      
      // Get campaign
      const campaign = await storage.getEmailCampaign(parseInt(campaignId));
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      // Get next contact scheduled for processing
      const contact = await storage.getNextContactForProcessing();
      
      if (!contact) {
        return res.json({ 
          status: "complete",
          message: "All scheduled contacts have been processed" 
        });
      }
      
      // Generate and send email using existing AI functionality
      let emailContent = campaign.content;
      
      // Replace placeholders with contact data
      emailContent = emailContent.replace(/{firstName}/g, contact.firstName || "")
                              .replace(/{lastName}/g, contact.lastName || "")
                              .replace(/{company}/g, contact.company || "")
                              .replace(/{position}/g, contact.position || "")
                              .replace(/{category}/g, contact.category || "");
      
      // Create email record
      const email = await storage.createEmail({
        contactId: contact.id,
        campaignId: parseInt(campaignId),
        subject: campaign.subject,
        content: emailContent,
        status: "sent",
        sentAt: new Date(),
        direction: "outbound",
        generatedByAI: false,
      });
      
      // Mark contact as processed
      await storage.markContactAsProcessed(contact.id);
      
      res.json({ 
        status: "sent",
        contact: contact,
        email: email,
        message: `Email sent to ${contact.email}` 
      });
    } catch (error) {
      next(error);
    }
  });

  // Emails routes
  app.get("/api/emails", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const contactId = req.query.contactId ? parseInt(req.query.contactId as string) : undefined;
      const campaignId = req.query.campaignId ? parseInt(req.query.campaignId as string) : undefined;
      
      let emails;
      if (contactId) {
        emails = await storage.getEmailsByContact(contactId);
      } else if (campaignId) {
        emails = await storage.getEmailsByCampaign(campaignId);
      } else {
        emails = await storage.getEmails();
      }
      
      res.json(emails);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/emails/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const id = parseInt(req.params.id);
      const email = await storage.getEmail(id);
      if (email) {
        res.json(email);
      } else {
        res.status(404).json({ message: "Email not found" });
      }
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/emails", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const validatedData = insertEmailSchema.parse(req.body);
      const email = await storage.createEmail(validatedData);
      res.status(201).json(email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        next(error);
      }
    }
  });

  app.post("/api/emails/generate-with-ai", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const { contactId, promptTemplate } = req.body;
      if (!contactId || !promptTemplate) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const email = await storage.generateEmailWithAI(contactId, promptTemplate);
      res.status(201).json(email);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/emails/:id/review", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const id = parseInt(req.params.id);
      const { content } = req.body;
      const email = await storage.reviewAndApproveEmail(id, req.user!.id, content);
      res.json(email);
    } catch (error) {
      next(error);
    }
  });

  // Stripe payment routes
  if (stripe) {
    // One-time payment endpoint
    app.post("/api/create-payment-intent", async (req, res, next) => {
      try {
        const { amount, currency = "eur" } = req.body;
        
        // Convert to cents if not already
        const amountInCents = typeof amount === 'number' ? Math.round(amount) : parseInt(amount);
        
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amountInCents,
          currency,
        });
        res.json({ clientSecret: paymentIntent.client_secret });
      } catch (error: any) {
        res.status(500).json({ message: "Error creating payment intent: " + error.message });
      }
    });

    // Subscription endpoint
    app.post('/api/get-or-create-subscription', async (req, res) => {
      if (!req.isAuthenticated()) {
        return res.sendStatus(401);
      }

      const user = req.user;

      if (user.stripeSubscriptionId) {
        try {
          const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
          
          // Return existing subscription data
          // Type assertion to properly handle expanded objects
          const latestInvoice = subscription.latest_invoice as any;
          const paymentIntent = latestInvoice?.payment_intent;
          
          res.send({
            subscriptionId: subscription.id,
            clientSecret: paymentIntent?.client_secret,
          });
          return;
        } catch (error: any) {
          console.error("Error retrieving subscription:", error.message);
          // If subscription not found, proceed to create a new one
        }
      }
      
      if (!user.email) {
        return res.status(400).json({ message: "No user email on file" });
      }

      try {
        // Create or retrieve customer
        let customerId = user.stripeCustomerId;
        
        if (!customerId) {
          const customer = await stripe.customers.create({
            email: user.email,
            name: user.fullName || user.username,
          });
          customerId = customer.id;
          
          // Update user with customer ID
          await storage.updateStripeCustomerId(user.id, customerId);
        }

        // Get the price ID based on the plan
        const { priceId } = req.body;
        if (!priceId) {
          return res.status(400).json({ message: "No price ID provided" });
        }

        // Create the subscription
        const subscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [{
            price: priceId,
          }],
          payment_behavior: 'default_incomplete',
          expand: ['latest_invoice.payment_intent'],
        });

        // Update user with subscription ID
        await storage.updateUserStripeInfo(user.id, {
          customerId,
          subscriptionId: subscription.id
        });
    
        // Type assertion to properly handle expanded objects
        const latestInvoice = subscription.latest_invoice as any;
        const paymentIntent = latestInvoice?.payment_intent;
        
        res.send({
          subscriptionId: subscription.id,
          clientSecret: paymentIntent?.client_secret,
        });
      } catch (error: any) {
        console.error("Subscription error:", error.message);
        return res.status(400).send({ error: { message: error.message } });
      }
    });
  } else {
    // Fallback if Stripe is not configured
    app.post("/api/create-payment-intent", (req, res) => {
      res.status(500).json({ message: "Stripe is not configured" });
    });
    
    app.post("/api/get-or-create-subscription", (req, res) => {
      res.status(500).json({ message: "Stripe is not configured" });
    });
  }

  const httpServer = createServer(app);

  return httpServer;
}
