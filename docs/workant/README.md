# Workant

> Automation scripts and prompts for development workflow automation

**Workant** is a comprehensive automation framework designed to streamline development workflows, manage multi-agent development environments, and automate GitHub operations. It provides enterprise-grade tools for issue management, PR automation, branch orchestration, code quality analysis, and AI-powered development assistance.

## 🎯 Getting Started

**IMPORTANT**: Before using any automation scripts, you must configure your GitHub organization and projects.

### Step 1: Run Setup Script

Run the interactive setup script to configure your GitHub organization, projects, and field mappings:

```powershell
.\scripts\configuration\setup-project.ps1
```

This script will:
- Detect your GitHub organization
- Auto-detect project fields (Status, Priority, Size, Estimate)
- Configure issue types
- Save configuration to `scripts/configuration/project-config.json`

### Step 2: Use Automation Scripts

Once configured, you can use all automation scripts:

```powershell
# Create an issue with automatic field configuration
.\scripts\issue-management\create-issue-enhanced.ps1 `
  -Title "Add new feature" `
  -Body "Description of the feature" `
  -IssueType "Feature" `
  -Priority "P1" `
  -Size "M"
```

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed setup instructions.

## 🚀 Features

### Multi-Agent Development System
- **Parallel Workflows**: Orchestrate multiple specialized AI agents working simultaneously
- **Intelligent Assignment**: AI-powered complexity analysis and agent assignment
- **Worktree Management**: Isolated development environments using Git worktrees
- **Conflict Prevention**: Automated conflict detection and resolution
- **Real-time Monitoring**: Comprehensive system health and performance tracking

### Automation Scripts
- **Issue Management**: Automated issue processing, configuration, and queue management
- **PR Automation**: Pull request creation, configuration, and management
- **Branch Orchestration**: Batch branch creation, health auditing, and synchronization
- **Project Management**: GitHub project board integration and field management
- **Documentation**: Automated documentation generation and updates

### AI-Powered Tools
- **Code Analysis**: AI-driven code quality, security, and performance analysis
- **Implementation Planning**: Automated implementation plan generation
- **PR Response Generation**: Intelligent responses to code review feedback
- **Multi-Provider Support**: OpenAI, Anthropic Claude, and Azure OpenAI integration

### Code Quality & Monitoring
- **Quality Analysis**: Automated code quality checks and cleanup suggestions
- **Performance Monitoring**: System metrics and automation analytics
- **Health Auditing**: Branch health checks and drift detection

## 📁 Repository Structure

```
workant/
├── scripts/
│   ├── agent-management/      # Multi-agent system orchestration
│   │   ├── pr-agent-assignment-workflow.ps1
│   │   ├── manage-multi-agent-system.ps1
│   │   ├── manage-agent-coordination-unified.ps1
│   │   └── start-multi-agent-e2e-unified.ps1
│   ├── automation/             # General automation workflows
│   │   ├── issue-config-unified.ps1
│   │   ├── pr-automation-unified.ps1
│   │   └── continuous-issue-pipeline.ps1
│   ├── branch-management/      # Git branch orchestration
│   │   ├── batch-branch-orchestrator.ps1
│   │   ├── branch-health-audit.ps1
│   │   └── sync-feature-branch.ps1
│   ├── core-utilities/         # Shared utilities and helpers
│   │   ├── issue-status-automation.ps1
│   │   ├── pr-status-monitor.ps1
│   │   └── project-config.ps1
│   ├── issue-management/       # Issue processing and management
│   ├── pr-management/          # Pull request automation
│   ├── project-management/     # Project board management
│   ├── code-quality/           # Code analysis and cleanup
│   ├── monitoring/             # System monitoring and metrics
│   ├── documentation/          # Documentation generation tools
│   ├── housekeeping/           # Cleanup and maintenance scripts
│   ├── ops/                    # Operational utilities
│   ├── build-tools/            # Build and configuration scripts
│   ├── testing/                # Testing utilities
│   ├── utilities/              # General utility scripts
│   └── configuration/         # Configuration files and setup
├── prompts/                    # AI prompts and templates
│   ├── automation/             # Automation workflow prompts
│   ├── workflows/              # End-to-end workflow prompts
│   ├── templates/              # Reusable prompt templates
│   └── agents/                 # Agent-specific prompts
├── package.json                  # NPM package configuration
├── setup.js                     # Initial setup script
├── postinstall.js               # Post-installation setup
├── postinstall.ps1              # PowerShell post-installation script
├── publish.ps1                  # Package publishing script
├── SETUP_GUIDE.md               # Detailed setup instructions
└── LICENSE                      # License file
```

## 🛠️ Prerequisites

### System Requirements
- **PowerShell 7.0+** (Latest version with full .NET support)
- **Git 2.30+** (Modern Git with worktree support)
- **GitHub CLI 2.0+** (Authenticated GitHub access)
- **Node.js 18+** (For frontend development tools)
- **Windows 10/11** (Primary development platform)

### Authentication Setup

```powershell
# GitHub CLI authentication
gh auth login --scopes repo,project,workflow

