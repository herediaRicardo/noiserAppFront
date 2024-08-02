//HOME: PrimeraPagina
const nombreUsuario2 = localStorage.getItem('user_name');
console.log('Nombre de usuario desde localStorage:', nombreUsuario2); // debug de consola

if (nombreUsuario2) {
    setTimeout(() => {
        alert(`Bienvenido, ${nombreUsuario2}!`);
    }, 1500); //retraso de la indicacion 
} else {
    console.log('No se encontró un nombre de usuario en localStorage.');
}


//POSTEOS: SegundaPagina

document.addEventListener('DOMContentLoaded', function() {
    fetchPublicaciones();
});

function fetchPublicaciones() {
    fetch('http://127.0.0.1:8000/api/publications', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('access_token') 
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la solicitud');
        }
        return response.json();
    })
    .then(data => {
        // Depuracion de publicaciones
        console.log(data); 
        displayPublicaciones(data);
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Ocurrió un error al intentar obtener las publicaciones');
    });
}

function displayPublicaciones(publicaciones) {
    const container = document.getElementById('publicacionesContainer');
    // Limpia el contenedor de publicaciones para permitir el inner
    container.innerHTML = ''; 

    publicaciones.forEach(publicacion => {
        //Depuracion de las publicaciones por consola
        console.log(publicacion); 

        const publicacionElement = document.createElement('div');
        publicacionElement.className = 'contenedorPublicacion';
        const userName = publicacion.user ? publicacion.user.name : 'Usuario desconocido';
        const ratings = Array.isArray(publicacion.ratings) ? publicacion.ratings : [];

        let mediaContent = '';
        if (publicacion.media) {
            const mediaUrl = publicacion.media;
            if (mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be')) {
                const videoId = getYouTubeVideoId(mediaUrl);
                mediaContent = `
                    <iframe class="publicacion-media" width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
                `;
            } else {
                const mediaType = mediaUrl.split('.').pop().toLowerCase();
                if (['jpg', 'jpeg', 'png', 'gif'].includes(mediaType)) {
                    mediaContent = `<img src="${mediaUrl}" alt="Publicación multimedia" class="publicacion-media">`;
                } else if (['mp4', 'webm', 'ogg'].includes(mediaType)) {
                    mediaContent = `
                        <video controls class="publicacion-media">
                            <source src="${mediaUrl}" type="video/${mediaType}">
                            Tu navegador no soporta la reproducción de videos.
                        </video>
                    `;
                }
            }
        }

        // Si no hay media que muestre la por defecto (no me la encuentra)
        if (!mediaContent) {
            mediaContent = `<img src="./assets/img/pruebaPubli.png" alt="Publicación multimedia" class="publicacion-media">`;
        }

        publicacionElement.innerHTML = `
            <div>
                <span id="nickPublicacion">${userName}</span>
            </div>
            <div>
                <h4 style="margin-bottom: -10px;"><span id="tituloPublicacion">${publicacion.title}</span></h4>
                <p><span id="descripcion">${publicacion.description}</span></p>
                <div id="imagenPublicacion">${mediaContent}</div>
            </div>
            <div class="publicacion-comentarios">
                <h5><span>Comentarios</span></h5>
                <div class="comentarios-list">
                    ${ratings.slice(0, 3).map((rating, index) => {
                        const ratingUserName = rating.user ? rating.user.name : 'Usuario desconocido';
                        return `
                            <div class="comentario">
                                <span id="usuarioComentario"><strong>${ratingUserName}</strong></span><br>
                                <span>${rating.comment}</span>
                                <hr>
                            </div>
                        `;
                    }).join('')}
                    ${ratings.slice(3).map((rating, index) => {
                        const ratingUserName = rating.user ? rating.user.name : 'Usuario desconocido';
                        return `
                            <div class="comentario hidden" style="display:none;">
                                <span id="usuarioComentario"><strong>${ratingUserName}</strong></span><br>
                                <span>${rating.comment}</span>
                                <hr>
                            </div>
                        `;
                    }).join('')}
                </div>
                ${ratings.length > 3 ? '<button class="more-comments-btn">Más comentarios</button>' : ''}
                <button class="less-comments-btn" style="display:none;">Menos comentarios</button>
                <form class="comentario-form">
                    <input type="text" placeholder="Agrega un comentario" class="comentario-input">
                    <button type="button" class="comentario-btn" data-publicacion-id="${publicacion.id}">Enviar</button>
                </form>
            </div>
        `;

        container.appendChild(publicacionElement);
    });

    //Funcionalidad de "Más comentarios"
    document.querySelectorAll('.more-comments-btn').forEach(button => {
        button.addEventListener('click', function() {
            const comentariosList = this.previousElementSibling;
            const hiddenComentarios = comentariosList.querySelectorAll('.comentario.hidden');
            hiddenComentarios.forEach(comentario => comentario.style.display = 'block');
            // Ocultar el botón "Más comentarios"
            this.style.display = 'none'; 
             // Mostrar el botón "Menos comentarios"
            this.nextElementSibling.style.display = 'block';
        });
    });

    //Funcionalidad de "Menos comentarios"
    document.querySelectorAll('.less-comments-btn').forEach(button => {
        button.addEventListener('click', function() {
            const comentariosList = this.previousElementSibling.previousElementSibling;
            const hiddenComentarios = comentariosList.querySelectorAll('.comentario.hidden');
            hiddenComentarios.forEach(comentario => comentario.style.display = 'none');
            // Ocultar el botón "Menos comentarios"
            this.style.display = 'none'; 
            // Mostrar el botón "Más comentarios"
            this.previousElementSibling.style.display = 'block'; 
        });
    });

    document.querySelectorAll('.comentario-btn').forEach(button => {
        button.addEventListener('click', addComentario);
    });
}

