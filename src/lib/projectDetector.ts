import { existsSync, readdirSync } from "fs";
import { join } from "path";

export interface ProjectType {
  type: string;
  confidence: number;
  files: string[];
  suggestedBranch: string | null;
}

interface ProjectPattern {
  type: string;
  requiredFiles: string[];
  optionalFiles: string[];
  branchSuggestion: string;
  description: string;
}

// Define project patterns
const PROJECT_PATTERNS: ProjectPattern[] = [
  {
    type: "node",
    requiredFiles: ["package.json"],
    optionalFiles: ["tsconfig.json", "webpack.config.js", "vite.config.js", ".nvmrc"],
    branchSuggestion: "project/node-app",
    description: "Node.js/JavaScript project"
  },
  {
    type: "typescript",
    requiredFiles: ["tsconfig.json", "package.json"],
    optionalFiles: ["tslint.json", ".eslintrc.js"],
    branchSuggestion: "project/typescript-app",
    description: "TypeScript project"
  },
  {
    type: "react",
    requiredFiles: ["package.json"],
    optionalFiles: ["public/index.html", "src/App.tsx", "src/App.jsx"],
    branchSuggestion: "project/react-app",
    description: "React application"
  },
  {
    type: "vue",
    requiredFiles: ["package.json", "vue.config.js"],
    optionalFiles: ["src/App.vue", ".vuerc"],
    branchSuggestion: "project/vue-app",
    description: "Vue.js application"
  },
  {
    type: "ruby",
    requiredFiles: ["Gemfile"],
    optionalFiles: ["Gemfile.lock", ".ruby-version", "Rakefile"],
    branchSuggestion: "project/ruby-app",
    description: "Ruby project"
  },
  {
    type: "rails",
    requiredFiles: ["Gemfile", "config/application.rb"],
    optionalFiles: ["app/controllers", "db/schema.rb"],
    branchSuggestion: "project/rails-app",
    description: "Ruby on Rails application"
  },
  {
    type: "python",
    requiredFiles: ["requirements.txt"],
    optionalFiles: ["setup.py", "pyproject.toml", "Pipfile"],
    branchSuggestion: "project/python-app",
    description: "Python project"
  },
  {
    type: "django",
    requiredFiles: ["manage.py", "requirements.txt"],
    optionalFiles: ["settings.py", "urls.py"],
    branchSuggestion: "project/django-app",
    description: "Django application"
  },
  {
    type: "go",
    requiredFiles: ["go.mod"],
    optionalFiles: ["go.sum", "main.go"],
    branchSuggestion: "project/go-app",
    description: "Go project"
  },
  {
    type: "rust",
    requiredFiles: ["Cargo.toml"],
    optionalFiles: ["Cargo.lock", "src/main.rs"],
    branchSuggestion: "project/rust-app",
    description: "Rust project"
  },
  {
    type: "java-maven",
    requiredFiles: ["pom.xml"],
    optionalFiles: ["src/main/java", ".mvn"],
    branchSuggestion: "project/java-maven",
    description: "Java Maven project"
  },
  {
    type: "java-gradle",
    requiredFiles: ["build.gradle"],
    optionalFiles: ["gradle.properties", "settings.gradle"],
    branchSuggestion: "project/java-gradle",
    description: "Java Gradle project"
  },
  {
    type: "dotnet",
    requiredFiles: [".csproj"],
    optionalFiles: [".sln", "Program.cs"],
    branchSuggestion: "project/dotnet-app",
    description: ".NET project"
  }
];

/**
 * Get list of project files in the current directory
 */
export function getProjectFiles(dirPath: string = process.cwd()): string[] {
  try {
    const files = readdirSync(dirPath);
    const projectFiles: string[] = [];
    
    for (const file of files) {
      // Skip hidden files except for specific ones
      if (file.startsWith(".") && 
          !file.includes(".nvmrc") && 
          !file.includes(".ruby-version") &&
          !file.includes(".eslintrc") &&
          !file.includes(".vuerc")) {
        continue;
      }
      
      // Skip node_modules and other common directories
      if (["node_modules", "dist", "build", "target", "vendor"].includes(file)) {
        continue;
      }
      
      projectFiles.push(file);
    }
    
    return projectFiles;
  } catch (error) {
    return [];
  }
}

/**
 * Detect the project type based on files in the current directory
 */
export function detectProjectType(dirPath: string = process.cwd()): ProjectType {
  const files = getProjectFiles(dirPath);
  
  let bestMatch: ProjectType = {
    type: "unknown",
    confidence: 0,
    files: [],
    suggestedBranch: null
  };
  
  for (const pattern of PROJECT_PATTERNS) {
    const matchedFiles: string[] = [];
    let score = 0;
    
    // Check required files
    const hasAllRequired = pattern.requiredFiles.every(requiredFile => {
      // Handle special cases like .csproj which is a pattern
      if (requiredFile.includes(".csproj")) {
        const hasCsproj = files.some(f => f.endsWith(".csproj"));
        if (hasCsproj) {
          const csprojFile = files.find(f => f.endsWith(".csproj"));
          if (csprojFile) matchedFiles.push(csprojFile);
        }
        return hasCsproj;
      }
      
      const exists = files.includes(requiredFile) || 
                    existsSync(join(dirPath, requiredFile));
      if (exists) {
        matchedFiles.push(requiredFile);
      }
      return exists;
    });
    
    if (!hasAllRequired) {
      continue;
    }
    
    // Base score for having all required files
    score = 0.5;
    
    // Check optional files for better confidence
    for (const optionalFile of pattern.optionalFiles) {
      if (files.includes(optionalFile) || 
          existsSync(join(dirPath, optionalFile))) {
        matchedFiles.push(optionalFile);
        score += 0.1;
      }
    }
    
    // Cap confidence at 0.95
    const confidence = Math.min(score, 0.95);
    
    // Update best match if this is better
    if (confidence > bestMatch.confidence) {
      bestMatch = {
        type: pattern.type,
        confidence,
        files: matchedFiles,
        suggestedBranch: pattern.branchSuggestion
      };
    }
  }
  
  // Special case: Check for React/Vue in package.json
  if (bestMatch.type === "node" && existsSync(join(dirPath, "package.json"))) {
    try {
      const packageJson = require(join(dirPath, "package.json"));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      if (deps.react || deps["react-dom"]) {
        bestMatch.type = "react";
        bestMatch.suggestedBranch = "project/react-app";
      } else if (deps.vue) {
        bestMatch.type = "vue";
        bestMatch.suggestedBranch = "project/vue-app";
      } else if (deps.express || deps.koa || deps.fastify) {
        bestMatch.type = "node-backend";
        bestMatch.suggestedBranch = "project/node-backend";
      }
    } catch (error) {
      // Ignore errors reading package.json
    }
  }
  
  return bestMatch;
}