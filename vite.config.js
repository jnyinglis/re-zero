import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'

const gitCommitHash = () => {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim()
  } catch (error) {
    return 'unknown'
  }
}

export default defineConfig({
  plugins: [react()],
  base: '/re-zero/',
  define: {
    __GIT_COMMIT__: JSON.stringify(gitCommitHash()),
  },
})
