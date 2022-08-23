import fs from "fs"
import GitLog from "./git-log"

import type { CommitRaw } from "./NodeTypes.temp"

describe("git-log", () => {
	let gitlog: GitLog

	beforeAll(() => {
		gitlog = new GitLog()
	})

	it("git-repo 경로를 전달받아, git log 출력을 반환한다", () => {
		// given
		const gitRepoPath = "~~~"

		// when
		const gitLogOutput = gitlog.collect(gitRepoPath)

		// then
		expect(gitLogOutput).toBeDefined()
		expect(typeof gitLogOutput).toBe("string")
	})

	it("git-log 출력을 전달받아, CommitRaw[] 를 반환한다", () => {
		// given
		const gitLogOutput = fs.readFileSync(`${__dirname}/git-log.sample.txt`).toString()

		// when
		const commitRaws = gitlog.parse(gitLogOutput)

		// then
		expect(commitRaws).toBeDefined()
		expect(commitRaws instanceof Array<CommitRaw>).toBe(true)
	})
})