# Verify authentication
gh auth status

# Test API access
gh api user
```

### Environment Configuration

```powershell
# Set up agent management environment
$env:AGENT_MANAGEMENT_PATH = "scripts/agent-management"
$env:AGENT_LOG_LEVEL = "Information"
$env:AGENT_COORDINATION_MODE = "automatic"

# Project configuration is managed via project-config.json
# Run setup script to configure: .\scripts\configuration\setup-project.ps1
```

## 📦 Installation

### Clone the Repository

```powershell
git clone https://github.com/IntraWeb-Technology/workant.git
cd workant
```

### Install Dependencies

```powershell
# Using npm
npm install

# Or using pnpm
pnpm install
```

### Run Setup

```powershell
# Run initial setup
npm run setup

# Or directly
node setup.js
```

## 🚀 Quick Start

### 1. Initialize Agent Management System

```powershell
# Navigate to agent management
cd scripts/agent-management

# Initialize the system
.\manage-multi-agent-system.ps1 -Operation setup

# Configure agent assignments
.\setup-agent-development.ps1 -AgentCount 2
```

### 2. Process Issues with Agent Assignment

```powershell
# Run PR agent assignment workflow
.\pr-agent-assignment-workflow.ps1 -ProjectNumber "20" -Owner "IntraWeb-Technology"

# Dry run to preview assignments
.\pr-agent-assignment-workflow.ps1 -ProjectNumber "20" -DryRun
```

### 3. Start Multi-Agent Development

```powershell
# Start E2E development workflow
.\start-multi-agent-e2e-unified.ps1 -Mode continuous

# Start specific agent
.\start-multi-agent-e2e-unified.ps1 -Agent Agent1 -Mode individual
```

### 4. Manage Branches

```powershell
# Navigate to branch management
cd scripts/branch-management

# Create branch from develop
.\create-branch-from-develop.ps1 -IssueNumber 250

# Sync feature branch
.\sync-feature-branch.ps1 -Branch "feature/250-improve-automation" -Strategy rebase

# Health audit
.\branch-health-audit.ps1 -Scope all -MaxAgeDays 10
```

### 5. Automate Issue Configuration

```powershell
# Navigate to automation
cd scripts/automation

# Configure issue automatically
.\issue-config-unified.ps1 -IssueNumber 250

# Process continuous issue pipeline
.\continuous-issue-pipeline.ps1
```

## 📚 Key Components

### Agent Management System

The multi-agent system enables parallel development workflows with specialized agents:

- **Agent 1 (Frontend/UI)**: React/Next.js, UI/UX, accessibility, performance
- **Agent 2 (Infrastructure/SEO)**: DevOps, SEO, deployment, security
- **Agent 3+ (Planned)**: Backend, QA, Documentation specialists

**Key Scripts:**
- `pr-agent-assignment-workflow.ps1` - Intelligent PR and agent assignment
- `manage-multi-agent-system.ps1` - System management and orchestration
- `manage-agent-coordination-unified.ps1` - Agent coordination and commands
- `start-multi-agent-e2e-unified.ps1` - End-to-end development workflows

**Documentation:** See [`scripts/agent-management/README.md`](scripts/agent-management/README.md) for comprehensive guide.

### Automation Scripts

Automation workflows for GitHub operations:

- **Issue Management**: Processing, configuration, queue management
- **PR Automation**: Creation, configuration, and management
- **Project Management**: Board integration and field updates
- **Documentation**: Automated documentation generation

**Key Scripts:**
- `issue-config-unified.ps1` - Automated issue configuration
- `pr-automation-unified.ps1` - PR automation workflows
- `continuous-issue-pipeline.ps1` - Continuous issue processing

**Documentation:** See [`scripts/automation/README.md`](scripts/automation/README.md) for details.

### Branch Management

Comprehensive Git branch orchestration tools:

- **Branch Creation**: Automated branch creation from issues
- **Health Auditing**: Branch drift detection and cleanup
- **Synchronization**: Rebase/merge workflows with safety checks
- **Batch Operations**: Bulk branch creation and management

**Key Scripts:**
- `batch-branch-orchestrator.ps1` - Bulk branch operations
- `branch-health-audit.ps1` - Branch health monitoring
- `sync-feature-branch.ps1` - Branch synchronization

**Documentation:** See [`scripts/branch-management/README.md`](scripts/branch-management/README.md) for usage.

### Core Utilities

Shared utilities and foundational capabilities:

- **Issue Status Automation**: Automated issue status management
- **PR Status Monitoring**: Pull request status tracking and updates
- **Project Configuration**: Project board configuration management

**Key Scripts:**
- `issue-status-automation.ps1` - Automated issue status workflows
- `pr-status-monitor.ps1` - PR status monitoring and updates
- `project-config.ps1` - Project configuration utilities

**Documentation:** See [`scripts/core-utilities/README.md`](scripts/core-utilities/README.md) for API reference.

### Documentation Tools

Automated documentation generation and maintenance:

- **Changelog Generation**: Automated changelog creation
- **Prompt Library**: Prompt generation and management
- **Documentation Updates**: Automated documentation maintenance

**Key Scripts:**
- `generate-full-changelog.ps1` - Comprehensive changelog generation
- `generate-prompt-library.js` - Prompt library management

**Documentation:** See [`scripts/documentation/README.md`](scripts/documentation/README.md) for details.

### Housekeeping & Maintenance

Repository cleanup and maintenance utilities:

- **Intelligent Cleanup**: Smart folder and file cleanup
- **Targeted Cleanup**: Selective cleanup operations
- **House Cleaning**: Comprehensive repository maintenance

**Key Scripts:**
- `clean-folder-intelligent.ps1` - Intelligent folder cleanup
- `clean-house-main.ps1` - Main housekeeping operations

**Documentation:** See [`scripts/housekeeping/README.md`](scripts/housekeeping/README.md) for usage.

### Prompts Directory

AI prompts and templates organized by category:

- **Automation Prompts**: GitHub issue and project management automation
- **Workflow Prompts**: End-to-end workflow automation
- **Template Prompts**: Reusable prompt templates and quick references
- **Agent Prompts**: Agent-specific prompts and assignments

**Documentation:** See [`prompts/README.md`](prompts/README.md) for prompt catalog.

## 💡 Usage Examples

### Daily Workflow

```powershell
# Morning startup routine
.\scripts\agent-management\manage-multi-agent-system.ps1 -Operation status
.\scripts\agent-management\pr-agent-assignment-workflow.ps1 -DryRun
.\scripts\agent-management\update-agent-status.ps1 -AllAgents

