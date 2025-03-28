import { db } from "./server/db";
import { surveyQuestions } from "./shared/schema";

async function seedSurveyQuestions() {
  // Check if questions already exist
  const existingQuestions = await db.select().from(surveyQuestions);
  
  if (existingQuestions.length > 0) {
    console.log(`${existingQuestions.length} survey questions already exist. Skipping seeding.`);
    return;
  }
  
  // Categories
  const CATEGORIES = {
    SITE_MANAGEMENT: "Site Management",
    COMMUNICATION: "Communication",
    REPORTING: "Reporting",
    SAFETY: "Safety",
    PRODUCTIVITY: "Productivity",
  };

  // Define the 20 questions with categories
  const questions = [
    // Site Management
    {
      question: "Do you struggle to keep track of workers' attendance on site?",
      category: CATEGORIES.SITE_MANAGEMENT,
      orderIndex: 1,
    },
    {
      question: "Is it difficult to maintain an overview of multiple construction sites simultaneously?",
      category: CATEGORIES.SITE_MANAGEMENT,
      orderIndex: 2,
    },
    {
      question: "Do you currently use a digital system to manage your construction sites?",
      category: CATEGORIES.SITE_MANAGEMENT,
      orderIndex: 3,
    },
    {
      question: "Do you find it challenging to coordinate equipment and material deliveries?",
      category: CATEGORIES.SITE_MANAGEMENT,
      orderIndex: 4,
    },
    
    // Communication
    {
      question: "Do you experience communication gaps between office and field staff?",
      category: CATEGORIES.COMMUNICATION,
      orderIndex: 5,
    },
    {
      question: "Is it difficult to maintain consistent communication with subcontractors?",
      category: CATEGORIES.COMMUNICATION,
      orderIndex: 6,
    },
    {
      question: "Do you need to improve how you communicate project updates to clients?",
      category: CATEGORIES.COMMUNICATION,
      orderIndex: 7,
    },
    {
      question: "Do you spend excessive time in meetings that could be handled through better communication tools?",
      category: CATEGORIES.COMMUNICATION,
      orderIndex: 8,
    },
    
    // Reporting
    {
      question: "Do you struggle to generate accurate and timely project reports?",
      category: CATEGORIES.REPORTING,
      orderIndex: 9,
    },
    {
      question: "Is it difficult to document and track site issues and resolutions?",
      category: CATEGORIES.REPORTING,
      orderIndex: 10,
    },
    {
      question: "Would you benefit from automated daily/weekly project reports?",
      category: CATEGORIES.REPORTING,
      orderIndex: 11,
    },
    {
      question: "Do you have trouble maintaining comprehensive photo documentation of project progress?",
      category: CATEGORIES.REPORTING,
      orderIndex: 12,
    },
    
    // Safety
    {
      question: "Do you find it challenging to ensure safety compliance documentation is up to date?",
      category: CATEGORIES.SAFETY,
      orderIndex: 13,
    },
    {
      question: "Would digital safety checklists and incident reporting be valuable to your operation?",
      category: CATEGORIES.SAFETY,
      orderIndex: 14,
    },
    {
      question: "Do you struggle to track and manage safety certifications for workers and subcontractors?",
      category: CATEGORIES.SAFETY,
      orderIndex: 15,
    },
    {
      question: "Is it difficult to ensure that everyone on site is aware of the latest safety protocols?",
      category: CATEGORIES.SAFETY,
      orderIndex: 16,
    },
    
    // Productivity
    {
      question: "Do you have difficulty tracking productivity rates across different project tasks?",
      category: CATEGORIES.PRODUCTIVITY,
      orderIndex: 17,
    },
    {
      question: "Would real-time progress tracking help you identify bottlenecks earlier?",
      category: CATEGORIES.PRODUCTIVITY,
      orderIndex: 18,
    },
    {
      question: "Do you find it difficult to compare planned versus actual progress?",
      category: CATEGORIES.PRODUCTIVITY,
      orderIndex: 19,
    },
    {
      question: "Would you benefit from better resource allocation tools to optimize workforce efficiency?",
      category: CATEGORIES.PRODUCTIVITY,
      orderIndex: 20,
    },
  ];

  // Insert the questions
  await db.insert(surveyQuestions).values(questions);
  
  console.log(`Successfully seeded ${questions.length} survey questions.`);
}

// Run the seeding function
seedSurveyQuestions()
  .then(() => {
    console.log("Seeding complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error seeding survey questions:", error);
    process.exit(1);
  });