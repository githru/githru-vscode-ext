import { AnalysisEngine } from "@githru-vscode-ext/analysis-engine";
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
    console.debug(`Repository info - Owner: ${this.repoInfo.owner}, Repo: ${this.repoInfo.repo}`);

    const targetBranch = baseBranchName || await GitHubUtils.getDefaultBranch(
      this.inputs.githubToken, 
      this.repoInfo.owner, 
      this.repoInfo.repo
    );

    this.gitLog = await GitHubUtils.fetchGitLogFromGitHub(
      this.inputs.githubToken,
      this.repoInfo.owner,
      this.repoInfo.repo
    );

    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    
    console.log = () => {};
    console.error = () => {};
    
    try {
      const analysisEngine = new AnalysisEngine({
        isDebugMode: false,
        gitLog: this.gitLog,
        owner: this.repoInfo.owner,
        repo: this.repoInfo.repo,
        auth: this.inputs.githubToken,
        baseBranchName: targetBranch,
      });

      this.analysisResult = await analysisEngine.analyzeGit();
    } finally {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
    }
  }
}

class NewViz {
  private engine: EngineGenerator;
  
  constructor(engine: EngineGenerator) {
    this.engine = engine;
  }
  
  async generate(): Promise<any> {
    const { debug = false } = this.engine.inputs;
    
    if (!this.engine.repoInfo || !this.engine.analysisResult) {
      throw new Error('Engine not initialized');
    }

    return this.buildResult(debug);
  }
  
  private buildResult(debug: boolean): any {
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