function addComentario(event) {
    const publicacionId = event.target.getAttribute('data-publicacion-id');
    const comentarioInput = event.target.previousElementSibling;
    const comentario = comentarioInput.value;
}

function addComentario(event) {
    const button = event.target;
    const publicacionId = button.getAttribute('data-publicacion-id');
    // Obtiene el formulario más cercano
    const comentarioForm = button.closest('.comentario-form'); 
    // Encuentra el input dentro del formulario
    const comentarioInput = comentarioForm.querySelector('.comentario-input'); 
    // Usa trim() para eliminar espacios adicionales
    const comentario = comentarioInput.value.trim(); 

    if (!comentario) {
        alert('Por favor, escribe un comentario.');
        return;
    }

    const userId = localStorage.getItem('user_id');
    if (!userId) {
        alert('Te has desconectado. Por favor, inicia sesión nuevamente.');
        window.location.href = '#login';
        return;
        
    }

    fetch('http://127.0.0.1:8000/api/ratings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        },
        body: JSON.stringify({
            user_id: userId,
            publication_id: publicacionId,
            comment: comentario,
            rating: 5 // Esto todavia no lo hicee funcional
        }),
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(errorData.message || 'Error al agregar el comentario');
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Comentario agregado:', data);
        // Limpia el campo de comentario
        comentarioInput.value = ''; 
        // Actualiza la lista de publicaciones
        fetchPublicaciones(); 
    })
    .catch(error => {
        console.error('Error:', error);
        alert(`Error: ${error.message}`);
    });
}
//Funcion para permitir videos de youtube (me lo robe de otro proyecto)
function getYouTubeVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|\/u\/\w\/|embed\/|watch\?v=|\&v=|\/v\/|v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

$(document).ready(function() {
    // Mostrar el modal al hacer clic en el botón de agregar publicación
    $('#addPublicationButton').on('click', function(e) {
        e.preventDefault(); 
        // Abre el modal
        $('#addPublicationPopup').popup('open'); 
    });

    // Oculta el modal al hacer clic en el botón de cancelar dentro del modal
    $('#cancelButton').on('click', function(e) {
        e.preventDefault(); 
        // Cierra el modal
        $('#addPublicationPopup').popup('close'); 
    });

    // Enviar el formulario para agregar una nueva publicación
    $('#publicationForm').on('submit', function(e) {
        e.preventDefault(); 

        const userId = localStorage.getItem('user_id');
        if (!userId) {
            alert('Te has desconectado. Por favor, inicia sesión nuevamente.');
            window.location.href = '#login';
            return;
        }

        const title = $('#title').val();
        const description = $('#description').val();
        const media = $('#media').val();

        fetch('http://127.0.0.1:8000/api/publications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            },
            body: JSON.stringify({
                title: title,
                description: description,
                media: media,
                user_id: userId
            }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la solicitud');
            }
            return response.json();
        })
        .then(data => {
            console.log('Respuesta del servidor:', data);
            // Cierra el modal
            $('#addPublicationPopup').popup('close'); 
            // Actualiza la lista de publicaciones
            fetchPublicaciones(); 
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Ocurrió un error al intentar agregar la publicación');
        });
    });
});		

