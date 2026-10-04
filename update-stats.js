const fs = require('fs');

async function fetchStats() {
  const username = 'arthurloni';
  const token = process.env.GITHUB_TOKEN;

  const headers = {
    'Authorization': `bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const query = `
  {
    user(login: "${username}") {
      repositories(privacy: PUBLIC) {
        totalCount
      }
      contributionsCollection {
        contributionCalendar {
          totalContributions
        }
      }
    }
  }`;

  try {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers,
      body: JSON.stringify({ query })
    });

    const data = await response.json();
    const repos = data.data.user.repositories.totalCount;
    const commits = data.data.user.contributionsCollection.contributionCalendar.totalContributions;

    const start = new Date('2024-02-01');
    const now = new Date();
    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    if (months < 0) { 
        years--; 
        months += 12; 
    }
    
    let timeStr = '';
    if (years > 0) timeStr += `\({years} ano\){years > 1 ? 's' : ''} e `;
    timeStr += `\({months} mês\){months > 1 ? 'es' : ''}`;

    const cliBlock = 
    `\`\`\`bash\n` +
    `> arthurloni@github:~$ ./status.sh\n` +
    `> \n` +
    `> [>] Repositórios públicos : ${repos}\n` +
    `> [>] Contribuições/ano     : ${commits}\n` +
    `> [>] Tempo de T.I          : ${timeStr}\n` +
    `\`\`\``;

    let readme = fs.readFileSync('README.md', 'utf8');
    readme = readme.replace(
      /[\s\S]*/, 
      `\n${cliBlock}\n`
    );

    fs.writeFileSync('README.md', readme);
    console.log('README atualizado com sucesso!');
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
  }
}

fetchStats();