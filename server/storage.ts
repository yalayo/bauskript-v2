import { 
  users, type User, type InsertUser,
  projects, type Project, type InsertProject,
  dailyReports, type DailyReport, type InsertDailyReport,
  attendance, type Attendance, type InsertAttendance,
  issues, type Issue, type InsertIssue,
  photos, type Photo, type InsertPhoto,
  blogPosts, type BlogPost, type InsertBlogPost,
  questionnaires, type Questionnaire, type InsertQuestionnaire,
  emailCampaigns, type EmailCampaign, type InsertEmailCampaign
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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

  // Questionnaire methods
  getQuestionnaires(): Promise<Questionnaire[]>;
  createQuestionnaire(questionnaire: InsertQuestionnaire): Promise<Questionnaire>;

  // Email Campaign methods
  getEmailCampaigns(): Promise<EmailCampaign[]>;
  getEmailCampaign(id: number): Promise<EmailCampaign | undefined>;
  createEmailCampaign(campaign: InsertEmailCampaign): Promise<EmailCampaign>;
  updateEmailCampaign(id: number, campaign: Partial<InsertEmailCampaign>): Promise<EmailCampaign>;

  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private dailyReports: Map<number, DailyReport>;
  private attendanceRecords: Map<number, Attendance>;
  private issues: Map<number, Issue>;
  private photos: Map<number, Photo>;
  private blogPosts: Map<number, BlogPost>;
  private questionnaires: Map<number, Questionnaire>;
  private emailCampaigns: Map<number, EmailCampaign>;

  private userCurrentId: number;
  private projectCurrentId: number;
  private reportCurrentId: number;
  private attendanceCurrentId: number;
  private issueCurrentId: number;
  private photoCurrentId: number;
  private blogPostCurrentId: number;
  private questionnaireCurrentId: number;
  private emailCampaignCurrentId: number;

  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.dailyReports = new Map();
    this.attendanceRecords = new Map();
    this.issues = new Map();
    this.photos = new Map();
    this.blogPosts = new Map();
    this.questionnaires = new Map();
    this.emailCampaigns = new Map();

    this.userCurrentId = 1;
    this.projectCurrentId = 1;
    this.reportCurrentId = 1;
    this.attendanceCurrentId = 1;
    this.issueCurrentId = 1;
    this.photoCurrentId = 1;
    this.blogPostCurrentId = 1;
    this.questionnaireCurrentId = 1;
    this.emailCampaignCurrentId = 1;

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
    const user: User = { ...insertUser, id };
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
    const newProject: Project = { ...project, id };
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
    const newReport: DailyReport = { ...report, id, createdAt: new Date() };
    this.dailyReports.set(id, newReport);
    return newReport;
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
    const newRecord: Attendance = { ...record, id, createdAt: new Date() };
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
    const newIssue: Issue = { ...issue, id, createdAt: new Date() };
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
    const newPhoto: Photo = { ...photo, id, createdAt: new Date() };
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
    const newPost: BlogPost = { ...post, id, createdAt: new Date() };
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
      sentCount: 0,
      createdAt: new Date() 
    };
    this.emailCampaigns.set(id, newCampaign);
    return newCampaign;
  }

  async updateEmailCampaign(id: number, campaign: Partial<InsertEmailCampaign>): Promise<EmailCampaign> {
    const existingCampaign = await this.getEmailCampaign(id);
    if (!existingCampaign) {
      throw new Error("Email campaign not found");
    }
    const updatedCampaign = { ...existingCampaign, ...campaign };
    this.emailCampaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }
}

export const storage = new MemStorage();
