import * as cp from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export interface GitExecutable {
	readonly path: string;
	readonly version: string;
}

export function resolveSpawnOutput(cmd: cp.ChildProcess) {
	return Promise.all([
		new Promise<{ code: number, error: Error | null }>((resolve) => {
			// status promise
			let resolved = false;
			cmd.on('error', (error) => {
				if (resolved) return;
				resolve({ code: -1, error: error });
				resolved = true;
			});
			cmd.on('exit', (code) => {
				if (resolved) return;
				resolve({ code: code || 0, error: null });
				resolved = true;
			});
		}),
		new Promise<Buffer>((resolve) => {
			// stdout promise
			const buffers: Buffer[] = [];
			cmd.stdout && cmd.stdout.on('data', (b: Buffer) => { buffers.push(b); });
			cmd.stdout && cmd.stdout.on('close', () => resolve(Buffer.concat(buffers)));
		}),
		new Promise<string>((resolve) => {
			// stderr promise
			let stderr = '';
			cmd.stderr && cmd.stderr.on('data', (d) => { stderr += d; });
			cmd.stderr && cmd.stderr.on('close', () => resolve(stderr));
		})
	]);
}

export async function findGit() {
	switch (process.platform) {
		case 'darwin':
			return findGitOnDarwin();
		case 'win32':
			return findGitOnWin32();
		default:
			return getGitExecutable('git');
	}
}

function findGitOnDarwin() {
	return new Promise<GitExecutable>((resolve, reject) => {
		cp.exec('which git', (err, stdout) => {
			if (err) return reject();

			const path = stdout.trim();
			if (path !== '/usr/bin/git') {
				getGitExecutable(path).then((exec) => resolve(exec), () => reject());
			} else {
				// must check if XCode is installed
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				cp.exec('xcode-select -p', (err: any) => {
					if (err && err.code === 2) {
						// git is not installed, and launching /usr/bin/git will prompt the user to install it
						reject();
					} else {
						getGitExecutable(path).then((exec) => resolve(exec), () => reject());
					}
				});
			}
		});
	});
}

function findGitOnWin32() {
	return findSystemGitWin32(process.env['ProgramW6432'])
		.then(undefined, () => findSystemGitWin32(process.env['ProgramFiles(x86)']))
		.then(undefined, () => findSystemGitWin32(process.env['ProgramFiles']))
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		.then(undefined, () => findSystemGitWin32(process.env['LocalAppData'] ? path.join(process.env['LocalAppData']!, 'Programs') : undefined))
		.then(undefined, () => findGitWin32InPath());
}
function findSystemGitWin32(pathBase?: string) {
	return pathBase
		? getGitExecutable(path.join(pathBase, 'Git', 'cmd', 'git.exe'))
		: Promise.reject<GitExecutable>();
}
async function findGitWin32InPath() {
	const dirs = (process.env['PATH'] || '').split(';');
	dirs.unshift(process.cwd());

	for (let i = 0; i < dirs.length; i++) {
		const file = path.join(dirs[i], 'git.exe');
		if (await isExecutable(file)) {
			try {
				return await getGitExecutable(file);
			} catch (_) { }
		}
	}
	return Promise.reject<GitExecutable>();
}

function isExecutable(path: string) {
	return new Promise<boolean>(resolve => {
		fs.stat(path, (err, stat) => {
			resolve(!err && (stat.isFile() || stat.isSymbolicLink()));
		});
	});
}

export function getGitExecutable(path: string) {
	return new Promise<GitExecutable>((resolve, reject) => {
		resolveSpawnOutput(cp.spawn(path, ['--version'])).then((values) => {
			if (values[0].code === 0) {
				resolve({ path: path, version: values[1].toString().trim().replace(/^git version /, '') });
			} else {
				reject();
			}
		});
	});
}

export async function getGitExecutableFromPaths(paths: string[]): Promise<GitExecutable> {
	for (let i = 0; i < paths.length; i++) {
		try {
			return await getGitExecutable(paths[i]);
		} catch (_) { }
	}
	throw new Error('None of the provided paths are a Git executable');
}

export async function getGitLog(gitPath: string, currentWorkspacePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const args = [
            "--no-pager",
            "log",
            "--all",
            "--parents",
            "--numstat",
            "--date-order",
            "--pretty=fuller",
            "--decorate",
            "-c",
        ];

        resolveSpawnOutput(cp.spawn(gitPath, args, {
            cwd: currentWorkspacePath,
            env: Object.assign({}, process.env)
        })).then((values) => {
            const status = values[0], stdout = values[1], stderr = values[2];
            if (status.code === 0) {
                resolve(stdout.toString());
            } else {
                reject(stderr);
            }
        });
    });
}

export async function getGitConfig(gitPath: string, currentWorkspacePath: string, remoteType: "origin" | "upstream"): Promise<string> {
	return new Promise((resolve, reject) => {
        const args = [
            "config",
            "--get",
            `remote.${remoteType}.url`,
        ];


        resolveSpawnOutput(cp.spawn(gitPath, args, {
            cwd: currentWorkspacePath,
            env: Object.assign({}, process.env)
        })).then((values) => {
            const status = values[0], stdout = values[1], stderr = values[2];
            if (status.code === 0) {
                resolve(stdout.toString());
            } else {
                reject(stderr);
            }
        });
    });
}

export const getRepo = (gitConfig: string) => {
	const regex = /^(https|http):\/\/[\s\S]+.git$/g;
	if(regex.test(gitConfig.trim())) {
		const chunks = gitConfig.split('.git')[0].split('/');
		return { owner: chunks.slice(-2)[0], repo: chunks.slice(-1)[0] };
	} else {
		throw new Error('git config should be: https|http://${domain}/${owner}/${repo}.git');
	}
}