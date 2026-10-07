import fs from 'fs'

const svgs = ['03_Auth_Login.svg', '01_Auth_Register.svg', '02_Auth_Verify_Email.svg']

for (const f of svgs) {
  console.log(`\n=================== ${f} ===================`)
  const content = fs.readFileSync(`figma_exports/${f}`, 'utf8')
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.includes('data:image/png;base64')) {
      console.log(`[Line ${i+1}]: <image href="[LOGO_BASE64]" ${line.slice(line.lastIndexOf('"') + 1)}`)
    } else {
      console.log(`[Line ${i+1}]: ${line}`)
    }
  }
}
