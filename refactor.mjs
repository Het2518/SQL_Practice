import fs from 'fs';
import path from 'path';

const SRC_DIR = path.join(process.cwd(), 'src');
const COMPONENTS_DIR = path.join(SRC_DIR, 'components');

const dirs = [
  'features/practice',
  'features/gamification',
  'features/visualizers',
  'features/profile',
  'features/auth',
  'shared/ui',
  'pages'
];

dirs.forEach(d => {
  fs.mkdirSync(path.join(SRC_DIR, d), { recursive: true });
});

// Map of ComponentName -> New Import Path (without .jsx)
const componentNewPaths = {
  'SqlEditor': 'features/practice/SqlEditor',
  'SchemaSidebar': 'features/practice/SchemaSidebar',
  'ResultsPanel': 'features/practice/ResultsPanel',
  'QuestionCard': 'features/practice/QuestionCard',
  'QuestionBrowser': 'features/practice/QuestionBrowser',
  
  'ConfettiBlast': 'features/gamification/ConfettiBlast',
  'TheoryConnector': 'features/gamification/TheoryConnector',
  
  'JoinAnalysisModal': 'features/visualizers/JoinAnalysisModal',
  'ERDiagramModal': 'features/visualizers/ERDiagramModal',
  'ExecutionOrderExplainer': 'features/visualizers/ExecutionOrderExplainer',
  'NullVisualizer': 'features/visualizers/NullVisualizer',
  'AggregateVisualizer': 'features/visualizers/AggregateVisualizer',
  'CteConverterModal': 'features/visualizers/CteConverterModal',
  'TablePreviewModal': 'features/visualizers/TablePreviewModal',
  'IndexAdvisor': 'features/visualizers/IndexAdvisor',
  'EdgeCaseTester': 'features/visualizers/EdgeCaseTester',
  
  'AuthModal': 'features/auth/AuthModal',
  'ProfileView': 'features/profile/ProfileView',
  'SettingsModal': 'features/profile/SettingsModal',
  
  'ToastSystem': 'shared/ui/ToastSystem',
  'UserGuide': 'pages/UserGuide',
};

// 1. Move all the files to their new destinations
for (const [comp, newPath] of Object.entries(componentNewPaths)) {
  const oldFile = path.join(COMPONENTS_DIR, `${comp}.jsx`);
  const newFile = path.join(SRC_DIR, `${newPath}.jsx`);
  if (fs.existsSync(oldFile)) {
    fs.renameSync(oldFile, newFile);
  }
}

// Move interview directory manually
const oldInterview = path.join(COMPONENTS_DIR, 'interview');
const newInterview = path.join(SRC_DIR, 'features/interview');
if (fs.existsSync(oldInterview)) {
  if (!fs.existsSync(newInterview)) {
     fs.renameSync(oldInterview, newInterview);
  }
}

// Helper to recursively get all files
function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, file));
    }
  });
  return arrayOfFiles;
}

const allJsxFiles = getAllFiles(SRC_DIR).filter(f => f.endsWith('.jsx') || f.endsWith('.js'));

// 2. Rewrite imports in ALL source files
allJsxFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  // Replace references to all moved components
  for (const [comp, newPath] of Object.entries(componentNewPaths)) {
    const newImport = `@/${newPath}`;
    
    // Replace: import { Comp } from '@/components/Comp'
    const reg1 = new RegExp(`from\\s+['"]@/components/${comp}['"]`, 'g');
    content = content.replace(reg1, `from '${newImport}'`);
    
    // Replace: import { Comp } from './Comp' or './Comp.jsx'
    const reg2 = new RegExp(`from\\s+['"]\\./${comp}['"]`, 'g');
    content = content.replace(reg2, `from '${newImport}'`);
    
    // Replace: import { Comp } from '../Comp'
    const reg3 = new RegExp(`from\\s+['"]\\.\\./${comp}['"]`, 'g');
    content = content.replace(reg3, `from '${newImport}'`);
    
    // Replace: import { Comp } from '../../components/Comp'
    const reg4 = new RegExp(`from\\s+['"]\\.\\./\\.\\./components/${comp}['"]`, 'g');
    content = content.replace(reg4, `from '${newImport}'`);
    
    // Replace: import { Comp } from '../components/Comp'
    const reg5 = new RegExp(`from\\s+['"]\\.\\./components/${comp}['"]`, 'g');
    content = content.replace(reg5, `from '${newImport}'`);
  }
  
  // Replace references to interview components
  // Replace: import { X } from '@/components/interview/X'
  const regInt = new RegExp(`from\\s+['"]@/components/interview/`, 'g');
  content = content.replace(regInt, `from '@/features/interview/`);
  
  // Replace relative imports to hooks/utils/types to absolute aliases
  // e.g. import from '../../utils/something' -> import from '@/utils/something'
  content = content.replace(/from\s+['"](?:\.\.\/)+utils\/([^'"]+)['"]/g, "from '@/utils/$1'");
  content = content.replace(/from\s+['"](?:\.\.\/)+hooks\/([^'"]+)['"]/g, "from '@/hooks/$1'");
  content = content.replace(/from\s+['"](?:\.\.\/)+types['"]/g, "from '@/types'");
  content = content.replace(/from\s+['"](?:\.\.\/)+data([^'"]*)['"]/g, "from '@/data$1'");
  content = content.replace(/from\s+['"](?:\.\.\/)+lib([^'"]*)['"]/g, "from '@/lib$1'");
  
  // Same for single ../
  content = content.replace(/from\s+['"]\.\.\/utils\/([^'"]+)['"]/g, "from '@/utils/$1'");
  content = content.replace(/from\s+['"]\.\.\/hooks\/([^'"]+)['"]/g, "from '@/hooks/$1'");
  content = content.replace(/from\s+['"]\.\.\/types['"]/g, "from '@/types'");
  content = content.replace(/from\s+['"]\.\.\/data([^'"]*)['"]/g, "from '@/data$1'");
  content = content.replace(/from\s+['"]\.\.\/lib([^'"]*)['"]/g, "from '@/lib$1'");
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content);
  }
});

console.log("Refactoring complete: Components moved and imports updated.");
