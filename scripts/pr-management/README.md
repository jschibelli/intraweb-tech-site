# PR Management System

A unified, user-friendly interface for all PR management operations. This directory contains both the main consolidated tool and specialized utilities for advanced workflows.

## 🎯 Quick Start

### Main Tool: `pr.ps1` (Recommended)

The easiest way to manage PRs - use the interactive menu or command-line interface:

```powershell
# Launch interactive menu
.\pr.ps1

# Or use command-line actions
.\pr.ps1 -Action create -IssueNumber 250
.\pr.ps1 -Action monitor -PRNumber 150
.\pr.ps1 -Action quality -PRNumber 150 -AutoFix
.\pr.ps1 -Action all -PRNumber 150
```

### Available Actions

- **create** - Create PR from issue
- **monitor** - Monitor PR status and progress
- **quality** - Run quality checks (linting, formatting, security, etc.)
- **review** - Request or re-request reviews
- **configure** - Configure project fields (Status, Priority, Size)
- **analyze** - Get AI-powered PR analysis
- **respond** - Generate responses to review comments (human + AI)
- **respond-human** - Generate responses to human review comments only
- **respond-ai** - Generate responses to AI review comments only (Copilot, CR-GPT, etc.)
- **all** - Run complete PR workflow

## 📁 Structure (keep it simple)

```
scripts/pr-management/
├── pr.ps1                          # ⭐ Main consolidated tool (use this!)
├── pr-automation-unified.ps1       # Legacy wrapper → scripts/automation/pr-automation-unified.ps1
├── create-pr-from-issue.ps1        # PR creation from issues
├── pr-quality-checker.ps1          # Quality assurance checks
├── pr-monitor.ps1                  # PR monitoring and status
├── request-pr-review.ps1           # Review request management
├── fix-pr-project-fields.ps1       # Project field configuration
├── auto-configure-pr.ps1           # Legacy wrapper → scripts/automation/auto-configure-pr.ps1
├── assign-pr-agents.ps1            # Legacy wrapper → scripts/automation/assign-pr-agents.ps1
├── configure-sprint-estimate.ps1   # Sprint estimation helpers
├── get-pr-aliases.ps1              # PR alias lookup tools
├── test-pr-identification.ps1      # Validation/testing helpers
└── README.md                       # This file
```

## ✅ One obvious way to use this folder

Use **`pr.ps1`**. Everything else is either:
- a focused “sub-command” script used by `pr.ps1`, or
- a legacy/compat wrapper that forwards to `scripts/automation`.

## 🚀 Usage Examples

### Interactive Mode (Recommended)

```powershell
.\pr.ps1
```

This launches an interactive menu where you can:
1. Select an action from the menu
2. Enter PR/issue numbers when prompted
3. Choose options interactively

### Command-Line Mode

#### Create PR from Issue
```powershell
.\pr.ps1 -Action create -IssueNumber 250
.\pr.ps1 -Action create -IssueNumber 250 -BaseBranch develop -DryRun
```

#### Monitor PR
```powershell
.\pr.ps1 -Action monitor -PRNumber 150
```

#### Quality Check
```powershell
.\pr.ps1 -Action quality -PRNumber 150 -AutoFix
```

#### Request Review
```powershell
.\pr.ps1 -Action review -PRNumber 150
```

#### Configure PR Fields
```powershell
.\pr.ps1 -Action configure -PRNumber 150
```

#### Analyze PR
```powershell
.\pr.ps1 -Action analyze -PRNumber 150
```

#### Respond to Reviews
```powershell
# Respond to all reviews (human + AI)
.\pr.ps1 -Action respond -PRNumber 150

# Respond to human reviews only
.\pr.ps1 -Action respond-human -PRNumber 150

# Respond to AI reviews only (Copilot, CR-GPT, etc.)
.\pr.ps1 -Action respond-ai -PRNumber 150
```

#### Run All Checks
```powershell
.\pr.ps1 -Action all -PRNumber 150 -AutoFix
```

## 📊 Core Scripts

### `pr-monitor.ps1`
**Purpose**: Real-time PR monitoring and status tracking

**Features**:
- Real-time PR status updates
- CR-GPT comment monitoring
- PR progress tracking
- Alert notifications
- Export capabilities

**Usage Examples**:
```powershell
# Monitor open PRs
.\pr-monitor.ps1 -Filter open -ShowDetails

# Watch mode with custom interval
.\pr-monitor.ps1 -WatchMode -Interval 30 -IncludeCRGPT

# Export PR report
.\pr-monitor.ps1 -Filter open -ExportTo "pr-report.json"
```

### `pr-quality-checker.ps1`
**Purpose**: Automated quality assurance and testing

**Check Types**:
- `all`: Complete quality assessment
- `linting`: Code linting validation
- `formatting`: Code formatting verification
- `security`: Security vulnerability scanning
- `performance`: Performance anti-pattern detection
- `documentation`: Documentation completeness check
- `tests`: Automated test execution

**Usage Examples**:
```powershell
# Complete quality check
.\pr-quality-checker.ps1 -PRNumber 150 -Checks all -AutoFix

# Security and performance checks
.\pr-quality-checker.ps1 -PRNumber 150 -Checks security,performance

# Run tests and quality checks
.\pr-quality-checker.ps1 -PRNumber 150 -Checks all -RunTests -ExportTo "quality-report.json"
```

