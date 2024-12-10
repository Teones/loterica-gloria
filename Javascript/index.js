let db = {};
let data = new Date();

async function gerarMensagem() {
    document.getElementById('mensagem').innerText = "Carregando mensagem...";

    const loteriasABuscar = [
        'megasena', 'lotofacil', 'quina', 'lotomania', 'supersete', 'duplasena', 'diadesorte', 'timemania', /*'loteca',*/ 'federal', 'maismilionaria'
    ];

    const dataAtual = data.toLocaleDateString('pt-BR');
    const diaSemana = data.getDay();
    data = dataAtual;
    
    let mensagemCompleta = `A *🍀Lotérica Glória🍀* informa as Loterias CAIXA que estão com sorteios programados para *HOJE, ${dataAtual}*, com suas respectivas estimativas de premiações:\n\n`;

    // Use um loop para buscar e processar as loterias uma por uma
    for (let i = 0; i < loteriasABuscar.length; i++) {
        const loteriaNome = loteriasABuscar[i];
        const api = `https://loteriascaixa-api.herokuapp.com/api/${loteriaNome}/latest`;

        // Aguarda a resposta da API
        try {
            const response = await axios.get(api);
            mensagemCompleta += await processarResposta(response, dataAtual, diaSemana);  // Aguarda o processamento da resposta
        } catch (error) {
            console.error(`Erro ao buscar dados da loteria ${loteriaNome}:`, error);
            mensagemCompleta += `Erro ao buscar dados da loteria ${loteriaNome}.\n\n`;
        }
    }

    mensagemCompleta += "🍀 *Lotérica Glória é bom para Cuité e melhor para você!*"

    // Mostra a mensagem completa (você pode alterar para mostrar na página ou fazer outra ação)
    document.getElementById('mensagem').innerText = mensagemCompleta;
    
    // Habilita o botão baixar imagem
    document.getElementById('downloadImagem').style.display = 'inline';
    document.getElementById('checkbox-container').style.display = 'inline';
}

async function processarResposta(resposta, dataAtual, diaSemana) {
    const loteriasNome = {
        maismilionaria: '+MILIONÁRIA',
        megasena: 'MEGA SENA',
        lotofacil: 'LOTOFÁCIL',
        quina: 'QUINA',
        lotomania: 'LOTOMANIA',
        timemania: 'TIMEMANIA',
        duplasena: 'DUPLA SENA',
        federal: 'FEDERAL',
        diadesorte: 'DIA DE SORTE',
        supersete: 'SUPER SETE',
        /*loteca: 'LOTECA'*/
    };
    
    const res = {...resposta.data};
    
    // Ajusta o valor estimado do próximo concurso para a loteria federal
    if (res.loteria == "federal" && (diaSemana == 3 || diaSemana == 6)) {
        if(res.valorEstimadoProximoConcurso == 0) {
            res.valorEstimadoProximoConcurso = 500000.00;
        }
        res.dataProximoConcurso = dataAtual;
    }
    
    // Verifica se a data do próximo concurso é válida
    if (res.valorEstimadoProximoConcurso == 0) {
        return "";
    } else if (!res || !res.valorEstimadoProximoConcurso) {
        return `Erro ao buscar dados para a loteria ${res.loteria}.\n\n`;
    }
    
    // adiciona a database
    db[res.loteria] = {...res};
    
    // Retorna a mensagem formatada para a loteria específica
    if (res.dataProximoConcurso == dataAtual) {
        return `*${loteriasNome[res.loteria]}*, concurso ${res.concurso + 1}\n* ${Number(res.valorEstimadoProximoConcurso).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}*\n\n`;
    } else {
        return "";
    }
}

function copiarMensagem() {
    const mensagem = document.getElementById('mensagem').innerText;
    
    // Verifica se a mensagem não está vazia
    if (mensagem) {
        const textarea = document.createElement('textarea');
        textarea.value = mensagem;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Mensagem copiada para a área de transferência!');
    } else {
        alert('Não há mensagem para copiar.');
    }
}

async function gerarImagens() {
    // Verifica os checkboxes selecionados
    const checkboxes = [
        { id: 'megasena', dbKey: 'megasena' },
        { id: 'quina', dbKey: 'quina' },
        { id: 'lotofacil', dbKey: 'lotofacil' }
    ].filter(item => document.getElementById(item.id).checked);

    // Verifica se pelo menos uma opção foi selecionada
    if (checkboxes.length > 0) {
        for (const { id, dbKey } of checkboxes) {
            if (db[dbKey]) {
                const loteria = db[dbKey];
                console.log(loteria)
                let info = []
                if(loteria.loteria == 'quina'){
                    info = [
                        { texto: `Concurso ${loteria.concurso + 1}`, font: 40, x: 230, y: -470 },
                        { texto: `É ${loteria.dataProximoConcurso == data ? "HOJE" : "AMANHÃ"}!`, font: 180, x: 0, y: -280 },
                        { texto: `${(loteria.valorEstimadoProximoConcurso / 1000000).toFixed(1)} MILHÕES`, font: 180, x: 0, y: -50 },
                        { texto: loteria.dataProximoConcurso, font: 60, x: 350, y: 580 }
                    ];
                } else if(loteria.loteria == 'megasena'){
                    info = [
                        {texto: `Concurso ${loteria.concurso + 1}`,font: 40, x: 230, y: -450}, 
                        {texto: `É ${loteria.dataProximoConcurso == data? "HOJE" : "Amanhã"}!`, font: 120, x: 0, y: -280}, 
                        {texto: `${(loteria.valorEstimadoProximoConcurso / 1000000)} MILHÕES`,  font: 180, x: 0, y: 0}, 
                        {texto: loteria.dataProximoConcurso, font: 60, x: 440, y: 455}
                      ]
              
                }
                await atualizarImagem(id, info);
                baixarImagem(id); // Chama a função para baixar cada imagem gerada
            } else {
                console.warn(`Dados não encontrados para a loteria: ${dbKey}`);
            }
        }
    } else {
        alert('Selecione pelo menos uma opção!');
    }
}

async function atualizarImagem(loteria, infos) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const imagemBase = new Image();
    imagemBase.src = `../assets/${loteria}.png`;

    return new Promise((resolve) => {
        imagemBase.onload = () => {
            canvas.width = imagemBase.width;
            canvas.height = imagemBase.height;

            // Desenha a imagem base no canvas
            ctx.drawImage(imagemBase, 0, 0);

            // Adiciona texto na imagem
            infos.forEach(info => {
                ctx.font = `bold ${info.font}px Inter`;
                ctx.fillStyle = 'white';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(info.texto, canvas.width / 2 + info.x, canvas.height / 2 + info.y);
            });

            // Atualiza a imagem na página
            const imgElement = document.getElementById('imagemAtualizada');
            imgElement.src = canvas.toDataURL();
            imgElement.style.display = 'inline';
            resolve(); // Resolve a promise quando a imagem for processada
        };
    });
}

function baixarImagem(loteria) {
    const imgElement = document.getElementById('imagemAtualizada');
    const link = document.createElement('a');
    link.href = imgElement.src;
    link.download = `${loteria}-atualizada.png`;
    link.click();
}
