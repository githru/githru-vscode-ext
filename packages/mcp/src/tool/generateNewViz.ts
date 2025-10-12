import { AnalysisEngine } from "../engine/Engine.js";
import { GitHubUtils } from "../common/utils.js";
import { I18n } from "../common/i18n.js";
import type { GitHubRepoInfo, CSMDictGeneratorInputs, CSMDictResult, AnalysisResult } from "../common/types.js";

class EngineGenerator {
  public inputs: CSMDictGeneratorInputs;
  public repoInfo: GitHubRepoInfo | null = null;
  public gitLog: string = '';
  public analysisResult!: AnalysisResult;
  private initializationPromise: Promise<void>;
  
  constructor(inputs: CSMDictGeneratorInputs) {
    this.inputs = inputs;
    I18n.setLocale(inputs.locale || 'en');
    this.initializationPromise = this.initializeAnalysis();
  }

  async waitForInitialization(): Promise<void> {
    await this.initializationPromise;
  }

  private async initializeAnalysis(): Promise<void> {
    const { repo, baseBranchName } = this.inputs;
    
    this.repoInfo = GitHubUtils.parseRepoUrl(repo);

    let targetBranch = baseBranchName;
    if (!targetBranch) {
      targetBranch = await GitHubUtils.getDefaultBranch(
        this.inputs.githubToken, 
        this.repoInfo.owner, 
        this.repoInfo.repo
      );
    }

    const tempRepoPath = `/tmp/githru-temp-${Date.now()}`;
    
    await GitHubUtils.cloneRepository(
      this.inputs.githubToken,
      this.repoInfo.owner,
      this.repoInfo.repo,
      tempRepoPath
    );

    this.gitLog = await GitHubUtils.getGitLog("git", tempRepoPath);
    
    try {
      const fs = await import('fs');
      await fs.promises.rm(tempRepoPath, { recursive: true, force: true });
    } catch (cleanupError) {
      // ignore cleanup errors
    }
    
    try {
      const analysisEngine = new AnalysisEngine({
        gitLog: this.gitLog,
        owner: this.repoInfo.owner,
        repo: this.repoInfo.repo,
        auth: this.inputs.githubToken,
        baseBranchName: targetBranch,
      });

      this.analysisResult = await analysisEngine.analyzeGit();
    } finally {
    }
  }
}

class NewViz {
  private engine: EngineGenerator;
  
  constructor(engine: EngineGenerator) {
    this.engine = engine;
  }
  
  async generate(): Promise<any> {
    if (!this.engine.repoInfo || !this.engine.analysisResult) {
      throw new Error('Engine not initialized');
    }

    return this.buildResult();
  }
  
  private buildResult(): any {
    if (!this.engine.repoInfo || !this.engine.analysisResult) {
      throw new Error('Required data not available');
    }
    
    const { isPRSuccess, csmDict } = this.engine.analysisResult;
    
    return csmDict;
  }
}

export async function generateNewViz(inputs: CSMDictGeneratorInputs): Promise<any> {
  const engine = new EngineGenerator(inputs);
  await engine.waitForInitialization();
  const viz = new NewViz(engine);
  return await viz.generate();
}