/* ============================================
   InterviewIQ — Course & Role Data
   ============================================ */

const CourseData = {
    BCA: {
        name: 'BCA',
        fullName: 'Bachelor of Computer Applications',
        icon: '💻',
        colorClass: 'bca',
        roles: [
            { id: 'software-developer', name: 'Software Developer', icon: '⚡' },
            { id: 'web-developer', name: 'Web Developer', icon: '🌐' },
            { id: 'data-analyst', name: 'Data Analyst', icon: '📊' },
            { id: 'it-support', name: 'IT Support Engineer', icon: '🔧' },
            { id: 'qa-tester', name: 'QA Tester', icon: '🧪' }
        ]
    },
    BCOM: {
        name: 'BCOM',
        fullName: 'Bachelor of Commerce',
        icon: '📈',
        colorClass: 'bcom',
        roles: [
            { id: 'accountant', name: 'Accountant', icon: '🧾' },
            { id: 'finance-analyst', name: 'Finance Analyst', icon: '💹' },
            { id: 'tax-consultant', name: 'Tax Consultant', icon: '📋' },
            { id: 'audit-associate', name: 'Audit Associate', icon: '🔍' },
            { id: 'ecommerce-manager', name: 'E-Commerce Manager', icon: '🛒' }
        ]
    },
    BBA: {
        name: 'BBA',
        fullName: 'Bachelor of Business Administration',
        icon: '🎯',
        colorClass: 'bba',
        roles: [
            { id: 'business-analyst', name: 'Business Analyst', icon: '📐' },
            { id: 'hr-executive', name: 'HR Executive', icon: '👥' },
            { id: 'marketing-manager', name: 'Marketing Manager', icon: '📢' },
            { id: 'operations-lead', name: 'Operations Lead', icon: '⚙️' },
            { id: 'sales-manager', name: 'Sales Manager', icon: '🤝' }
        ]
    }
};