//LOGIN Y REGISTER
document.getElementById('form').addEventListener('submit', function(e) {
    e.preventDefault();
    const correo = document.getElementById('correo').value;
    const contrasena = document.getElementById('contrasena').value;
    
    fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            email: correo,
            password: contrasena,
        }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la solicitud');
        }
        return response.json();
    })
    .then(data => {
        //Debug servidor
        console.log('Respuesta del servidor:', data);
        if (data.token) {
            localStorage.setItem('access_token', data.token);
            if (data.user && data.user.id) {
                const userId = data.user.id;
                const nombreUsuario = data.user.name;
                // Almacenar el ID y nombre del usuario
                localStorage.setItem('user_id', userId); 
                localStorage.setItem('user_name', nombreUsuario); 
                // Guarda la hora de inicio de sesión y la duración de la sesión 
                const sessionDuration = 1 * 60 * 1000; 
                const loginTime = Date.now();
                localStorage.setItem('login_time', loginTime);
                localStorage.setItem('session_duration', sessionDuration);
                alert(`Inicio de sesión exitoso. Bienvenido, ${nombreUsuario}!`);
                window.location.href = 'index.html#primera';
            } else {
                console.error('El objeto usuario no está definido o no tiene una propiedad `id`:', data.user);
                alert('Error al iniciar sesión: Información de usuario inválida');
            }
        } else {
            alert('Error al iniciar sesión: Credenciales inválidas');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Ocurrió un error al intentar iniciar sesión');
    });
});

function checkSessionTimeout() {
    const loginTime = localStorage.getItem('login_time');
    const sessionDuration = localStorage.getItem('session_duration');
    
    if (loginTime && sessionDuration) {
        const currentTime = Date.now();
        if (currentTime - loginTime > sessionDuration) {
            alert('Tiempo de sesión agotado, vuelve a ingresar');
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_id');
            localStorage.removeItem('user_name');
            localStorage.removeItem('login_time');
            localStorage.removeItem('session_duration');
            window.location.href = '#login';
        }
    }
}

// Verificar el tiempo de sesion cada 30 segundos (se puede cambiar)
setInterval(checkSessionTimeout, 30000);

// Cuando carga el documento llama al check
document.addEventListener('DOMContentLoaded', function() {
    checkSessionTimeout();
});




      
          document.getElementById('formRegistro').addEventListener('submit', function(e) {
              e.preventDefault();
              
              const nombre = document.getElementById('nombre').value;
              const email = document.getElementById('emailRegistro').value;
              const contrasena = document.getElementById('contrasenaRegistro').value;
              
              fetch('http://127.0.0.1:8000/api/register', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      'Accept': 'application/json',
                  },
                  body: JSON.stringify({
                      name: nombre,
                      email: email,
                      password: contrasena,
                  }),
              })
              .then(response => {
                  if (!response.ok) {
                      throw new Error('Error en la solicitud');
                  }
                  return response.json();
              })
              .then(data => {
                  console.log('Respuesta del servidor:', data);  //depuracion despues se va
                  if (data.access_token) {
                      localStorage.setItem('access_token', data.access_token);
                      alert('Registro exitoso');
                  } else {
                      alert(data.message);
                  }
              })
              .catch(error => {
                  console.error('Error:', error);
                  alert('Ocurrió un error al intentar registrarse');
              });
          });

// Agregar el evento click al botón de logout
document.getElementById('logoutButton').addEventListener('click', function(e) {
    // Evita la redirección predeterminada
    e.preventDefault();
    // Elimina tocken de acceso e id de usuario
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
    alert('Sesión finalizada con éxito');
    window.location.href = '#login'; 
});