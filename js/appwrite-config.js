/* ============================================
   InterviewIQ — Appwrite Configuration
   ============================================ */

const AppwriteConfig = {
  endpoint: 'https://fra.cloud.appwrite.io/v1',
  projectId: '69a3d891002c5e7e2fea',

  // Database & Collection IDs (will be created in Appwrite Console)
  databaseId: 'interviewiq_db',
  collections: {
    users: 'users',
    sessions: 'sessions',
    questions: 'questions',
    sessionAnswers: 'session_answers',
    resources: 'resources'
  }
};

// Initialize Appwrite SDK
const client = new Appwrite.Client();
client
  .setEndpoint(AppwriteConfig.endpoint)
  .setProject(AppwriteConfig.projectId);

const account = new Appwrite.Account(client);
const databases = new Appwrite.Databases(client);
const functions = new Appwrite.Functions(client);

// Export for other modules
window.AppwriteConfig = AppwriteConfig;
window.appwrite = { client, account, databases, functions };