// Fallback questions if AI is unavailable
const FallbackQuestions = {
    'software-developer': [
        { text: 'Explain the difference between a stack and a queue. When would you use each?', category: 'Data Structures', difficulty: 'easy', timeLimit: 120 },
        { text: 'What is Object-Oriented Programming? Explain the four pillars with examples.', category: 'OOP Concepts', difficulty: 'easy', timeLimit: 120 },
        { text: 'Describe the software development lifecycle (SDLC). Which methodology do you prefer and why?', category: 'Software Engineering', difficulty: 'medium', timeLimit: 150 },
        { text: 'What is a RESTful API? How do GET, POST, PUT, and DELETE methods differ?', category: 'Web Development', difficulty: 'easy', timeLimit: 120 },
        { text: 'Explain the concept of version control. Why is Git important in software development?', category: 'Tools', difficulty: 'easy', timeLimit: 120 },
        { text: 'What are design patterns? Name three commonly used patterns and explain one in detail.', category: 'Design Patterns', difficulty: 'hard', timeLimit: 180 },
        { text: 'How would you optimize a slow database query? Walk through your debugging process.', category: 'Database', difficulty: 'medium', timeLimit: 150 },
        { text: 'Explain the difference between SQL and NoSQL databases. When would you choose one over the other?', category: 'Database', difficulty: 'medium', timeLimit: 120 },
        { text: 'What is the difference between authentication and authorization? How would you implement both?', category: 'Security', difficulty: 'medium', timeLimit: 150 },
        { text: 'Describe a challenging bug you\'ve encountered. How did you debug and fix it?', category: 'Problem Solving', difficulty: 'medium', timeLimit: 150 }
    ],
    'web-developer': [
        { text: 'Explain the CSS Box Model and how it affects layout. What does box-sizing: border-box do?', category: 'CSS', difficulty: 'easy', timeLimit: 120 },
        { text: 'What is the difference between let, const, and var in JavaScript? Explain scope and hoisting.', category: 'JavaScript', difficulty: 'easy', timeLimit: 120 },
        { text: 'What is responsive web design? How would you make a website work on both mobile and desktop?', category: 'Responsive Design', difficulty: 'easy', timeLimit: 120 },
        { text: 'Explain how the browser renders a web page from receiving the HTML to displaying pixels.', category: 'Browser', difficulty: 'hard', timeLimit: 180 },
        { text: 'What are Web APIs? Give examples of commonly used browser APIs and explain one.', category: 'Web APIs', difficulty: 'medium', timeLimit: 120 },
        { text: 'What is the difference between cookies, localStorage, and sessionStorage?', category: 'Storage', difficulty: 'easy', timeLimit: 120 },
        { text: 'Explain event delegation in JavaScript. Why is it useful and how does it work?', category: 'JavaScript', difficulty: 'medium', timeLimit: 150 },
        { text: 'What is Cross-Origin Resource Sharing (CORS)? How do you handle CORS issues?', category: 'Security', difficulty: 'medium', timeLimit: 150 },
        { text: 'What are Progressive Web Apps (PWAs)? What features make a website a PWA?', category: 'Modern Web', difficulty: 'medium', timeLimit: 120 },
        { text: 'How do you optimize website performance? Name at least 5 techniques.', category: 'Performance', difficulty: 'medium', timeLimit: 150 }
    ],
    'data-analyst': [
        { text: 'What is the difference between descriptive, diagnostic, predictive, and prescriptive analytics?', category: 'Analytics', difficulty: 'easy', timeLimit: 120 },
        { text: 'Explain the concept of data cleaning. What are common data quality issues?', category: 'Data Quality', difficulty: 'easy', timeLimit: 120 },
        { text: 'What SQL joins do you know? Explain with examples when you would use each type.', category: 'SQL', difficulty: 'medium', timeLimit: 150 },
        { text: 'Explain the difference between correlation and causation with a real-world example.', category: 'Statistics', difficulty: 'medium', timeLimit: 120 },
        { text: 'What is a pivot table? How would you use it to summarize sales data?', category: 'Tools', difficulty: 'easy', timeLimit: 120 },
        { text: 'Describe ETL (Extract, Transform, Load). Why is it important in data pipelines?', category: 'Data Engineering', difficulty: 'medium', timeLimit: 150 },
        { text: 'What visualization tools have you used? When would you use a bar chart vs. line chart vs. scatter plot?', category: 'Visualization', difficulty: 'easy', timeLimit: 120 },
        { text: 'What are KPIs? Give examples of KPIs for an e-commerce business.', category: 'Business', difficulty: 'easy', timeLimit: 120 },
        { text: 'How would you handle missing data in a dataset? Explain different approaches.', category: 'Data Quality', difficulty: 'medium', timeLimit: 150 },
        { text: 'Explain A/B testing. How would you design a test to measure the impact of a new feature?', category: 'Statistics', difficulty: 'hard', timeLimit: 180 }
    ],
    'accountant': [
        { text: 'What are the golden rules of accounting? Explain with examples.', category: 'Fundamentals', difficulty: 'easy', timeLimit: 120 },
        { text: 'Explain the difference between accrual and cash basis of accounting.', category: 'Fundamentals', difficulty: 'easy', timeLimit: 120 },
        { text: 'What is a trial balance? How does it help in preparing financial statements?', category: 'Financial Statements', difficulty: 'easy', timeLimit: 120 },
        { text: 'Explain depreciation. What are the different methods and when would you use each?', category: 'Assets', difficulty: 'medium', timeLimit: 150 },
        { text: 'What is GST? Explain the different types and how input tax credit works.', category: 'Taxation', difficulty: 'medium', timeLimit: 150 },
        { text: 'What is the difference between a balance sheet and an income statement?', category: 'Financial Statements', difficulty: 'easy', timeLimit: 120 },
        { text: 'Explain what bank reconciliation is. Why is it important and how do you prepare one?', category: 'Banking', difficulty: 'medium', timeLimit: 150 },
        { text: 'What are the different types of budgets? Explain zero-based budgeting.', category: 'Budgeting', difficulty: 'medium', timeLimit: 150 },
        { text: 'What is TDS? Explain the process of TDS deduction and filing.', category: 'Taxation', difficulty: 'medium', timeLimit: 150 },
        { text: 'What accounting software have you used? Compare Tally and QuickBooks.', category: 'Tools', difficulty: 'easy', timeLimit: 120 }
    ],
    'business-analyst': [
        { text: 'What is a Business Analyst? Explain the key responsibilities of this role.', category: 'Role Overview', difficulty: 'easy', timeLimit: 120 },
        { text: 'Explain the difference between functional and non-functional requirements with examples.', category: 'Requirements', difficulty: 'easy', timeLimit: 120 },
        { text: 'What is SWOT analysis? Conduct a SWOT for an EdTech startup.', category: 'Strategy', difficulty: 'medium', timeLimit: 150 },
        { text: 'What is a use case diagram? When and why would you create one?', category: 'Documentation', difficulty: 'easy', timeLimit: 120 },
        { text: 'Explain Agile methodology. What is the difference between Scrum and Kanban?', category: 'Methodology', difficulty: 'medium', timeLimit: 150 },
        { text: 'How do you prioritize requirements? Explain the MoSCoW method.', category: 'Requirements', difficulty: 'medium', timeLimit: 120 },
        { text: 'What is stakeholder management? How do you handle conflicting stakeholder requirements?', category: 'Communication', difficulty: 'hard', timeLimit: 180 },
        { text: 'What is a business process model? Explain BPMN notation basics.', category: 'Process', difficulty: 'medium', timeLimit: 150 },
        { text: 'How do you measure the success of a project? What KPIs would you track?', category: 'Metrics', difficulty: 'medium', timeLimit: 150 },
        { text: 'Describe a situation where you had to gather requirements from non-technical stakeholders.', category: 'Communication', difficulty: 'medium', timeLimit: 150 }
    ],
    // Default fallback for roles without specific questions
    'default': [
        { text: 'Tell me about yourself and why you are interested in this role.', category: 'Introduction', difficulty: 'easy', timeLimit: 120 },
        { text: 'What are your greatest strengths and how do they relate to this position?', category: 'Self-Assessment', difficulty: 'easy', timeLimit: 120 },
        { text: 'Describe a challenging situation you faced and how you handled it.', category: 'Behavioral', difficulty: 'medium', timeLimit: 150 },
        { text: 'Where do you see yourself in 5 years? How does this role fit into your career plan?', category: 'Career Goals', difficulty: 'easy', timeLimit: 120 },
        { text: 'What do you know about our company and industry?', category: 'Company Research', difficulty: 'easy', timeLimit: 120 },
        { text: 'How do you handle working under pressure and meeting tight deadlines?', category: 'Work Style', difficulty: 'medium', timeLimit: 120 },
        { text: 'Give an example of when you worked in a team. What was your role and contribution?', category: 'Teamwork', difficulty: 'easy', timeLimit: 120 },
        { text: 'What skills are you currently developing or want to learn?', category: 'Growth', difficulty: 'easy', timeLimit: 120 },
        { text: 'How do you stay updated with industry trends and new developments?', category: 'Learning', difficulty: 'easy', timeLimit: 120 },
        { text: 'Do you have any questions for us? (Practice asking insightful questions)', category: 'Interview Skills', difficulty: 'easy', timeLimit: 120 }
    ]
};

