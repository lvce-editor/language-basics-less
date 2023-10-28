import { execaCommand } from 'execa'
import { readFile, readdir, rm, writeFile } from 'node:fs/promises'
import path, { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const REPO = 'https://github.com/bus-stop/x-terminal'
const COMMIT = '2e95790ef20b155feb4c3e50a8cadbcbe92c671e'

const getTestName = (line) => {
  return 'x-terminal.less'
}

const getAllTests = async (folder) => {
  const dirents = await readdir(folder, { recursive: true })
  const allTests = []
  for (const dirent of dirents) {
    if (!dirent.endsWith('.less')) {
      continue
    }
    const filePath = join(folder, dirent)
    const fileContent = await readFile(filePath, 'utf8')
    allTests.push({
      testName: getTestName(dirent),
      testContent: fileContent,
    })
  }
  return allTests
}

const writeTestFiles = async (allTests) => {
  for (const test of allTests) {
    await writeFile(
      `${root}/test/cases/${test.testName}.less`,
      test.testContent,
    )
  }
}

const main = async () => {
  process.chdir(root)
  await rm(`${root}/.tmp`, { recursive: true, force: true })
  await execaCommand(`git clone ${REPO} .tmp/x-terminal`)
  process.chdir(`${root}/.tmp/x-terminal`)
  await execaCommand(`git checkout ${COMMIT}`)
  process.chdir(root)
  const allTests = await getAllTests(`${root}/.tmp/x-terminal/styles`)
  await writeTestFiles(allTests)
}

main()
