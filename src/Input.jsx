import React, { useState } from 'react';
import axios from 'axios';


const Input = ({fetchNotas}) => {
    //estado para almacenar el valor del input
    const [nota, setNota] = useState('');

    //función para manejar el cambio del input
    const handleInputChange = (e) => {
        setNota(e.target.value); // almacena el valor del input en el estado
    };

    //ruta PROVISIONAL al backend
    const API_URL = 'https://8000-idx-lego-1740498734721.cluster-blu4edcrfnajktuztkjzgyxzek.cloudworkstations.dev/api/brickheadz';

    //función para manejar el clic del button anadir
    const handleSubmit = () => {
        //enviar datos al backend
        axios.post(API_URL, {nota})
        .then(response =>{
            console.log('Nota añadida con éxtio', response.data);
            setNota('')// limpiar el input
            fetchNotas()
        })
        .catch(error => {
            console.error('Error al anadir Nota', error);
        });
    }


    return(
        <div>
            <input
                type ='text'
                placeholder ='Escribe aquí tu nota'
                value ={nota}
                onChange ={handleInputChange}
            />
            <button onClick ={handleSubmit}>Añadir</button>
        </div>
    )
}

export default Input;