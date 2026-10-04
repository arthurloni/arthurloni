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
    
    let labelAno = years > 1 ? "anos" : "ano";
    let labelMes = months > 1 ? "meses" : "mês";
    
    let timeStr = "";
    if (years > 0) {
        timeStr = years + " " + labelAno + " e " + months + " " + labelMes;
    } else {
        timeStr = months + " " + labelMes;
    }

    // VISUAL CORRETO E PADRONIZADO (COM O '#')
    const cliBlock = 
    "### `$ status.sh`\n\n" +
    "```bash\n" +
    "# Estatísticas Diárias\n" +
    "# --------------------\n" +
    "# Repositórios públicos : " + repos + "\n" +
    "# Contribuições no ano  : " + commits + "\n" +
    "# Tempo de T.I          : " + timeStr + "\n" +
    "```";

    let readme = fs.readFileSync('README.md', 'utf8');
    
    // REGEX AJUSTADA PARA NÃO APAGAR O RESTO DO SEU PERFIL
    readme = readme.replace(
      /[\s\S]*?/, 
      "\n" + cliBlock + "\n"
    );

    fs.writeFileSync('README.md', readme);
    console.log('README atualizado com sucesso!');
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
  }
}

fetchStats();