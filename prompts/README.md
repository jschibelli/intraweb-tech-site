# Prompts Directory - Quick Start Guide

Welcome to the Prompts Directory! This is your starting point for finding the right prompt for any task.

## 🚀 Quick Start

**New to the system?** Start here:
1. **[Issue Management Default Prompt](automation/issue-management-default-prompt.md)** - Complete guide for working with issues
2. **[Quick Reference Templates](templates/)** - Copy-paste ready prompts
3. **[Common Workflows](workflows/)** - End-to-end automation workflows

---

## 📁 Directory Structure

```
prompts/
├── automation/          # Issue, PR, and project automation prompts
├── workflows/           # Complete end-to-end workflows
├── templates/           # Quick reference templates
├── agents/             # Agent assignment and coordination
├── generated/           # Auto-generated prompts (reference only)
└── README.md            # This file
```

---

## 🎯 Find What You Need

### **By Task Type**

#### **Working with Issues**
- **[Issue Management Default Prompt](automation/issue-management-default-prompt.md)** ⭐ **START HERE**
  - Complete guide with examples, workflows, and troubleshooting
  - Copy-paste ready prompts for all issue operations
  
- **[Issue Analysis Template](automation/issue-analysis-prompt-template.md)**
  - Extract requirements and create implementation plans

#### **Working with Pull Requests**
- **[PR Automation Template](automation/pr-automation-prompt-template.md)**
  - Automate PR configuration and management
  
- **[PR to Merge Workflow](templates/github-pr-to-merge.md)**
  - Complete PR workflow from creation to merge

#### **Complete Workflows**
- **[End-to-End Issue to Merge](workflows/e2e-issue-to-merge.md)**
  - Complete workflow from issue creation to code merge
  
- **[Two-Agent PR Assignment](workflows/default-two-agent-pr-assignment-strategy.md)**
  - Automated agent assignment strategy

#### **Quick Operations**
- **[Complete Prompt List](templates/github-complete-prompt-list.md)**
  - One-liner prompts for common operations
  
- **[GitHub PR to Merge](templates/github-pr-to-merge.md)**
  - Streamlined PR automation

### **By User Journey**

#### **I'm Starting Work on an Issue**
1. Read: [Issue Management Default Prompt](automation/issue-management-default-prompt.md) - Workflow 1
2. Use: [Issue Analysis Template](automation/issue-analysis-prompt-template.md)
3. Configure: [Issue Auto-Configuration](automation/github-issue-auto-configuration.md)

#### **I Need to Process Multiple Issues**
1. Read: [Issue Management Default Prompt](automation/issue-management-default-prompt.md) - Workflow 3
2. Use: [End-to-End Issue to Merge](workflows/e2e-issue-to-merge.md)

#### **I'm Managing a Pull Request**
1. Read: [PR Automation Template](automation/pr-automation-prompt-template.md)
2. Use: [PR to Merge Workflow](templates/github-pr-to-merge.md)

#### **I Need Help with Queue Management**
1. Read: [Issue Management Default Prompt](automation/issue-management-default-prompt.md) - Workflow 4
2. Use: Queue management commands from the default prompt

---

## 📚 Detailed Categories

### **Automation Prompts** (`automation/`)

**Issue Management:**
- `issue-management-default-prompt.md` ⭐ - **Main user guide** (start here!)
- `issue-analysis-prompt-template.md` - Issue analysis and planning

**PR Management:**
- `pr-automation-prompt-template.md` - PR automation and configuration

**Branch Management:**
- `batch-branch-orchestrator.md` - Batch branch operations
- `branch-health-audit.md` - Branch health monitoring
- `sync-feature-branch.md` - Feature branch synchronization

**Security & Operations:**
- `security-and-ops.md` - Security and operations

**Audit & Evaluation:**
- `automation-prompt-audit.md` - System audit prompts
- `workflow-evaluation-report.md` - Workflow evaluation

### **Workflow Prompts** (`workflows/`)

Complete end-to-end automation workflows:
- `e2e-issue-to-merge.md` - Issue to merge complete workflow
- `default-two-agent-pr-assignment-strategy.md` - Agent assignment workflow

### **Template Prompts** (`templates/`)

Quick reference templates:
- `github-complete-prompt-list.md` - One-liner prompt collection
- `github-pr-to-merge.md` - PR automation template

### **Agent Prompts** (`agents/`)

Agent coordination and assignment:
- `agent-assignments.md` - Agent assignment strategies

### **Generated Prompts** (`generated/`)

