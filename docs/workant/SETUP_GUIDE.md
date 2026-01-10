# Project Setup Guide

This guide will walk you through setting up Workant for your GitHub organization and projects.

## Prerequisites

Before running the setup script, ensure you have:

1. **GitHub CLI installed**
   - Download from: https://cli.github.com/
   - Verify installation: `gh --version`

2. **GitHub CLI authenticated**
   - Run: `gh auth login`
   - Follow the prompts to authenticate

3. **Access to GitHub organization**
   - You must have access to the organization you want to configure
   - You must have access to the projects you want to configure

## Quick Start

Run the setup script:

```powershell
.\scripts\configuration\setup-project.ps1
```

The script will guide you through the configuration process interactively.

## Detailed Setup Process

### Step 1: Run Setup Script

```powershell
.\scripts\configuration\setup-project.ps1
```

### Step 2: Prerequisites Check

The script will automatically check:
- ✅ GitHub CLI is installed
- ✅ GitHub CLI is authenticated

If either check fails, the script will provide instructions to fix the issue.

### Step 3: Organization Detection

The script will:
- Try to auto-detect your organization from the current repository
- Ask you to confirm or enter a different organization name

**Example:**
```
Detected organization: IntraWeb-Technology
Use this organization? (Y/n): Y
```

### Step 4: Issue Types Detection

The script automatically detects available issue types from your organization:
- Feature
- Bug
- Task

These are saved to your configuration.

### Step 5: Project Configuration

For each project you want to configure:

1. **Enter project number** (e.g., `6` for Project #6)
2. **Script auto-detects**:
   - Project ID
   - Project title
   - All available fields (Status, Priority, Size, Estimate)
   - All field options (e.g., Backlog, Ready, In progress, etc.)

3. **Confirm configuration**:
   - Review detected fields
   - Confirm or skip the project

**Example:**
```
Enter project number (or 'done' to finish): 6
Detecting project #6...
✅ Found project: @Workant
✅ Detected field: Status
✅ Detected field: Priority
✅ Detected field: Size
✅ Detected field: Estimate

Detected fields:
  - Status
  - Priority
  - Size
  - Estimate
Confirm this project configuration? (Y/n): Y
✅ Project 'workant' added
```

### Step 6: Set Default Project

If you configure multiple projects, select which one should be the default:

```
Available projects:
  1. workant - @Workant
  2. portfolio - @Workant
Select default project (1-2): 1
```

### Step 7: Configuration Saved

The script saves your configuration to:
```
scripts/configuration/project-config.json
```

### Step 8: Validation

The script validates:
- Configuration file is valid JSON
- All projects are accessible
- Issue types are configured

## Configuration File

Your configuration is saved to `scripts/configuration/project-config.json`:

```json
{
  "version": "1.0",
  "organization": "YourOrg",
  "setupDate": "2025-01-XX",
  "projects": {
    "projectkey": {
      "name": "@Project Name",
      "projectId": "PVT_...",
      "projectNumber": 6,
      "fieldIds": { ... },
      "options": { ... },
      "defaults": { ... }
    }
  },
  "issueTypes": { ... },
  "defaultProject": "projectkey"
}
```

## Updating Configuration

To update your configuration:

```powershell
# Run setup again (will prompt to overwrite)
.\scripts\configuration\setup-project.ps1

# Or force overwrite
.\scripts\configuration\setup-project.ps1 -Force
```

## Troubleshooting

### "GitHub CLI not found"

**Solution**: Install GitHub CLI from https://cli.github.com/

### "GitHub CLI not authenticated"

**Solution**: Run `gh auth login` and follow the prompts

### "Project #X not found"

**Possible causes**:
- Project number is incorrect
- You don't have access to the project
- Project is in a different organization

**Solution**: Verify project number and organization access

### "Field not detected"

**Possible causes**:
- Field name doesn't match expected names (Status, Priority, Size, Estimate)
- Field type is not single-select (for Status/Priority/Size)
- Field doesn't exist in the project

**Solution**: 
- Check field names in your GitHub project
- Fields must be named exactly: Status, Priority, Size, Estimate
- You can manually edit `project-config.json` if needed

### "Configuration file not found"

**Solution**: Run `.\scripts\configuration\setup-project.ps1` to create the configuration

### Scripts show "Project Configuration Not Found"

**Solution**: Run the setup script first:
```powershell
.\scripts\configuration\setup-project.ps1
```

## Manual Configuration

If auto-detection fails, you can manually edit `scripts/configuration/project-config.json`:

1. Get field IDs from GitHub API:
   ```powershell
   gh api graphql -f query='query { organization(login: "YourOrg") { projectV2(number: 6) { fields(first: 50) { nodes { id name } } } } }'
   ```

2. Get option IDs for fields:
   ```powershell
   gh api graphql -f query='query { organization(login: "YourOrg") { projectV2(number: 6) { fields(first: 50) { nodes { ... on ProjectV2SingleSelectField { id name options { id name } } } } } } }'
   ```

3. Edit `project-config.json` with the IDs

## Multiple Projects

You can configure multiple projects in one setup session:

1. Run setup script
2. Add first project (enter project number)
3. When prompted, enter another project number (or 'done' to finish)
4. Select default project from the list

All configured projects will be available for use in automation scripts.

## Next Steps

After setup, you can:

1. **Create issues** with automatic field configuration:
   ```powershell
   .\scripts\issue-management\create-issue-enhanced.ps1 -Title "..." -Body "..."
   ```

2. **Use other automation scripts** - they all read from your configuration

3. **Update configuration** anytime by running setup again

## Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Verify prerequisites are met
3. Check GitHub CLI authentication: `gh auth status`
4. Review configuration file: `scripts/configuration/project-config.json`