### `configure-sprint-estimate.ps1`
**Purpose**: Sprint estimation and capacity planning

**Features**:
- Story point calculation
- Sprint capacity planning
- Velocity tracking
- Burn-down analysis

**Usage Examples**:
```powershell
# Estimate current sprint
.\configure-sprint-estimate.ps1 -SprintName "Sprint 2024.1"

# Calculate team capacity
.\configure-sprint-estimate.ps1 -SprintName "Sprint 2024.1" -CalculateCapacity
```

### `get-pr-aliases.ps1`
**Purpose**: PR alias management and quick access

**Features**:
- PR number to alias mapping
- Quick PR lookup
- Alias validation
- Bulk alias operations

**Usage Examples**:
```powershell
# List all aliases
.\get-pr-aliases.ps1 -ListAll

# Find PR by alias
.\get-pr-aliases.ps1 -Alias "feature-auth"

# Create new alias
.\get-pr-aliases.ps1 -PRNumber 150 -Alias "bug-fix-login"
```

### `test-pr-identification.ps1`
**Purpose**: PR identification and validation testing

**Features**:
- PR validation testing
- Branch analysis
- Commit verification
- Integration testing

**Usage Examples**:
```powershell
# Test PR identification
.\test-pr-identification.ps1 -PRNumber 150

# Validate PR data
.\test-pr-identification.ps1 -PRNumber 150 -ValidateData

# Run integration tests
.\test-pr-identification.ps1 -PRNumber 150 -IntegrationTest
```

## 📈 Key Features

### Quality Assurance
- **Automated Testing**: Run tests and validate code quality
- **Linting Integration**: ESLint and Prettier integration
- **Security Scanning**: Vulnerability detection and assessment
- **Performance Analysis**: Performance anti-pattern detection
- **Documentation Checking**: Ensure proper code documentation

### Monitoring & Analytics
- **Real-time Monitoring**: Live PR status and progress tracking
- **Trend Analysis**: Historical performance and velocity tracking
- **Alert System**: Proactive notifications for issues and delays
- **Reporting**: Comprehensive reports and data export

## 🔧 Configuration

### Environment Variables
```powershell
# Set PR management configuration
$env:PR_MANAGEMENT_DATA_PATH = "scripts/pr-management/data"
$env:PR_MANAGEMENT_LOG_LEVEL = "Information"
$env:GITHUB_PROJECT_ID = "PVT_kwHOAEnMVc4BCu-c"
$env:DEFAULT_ASSIGNEE = "jschibelli"
```

### Data Storage
- **PR Data**: Stored in `data/` directory
- **Analysis Results**: JSON format for trend analysis
- **Quality Reports**: Persistent quality assessment data
- **Agent Metrics**: Performance and workload tracking

## 🚨 Quality Gates

### Automated Checks
- **Linting**: Code style and quality validation
- **Formatting**: Code formatting consistency
- **Security**: Vulnerability scanning
- **Performance**: Performance impact assessment
- **Tests**: Automated test execution
- **Documentation**: Documentation completeness

### Manual Reviews
- **Human Review**: Required for all PRs
- **CR-GPT Feedback**: Address all bot feedback
- **Security Review**: For security-related changes
- **Performance Review**: For performance-critical changes

## 📊 Metrics & Reporting

### PR Metrics
- **Resolution Time**: Time from creation to merge
- **Review Cycles**: Number of review iterations
- **Quality Score**: Overall quality assessment
- **Agent Performance**: Individual agent metrics

### Team Metrics
- **Velocity**: Story points completed per sprint
- **Throughput**: PRs processed per time period
- **Quality Trends**: Quality metrics over time
- **Bottleneck Analysis**: Identify process bottlenecks

## 🔍 Troubleshooting

### Common Issues

#### GitHub API Rate Limiting
```powershell
# Check rate limit status
gh api rate_limit

# Implement retry logic
.\scripts\automation\pr-automation-unified.ps1 -PRNumber 150 -MaxRetries 3 -RetryDelay 1000
```

#### PR Not Found
```powershell
# Verify PR exists
gh pr view $PRNumber

# Check PR status
gh pr list --state all | Where-Object { $_ -match $PRNumber }
```

#### Quality Check Failures
```powershell
# Run with auto-fix
.\pr-quality-checker.ps1 -PRNumber 150 -Checks all -AutoFix

# Check specific issues
.\pr-quality-checker.ps1 -PRNumber 150 -Checks security -Detailed
```

### Debug Mode
```powershell
# Enable verbose logging
.\scripts\automation\pr-automation-unified.ps1 -PRNumber 150 -Action analyze -Detailed -Verbose

# Run quality checks with detailed output
.\pr-quality-checker.ps1 -PRNumber 150 -Checks all -Detailed
```

## 📚 Documentation

For the active automation suite, read:
- `prompts/automation/pr-automation-prompt-template.md`
- `scripts/automation/README.md` (coming soon)
- Legacy details remain in **[DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)** for reference

## 🤝 Contributing

1. Follow PowerShell best practices
2. Add comprehensive error handling
3. Include parameter validation
4. Document all functions and parameters
5. Test with various PR scenarios
6. Update documentation

## 📞 Support

- **Documentation**: Check DEVELOPER_GUIDE.md for detailed tutorials
- **Issues**: Create GitHub issues for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions

---

*Last Updated: 2025-10-06*
*Version: 1.0.0*
