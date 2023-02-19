const shell = require('shelljs')

if (shell.test('-d', './.git')) {
    shell.exec('git pull')
}

shell.exec('npx prisma db push')

shell.exec('npm run build:start')
