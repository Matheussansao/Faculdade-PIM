let agendamentos = [];

function agendar(){
    let nome = document.getElementById('nome').value;
    let servico = document.getElementById('servico').value;
    let dataOriginal = document.getElementById('data').value;
    let partesData = dataOriginal.split("-");
    let dataFormatada = `${partesData[2]}/${partesData[1]}/${partesData[0]}`;
    let hora = document.getElementById('hora').value; 

    //valida campos
    if(!nome || !servico || !dataOriginal|| !hora){
        alert("Preencha todos os campos!")
        return;
    }

    //verifica duplicidade
    let horarioExistente = agendamentos.find(agendamento =>

        agendamento.data === dataOriginal &&
        agendamento.hora === hora
    );
    if(horarioExistente){
        alert("Esse horário já está agendado!");
        return;
    }

    //objeto do agendamento
    let novoAgendamento = {
        nome,
        servico,
        data: dataOriginal,
        hora
    };

    //adiciona no array
    agendamentos.push(novoAgendamento);

    //ordena cronologicamente
    agendamentos.sort((a, b) =>{
        let dataA = new Date(`${a.data} ${a.hora}`);
        let dataB = new Date(`${b.data} ${b.hora}`);

        return dataA - dataB;
    });

    //mostra agendamentos
    mostrarAgendamentos();
    
    //whatsapp
    let mensagem = `Olá, gostaria de agendar:

    nome: ${nome}
    servico: ${servico}
    data:${dataFormatada}
    hora:${hora}`;

    let telefone = "5511965511536";
    let url = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;

    window.open(url, "_blank")

    //limpar formulario
    document.getElementById('nome').value = "";
    document.getElementById('servico').value = "";
    document.getElementById('data').value = "";
    document.getElementById('hora').value = "";
}

function mostrarAgendamentos(){

    const lista = document.getElementById("ListaAgendamentos");
    lista.innerHTML = "<h4>Agendamentos:</h4>";
    agendamentos.forEach(agendamento => {

        let partesData = agendamento.data.split("-");
        let dataFormatada = `${partesData[2]}/${partesData[1]}/${partesData[0]}`;
        
        lista.innerHTML += `
        
        <p>
        ${dataFormatada} - 
        ${agendamento.hora} -
        ${agendamento.nome} -
        ${agendamento.servico} -
        </p>
        `;
    });
}