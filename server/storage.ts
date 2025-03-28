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
  surveyResponses, type SurveyResponse, type InsertSurveyResponse
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
  private surveyQuestions: Map<number, SurveyQuestion>;
  private surveyResponses: Map<number, SurveyResponse>;
  private questionnaires: Map<number, Questionnaire>;
  private emailCampaigns: Map<number, EmailCampaign>;

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

  sessionStore: session.SessionStore;

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
    const newReport: DailyReport = { 
      ...report, 
      id, 
      createdAt: new Date(),
      notes: report.notes || null,
      materials: report.materials || null,
      equipment: report.equipment || null,
      safety: report.safety || null,
      updatedAt: null
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

  async deleteBlogPost(id: number): Promise<void> {
    const existingPost = await this.getBlogPost(id);
    if (!existingPost) {
      throw new Error("Blog post not found");
    }
    this.blogPosts.delete(id);
  }

  // Survey Question methods
  async getSurveyQuestions(): Promise<SurveyQuestion[]> {
    return Array.from(this.surveyQuestions.values());
  }

  async getSurveyQuestionsByCategory(category: string): Promise<SurveyQuestion[]> {
    return Array.from(this.surveyQuestions.values()).filter(
      (question) => question.category === category
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
      createdAt: new Date() 
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
    const existingQuestion = await this.getSurveyQuestion(id);
    if (!existingQuestion) {
      throw new Error("Survey question not found");
    }
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
      createdAt: new Date() 
    };
    this.surveyResponses.set(id, newResponse);
    return newResponse;
  }

  // Survey Analytics methods
  async getSurveyAnalytics(): Promise<any> {
    const responses = await this.getSurveyResponses();
    const questions = await this.getSurveyQuestions();
    
    // Initialize analytics object
    const analytics = {
      totalResponses: responses.length,
      responsesByDate: this.getResponsesByDate(responses),
      questionAnalytics: this.getQuestionAnalytics(questions, responses)
    };
    
    return analytics;
  }

  async getSurveyAnalyticsByQuestionId(questionId: number): Promise<any> {
    const responses = await this.getSurveyResponses();
    const question = await this.getSurveyQuestion(questionId);
    
    if (!question) {
      throw new Error("Survey question not found");
    }
    
    // Count yes/no responses for this specific question
    const analytics = this.analyzeQuestion(question, responses);
    
    return analytics;
  }

  private getResponsesByDate(responses: SurveyResponse[]): Record<string, number> {
    const responsesByDate: Record<string, number> = {};
    
    responses.forEach(response => {
      const date = new Date(response.createdAt).toISOString().split('T')[0];
      responsesByDate[date] = (responsesByDate[date] || 0) + 1;
    });
    
    return responsesByDate;
  }

  private getQuestionAnalytics(questions: SurveyQuestion[], responses: SurveyResponse[]): any[] {
    return questions.map(question => this.analyzeQuestion(question, responses));
  }

  private analyzeQuestion(question: SurveyQuestion, responses: SurveyResponse[]): any {
    let yesCount = 0;
    let noCount = 0;
    let totalResponses = 0;
    
    responses.forEach(response => {
      const answer = (response.answers as any[]).find(a => a.questionId === question.id);
      if (answer) {
        totalResponses++;
        if (answer.answer === true) {
          yesCount++;
        } else {
          noCount++;
        }
      }
    });
    
    return {
      questionId: question.id,
      question: question.question,
      category: question.category,
      totalResponses,
      yesCount,
      noCount,
      yesPercentage: totalResponses ? Math.round((yesCount / totalResponses) * 100) : 0,
      noPercentage: totalResponses ? Math.round((noCount / totalResponses) * 100) : 0
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
