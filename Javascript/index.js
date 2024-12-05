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

async function gerarImagens(){
      // Pegando os valores dos checkboxes
    const megasenaSelecionada = document.getElementById('megasena').checked;
    const quinaSelecionada = document.getElementById('quina').checked;
    const lotofacilSelecionada = document.getElementById('lotofacil').checked;

    // Verifica se pelo menos uma opção foi selecionada
    if (megasenaSelecionada || quinaSelecionada || lotofacilSelecionada) {
      console.log(megasenaSelecionada, quinaSelecionada, lotofacilSelecionada);
      if (quinaSelecionada) {
        console.log(db.quina,)

        const info = [
          {texto: `Concurso ${db.quina.concurso + 1}`,font: 40, x: 230, y: -470}, 
          {texto: `É ${db.quina.dataProximoConcurso == data? "HOJE" : "Amanhã"}!`, font: 180, x: 0, y: -280}, 
          {texto: `R$ ${(db.quina.valorEstimadoProximoConcurso / 1000000)} MILHÕES`, font: 180, x: 0, y: -50}, 
          {texto: db.quina.dataProximoConcurso, font: 60, x: 350, y: 580}
      ]

      atualizarImagem('quina', info)
      }
    } else {
      alert('Selecione pelo menos uma opção!');
    }

}


async function atualizarImagem(loteria, infos) {
  // criar canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Carregar a imagem base
  const imagemBase = new Image();
  imagemBase.src = `../assets/${loteria}.png`;

  // Esperar a imagem carregar
  imagemBase.onload = () => {
      canvas.width = imagemBase.width;
      canvas.height = imagemBase.height;

      // Desenhar a imagem base no canvas
      ctx.drawImage(imagemBase, 0, 0);

      // Configurar estilo do texto
      infos.forEach((info) => {
        ctx.font = `bold ${info.font}px Inter`;
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Desenhar o texto no canvas
        ctx.fillText(info.texto, canvas.width / 2 + info.x, canvas.width / 2 + info.y);
    });

      // Atualizar a imagem na página
      const imgElement = document.getElementById('imagemAtualizada');
      imgElement.src = canvas.toDataURL();

      // Mostrar botão de download
      document.getElementById('downloadImagem').style.display = 'inline';

      // Adicionar evento de clique no botão de download
      baixarImagem()
  };
}

function baixarImagem() {
  const imgElement = document.getElementById('imagemAtualizada');
  const link = document.createElement('a');
  link.href = imgElement.src;
  link.download = 'imagem-atualizada.png';
  link.click();
}
