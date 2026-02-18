I need to use the Issue Management System for GitHub issue automation. Here's what I need you to understand and help me with:

## System Overview

The Issue Management System is an automated GitHub issue management system located in the workspace at `scripts/issue-management/`. It provides comprehensive automation for:

1. **Automatic Issue Configuration** - Sets GitHub project fields (Priority, Size, Status, Estimate, Labels, Milestones) automatically using presets (blog, dashboard, docs, infra) or AI analysis
2. **Automatic Issue Type Detection** - Automatically detects and sets issue types (Feature, Bug, Task) from title, body, and labels. Creates typed branches (feature/, bug/, task/) and uses appropriate commit prefixes (feat:, fix:, chore:)
3. **Intelligent Requirements Extraction** - Analyzes issue descriptions to extract acceptance criteria, technical requirements, files to modify, and generates implementation plans
4. **Complete Implementation Workflow** - Guides from issue analysis through implementation to completion with progress tracking, including automatic branch creation with type prefixes
5. **Queue Management** - Intelligent prioritized queues (high-priority, standard, low-priority) with weighted scoring and concurrent processing
6. **Continuous Issue Processing** - Watches for new issues and processes them automatically in batches
7. **Stale Issue Detection** - Identifies old, inactive, or unassigned issues that need attention

## Available Scripts & Commands

**Configuration:**
- `scripts/issue-management/configuration/configure-issues-unified.ps1` - Configure issues with presets or AI
  - Usage: `-IssueNumber <number> -Preset <blog|dashboard|docs|infra> -EnableAI -DryRun`
  - Example: `.\scripts\issue-management\configuration\configure-issues-unified.ps1 -IssueNumber 123 -Preset blog`

**Analysis:**
- `scripts/issue-management/analysis/analyze-issues.ps1` - Extract requirements and generate implementation plans
  - Usage: `-IssueNumber <number> -GeneratePlan -ExportPath <path>`
  - Example: `.\scripts\issue-management\analysis\analyze-issues.ps1 -IssueNumber 123 -GeneratePlan`

**Issue Creation:**
- `scripts/issue-management/create-issue-enhanced.ps1` - Create issues with automatic branch creation and type detection
  - Usage: `-Title <title> -Body <body> -Labels <labels> -IssueType <Feature|Bug|Task> -CreateBranch -PushBranch`
  - Example: `.\scripts\issue-management\create-issue-enhanced.ps1 -Title "Fix bug" -Body "Description" -Labels "bug"`
  - Note: Issue type is automatically detected from title/body/labels if not specified

**Implementation Workflow:**
- `scripts/issue-management/implementation/implement-issues.ps1` - Complete implementation workflow tracking
  - Usage: `-IssueNumber <number> -Mode <analyze|plan|implement|validate|complete|auto> -Interactive -DryRun`
  - Example: `.\scripts\issue-management\implementation\implement-issues.ps1 -IssueNumber 123 -Mode auto`
  - Automatically detects issue type, sets it on GitHub, creates typed branch (feature/bug/task), uses appropriate commit prefix

**Queue Management:**
- `scripts/issue-management/management/manage-issue-queue.ps1` - Manage prioritized work queues
  - Usage: `-AddIssue <number> -Queue <high-priority|standard|low-priority> -ProcessQueue -MaxConcurrent <n>`
  - Example: `.\scripts\issue-management\management\manage-issue-queue.ps1 -AddIssue 123 -Queue high-priority`

**Continuous Processing:**
- `scripts/issue-management/management/run-issue-pipeline.ps1` - Continuous issue processing with watch mode
  - Usage: `-MaxIssues <n> -Status <Todo|In progress|Ready|Done> -Priority <P0|P1|P2|P3> -Watch -Interval <seconds> -EnableAI -UseQueueManager`
  - Example: `.\scripts\issue-management\management\run-issue-pipeline.ps1 -MaxIssues 5 -Status "Todo" -Watch -EnableAI`

**Stale Issue Detection:**
- `scripts/issue-management/analysis/analyze-stale-issues.ps1` - Find issues that need attention
  - Usage: `-DaysOld <n> -DaysInactive <n> -ShowUnassigned -ExportPath <path>`
  - Example: `.\scripts\issue-management\analysis\analyze-stale-issues.ps1`

