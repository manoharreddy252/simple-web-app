const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const natural = require('natural');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// In-memory data store
let users = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
];

let tasks = [
  { id: 1, title: 'Learn React', completed: false },
  { id: 2, title: 'Build Node API', completed: true }
];

let resumes = [];

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Simple Web App API is running!' });
});

// Users endpoints
app.get('/api/users', (req, res) => {
  res.json(users);
});

app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  const newUser = {
    id: users.length + 1,
    name,
    email
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

app.delete('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  users = users.filter(user => user.id !== id);
  res.json({ message: 'User deleted' });
});

// Tasks endpoints
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
  const { title } = req.body;
  const newTask = {
    id: tasks.length + 1,
    title,
    completed: false
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

app.put('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    res.json(task);
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

app.delete('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  tasks = tasks.filter(task => task.id !== id);
  res.json({ message: 'Task deleted' });
});

// Resume analysis functions
function analyzeGrammar(text) {
  const sentences = natural.SentenceTokenizer.tokenize(text);
  const words = natural.WordTokenizer().tokenize(text.toLowerCase());
  
  let issues = [];
  let score = 100;
  
  // Check for common grammar issues
  const commonErrors = {
    'recieve': 'receive',
    'seperate': 'separate',
    'definately': 'definitely',
    'occured': 'occurred',
    'managment': 'management',
    'experiance': 'experience',
    'responsibilty': 'responsibility'
  };
  
  words.forEach(word => {
    if (commonErrors[word]) {
      issues.push(`Spelling: '${word}' should be '${commonErrors[word]}'`);
      score -= 5;
    }
  });
  
  // Check sentence structure
  sentences.forEach(sentence => {
    if (sentence.length < 10) {
      issues.push('Short sentence detected - consider expanding');
      score -= 2;
    }
    if (!sentence.match(/^[A-Z]/)) {
      issues.push('Sentence should start with capital letter');
      score -= 3;
    }
  });
  
  return { score: Math.max(score, 0), issues };
}

function analyzeResumeContent(text) {
  const keywords = ['experience', 'skills', 'education', 'projects', 'achievements'];
  const words = natural.WordTokenizer().tokenize(text.toLowerCase());
  
  let contentScore = 0;
  let suggestions = [];
  
  keywords.forEach(keyword => {
    if (words.includes(keyword)) {
      contentScore += 20;
    } else {
      suggestions.push(`Consider adding '${keyword}' section`);
    }
  });
  
  // Check for action verbs
  const actionVerbs = ['managed', 'developed', 'created', 'implemented', 'designed', 'led'];
  const hasActionVerbs = actionVerbs.some(verb => words.includes(verb));
  
  if (hasActionVerbs) {
    contentScore += 20;
  } else {
    suggestions.push('Use more action verbs to describe achievements');
  }
  
  return { contentScore, suggestions };
}

// Resume endpoints
app.post('/api/resume/analyze', upload.single('resume'), async (req, res) => {
  try {
    let text = '';
    
    if (req.file) {
      if (req.file.mimetype === 'application/pdf') {
        const pdfData = await pdfParse(req.file.buffer);
        text = pdfData.text;
      } else {
        return res.status(400).json({ error: 'Only PDF files supported' });
      }
    } else if (req.body.text) {
      text = req.body.text;
    } else {
      return res.status(400).json({ error: 'No text or file provided' });
    }
    
    const grammarAnalysis = analyzeGrammar(text);
    const contentAnalysis = analyzeResumeContent(text);
    
    const totalScore = Math.round((grammarAnalysis.score + contentAnalysis.contentScore) / 2);
    
    const analysis = {
      id: resumes.length + 1,
      filename: req.file ? req.file.originalname : 'Text Input',
      totalScore,
      grammarScore: grammarAnalysis.score,
      contentScore: contentAnalysis.contentScore,
      issues: grammarAnalysis.issues,
      suggestions: contentAnalysis.suggestions,
      analyzedAt: new Date().toISOString()
    };
    
    resumes.push(analysis);
    res.json(analysis);
    
  } catch (error) {
    console.error('Resume analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze resume' });
  }
});

app.get('/api/resume/history', (req, res) => {
  res.json(resumes);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});