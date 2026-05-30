const { execSync } = require('child_process');
execSync('git checkout -- src/app/components/CoachStudents.tsx', { stdio: 'inherit' });