## Common Workflows

**Workflow 1: Configure a Single Issue**
When I mention configuring an issue (e.g., "Configure issue #123"), you should:
1. Ask if I want to use a preset (blog, dashboard, docs, infra) or manual configuration
2. Show me the exact command with appropriate parameters
3. Offer to run it in dry-run mode first if unsure
4. Execute the command when I confirm

**Workflow 2: Analyze an Issue for Implementation**
When I mention analyzing an issue (e.g., "Analyze issue #456"), you should:
1. Run the analysis script with -GeneratePlan flag
2. Extract and display: acceptance criteria, technical requirements, files to modify, complexity estimate
3. Show the generated implementation plan with phases
4. Offer to configure the issue if not already done

**Workflow 3: Batch Process Multiple Issues**
When I mention processing multiple issues (e.g., "Process 10 issues in Backlog"), you should:
1. Set up the continuous pipeline with appropriate filters
2. Suggest batch size and watch interval
3. Show the command and offer to run it
4. Monitor progress if running in watch mode

**Workflow 4: Queue Management**
When I mention managing my queue (e.g., "Add issues to my queue"), you should:
1. Determine the appropriate queue based on priority
2. Add issues to the queue
3. Show queue status and statistics
4. Offer to process the queue with appropriate concurrency limits

**Workflow 5: Complete Implementation Workflow**
When I mention working on an issue (e.g., "Help me work on issue #789"), you should:
1. Automatically detect issue type from content and set it on GitHub if not already set
2. Analyze the issue to extract requirements
3. Configure it with appropriate fields
4. Generate an implementation plan
5. Create a branch with type prefix (feature/issue-789, bug/issue-789, or task/issue-789)
6. Guide me through each phase (analysis → implementation → validation → completion)
7. Use appropriate commit message prefix (feat:, fix:, or chore:) based on issue type
8. Track progress and validate work at each step

**Workflow 6: Stale Issue Detection**
When I mention finding stale issues or need attention, you should:
1. Run the stale issue analysis
2. Categorize issues (very old, old, inactive, unassigned, etc.)
3. Show summary and help decide what actions to take
4. Offer to configure or process identified issues

## Your Role

When I work with issues, you should:
1. **Be Proactive** - Suggest appropriate presets, priorities, and workflows based on context
2. **Show Commands** - Always display the exact PowerShell command before running it
3. **Auto-Detect Types** - Automatically detect issue types (Feature/Bug/Task) from content and set them on GitHub
4. **Use Dry-Run** - Offer dry-run mode when configuring issues to preview changes
5. **Leverage AI** - Suggest using -EnableAI when intelligent analysis would help
6. **Guide Workflows** - Walk me through multi-step workflows, tracking progress
7. **Handle Errors** - If commands fail, diagnose the issue (check issue existence, field IDs, permissions)
8. **Monitor Status** - Show queue status, processing statistics, and progress
9. **Provide Context** - Reference issue details, current status, and related information
10. **Type-Aware Branches** - Ensure branches are created with appropriate type prefixes (feature/, bug/, task/)

## Integration with Other Tools

The system integrates with:
- GitHub Issues (read/write via GitHub CLI and API)
- GitHub Projects (set project field values)
- Git Repository (create branches, check status, validate commits)
- Optional: OpenAI API for AI-enhanced analysis

## Key Principles

1. **Automation First** - Prefer automated configuration over manual steps
2. **Auto-Detect Issue Types** - Automatically detect and set issue types from content (no manual specification needed)
3. **Type-Aware Operations** - Use issue types for branch naming (feature/bug/task) and commit prefixes (feat:/fix:/chore:)
4. **Presets When Possible** - Use presets (blog, dashboard, docs, infra) for consistency
5. **AI Enhancement** - Suggest AI analysis when it would add value
6. **Dry-Run Safety** - Always offer dry-run mode for destructive operations
7. **Progress Tracking** - Track and report progress through workflows
8. **Error Handling** - Diagnose and fix issues proactively
7. **Batch Processing** - Use batch operations for multiple issues efficiently

## Getting Started

Now that you understand the system, help me:
1. Identify what I want to accomplish with issues
2. Determine the appropriate workflow
3. Show me the commands needed
4. Execute them when I confirm
5. Track progress and provide updates
