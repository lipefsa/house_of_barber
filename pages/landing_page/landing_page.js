const apiPath = "/house_of_barber/api";

const buildClienteArea = () => {
    loading();

    const token = Cookies.get('user_token');

    const headers = {
        'Content-Type': 'application/json',
        'token': token
    };

    request('./api/estabelecimentos/recentes', headers, 'GET', '', (data) => {
        const cardsBarbeariaWrapper = document.querySelector("#cards-barbearias");
        if(!cardsBarbeariaWrapper) { 
            closeLoading();
            return;
        };

        if (data.error == "true") {
            msgWithRedirect("error", "Ooops!", data.message, "/house_of_barber");
        }
        else {
            if (data && data.length > 0) {
                data.forEach(establishment => {
                    const {
                        estabelecimento_id,
                        nome,
                        horario_abertura,
                        horario_fechamento,
                        telefone,
                        cidade,
                        status_funcionamento,
                        foto_perfil
                    } = establishment;

                    let horarioAberturaFormat = "";
                    let horarioFechamentoFormat = "";
                    let fotoPerfil;

                    if (horario_abertura == "FECHADO") {
                        horarioAberturaFormat = "Fechado"
                    }
                    else if (horario_abertura) {
                        horarioAberturaFormat = `${horario_abertura}H - `;
                        horarioFechamentoFormat = `${horario_fechamento}H`;
                    }

                    if (foto_perfil == null || foto_perfil == "") {
                        fotoPerfil = `assets/images/cliente-sem-ft.png`;
                    }
                    else {
                        fotoPerfil = `uploads/barbearia/resized_${foto_perfil}`;
                    }

                    cardsBarbeariaWrapper.innerHTML += `
                        <div class='swiper-slide'>
                            <div class='landing-page-cliente-card'>
                                <div class='landing-page-cliente-card-header'>
                                    <img 
                                        class='card-img-top' 
                                        src='${fotoPerfil}' 
                                        alt='Imagem de capa do card'
                                    />
                                    <div class='status-${status_funcionamento == "ABERTO" ? "aberto" : "fechado"}'>
                                    ${status_funcionamento} </div>
                                    </div>
                                </div>
                                <div class='card-body hb-txt-white'>
                                    <h5 class='card-title hb-w-700 hb-txt-secondary'>
                                        ${nome}
                                    </h5>
                                    
                                    <div class='card-text'>
                                        <p>
                                            <i class='fa fa-clock-o'></i>
                                            <span class='ml-1'>
                                                ${horarioAberturaFormat} 
                                                ${horarioFechamentoFormat}
                                            </span>
                                        </p>    
                                        <p>
                                            <i class='fa fa-phone'></i>
                                            <span class='ml-1'>${telefone}</span>
                                        </p>        
                                        <p>
                                            <i class='fa fa-map-marker'></i>
                                            <span class='ml-1'>${cidade}</span>
                                        </p>            
                                    </div>
                                    <a 
                                        href='/house_of_barber/cliente/login' 
                                        class='btn hb-btn-secondary hb-w-700 hb-full-width'
                                    >
                                        Agendar
                                    </a>
                                </div>
                            </div>
                        </div>
                    `;
                })

                closeLoading();
            }

            const swiper = new Swiper(".establishments-carousel", {
                slidesPerView: 1.25,
                spaceBetween: 30,
                loop: false,
                breakpoints: {
                    1200: {
                        slidesPerView: 3.5,
                    }
                }
            });
        }
    });
}

buildClienteArea();