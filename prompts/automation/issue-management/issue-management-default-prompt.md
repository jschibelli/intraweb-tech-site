# Issue Management System - Default User Prompt

## Quick Start Guide

Use this prompt as a starting point when working with the Issue Management System. Copy and customize it for your specific needs.

---

## **Basic Usage Prompt**

```
I need to work with GitHub issues using the Issue Management System. Help me:

1. Configure a new issue with appropriate priority, size, and status
2. Analyze an issue to extract requirements and create an implementation plan
3. Process multiple issues automatically
4. Manage my work queue efficiently

Start by showing me the available commands and how to use them for my current workflow.
```

---

## **Common Workflows**

### **Workflow 1: Configure a Single Issue**

```
Configure issue #123 with:
- Priority: P1
- Size: Medium
- Status: Backlog
- Use the "blog" preset
- Add it to the project board
- Issue type will be automatically detected from content (Feature/Bug/Task)

Show me the exact command to run.
```

### **Workflow 2: Analyze an Issue for Implementation**

```
Analyze issue #456 and:
1. Automatically detect and set the issue type (Feature/Bug/Task) from content
2. Extract all acceptance criteria
3. Identify files that need to be modified
4. Generate a step-by-step implementation plan
5. Estimate the complexity and time required
6. Create a branch with the appropriate type prefix (feature/bug/task)

Run the analysis and show me the results.
```

### **Workflow 3: Batch Process Multiple Issues**

```
I have 10 issues in "Backlog" status with Priority P1. I want to:
1. Configure them all automatically
2. Process them in batches of 3
3. Use the "dashboard" preset for all

Set up the continuous pipeline to handle this.
```

### **Workflow 4: Queue Management**

```
I need to manage my work queue:
1. Add issues #100, #101, #102 to the high-priority queue
2. Show me the current queue status
3. Process the next 2 issues from the queue
4. Display processing statistics

Help me set this up.
```

### **Workflow 5: Stale Issue Detection**

```
Find all stale issues that need attention:
- Issues created more than 30 days ago
- Issues with no activity in the last 14 days
- Unassigned issues
- Low priority issues that haven't been updated

Show me a summary and help me decide what to do with them.
```

---

## **Advanced Usage Prompts**

### **AI-Enhanced Configuration**

```
Use AI to analyze issue #789 and automatically configure:
- Optimal priority based on content
- Appropriate size estimation
- Relevant labels
- Suggested milestone

Run the AI analysis and apply the recommended configuration.
```

### **Complete Implementation Workflow**

```
Guide me through the complete implementation workflow for issue #999:
1. Automatically detect issue type from content and set it on GitHub
2. Analyze the issue and extract requirements
3. Generate an implementation plan
4. Create a branch with type prefix (feature/issue-999, bug/issue-999, or task/issue-999)
5. Track my progress as I work
6. Use appropriate commit message prefix (feat:, fix:, or chore:) based on issue type
7. Validate my changes (linting, tests)
8. Mark the issue as complete when done

Start the workflow and guide me through each step.
```

### **Continuous Monitoring**

```
Set up continuous monitoring for:
- New issues with Priority P0 or P1
- Issues in "Backlog" status
- Check every 60 seconds
- Automatically configure any matching issues

Start the watch mode and keep it running.
```

---

## **Troubleshooting Prompts**

### **When Configuration Fails**

```
Issue #123 failed to configure. Help me:
1. Check if the issue exists in the project
2. Verify the field IDs are correct
3. Test the configuration in dry-run mode
4. Show me what would be set before making changes

Diagnose the problem and fix it.
```

### **When Queue Processing Stalls**

```
My issue queue seems stuck. Help me:
1. Check queue status and see what's processing
2. Identify any failed issues
3. Clear stuck items if needed
4. Restart processing

Show me the current state and help resolve it.
```

---

## **Customization Prompts**

### **Create Custom Preset**

```
I need a custom preset for "api" issues that sets:
- Priority: P1
- Size: Large
- Labels: ["api", "backend", "priority: high"]
- Status: Backlog

Show me how to add this preset to the configuration.
```

### **Filter Issues by Criteria**

```
Find all issues that match:
- Status: "In progress"
- Priority: P1 or P2
- Created in the last 7 days

List them and help me decide which to work on next.
```

---

## **Best Practices Prompt**

```
I'm new to the Issue Management System. Teach me:
1. When to use presets vs manual configuration
2. How to choose the right priority and size
3. When to use AI analysis vs manual setup
4. How to efficiently manage multiple issues
5. Best practices for queue management

Give me a comprehensive guide with examples.
```