# Process new issues
.\scripts\agent-management\pr-agent-assignment-workflow.ps1 -ProjectNumber "20"
.\scripts\agent-management\assign-agent-enhanced.ps1 -IssueNumber 250

# Monitor progress
.\scripts\agent-management\manage-agent-coordination-unified.ps1 -Action status
```

### Issue to Merge Pipeline

```powershell
# 1. Analyze and assign issue
.\scripts\agent-management\pr-agent-assignment-workflow.ps1 -ProjectNumber "20"

# 2. Assign to agent
.\scripts\agent-management\assign-agent-enhanced.ps1 -IssueNumber 250

# 3. Start development
.\scripts\agent-management\start-multi-agent-e2e-unified.ps1 -Agent Agent1 -Mode continuous

# 4. Monitor and coordinate
.\scripts\agent-management\manage-agent-coordination-unified.ps1 -Action sync
```

### Branch Management Workflow

```powershell
# Create branch from issue
.\scripts\branch-management\create-branch-from-develop.ps1 -IssueNumber 250

# Work on branch... (development happens here)

# Sync with develop
.\scripts\branch-management\sync-feature-branch.ps1 -Branch "issue-250" -Strategy rebase -Push

# Health audit
.\scripts\branch-management\branch-health-audit.ps1 -Scope all -AutoFix
```

### Documentation Automation

```powershell
# Update documentation for PR
.\scripts\core-utilities\docs-updater.ps1 -PRNumber 123 -UpdateChangelog -GenerateDocs

# Dry run to preview
.\scripts\core-utilities\docs-updater.ps1 -PRNumber 123 -GenerateDocs -DryRun
```

## 🔧 Configuration

### Agent Assignment Configuration

Agent assignment is configured through the multi-agent system scripts. The system supports:
- **Frontend Agent**: React/Next.js, UI/UX, accessibility, performance
- **Infrastructure Agent**: DevOps, SEO, deployment, security
- **Dynamic Assignment**: AI-powered complexity analysis and agent assignment

Configuration is managed through the agent management scripts. See [`scripts/agent-management/README.md`](scripts/agent-management/README.md) for detailed configuration options.

### Project Configuration

Default project settings (configured via setup script):
- **Project Number**: `6` (configurable)
- **Project Name**: `@Workant`
- **Organization**: `IntraWeb-Technology`

Configuration is stored in `scripts/configuration/project-config.json` and is automatically detected during setup. Run `.\scripts\configuration\setup-project.ps1` to configure your projects.

## 📊 Monitoring & Analytics

### System Health Monitoring

```powershell
# Agent status overview
.\scripts\agent-management\manage-multi-agent-system.ps1 -Operation status

