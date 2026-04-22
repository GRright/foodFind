const cloudbase = require('@cloudbase/node-sdk')
const fs = require('fs')
const path = require('path')

const app = cloudbase.init({
  env: 'cloud1-d7gvzylmp17ed1957'
})

async function deployFunction(fnName) {
  const fnDir = path.join(__dirname, 'cloudfunctions', fnName)
  console.log(`Deploying ${fnName}...`)
  
  try {
    const result = await app.invokeFunction('cloudbase.functions.deploy', {
      FunctionName: fnName,
      ZipFile: fs.readdirSync(fnDir).reduce((acc, file) => {
        const filePath = path.join(fnDir, file)
        acc[file] = fs.readFileSync(filePath, 'base64')
        return acc
      }, {}),
      Force: true
    })
    console.log(`✓ ${fnName} deployed successfully`)
  } catch (err) {
    console.error(`✗ ${fnName} failed:`, err.message)
  }
}

const fnName = process.argv[2] || 'getPairInfo'
deployFunction(fnName)
