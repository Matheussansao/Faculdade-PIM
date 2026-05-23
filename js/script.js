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

function agendar(event) {
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

    setTimeout(() => {
        let agendamentos = JSON.parse(localStorage.getItem('ruy_agendamentos')) || [];

        agendamentos.push({
            nome: nome,
            servico: servico,
            data: data,
            hora: hora,
            status: 'Confirmado'
        });

        localStorage.setItem('ruy_agendamentos', JSON.stringify(agendamentos));

        alert("✅ Agendamento confirmado com sucesso! O Ruy já está à tua espera.");
        document.getElementById('formAgendamento').reset();
        
        restaurarBotao(btnAgendar, textoOriginalBtn);
        escutarAgendamentos(); // Atualiza a lista na tela

    }, 800);
}

function restaurarBotao(botao, texto) {
    botao.innerText = texto;
    botao.disabled = false;
    botao.style.opacity = "1";
}

function escutarAgendamentos() {
    const listaUI = document.getElementById("ulAgendamentos");
    let agendamentos = JSON.parse(localStorage.getItem('ruy_agendamentos')) || [];

    listaUI.innerHTML = ""; 
    
    if (agendamentos.length === 0) {
        listaUI.innerHTML = "<li style='text-align:center; color: var(--text-muted);'>Nenhum horário reservado de momento. Seja o primeiro!</li>";
        return;
    }

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
}

if(document.getElementById("ulAgendamentos")) {
    window.onload = escutarAgendamentos;
}