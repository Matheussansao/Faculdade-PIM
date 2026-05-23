document.addEventListener('DOMContentLoaded', function() {
    flatpickr("#dataHora", {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        minDate: "today",
        minTime: "09:00",
        maxTime: "20:00",
        locale: "pt",
        disableMobile: "true"
    });
});

async function agendar(event) {
    event.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const servico = document.getElementById('servico').value;
    const dataHoraInput = document.getElementById('dataHora').value; 

    const data = dataHoraInput.split(" ")[0]; 
    const hora = dataHoraInput.split(" ")[1];

    if (!data || !hora) {
        alert("Por favor, seleciona uma data e horário válidos no calendário.");
        return;
    }

    const btnAgendar = document.querySelector('.btn-agendar');
    const textoOriginalBtn = btnAgendar.innerText;
    
    btnAgendar.innerText = "A processar reserva...";
    btnAgendar.disabled = true;
    btnAgendar.style.opacity = "0.7";

    // Prepara os dados para enviar para o MySQL
    const novoAgendamento = {
        nome: nome,
        servico: servico,
        data: data,
        hora: hora,
        status: 'Confirmado'
    };

    try {
        // Envia para a API C#
        const resposta = await fetch('http://localhost:5098/api/Agendamentos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(novoAgendamento)
        });

        if (resposta.ok) {
            alert("✅ Agendamento confirmado com sucesso! O Ruy já está à tua espera.");
            document.getElementById('formAgendamento').reset();
            escutarAgendamentos(); // Atualiza a lista na página
        } else {
            alert("Ops! Ocorreu um problema ao guardar na base de dados.");
        }
    } catch (erro) {
        console.error(erro);
        alert("Erro de ligação. Verifica se a tua API C# está em execução no Visual Studio!");
    } finally {
        restaurarBotao(btnAgendar, textoOriginalBtn);
    }
}

function restaurarBotao(botao, texto) {
    botao.innerText = texto;
    botao.disabled = false;
    botao.style.opacity = "1";
}

async function escutarAgendamentos() {
    const listaUI = document.getElementById("ulAgendamentos");
    if (!listaUI) return; // Evita erros noutras páginas que não tenham a lista

    try {
        // Pede os dados à API C#
        const resposta = await fetch('http://localhost:5098/api/Agendamentos');
        if (!resposta.ok) throw new Error("Erro na API");
        
        const agendamentos = await resposta.json();

        listaUI.innerHTML = ""; 
        
        if (agendamentos.length === 0) {
            listaUI.innerHTML = "<li style='text-align:center; color: var(--text-muted);'>Nenhum horário reservado de momento. Seja o primeiro!</li>";
            return;
        }

        // Mostra os 5 mais recentes
        const ultimosAgendamentos = agendamentos.slice(-5).reverse();

        ultimosAgendamentos.forEach((ag) => {
            const partesData = ag.data.split("-");
            const dataFormatada = `${partesData[2]}/${partesData[1]}/${partesData[0]}`;

            const li = document.createElement("li");
            li.innerHTML = `
                <span class="agendamento-data">📅 ${dataFormatada} às ${ag.hora}</span><br>
                👤 <span style="color: var(--text-main); font-weight: 500;">${ag.nome}</span> <br>
                ✂️ <span style="color: var(--text-muted); font-size: 0.85rem;">${ag.servico}</span>
            `;
            
            listaUI.appendChild(li);
        });
    } catch (erro) {
        listaUI.innerHTML = "<li style='text-align:center; color: #ef4444;'>Não foi possível comunicar com a base de dados.</li>";
    }
}

if(document.getElementById("ulAgendamentos")) {
    window.onload = escutarAgendamentos;
}