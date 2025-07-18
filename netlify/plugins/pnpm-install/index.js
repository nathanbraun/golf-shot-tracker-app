module.exports = {
  onPreBuild: async ({ utils }) => {
    try {
      await utils.run.command('npm install -g pnpm')
      await utils.run.command('pnpm install')
      console.log('pnpm installation complete')
    } catch (error) {
      utils.build.failBuild('pnpm installation failed', { error })
    }
  }
}

