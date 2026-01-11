# Quick Start Guide - Issue Management Prompts

## 🚀 Get Started in 30 Seconds

**Just want to configure an issue?** Copy this:

```
Configure issue #123 with:
- Priority: P1
- Size: Medium  
- Status: Backlog
- Use the "blog" preset

Show me the exact command to run.
```

---

## 📋 Most Common Prompts

### **1. Configure an Issue**
```
Configure issue #[NUMBER] with preset [blog|dashboard|docs|infra]
```

### **2. Analyze an Issue**
```
Analyze issue #[NUMBER] and extract:
- Automatically detect and set issue type (Feature/Bug/Task)
- Acceptance criteria
- Files to modify
- Implementation plan
- Time estimate
- Create typed branch (feature/bug/task)
```

### **3. Process Multiple Issues**
```
Process [NUMBER] issues with status "[STATUS]" and priority [PRIORITY]
Use preset [PRESET] for all
```

### **4. Manage Queue**
```
Add issues #[NUMBERS] to [high-priority|standard|low-priority] queue
Show queue status and process next [NUMBER] issues
```

### **5. Find Stale Issues**
```
Find all stale issues:
- Created more than 30 days ago
- No activity in 14+ days
- Unassigned issues
Show summary
```

---

## 🎯 By What You Want to Do

| I Want To... | Use This Prompt |
|--------------|----------------|
| Configure one issue | [Default Prompt - Workflow 1](../automation/issue-management-default-prompt.md#workflow-1-configure-a-single-issue) |
| Analyze requirements | [Default Prompt - Workflow 2](../automation/issue-management-default-prompt.md#workflow-2-analyze-an-issue-for-implementation) |
| Process many issues | [Default Prompt - Workflow 3](../automation/issue-management-default-prompt.md#workflow-3-batch-process-multiple-issues) |
| Manage my queue | [Default Prompt - Workflow 4](../automation/issue-management-default-prompt.md#workflow-4-queue-management) |
| Find old issues | [Default Prompt - Workflow 5](../automation/issue-management-default-prompt.md#workflow-5-stale-issue-detection) |
| Use AI analysis | [Default Prompt - AI Enhanced](../automation/issue-management-default-prompt.md#ai-enhanced-configuration) |
| Complete workflow | [Default Prompt - Complete Example](../automation/issue-management-default-prompt.md#example-complete-workflow-prompt) |

---

## 📖 Full Documentation

For complete guides, examples, and advanced usage:
- **[Issue Management Default Prompt](automation/issue-management-default-prompt.md)** - Complete guide
- **[Main README](README.md)** - Full directory overview

---

## 💡 Pro Tips

1. **Always use `-DryRun` first** to test commands
2. **Start with single issues** before batch processing  
3. **Use presets** for consistency (blog, dashboard, docs, infra)
4. **Issue types auto-detect** - No need to specify Feature/Bug/Task manually
5. **Typed branches** - Branches automatically get type prefix (feature/, bug/, task/)
6. **Enable AI** with `-EnableAI` for smart recommendations
7. **Watch mode** for continuous processing

---

**Ready to dive deeper?** → [Full Default Prompt Guide](automation/issue-management-default-prompt.md)


