async function gerarMensagem() {
    document.getElementById('mensagem').innerText = "Carregando mensagem...";

    const loteriasABuscar = [
        'maismilionaria', 'megasena', 'lotofacil', 'quina', 'lotomania',
        'timemania', 'duplasena', 'federal', 'diadesorte', 'supersete'
    ];

    const dataAtual = new Date().toLocaleDateString('pt-BR');
    
    let mensagemCompleta = `A *🍀Lotérica Glória🍀* informa as Loterias CAIXA que estão com sorteios programados para *HOJE, ${dataAtual}*, com suas respectivas estimativas de premiações:\n\n`;

    // Use um loop para buscar e processar as loterias uma por uma
    for (let i = 0; i < loteriasABuscar.length; i++) {
        const loteriaNome = loteriasABuscar[i];
        const api = `https://loteriascaixa-api.herokuapp.com/api/${loteriaNome}/latest`;

        // Aguarda a resposta da API
        try {
            const response = await axios.get(api);
            mensagemCompleta += await processarResposta(response, dataAtual);  // Aguarda o processamento da resposta
        } catch (error) {
            console.error(`Erro ao buscar dados da loteria ${loteriaNome}:`, error);
            mensagemCompleta += `Erro ao buscar dados da loteria ${loteriaNome}.\n\n`;
        }
    }

    // Mostra a mensagem completa (você pode alterar para mostrar na página ou fazer outra ação)
    document.getElementById('mensagem').innerText = mensagemCompleta;
}

async function processarResposta(resposta, dataAtual) {
    const loteriasNome = {
        maismilionaria: 'MAIS MILIONÁRIA',
        megasena: 'MEGA SENA',
        lotofacil: 'LOTOFÁCIL',
        quina: 'QUINA',
        lotomania: 'LOTOMANIA',
        timemania: 'TIMEMANIA',
        duplasena: 'DUPLA SENA',
        federal: 'FEDERAL',
        diadesorte: 'DIA DE SORTE',
        supersete: 'SUPER SETE'
    };

    const res = resposta.data;

    // Verifica se a data do próximo concurso é válida
    if (res.valorEstimadoProximoConcurso == 0) {
        return "";
    } else if (!res || !res.valorEstimadoProximoConcurso) {
        return `Erro ao buscar dados para a loteria ${res.loteria}.\n\n`;
    }

    // Retorna a mensagem formatada para a loteria específica
    if (res.dataProximoConcurso == dataAtual) {
        return `*${loteriasNome[res.loteria]}*, concurso ${res.concurso + 1}\n*R$ ${Number(res.valorEstimadoProximoConcurso).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}*\n\n`;
    } else {
        return "";
    }
}

function copiarMensagem(){
    const mensagem = document.getElementById('mensagem').innerText;
    navigator.clipboard.writeText(mensagem);
    alert('Mensagem copiada para a área de transferência!');
}