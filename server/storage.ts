import { 
  users, type User, type InsertUser,
  projects, type Project, type InsertProject,
  dailyReports, type DailyReport, type InsertDailyReport,
  attendance, type Attendance, type InsertAttendance,
  issues, type Issue, type InsertIssue,
  photos, type Photo, type InsertPhoto,
  blogPosts, type BlogPost, type InsertBlogPost,
  questionnaires, type Questionnaire, type InsertQuestionnaire,
  emailCampaigns, type EmailCampaign, type InsertEmailCampaign,
  surveyQuestions, type SurveyQuestion, type InsertSurveyQuestion,
  surveyResponses, type SurveyResponse, type InsertSurveyResponse,
  contacts, type Contact, type InsertContact,
  emails, type Email, type InsertEmail
} from "@shared/schema";
import type { SessionData, Store } from "express-session";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { Pool } from '@neondatabase/serverless';

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateStripeCustomerId(id: number, customerId: string): Promise<User>;
  updateUserStripeInfo(id: number, info: { customerId: string, subscriptionId: string }): Promise<User>;
  
  // Project methods
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project>;

  // Daily Report methods
  getDailyReports(): Promise<DailyReport[]>;
  getDailyReportsByProject(projectId: number): Promise<DailyReport[]>;
  getDailyReport(id: number): Promise<DailyReport | undefined>;
  createDailyReport(report: InsertDailyReport): Promise<DailyReport>;
  updateDailyReport(id: number, report: Partial<InsertDailyReport>): Promise<DailyReport>;

  // Attendance methods
  getAttendanceRecords(): Promise<Attendance[]>;
  getAttendanceByProject(projectId: number): Promise<Attendance[]>;
  getAttendanceRecord(id: number): Promise<Attendance | undefined>;
  createAttendanceRecord(record: InsertAttendance): Promise<Attendance>;

  // Issue methods
  getIssues(): Promise<Issue[]>;
  getIssuesByProject(projectId: number): Promise<Issue[]>;
  getIssue(id: number): Promise<Issue | undefined>;
  createIssue(issue: InsertIssue): Promise<Issue>;
  updateIssue(id: number, issue: Partial<InsertIssue>): Promise<Issue>;

  // Photo methods
  getPhotos(): Promise<Photo[]>;
  getPhotosByProject(projectId: number): Promise<Photo[]>;
  getPhoto(id: number): Promise<Photo | undefined>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;

  // Blog methods
  getBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost>;
  deleteBlogPost(id: number): Promise<void>;
  
  // Survey Question methods
  getSurveyQuestions(): Promise<SurveyQuestion[]>;
  getSurveyQuestionsByCategory(category: string): Promise<SurveyQuestion[]>;
  getSurveyQuestion(id: number): Promise<SurveyQuestion | undefined>;
  createSurveyQuestion(question: InsertSurveyQuestion): Promise<SurveyQuestion>;
  updateSurveyQuestion(id: number, question: Partial<InsertSurveyQuestion>): Promise<SurveyQuestion>;
  deleteSurveyQuestion(id: number): Promise<void>;

  // Survey Response methods
  getSurveyResponses(): Promise<SurveyResponse[]>;
  getSurveyResponse(id: number): Promise<SurveyResponse | undefined>;
  createSurveyResponse(response: InsertSurveyResponse): Promise<SurveyResponse>;
  
  // Survey Analytics methods
  getSurveyAnalytics(): Promise<any>;
  getSurveyAnalyticsByQuestionId(questionId: number): Promise<any>;

  // Questionnaire methods
  getQuestionnaires(): Promise<Questionnaire[]>;
  createQuestionnaire(questionnaire: InsertQuestionnaire): Promise<Questionnaire>;

  // Email Campaign methods
  getEmailCampaigns(): Promise<EmailCampaign[]>;
  getEmailCampaign(id: number): Promise<EmailCampaign | undefined>;
  createEmailCampaign(campaign: InsertEmailCampaign): Promise<EmailCampaign>;
  updateEmailCampaign(id: number, campaign: Partial<InsertEmailCampaign>): Promise<EmailCampaign>;
  getEmailCampaignStats(id: number): Promise<any>;
  scheduleEmailCampaign(id: number, date: Date): Promise<EmailCampaign>;
  pauseEmailCampaign(id: number): Promise<EmailCampaign>;
  resumeEmailCampaign(id: number): Promise<EmailCampaign>;

  // Contact methods
  getContacts(): Promise<Contact[]>;
  getContact(id: number): Promise<Contact | undefined>;
  getContactByEmail(email: string): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: number, contact: Partial<InsertContact>): Promise<Contact>;
  deleteContact(id: number): Promise<void>;
  
  // Email methods
  getEmails(): Promise<Email[]>;
  getEmailsByContact(contactId: number): Promise<Email[]>;
  getEmailsByCampaign(campaignId: number): Promise<Email[]>;
  getEmail(id: number): Promise<Email | undefined>;
  createEmail(email: InsertEmail): Promise<Email>;
  updateEmail(id: number, email: Partial<InsertEmail>): Promise<Email>;
  markEmailAsSent(id: number): Promise<Email>;
  markEmailAsOpened(id: number): Promise<Email>;
  markEmailAsClicked(id: number): Promise<Email>;
  markEmailAsReplied(id: number): Promise<Email>;
  generateEmailWithAI(contactId: number, promptTemplate: string): Promise<Email>;
  reviewAndApproveEmail(id: number, reviewerId: number, content?: string): Promise<Email>;

  sessionStore: Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private dailyReports: Map<number, DailyReport>;
  private attendanceRecords: Map<number, Attendance>;
  private issues: Map<number, Issue>;
  private photos: Map<number, Photo>;
  private blogPosts: Map<number, BlogPost>;
  private surveyQuestions: Map<number, SurveyQuestion>;
  private surveyResponses: Map<number, SurveyResponse>;
  private questionnaires: Map<number, Questionnaire>;
  private emailCampaigns: Map<number, EmailCampaign>;
  private contacts: Map<number, Contact>;
  private emails: Map<number, Email>;

  private userCurrentId: number;
  private projectCurrentId: number;
  private reportCurrentId: number;
  private attendanceCurrentId: number;
  private issueCurrentId: number;
  private photoCurrentId: number;
  private blogPostCurrentId: number;
  private surveyQuestionCurrentId: number;
  private surveyResponseCurrentId: number;
  private questionnaireCurrentId: number;
  private emailCampaignCurrentId: number;
  private contactCurrentId: number;
  private emailCurrentId: number;

  sessionStore: Store;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.dailyReports = new Map();
    this.attendanceRecords = new Map();
    this.issues = new Map();
    this.photos = new Map();
    this.blogPosts = new Map();
    this.surveyQuestions = new Map();
    this.surveyResponses = new Map();
    this.questionnaires = new Map();
    this.emailCampaigns = new Map();
    this.contacts = new Map();
    this.emails = new Map();

    this.userCurrentId = 1;
    this.projectCurrentId = 1;
    this.reportCurrentId = 1;
    this.attendanceCurrentId = 1;
    this.issueCurrentId = 1;
    this.photoCurrentId = 1;
    this.blogPostCurrentId = 1;
    this.surveyQuestionCurrentId = 1;
    this.surveyResponseCurrentId = 1;
    this.questionnaireCurrentId = 1;
    this.emailCampaignCurrentId = 1;
    this.contactCurrentId = 1;
    this.emailCurrentId = 1;

    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });

    // Initialize with some test data
    this.initializeData();
  }

  private initializeData() {
    // Create sample projects
    this.createProject({
      name: "Riverfront Tower",
      dueDate: "2023-10-15",
      progress: 78,
    });
    
    this.createProject({
      name: "Metro Plaza",
      dueDate: "2023-12-12",
      progress: 45,
    });
    
    this.createProject({
      name: "Harbor Office",
      dueDate: "2023-11-30",
      progress: 92,
    });
    
    this.createProject({
      name: "Suburban Residence",
      dueDate: "2024-01-10",
      progress: 25,
    });
    
    // Initialize survey questions (20 yes/no questions for construction management)
    const surveyQuestions = [
      // Budget & Cost Management
      { question: "Do you have a detailed budget for your construction project?", category: "Budget", orderIndex: 1, active: true },
      { question: "Are you experiencing cost overruns on your current projects?", category: "Budget", orderIndex: 2, active: true },
      { question: "Do you use software for cost tracking and management?", category: "Budget", orderIndex: 3, active: true },
      { question: "Are you satisfied with your current budgeting process?", category: "Budget", orderIndex: 4, active: true },
      
      // Project Management
      { question: "Do you use dedicated construction project management software?", category: "Management", orderIndex: 5, active: true },
      { question: "Is your current scheduling process working efficiently?", category: "Management", orderIndex: 6, active: true },
      { question: "Do you track daily progress on your construction sites?", category: "Management", orderIndex: 7, active: true },
      { question: "Can you easily generate project reports for stakeholders?", category: "Management", orderIndex: 8, active: true },
      { question: "Do subcontractors have access to your project management system?", category: "Management", orderIndex: 9, active: true },
      
      // Safety & Compliance
      { question: "Do you document safety incidents digitally?", category: "Safety", orderIndex: 10, active: true },
      { question: "Can workers report safety concerns through a mobile app?", category: "Safety", orderIndex: 11, active: true },
      { question: "Do you track compliance with safety regulations?", category: "Safety", orderIndex: 12, active: true },
      { question: "Are safety inspections performed and recorded regularly?", category: "Safety", orderIndex: 13, active: true },
      
      // Communication
      { question: "Do you have a centralized communication system for your projects?", category: "Communication", orderIndex: 14, active: true },
      { question: "Are you satisfied with the current level of communication on your projects?", category: "Communication", orderIndex: 15, active: true },
      { question: "Can stakeholders access project updates in real-time?", category: "Communication", orderIndex: 16, active: true },
      
      // Resource Management
      { question: "Do you digitally track equipment usage and availability?", category: "Resources", orderIndex: 17, active: true },
      { question: "Is your material procurement process efficient?", category: "Resources", orderIndex: 18, active: true },
      { question: "Do you experience delays due to resource management issues?", category: "Resources", orderIndex: 19, active: true },
      { question: "Would you be interested in an integrated construction management solution?", category: "General", orderIndex: 20, active: true },
    ];
    
    // Add questions to storage
    surveyQuestions.forEach(q => {
      this.createSurveyQuestion(q);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { 
      ...insertUser, 
      id, 
      stripeCustomerId: null, 
      stripeSubscriptionId: null,
      email: insertUser.email || null,
      role: insertUser.role || null,
      fullName: insertUser.fullName || null
    };
    this.users.set(id, user);
    return user;
  }

  async updateStripeCustomerId(id: number, customerId: string): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error("User not found");
    }
    const updatedUser = { ...user, stripeCustomerId: customerId };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserStripeInfo(id: number, info: { customerId: string, subscriptionId: string }): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error("User not found");
    }
    const updatedUser = { 
      ...user, 
      stripeCustomerId: info.customerId, 
      stripeSubscriptionId: info.subscriptionId 
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Project methods
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = this.projectCurrentId++;
    const newProject: Project = { 
      ...project, 
      id,
      progress: project.progress ?? null,
      dueDate: project.dueDate ?? null
    };
    this.projects.set(id, newProject);
    return newProject;
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project> {
    const existingProject = await this.getProject(id);
    if (!existingProject) {
      throw new Error("Project not found");
    }
    const updatedProject = { ...existingProject, ...project };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  // Daily Report methods
  async getDailyReports(): Promise<DailyReport[]> {
    return Array.from(this.dailyReports.values());
  }

  async getDailyReportsByProject(projectId: number): Promise<DailyReport[]> {
    return Array.from(this.dailyReports.values()).filter(
      (report) => report.projectId === projectId
    );
  }

  async getDailyReport(id: number): Promise<DailyReport | undefined> {
    return this.dailyReports.get(id);
  }

  async createDailyReport(report: InsertDailyReport): Promise<DailyReport> {
    const id = this.reportCurrentId++;
    const newReport: DailyReport = { 
      ...report, 
      id, 
      createdAt: new Date(),
      notes: report.notes || null,
      materials: report.materials || null,
      equipment: report.equipment || null,
      safety: report.safety || null,
      updatedAt: null,
      status: report.status || null,
      progress: report.progress || null,
      weather: report.weather || null
    };
    this.dailyReports.set(id, newReport);
    return newReport;
  }

  async updateDailyReport(id: number, report: Partial<InsertDailyReport>): Promise<DailyReport> {
    const existingReport = await this.getDailyReport(id);
    if (!existingReport) {
      throw new Error("Daily report not found");
    }
    const updatedReport = { 
      ...existingReport, 
      ...report,
      updatedAt: new Date()
    };
    this.dailyReports.set(id, updatedReport);
    return updatedReport;
  }

  // Attendance methods
  async getAttendanceRecords(): Promise<Attendance[]> {
    return Array.from(this.attendanceRecords.values());
  }

  async getAttendanceByProject(projectId: number): Promise<Attendance[]> {
    return Array.from(this.attendanceRecords.values()).filter(
      (record) => record.projectId === projectId
    );
  }

  async getAttendanceRecord(id: number): Promise<Attendance | undefined> {
    return this.attendanceRecords.get(id);
  }

  async createAttendanceRecord(record: InsertAttendance): Promise<Attendance> {
    const id = this.attendanceCurrentId++;
    const newRecord: Attendance = { 
      ...record, 
      id, 
      createdAt: new Date(),
      workers: record.workers || null
    };
    this.attendanceRecords.set(id, newRecord);
    return newRecord;
  }

  // Issue methods
  async getIssues(): Promise<Issue[]> {
    return Array.from(this.issues.values());
  }

  async getIssuesByProject(projectId: number): Promise<Issue[]> {
    return Array.from(this.issues.values()).filter(
      (issue) => issue.projectId === projectId
    );
  }

  async getIssue(id: number): Promise<Issue | undefined> {
    return this.issues.get(id);
  }

  async createIssue(issue: InsertIssue): Promise<Issue> {
    const id = this.issueCurrentId++;
    const newIssue: Issue = { 
      ...issue, 
      id, 
      createdAt: new Date(),
      description: issue.description || null,
      status: issue.status || null,
      priority: issue.priority || null,
      createdBy: issue.createdBy || null
    };
    this.issues.set(id, newIssue);
    return newIssue;
  }

  async updateIssue(id: number, issue: Partial<InsertIssue>): Promise<Issue> {
    const existingIssue = await this.getIssue(id);
    if (!existingIssue) {
      throw new Error("Issue not found");
    }
    const updatedIssue = { ...existingIssue, ...issue };
    this.issues.set(id, updatedIssue);
    return updatedIssue;
  }

  // Photo methods
  async getPhotos(): Promise<Photo[]> {
    return Array.from(this.photos.values());
  }

  async getPhotosByProject(projectId: number): Promise<Photo[]> {
    return Array.from(this.photos.values()).filter(
      (photo) => photo.projectId === projectId
    );
  }

  async getPhoto(id: number): Promise<Photo | undefined> {
    return this.photos.get(id);
  }

  async createPhoto(photo: InsertPhoto): Promise<Photo> {
    const id = this.photoCurrentId++;
    const newPhoto: Photo = { 
      ...photo, 
      id, 
      createdAt: new Date(),
      title: photo.title || null,
      description: photo.description || null,
      createdBy: photo.createdBy || null,
      reportId: photo.reportId || null
    };
    this.photos.set(id, newPhoto);
    return newPhoto;
  }

  // Blog methods
  async getBlogPosts(): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values());
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    return this.blogPosts.get(id);
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const id = this.blogPostCurrentId++;
    const newPost: BlogPost = { 
      ...post, 
      id, 
      createdAt: new Date(),
      status: post.status || null,
      createdBy: post.createdBy || null
    };
    this.blogPosts.set(id, newPost);
    return newPost;
  }

  async updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost> {
    const existingPost = await this.getBlogPost(id);
    if (!existingPost) {
      throw new Error("Blog post not found");
    }
    const updatedPost = { ...existingPost, ...post };
    this.blogPosts.set(id, updatedPost);
    return updatedPost;
  }

  async deleteBlogPost(id: number): Promise<void> {
    this.blogPosts.delete(id);
  }

  // Survey Question methods
  async getSurveyQuestions(): Promise<SurveyQuestion[]> {
    return Array.from(this.surveyQuestions.values());
  }

  async getSurveyQuestionsByCategory(category: string): Promise<SurveyQuestion[]> {
    return Array.from(this.surveyQuestions.values()).filter(
      (question) => question.category === category,
    );
  }

  async getSurveyQuestion(id: number): Promise<SurveyQuestion | undefined> {
    return this.surveyQuestions.get(id);
  }

  async createSurveyQuestion(question: InsertSurveyQuestion): Promise<SurveyQuestion> {
    const id = this.surveyQuestionCurrentId++;
    const newQuestion: SurveyQuestion = { 
      ...question, 
      id, 
      createdAt: new Date(),
      category: question.category || null,
      active: question.active !== undefined ? question.active : true
    };
    this.surveyQuestions.set(id, newQuestion);
    return newQuestion;
  }

  async updateSurveyQuestion(id: number, question: Partial<InsertSurveyQuestion>): Promise<SurveyQuestion> {
    const existingQuestion = await this.getSurveyQuestion(id);
    if (!existingQuestion) {
      throw new Error("Survey question not found");
    }
    const updatedQuestion = { ...existingQuestion, ...question };
    this.surveyQuestions.set(id, updatedQuestion);
    return updatedQuestion;
  }

  async deleteSurveyQuestion(id: number): Promise<void> {
    this.surveyQuestions.delete(id);
  }

  // Survey Response methods
  async getSurveyResponses(): Promise<SurveyResponse[]> {
    return Array.from(this.surveyResponses.values());
  }

  async getSurveyResponse(id: number): Promise<SurveyResponse | undefined> {
    return this.surveyResponses.get(id);
  }

  async createSurveyResponse(response: InsertSurveyResponse): Promise<SurveyResponse> {
    const id = this.surveyResponseCurrentId++;
    const newResponse: SurveyResponse = { 
      ...response, 
      id, 
      createdAt: new Date(),
      name: response.name || null,
      company: response.company || null,
      phone: response.phone || null
    };
    this.surveyResponses.set(id, newResponse);
    return newResponse;
  }

  // Survey Analytics methods
  async getSurveyAnalytics(): Promise<any> {
    const questions = await this.getSurveyQuestions();
    const responses = await this.getSurveyResponses();
    
    const responsesByDate = this.getResponsesByDate(responses);
    const questionAnalytics = this.getQuestionAnalytics(questions, responses);
    
    return {
      totalResponses: responses.length,
      responsesByDate,
      questionAnalytics
    };
  }

  async getSurveyAnalyticsByQuestionId(questionId: number): Promise<any> {
    const question = await this.getSurveyQuestion(questionId);
    
    if (!question) {
      throw new Error("Survey question not found");
    }
    
    const responses = await this.getSurveyResponses();
    
    return this.analyzeQuestion(question, responses);
  }

  private getResponsesByDate(responses: SurveyResponse[]): Record<string, number> {
    const result: Record<string, number> = {};
    
    responses.forEach(response => {
      if (response.createdAt) {
        const date = response.createdAt.toISOString().split('T')[0];
        result[date] = (result[date] || 0) + 1;
      }
    });
    
    return result;
  }

  private getQuestionAnalytics(questions: SurveyQuestion[], responses: SurveyResponse[]): any[] {
    return questions.map(question => this.analyzeQuestion(question, responses));
  }

  private analyzeQuestion(question: SurveyQuestion, responses: SurveyResponse[]): any {
    const relevantResponses = responses.filter(r => {
      if (!r.answers) return false;
      const answersObj = typeof r.answers === 'string' ? JSON.parse(r.answers as string) : r.answers;
      return answersObj && answersObj[`q${question.id}`] !== undefined;
    });
    
    const yesCount = relevantResponses.filter(r => {
      const answersObj = typeof r.answers === 'string' ? JSON.parse(r.answers as string) : r.answers;
      return answersObj[`q${question.id}`] === true;
    }).length;
    
    const totalResponses = relevantResponses.length;
    const yesPercentage = totalResponses ? Math.round((yesCount / totalResponses) * 100) : 0;
    const noCount = totalResponses - yesCount;
    const noPercentage = totalResponses ? Math.round((noCount / totalResponses) * 100) : 0;
    
    return {
      questionId: question.id,
      question: question.question,
      category: question.category || "General",
      totalResponses,
      yesCount,
      noCount,
      yesPercentage,
      noPercentage
    };
  }

  // Questionnaire methods
  async getQuestionnaires(): Promise<Questionnaire[]> {
    return Array.from(this.questionnaires.values());
  }

  async createQuestionnaire(questionnaire: InsertQuestionnaire): Promise<Questionnaire> {
    const id = this.questionnaireCurrentId++;
    const newQuestionnaire: Questionnaire = { ...questionnaire, id, createdAt: new Date() };
    this.questionnaires.set(id, newQuestionnaire);
    return newQuestionnaire;
  }

  // Email Campaign methods
  async getEmailCampaigns(): Promise<EmailCampaign[]> {
    return Array.from(this.emailCampaigns.values());
  }

  async getEmailCampaign(id: number): Promise<EmailCampaign | undefined> {
    return this.emailCampaigns.get(id);
  }

  async createEmailCampaign(campaign: InsertEmailCampaign): Promise<EmailCampaign> {
    const id = this.emailCampaignCurrentId++;
    const newCampaign: EmailCampaign = { 
      ...campaign, 
      id, 
      createdAt: new Date(),
      status: campaign.status || null,
      createdBy: campaign.createdBy || null,
      sentCount: campaign.sentCount || 0
    };
    this.emailCampaigns.set(id, newCampaign);
    return newCampaign;
  }

  async updateEmailCampaign(id: number, campaign: Partial<InsertEmailCampaign>): Promise<EmailCampaign> {
    const existingCampaign = await this.getEmailCampaign(id);
    if (!existingCampaign) {
      throw new Error("Email campaign not found");
    }
    const updatedCampaign = { 
      ...existingCampaign, 
      ...campaign,
      updatedAt: new Date()
    };
    this.emailCampaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }

  async getEmailCampaignStats(id: number): Promise<any> {
    const campaign = await this.getEmailCampaign(id);
    if (!campaign) {
      throw new Error("Email campaign not found");
    }
    
    const emails = Array.from(this.emails.values()).filter(
      email => email.campaignId === id
    );
    
    const sent = emails.filter(email => email.status === 'sent').length;
    const opened = emails.filter(email => email.opened_at !== null).length;
    const clicked = emails.filter(email => email.clicked_at !== null).length;
    const replied = emails.filter(email => email.replied_at !== null).length;
    
    return {
      id: campaign.id,
      name: campaign.name,
      sent,
      opened,
      clicked,
      replied,
      openRate: sent > 0 ? (opened / sent) * 100 : 0,
      clickRate: opened > 0 ? (clicked / opened) * 100 : 0,
      replyRate: sent > 0 ? (replied / sent) * 100 : 0
    };
  }
  
  async scheduleEmailCampaign(id: number, date: Date): Promise<EmailCampaign> {
    const campaign = await this.getEmailCampaign(id);
    if (!campaign) {
      throw new Error("Email campaign not found");
    }
    
    const updatedCampaign = { 
      ...campaign, 
      scheduledDate: date,
      status: 'scheduled',
      updatedAt: new Date()
    };
    
    this.emailCampaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }
  
  async pauseEmailCampaign(id: number): Promise<EmailCampaign> {
    const campaign = await this.getEmailCampaign(id);
    if (!campaign) {
      throw new Error("Email campaign not found");
    }
    
    const updatedCampaign = { 
      ...campaign, 
      status: 'paused',
      updatedAt: new Date()
    };
    
    this.emailCampaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }
  
  async resumeEmailCampaign(id: number): Promise<EmailCampaign> {
    const campaign = await this.getEmailCampaign(id);
    if (!campaign) {
      throw new Error("Email campaign not found");
    }
    
    const updatedCampaign = { 
      ...campaign, 
      status: campaign.scheduledDate && campaign.scheduledDate > new Date() ? 'scheduled' : 'active',
      updatedAt: new Date()
    };
    
    this.emailCampaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }
  
  // Contact methods
  async getContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values());
  }
  
  async getContact(id: number): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }
  
  async getContactByEmail(email: string): Promise<Contact | undefined> {
    return Array.from(this.contacts.values()).find(
      contact => contact.email === email
    );
  }
  
  async createContact(contact: InsertContact): Promise<Contact> {
    const id = this.contactCurrentId++;
    const newContact: Contact = {
      ...contact,
      id,
      created_at: new Date(),
      updated_at: null,
      status: contact.status || 'active',
      source: contact.source || null,
      notes: contact.notes || null,
      company: contact.company || null,
      position: contact.position || null,
      phone: contact.phone || null
    };
    this.contacts.set(id, newContact);
    return newContact;
  }
  
  async updateContact(id: number, contact: Partial<InsertContact>): Promise<Contact> {
    const existingContact = await this.getContact(id);
    if (!existingContact) {
      throw new Error("Contact not found");
    }
    const updatedContact = { 
      ...existingContact, 
      ...contact,
      updated_at: new Date()
    };
    this.contacts.set(id, updatedContact);
    return updatedContact;
  }
  
  async deleteContact(id: number): Promise<void> {
    this.contacts.delete(id);
  }
  
  // Email methods
  async getEmails(): Promise<Email[]> {
    return Array.from(this.emails.values());
  }
  
  async getEmailsByContact(contactId: number): Promise<Email[]> {
    return Array.from(this.emails.values()).filter(
      email => email.contactId === contactId
    );
  }
  
  async getEmailsByCampaign(campaignId: number): Promise<Email[]> {
    return Array.from(this.emails.values()).filter(
      email => email.campaignId === campaignId
    );
  }
  
  async getEmail(id: number): Promise<Email | undefined> {
    return this.emails.get(id);
  }
  
  async createEmail(email: InsertEmail): Promise<Email> {
    const id = this.emailCurrentId++;
    const newEmail: Email = {
      ...email,
      id,
      created_at: new Date(),
      sent_at: null,
      opened_at: null,
      clicked_at: null,
      replied_at: null,
      status: email.status || 'draft',
      direction: email.direction || 'outbound',
      generated_by_ai: email.generated_by_ai || false,
      reviewed_by_id: email.reviewed_by_id || null,
      ai_prompt: email.ai_prompt || null
    };
    this.emails.set(id, newEmail);
    return newEmail;
  }
  
  async updateEmail(id: number, email: Partial<InsertEmail>): Promise<Email> {
    const existingEmail = await this.getEmail(id);
    if (!existingEmail) {
      throw new Error("Email not found");
    }
    const updatedEmail = { ...existingEmail, ...email };
    this.emails.set(id, updatedEmail);
    return updatedEmail;
  }
  
  async markEmailAsSent(id: number): Promise<Email> {
    const email = await this.getEmail(id);
    if (!email) {
      throw new Error("Email not found");
    }
    const updatedEmail = { 
      ...email, 
      status: 'sent',
      sent_at: new Date()
    };
    this.emails.set(id, updatedEmail);
    return updatedEmail;
  }
  
  async markEmailAsOpened(id: number): Promise<Email> {
    const email = await this.getEmail(id);
    if (!email) {
      throw new Error("Email not found");
    }
    const updatedEmail = { 
      ...email, 
      opened_at: new Date()
    };
    this.emails.set(id, updatedEmail);
    
    // Update campaign stats if part of a campaign
    if (email.campaignId) {
      const campaign = await this.getEmailCampaign(email.campaignId);
      if (campaign) {
        const updatedCampaign = {
          ...campaign,
          openCount: (campaign.openCount || 0) + 1
        };
        this.emailCampaigns.set(campaign.id, updatedCampaign);
      }
    }
    
    return updatedEmail;
  }
  
  async markEmailAsClicked(id: number): Promise<Email> {
    const email = await this.getEmail(id);
    if (!email) {
      throw new Error("Email not found");
    }
    const updatedEmail = { 
      ...email, 
      clicked_at: new Date()
    };
    this.emails.set(id, updatedEmail);
    
    // Update campaign stats if part of a campaign
    if (email.campaignId) {
      const campaign = await this.getEmailCampaign(email.campaignId);
      if (campaign) {
        const updatedCampaign = {
          ...campaign,
          clickCount: (campaign.clickCount || 0) + 1
        };
        this.emailCampaigns.set(campaign.id, updatedCampaign);
      }
    }
    
    return updatedEmail;
  }
  
  async markEmailAsReplied(id: number): Promise<Email> {
    const email = await this.getEmail(id);
    if (!email) {
      throw new Error("Email not found");
    }
    const updatedEmail = { 
      ...email, 
      replied_at: new Date()
    };
    this.emails.set(id, updatedEmail);
    return updatedEmail;
  }
  
  async generateEmailWithAI(contactId: number, promptTemplate: string): Promise<Email> {
    const contact = await this.getContact(contactId);
    if (!contact) {
      throw new Error("Contact not found");
    }
    
    // This is where we would integrate with the Gemini API to generate content
    // For now, we'll just create a placeholder email
    
    const newEmail: InsertEmail = {
      contact_id: contactId,
      campaignId: null,
      subject: `Hello ${contact.first_name}`,
      content: `Dear ${contact.first_name},\n\nThis is a placeholder for AI-generated content based on the prompt: ${promptTemplate}\n\nBest regards,\nThe Team`,
      status: 'draft',
      direction: 'outbound',
      generated_by_ai: true,
      ai_prompt: promptTemplate
    };
    
    return this.createEmail(newEmail);
  }
  
  async reviewAndApproveEmail(id: number, reviewerId: number, content?: string): Promise<Email> {
    const email = await this.getEmail(id);
    if (!email) {
      throw new Error("Email not found");
    }
    
    const updatedEmail = { 
      ...email, 
      status: 'approved',
      reviewed_by_id: reviewerId,
      content: content || email.content
    };
    
    this.emails.set(id, updatedEmail);
    return updatedEmail;
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: Store;

  constructor() {
    // Initialize PostgreSQL session store
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateStripeCustomerId(id: number, customerId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ stripeCustomerId: customerId })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserStripeInfo(id: number, info: { customerId: string, subscriptionId: string }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        stripeCustomerId: info.customerId,
        stripeSubscriptionId: info.subscriptionId
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Project methods
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects);
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project> {
    const [updatedProject] = await db
      .update(projects)
      .set(project)
      .where(eq(projects.id, id))
      .returning();
    
    if (!updatedProject) {
      throw new Error("Project not found");
    }
    
    return updatedProject;
  }

  // Daily Report methods
  async getDailyReports(): Promise<DailyReport[]> {
    return await db.select().from(dailyReports);
  }

  async getDailyReportsByProject(projectId: number): Promise<DailyReport[]> {
    return await db
      .select()
      .from(dailyReports)
      .where(eq(dailyReports.projectId, projectId));
  }

  async getDailyReport(id: number): Promise<DailyReport | undefined> {
    const [report] = await db.select().from(dailyReports).where(eq(dailyReports.id, id));
    return report;
  }

  async createDailyReport(report: InsertDailyReport): Promise<DailyReport> {
    const [newReport] = await db.insert(dailyReports).values(report).returning();
    return newReport;
  }

  async updateDailyReport(id: number, report: Partial<InsertDailyReport>): Promise<DailyReport> {
    const [updatedReport] = await db
      .update(dailyReports)
      .set(report)
      .where(eq(dailyReports.id, id))
      .returning();
    
    if (!updatedReport) {
      throw new Error("Daily report not found");
    }
    
    return updatedReport;
  }

  // Attendance methods
  async getAttendanceRecords(): Promise<Attendance[]> {
    return await db.select().from(attendance);
  }

  async getAttendanceByProject(projectId: number): Promise<Attendance[]> {
    return await db
      .select()
      .from(attendance)
      .where(eq(attendance.projectId, projectId));
  }

  async getAttendanceRecord(id: number): Promise<Attendance | undefined> {
    const [record] = await db.select().from(attendance).where(eq(attendance.id, id));
    return record;
  }

  async createAttendanceRecord(record: InsertAttendance): Promise<Attendance> {
    const [newRecord] = await db.insert(attendance).values(record).returning();
    return newRecord;
  }

  // Issue methods
  async getIssues(): Promise<Issue[]> {
    return await db.select().from(issues);
  }

  async getIssuesByProject(projectId: number): Promise<Issue[]> {
    return await db
      .select()
      .from(issues)
      .where(eq(issues.projectId, projectId));
  }

  async getIssue(id: number): Promise<Issue | undefined> {
    const [issue] = await db.select().from(issues).where(eq(issues.id, id));
    return issue;
  }

  async createIssue(issue: InsertIssue): Promise<Issue> {
    const [newIssue] = await db.insert(issues).values(issue).returning();
    return newIssue;
  }

  async updateIssue(id: number, issue: Partial<InsertIssue>): Promise<Issue> {
    const [updatedIssue] = await db
      .update(issues)
      .set(issue)
      .where(eq(issues.id, id))
      .returning();
    
    if (!updatedIssue) {
      throw new Error("Issue not found");
    }
    
    return updatedIssue;
  }

  // Photo methods
  async getPhotos(): Promise<Photo[]> {
    return await db.select().from(photos);
  }

  async getPhotosByProject(projectId: number): Promise<Photo[]> {
    return await db
      .select()
      .from(photos)
      .where(eq(photos.projectId, projectId));
  }

  async getPhoto(id: number): Promise<Photo | undefined> {
    const [photo] = await db.select().from(photos).where(eq(photos.id, id));
    return photo;
  }

  async createPhoto(photo: InsertPhoto): Promise<Photo> {
    const [newPhoto] = await db.insert(photos).values(photo).returning();
    return newPhoto;
  }

  // Blog methods
  async getBlogPosts(): Promise<BlogPost[]> {
    return await db.select().from(blogPosts);
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post;
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const [newPost] = await db.insert(blogPosts).values(post).returning();
    return newPost;
  }

  async updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost> {
    const [updatedPost] = await db
      .update(blogPosts)
      .set(post)
      .where(eq(blogPosts.id, id))
      .returning();
    
    if (!updatedPost) {
      throw new Error("Blog post not found");
    }
    
    return updatedPost;
  }

  async deleteBlogPost(id: number): Promise<void> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }

  // Survey Question methods
  async getSurveyQuestions(): Promise<SurveyQuestion[]> {
    return await db.select().from(surveyQuestions);
  }

  async getSurveyQuestionsByCategory(category: string): Promise<SurveyQuestion[]> {
    return await db
      .select()
      .from(surveyQuestions)
      .where(eq(surveyQuestions.category, category));
  }

  async getSurveyQuestion(id: number): Promise<SurveyQuestion | undefined> {
    const [question] = await db.select().from(surveyQuestions).where(eq(surveyQuestions.id, id));
    return question;
  }

  async createSurveyQuestion(question: InsertSurveyQuestion): Promise<SurveyQuestion> {
    const [newQuestion] = await db.insert(surveyQuestions).values(question).returning();
    return newQuestion;
  }

  async updateSurveyQuestion(id: number, question: Partial<InsertSurveyQuestion>): Promise<SurveyQuestion> {
    const [updatedQuestion] = await db
      .update(surveyQuestions)
      .set(question)
      .where(eq(surveyQuestions.id, id))
      .returning();
    
    if (!updatedQuestion) {
      throw new Error("Survey question not found");
    }
    
    return updatedQuestion;
  }

  async deleteSurveyQuestion(id: number): Promise<void> {
    await db.delete(surveyQuestions).where(eq(surveyQuestions.id, id));
  }

  // Survey Response methods
  async getSurveyResponses(): Promise<SurveyResponse[]> {
    return await db.select().from(surveyResponses);
  }

  async getSurveyResponse(id: number): Promise<SurveyResponse | undefined> {
    const [response] = await db.select().from(surveyResponses).where(eq(surveyResponses.id, id));
    return response;
  }

  async createSurveyResponse(response: InsertSurveyResponse): Promise<SurveyResponse> {
    const [newResponse] = await db.insert(surveyResponses).values(response).returning();
    return newResponse;
  }

  // Survey Analytics methods
  async getSurveyAnalytics(): Promise<any> {
    const questions = await this.getSurveyQuestions();
    const responses = await this.getSurveyResponses();
    
    const responsesByDate = this.getResponsesByDate(responses);
    const questionAnalytics = this.getQuestionAnalytics(questions, responses);
    
    return {
      totalResponses: responses.length,
      responsesByDate,
      questionAnalytics
    };
  }

  async getSurveyAnalyticsByQuestionId(questionId: number): Promise<any> {
    const question = await this.getSurveyQuestion(questionId);
    
    if (!question) {
      throw new Error("Survey question not found");
    }
    
    const responses = await this.getSurveyResponses();
    
    return this.analyzeQuestion(question, responses);
  }

  private getResponsesByDate(responses: SurveyResponse[]): Record<string, number> {
    const result: Record<string, number> = {};
    
    responses.forEach(response => {
      if (response.createdAt) {
        const date = response.createdAt.toISOString().split('T')[0];
        result[date] = (result[date] || 0) + 1;
      }
    });
    
    return result;
  }

  private getQuestionAnalytics(questions: SurveyQuestion[], responses: SurveyResponse[]): any[] {
    return questions.map(question => this.analyzeQuestion(question, responses));
  }

  private analyzeQuestion(question: SurveyQuestion, responses: SurveyResponse[]): any {
    const relevantResponses = responses.filter(r => {
      if (!r.answers) return false;
      const answersObj = typeof r.answers === 'string' ? JSON.parse(r.answers as string) : r.answers;
      return answersObj && answersObj[`q${question.id}`] !== undefined;
    });
    
    const yesCount = relevantResponses.filter(r => {
      const answersObj = typeof r.answers === 'string' ? JSON.parse(r.answers as string) : r.answers;
      return answersObj[`q${question.id}`] === true;
    }).length;
    
    const totalResponses = relevantResponses.length;
    const yesPercentage = totalResponses ? Math.round((yesCount / totalResponses) * 100) : 0;
    const noCount = totalResponses - yesCount;
    const noPercentage = totalResponses ? Math.round((noCount / totalResponses) * 100) : 0;
    
    return {
      questionId: question.id,
      question: question.question,
      category: question.category || "General",
      totalResponses,
      yesCount,
      noCount,
      yesPercentage,
      noPercentage
    };
  }

  // Questionnaire methods
  async getQuestionnaires(): Promise<Questionnaire[]> {
    return await db.select().from(questionnaires);
  }

  async createQuestionnaire(questionnaire: InsertQuestionnaire): Promise<Questionnaire> {
    const [newQuestionnaire] = await db.insert(questionnaires).values(questionnaire).returning();
    return newQuestionnaire;
  }

  // Email Campaign methods
  async getEmailCampaigns(): Promise<EmailCampaign[]> {
    return await db.select().from(emailCampaigns);
  }

  async getEmailCampaign(id: number): Promise<EmailCampaign | undefined> {
    const [campaign] = await db.select().from(emailCampaigns).where(eq(emailCampaigns.id, id));
    return campaign;
  }

  async createEmailCampaign(campaign: InsertEmailCampaign): Promise<EmailCampaign> {
    const [newCampaign] = await db.insert(emailCampaigns).values(campaign).returning();
    return newCampaign;
  }

  async updateEmailCampaign(id: number, campaign: Partial<InsertEmailCampaign>): Promise<EmailCampaign> {
    const [updatedCampaign] = await db
      .update(emailCampaigns)
      .set(campaign)
      .where(eq(emailCampaigns.id, id))
      .returning();
    
    if (!updatedCampaign) {
      throw new Error("Email campaign not found");
    }
    
    return updatedCampaign;
  }

  async getEmailCampaignStats(id: number): Promise<any> {
    const campaign = await this.getEmailCampaign(id);
    if (!campaign) {
      throw new Error("Email campaign not found");
    }
    
    const emailList = await db
      .select()
      .from(emails)
      .where(eq(emails.campaignId, id));
    
    const sent = emailList.filter(email => email.status === 'sent').length;
    const opened = emailList.filter(email => email.opened_at !== null).length;
    const clicked = emailList.filter(email => email.clicked_at !== null).length;
    const replied = emailList.filter(email => email.replied_at !== null).length;
    
    return {
      id: campaign.id,
      name: campaign.name,
      sent,
      opened,
      clicked,
      replied,
      openRate: sent > 0 ? (opened / sent) * 100 : 0,
      clickRate: opened > 0 ? (clicked / opened) * 100 : 0,
      replyRate: sent > 0 ? (replied / sent) * 100 : 0
    };
  }
  
  async scheduleEmailCampaign(id: number, date: Date): Promise<EmailCampaign> {
    const [updatedCampaign] = await db
      .update(emailCampaigns)
      .set({ 
        scheduledDate: date,
        status: 'scheduled',
        updatedAt: new Date()
      })
      .where(eq(emailCampaigns.id, id))
      .returning();
    
    if (!updatedCampaign) {
      throw new Error("Email campaign not found");
    }
    
    return updatedCampaign;
  }
  
  async pauseEmailCampaign(id: number): Promise<EmailCampaign> {
    const [updatedCampaign] = await db
      .update(emailCampaigns)
      .set({ 
        status: 'paused',
        updatedAt: new Date()
      })
      .where(eq(emailCampaigns.id, id))
      .returning();
    
    if (!updatedCampaign) {
      throw new Error("Email campaign not found");
    }
    
    return updatedCampaign;
  }
  
  async resumeEmailCampaign(id: number): Promise<EmailCampaign> {
    const campaign = await this.getEmailCampaign(id);
    if (!campaign) {
      throw new Error("Email campaign not found");
    }
    
    const status = campaign.scheduledDate && new Date(campaign.scheduledDate) > new Date() 
      ? 'scheduled' 
      : 'active';
    
    const [updatedCampaign] = await db
      .update(emailCampaigns)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(eq(emailCampaigns.id, id))
      .returning();
    
    if (!updatedCampaign) {
      throw new Error("Email campaign not found");
    }
    
    return updatedCampaign;
  }
  
  // Contact methods
  async getContacts(): Promise<Contact[]> {
    return await db.select().from(contacts);
  }
  
  async getContact(id: number): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
    return contact;
  }
  
  async getContactByEmail(email: string): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.email, email));
    return contact;
  }
  
  async createContact(contact: InsertContact): Promise<Contact> {
    const [newContact] = await db.insert(contacts).values(contact).returning();
    return newContact;
  }
  
  async updateContact(id: number, contact: Partial<InsertContact>): Promise<Contact> {
    const [updatedContact] = await db
      .update(contacts)
      .set({
        ...contact,
        updated_at: new Date()
      })
      .where(eq(contacts.id, id))
      .returning();
    
    if (!updatedContact) {
      throw new Error("Contact not found");
    }
    
    return updatedContact;
  }
  
  async deleteContact(id: number): Promise<void> {
    await db.delete(contacts).where(eq(contacts.id, id));
  }
  
  // Email methods
  async getEmails(): Promise<Email[]> {
    return await db.select().from(emails);
  }
  
  async getEmailsByContact(contactId: number): Promise<Email[]> {
    return await db
      .select()
      .from(emails)
      .where(eq(emails.contact_id, contactId));
  }
  
  async getEmailsByCampaign(campaignId: number): Promise<Email[]> {
    return await db
      .select()
      .from(emails)
      .where(eq(emails.campaignId, campaignId));
  }
  
  async getEmail(id: number): Promise<Email | undefined> {
    const [email] = await db.select().from(emails).where(eq(emails.id, id));
    return email;
  }
  
  async createEmail(email: InsertEmail): Promise<Email> {
    const [newEmail] = await db.insert(emails).values(email).returning();
    return newEmail;
  }
  
  async updateEmail(id: number, email: Partial<InsertEmail>): Promise<Email> {
    const [updatedEmail] = await db
      .update(emails)
      .set(email)
      .where(eq(emails.id, id))
      .returning();
    
    if (!updatedEmail) {
      throw new Error("Email not found");
    }
    
    return updatedEmail;
  }
  
  async markEmailAsSent(id: number): Promise<Email> {
    const [updatedEmail] = await db
      .update(emails)
      .set({
        status: 'sent',
        sent_at: new Date()
      })
      .where(eq(emails.id, id))
      .returning();
    
    if (!updatedEmail) {
      throw new Error("Email not found");
    }
    
    return updatedEmail;
  }
  
  async markEmailAsOpened(id: number): Promise<Email> {
    const email = await this.getEmail(id);
    if (!email) {
      throw new Error("Email not found");
    }
    
    const [updatedEmail] = await db
      .update(emails)
      .set({
        opened_at: new Date()
      })
      .where(eq(emails.id, id))
      .returning();
    
    // Update campaign stats if part of a campaign
    if (email.campaignId) {
      await db
        .update(emailCampaigns)
        .set({
          openCount: sql`${emailCampaigns.openCount} + 1`
        })
        .where(eq(emailCampaigns.id, email.campaignId));
    }
    
    return updatedEmail;
  }
  
  async markEmailAsClicked(id: number): Promise<Email> {
    const email = await this.getEmail(id);
    if (!email) {
      throw new Error("Email not found");
    }
    
    const [updatedEmail] = await db
      .update(emails)
      .set({
        clicked_at: new Date()
      })
      .where(eq(emails.id, id))
      .returning();
    
    // Update campaign stats if part of a campaign
    if (email.campaignId) {
      await db
        .update(emailCampaigns)
        .set({
          clickCount: sql`${emailCampaigns.clickCount} + 1`
        })
        .where(eq(emailCampaigns.id, email.campaignId));
    }
    
    return updatedEmail;
  }
  
  async markEmailAsReplied(id: number): Promise<Email> {
    const [updatedEmail] = await db
      .update(emails)
      .set({
        replied_at: new Date()
      })
      .where(eq(emails.id, id))
      .returning();
    
    if (!updatedEmail) {
      throw new Error("Email not found");
    }
    
    return updatedEmail;
  }
  
  async generateEmailWithAI(contactId: number, promptTemplate: string): Promise<Email> {
    const contact = await this.getContact(contactId);
    if (!contact) {
      throw new Error("Contact not found");
    }
    
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    
    try {
      // Initialize the Google Generative AI API with the key from environment
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API key not found in environment variables");
      }
      
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      // Replace placeholders in template with contact info
      let personalizedPrompt = promptTemplate
        .replace(/\{name\}/g, contact.firstName || "")
        .replace(/\{firstName\}/g, contact.firstName || "")
        .replace(/\{lastName\}/g, contact.lastName || "")
        .replace(/\{company\}/g, contact.company || "")
        .replace(/\{position\}/g, contact.position || "");
      
      // Ask Gemini to generate email content
      const result = await model.generateContent(personalizedPrompt);
      const response = await result.response;
      const emailContent = response.text();
      
      // Extract subject from content or create default one
      let subject = `Email for ${contact.firstName || contact.email}`;
      // Try to extract subject from the generated text (assuming format like "Subject: XYZ\n\nDear...")
      const subjectMatch = emailContent.match(/Subject:([^\n]+)/i);
      if (subjectMatch && subjectMatch[1]) {
        subject = subjectMatch[1].trim();
      }
      
      // Create new email
      const newEmail: InsertEmail = {
        contactId: contactId,
        campaignId: null,
        subject: subject,
        content: emailContent,
        status: 'draft',
        direction: 'outbound',
        generatedByAI: true,
        aiPrompt: promptTemplate
      };
      
      return this.createEmail(newEmail);
    } catch (error) {
      console.error("Error generating email with AI:", error);
      
      // Fallback to a basic email if AI generation fails
      const newEmail: InsertEmail = {
        contactId: contactId,
        campaignId: null,
        subject: `Email for ${contact.firstName || contact.email}`,
        content: `Dear ${contact.firstName || "customer"},\n\nThis is a fallback email as we encountered an issue with AI generation.\n\nBest regards,\nThe Team`,
        status: 'draft',
        direction: 'outbound',
        generatedByAI: true,
        aiPrompt: promptTemplate
      };
      
      return this.createEmail(newEmail);
    }
  }
  
  async reviewAndApproveEmail(id: number, reviewerId: number, content?: string): Promise<Email> {
    const email = await this.getEmail(id);
    if (!email) {
      throw new Error("Email not found");
    }
    
    const [updatedEmail] = await db
      .update(emails)
      .set({
        status: 'approved',
        reviewedById: reviewerId,
        content: content || email.content
      })
      .where(eq(emails.id, id))
      .returning();
    
    return updatedEmail;
  }
}

// Use database storage
export const storage = new DatabaseStorage();