Auto-generated prompts (reference only):
- `automation-metrics-workflow-prompt.md`
- `docs-updater-workflow-prompt.md`
- `manage-projects-workflow-prompt.md`
- `pr-agent-assignment-workflow-prompt.md`

---

## 🎓 Learning Path

### **Beginner**
1. Start with: [Issue Management Default Prompt](automation/issue-management-default-prompt.md)
2. Try: Basic Usage Prompt section
3. Practice: Workflow 1 (Configure a Single Issue)

### **Intermediate**
1. Explore: All workflows in the default prompt
2. Learn: Queue management and batch processing
3. Use: AI-enhanced configuration

### **Advanced**
1. Master: Complete implementation workflows
2. Customize: Create custom presets
3. Integrate: Connect with PR and branch management

---

## 💡 Usage Tips

### **Getting Started**
1. **Copy a prompt** from the default prompt file
2. **Customize it** with your specific issue numbers and requirements
3. **Use dry-run first** by adding `-DryRun` to commands
4. **Start simple** with single issue operations before batch processing

### **Best Practices**
- ✅ Be specific with issue numbers, priorities, and statuses
- ✅ Test with `-DryRun` before executing
- ✅ Use presets for consistency
- ✅ Leverage AI analysis for intelligent recommendations
- ✅ Monitor progress with watch mode

### **Common Commands Reference**

**Configure Issue:**
```powershell
.\scripts\issue-management\configuration\configure-issues-unified.ps1 -IssueNumber 123 -Preset blog
```

**Analyze Issue:**
```powershell
.\scripts\issue-management\analysis\analyze-issues.ps1 -IssueNumber 123 -GeneratePlan
```

**Process Queue:**
```powershell
.\scripts\issue-management\management\manage-issue-queue.ps1 -AddIssue 123 -Queue high-priority
```

**Continuous Pipeline:**
```powershell
.\scripts\issue-management\management\run-issue-pipeline.ps1 -MaxIssues 5 -Status "Backlog" -Watch
```

---

## 🔍 Search by Feature

### **Issue Configuration**
- Automatic field setting
- Preset configurations
- AI-enhanced analysis
- → Use: `automation/issue-management-default-prompt.md`

### **Requirements Extraction**
- Acceptance criteria parsing
- File identification
- Implementation planning
- → Use: `automation/issue-analysis-prompt-template.md`

### **Queue Management**
- Priority-based queues
- Intelligent scheduling
- Batch processing
- → Use: `automation/issue-management-default-prompt.md` (Workflow 4)

### **Continuous Processing**
- Watch mode
- Automatic configuration
- Batch operations
- → Use: `automation/issue-management-default-prompt.md` (Advanced Usage)

### **PR Automation**
- PR configuration
- Status management
- Merge workflows
- → Use: `automation/pr-automation-prompt-template.md`

---

## 📖 Documentation

- **[Issue Management README](../scripts/issue-management/README.md)** - System documentation
- **[Developer Guide](../scripts/issue-management/DEVELOPER_GUIDE.md)** - Technical details

---

## 🆘 Need Help?

1. **Check the Default Prompt** - Most questions answered there
2. **Review Examples** - Each prompt includes examples
3. **Use Dry-Run** - Test before executing
4. **Start Simple** - Begin with single operations

---

## 🎯 Recommended Starting Points

| Your Goal | Start Here |
|-----------|------------|
| Configure a single issue | [Default Prompt - Workflow 1](automation/issue-management-default-prompt.md#workflow-1-configure-a-single-issue) |
| Analyze an issue | [Default Prompt - Workflow 2](automation/issue-management-default-prompt.md#workflow-2-analyze-an-issue-for-implementation) |
| Process multiple issues | [Default Prompt - Workflow 3](automation/issue-management-default-prompt.md#workflow-3-batch-process-multiple-issues) |
| Manage work queue | [Default Prompt - Workflow 4](automation/issue-management-default-prompt.md#workflow-4-queue-management) |
| Find stale issues | [Default Prompt - Workflow 5](automation/issue-management-default-prompt.md#workflow-5-stale-issue-detection) |
| Complete workflow | [Default Prompt - Complete Example](automation/issue-management-default-prompt.md#example-complete-workflow-prompt) |
| PR automation | [PR Automation Template](automation/pr-automation-prompt-template.md) |
| End-to-end workflow | [E2E Issue to Merge](workflows/e2e-issue-to-merge.md) |

---

**Remember**: The Issue Management System is designed to save you time. Start with the [Default Prompt](automation/issue-management-default-prompt.md) and customize from there!

*Last updated: 2025-01-27*