# Performance metrics
.\scripts\monitoring\automation-metrics.ps1 -Operation agents -RealTime

# Workload distribution
.\scripts\agent-management\manage-agent-coordination-unified.ps1 -Action status
```

### Reporting

```powershell
# Generate comprehensive report
.\scripts\agent-management\pr-agent-assignment-workflow.ps1 `
    -ExportTo "reports/daily-agent-report-$(Get-Date -Format 'yyyyMMdd').md"

# Weekly analytics
.\scripts\monitoring\automation-metrics.ps1 `
    -Operation agents `
    -TimeRange 7 `
    -ExportTo "reports/weekly-analytics.json"
```

## 🛡️ Security & Best Practices

### Security Considerations

- **API Key Management**: Store API keys in environment variables, never commit to version control
- **Authentication**: Use GitHub CLI with appropriate scopes
- **Access Control**: Implement role-based access for different operations
- **Audit Logging**: Complete trail of all agent operations

### Best Practices

1. **Use Dry Run Mode**: Test operations before execution
   ```powershell
   .\pr-agent-assignment-workflow.ps1 -DryRun
   ```

2. **Regular Cleanup**: Maintain system health
   ```powershell
   .\manage-multi-agent-system.ps1 -Operation cleanup
   ```

3. **Monitor Performance**: Track system metrics regularly
   ```powershell
   .\monitoring\automation-metrics.ps1 -Operation performance
   ```

4. **Version Control**: Commit configuration changes with clear messages

## 🐛 Troubleshooting

### Common Issues

#### Agent Assignment Failures
```powershell
# Check agent status
.\scripts\agent-management\manage-multi-agent-system.ps1 -Operation status

# Verify GitHub authentication
gh auth status

# Test assignment logic
.\scripts\agent-management\assign-agent-enhanced.ps1 -IssueNumber 250 -DryRun
```

#### Worktree Conflicts
```powershell
# Check worktree status
.\scripts\agent-management\manage-multi-agent-system.ps1 -Operation list

# Force sync
.\scripts\agent-management\manage-multi-agent-system.ps1 -Operation sync -Force

# Clean worktrees
.\scripts\agent-management\manage-multi-agent-system.ps1 -Operation cleanup
```

#### Authentication Issues
```powershell
# Re-authenticate
gh auth login --scopes repo,project,workflow

# Verify token scopes
gh auth status --show-token
```

### Debug Mode

```powershell
# Enable verbose logging
$VerbosePreference = "Continue"
$DebugPreference = "Continue"
$InformationPreference = "Continue"

# Run operations with detailed output
.\scripts\agent-management\pr-agent-assignment-workflow.ps1 -DryRun
```

## 📖 Documentation

Comprehensive documentation is available in each component directory:

- **[Agent Management](scripts/agent-management/README.md)** - Enterprise developer guide
- **[Automation](scripts/automation/README.md)** - Automation workflows and integration
- **[Branch Management](scripts/branch-management/README.md)** - Branch orchestration toolkit
- **[Core Utilities](scripts/core-utilities/README.md)** - API reference and utilities
- **[Code Quality](scripts/code-quality/README.md)** - Code analysis and quality tools
- **[Documentation](scripts/documentation/README.md)** - Documentation generation tools
- **[Issue Management](scripts/issue-management/README.md)** - Issue processing workflows
- **[PR Management](scripts/pr-management/README.md)** - Pull request automation
- **[Project Management](scripts/project-management/README.md)** - Project board integration
- **[Monitoring](scripts/monitoring/README.md)** - System monitoring and metrics
- **[Prompts](prompts/README.md)** - Prompt catalog and usage guidelines
- **[Setup Guide](SETUP_GUIDE.md)** - Detailed setup instructions

## 🤝 Contributing

This is a private repository for Workant automation tools. For contributions:

1. Create a feature branch from `develop`
2. Make your changes with clear commit messages
3. Test thoroughly using dry-run modes
4. Submit a pull request with detailed description

## 📝 License

This project is licensed under the GNU Affero General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## 👤 Organization

**IntraWeb-Technology**
- GitHub: [@IntraWeb-Technology](https://github.com/IntraWeb-Technology)
- Repository: [workant](https://github.com/IntraWeb-Technology/workant)

**Maintainers**: [@intraweb-technology/core](https://github.com/orgs/intraweb-technology/teams/core)


## 📞 Support

For issues, questions, or feature requests:
- Create an issue in this repository
- Check existing documentation in component directories
- Review troubleshooting guides in component READMEs

---

**Version**: 1.0.13  
**Last Updated**: 2025-12-15  
**Status**: Active Development

---

*Workant - Streamlining development workflows with AI-powered multi-agent orchestration and comprehensive GitHub automation.*