// Learning resources mapped to categories
const LearningResources = {
    'Data Structures': [
        { title: 'Data Structures Full Course — freeCodeCamp', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', type: 'video' },
        { title: 'GeeksForGeeks — Data Structures', url: 'https://www.geeksforgeeks.org/data-structures/', type: 'article' }
    ],
    'OOP Concepts': [
        { title: 'Object Oriented Programming in Java', url: 'https://www.youtube.com/watch?v=pTB0EiLXUC8', type: 'video' },
        { title: 'NPTEL — OOP with Java', url: 'https://nptel.ac.in/courses/106105191', type: 'course' }
    ],
    'JavaScript': [
        { title: 'JavaScript Full Course — freeCodeCamp', url: 'https://www.youtube.com/watch?v=PkZNo7MFNFg', type: 'video' },
        { title: 'MDN Web Docs — JavaScript Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide', type: 'article' }
    ],
    'CSS': [
        { title: 'CSS Crash Course — Traversy Media', url: 'https://www.youtube.com/watch?v=yfoY53QXEnI', type: 'video' },
        { title: 'CSS-Tricks Complete Guide', url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/', type: 'article' }
    ],
    'SQL': [
        { title: 'SQL Tutorial — W3Schools', url: 'https://www.w3schools.com/sql/', type: 'article' },
        { title: 'SQL Full Course — freeCodeCamp', url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY', type: 'video' }
    ],
    'Fundamentals': [
        { title: 'Accounting Basics — Khan Academy', url: 'https://www.khanacademy.org/economics-finance-domain/core-finance', type: 'course' },
        { title: 'Accounting Fundamentals — Coursera', url: 'https://www.coursera.org/learn/wharton-accounting', type: 'course' }
    ],
    'Taxation': [
        { title: 'GST Complete Guide', url: 'https://www.youtube.com/watch?v=VbwGNBUPpp0', type: 'video' },
        { title: 'Income Tax Basics — ClearTax', url: 'https://cleartax.in/s/income-tax', type: 'article' }
    ],
    'Strategy': [
        { title: 'Business Strategy — Coursera', url: 'https://www.coursera.org/learn/foundations-business-strategy', type: 'course' },
        { title: 'SWOT Analysis Explained', url: 'https://www.youtube.com/watch?v=JXXHqM6RzZQ', type: 'video' }
    ],
    'default': [
        { title: 'Interview Preparation Tips — GeeksForGeeks', url: 'https://www.geeksforgeeks.org/how-to-prepare-for-interviews/', type: 'article' },
        { title: 'Communication Skills — Coursera', url: 'https://www.coursera.org/learn/wharton-communication', type: 'course' }
    ]
};

window.CourseData = CourseData;
window.FallbackQuestions = FallbackQuestions;
window.LearningResources = LearningResources;