---

## **Integration Prompts**

### **With PR Management**

```
I've completed work on issue #555. Help me:
1. Mark the issue as "Ready for Merge"
2. Create a pull request linked to the issue
3. Configure the PR with appropriate fields
4. Update the project board status

Guide me through the complete workflow.
```

### **With Branch Management**

```
I'm starting work on issue #777. Help me:
1. Automatically detect issue type from content (Feature/Bug/Task)
2. Set the issue type on GitHub if not already set
3. Create a branch with type prefix (feature/issue-777, bug/issue-777, or task/issue-777)
4. Configure the issue with appropriate fields
5. Set up the branch for development
6. Link everything together

Set this up automatically.
```

---

## **Quick Reference Commands**

When asking for help, you can reference these common commands:

**Configure Issue:**
```powershell
.\scripts\issue-management\configuration\configure-issues-unified.ps1 -IssueNumber 123 -Preset blog
```

**Analyze Issue:**
```powershell
.\scripts\issue-management\analysis\analyze-issues.ps1 -IssueNumber 123 -GeneratePlan
```

**Create Issue with Auto-Detection:**
```powershell
.\scripts\issue-management\create-issue-enhanced.ps1 -Title "Fix navigation bug" -Body "Description" -Labels "bug,frontend"
# Issue type automatically detected from title/body/labels
```

**Implement Issue (Auto-Detects Type):**
```powershell
.\scripts\issue-management\implementation\implement-issues.ps1 -IssueNumber 123 -Mode auto
# Automatically detects issue type, sets it on GitHub, creates typed branch, uses appropriate commit prefix
```

**Process Queue:**
```powershell
.\scripts\issue-management\management\manage-issue-queue.ps1 -AddIssue 123 -Queue high-priority
```

**Continuous Pipeline:**
```powershell
.\scripts\issue-management\management\run-issue-pipeline.ps1 -MaxIssues 5 -Status "Backlog" -Watch
```

**Find Stale Issues:**
```powershell
.\scripts\issue-management\analysis\analyze-stale-issues.ps1
```

---

## **Automatic Issue Type Detection**

The system now automatically detects issue types (Feature, Bug, Task) from:
- **Title keywords**: "fix:", "bug:", "feat:", "chore:", etc.
- **Body content**: Keywords like "broken", "error", "add", "implement", "refactor"
- **Labels**: "bug", "fix", "feature", "task", "chore" labels
- **Patterns**: Common phrases and issue descriptions

**What happens automatically:**
- Issue type is detected when creating or analyzing issues
- Type is set on GitHub if not already configured
- Branch names include type prefix: `feature/issue-123`, `bug/issue-123`, `task/issue-123`
- Commit messages use appropriate prefix: `feat:`, `fix:`, or `chore:`

**Example:**
- Issue title: "Fix navigation menu bug" → Detected as **Bug** → Branch: `bug/issue-123` → Commit: `fix: implement issue #123`
- Issue title: "Add dark mode toggle" → Detected as **Feature** → Branch: `feature/issue-124` → Commit: `feat: implement issue #124`
- Issue title: "Refactor API client" → Detected as **Task** → Branch: `task/issue-125` → Commit: `chore: implement issue #125`

## **Tips for Using This Prompt**

1. **Be Specific**: Include issue numbers, priorities, and statuses when possible
2. **Use Dry-Run First**: Add `-DryRun` to test commands before executing
3. **Start Simple**: Begin with single issue operations before batch processing
4. **Leverage AI**: Use `-EnableAI` for intelligent recommendations
5. **Monitor Progress**: Use watch mode to see real-time updates
6. **Issue Type Auto-Detection**: The system automatically detects issue types - no need to specify manually

---

## **Example: Complete Workflow Prompt**

```
I want to work on issue #123. Help me:

1. First, analyze the issue to understand what needs to be done
2. Automatically detect and set the issue type (Feature/Bug/Task) from content
3. Configure it with appropriate priority (P1), size (Medium), and status (Backlog)
4. Extract the requirements and create an implementation plan
5. Create a branch with the appropriate type prefix (feature/bug/task)
6. Add it to my high-priority work queue
7. Start the implementation workflow to track my progress
8. Use appropriate commit message prefix based on issue type

Guide me through each step and show me the commands to run.
```

---

**Remember**: The Issue Management System is designed to save you time and ensure consistency. Don't hesitate to use presets, AI analysis, and automation features to streamline your workflow!
