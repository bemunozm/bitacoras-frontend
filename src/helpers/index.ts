export function formatCurrency(amount: number) {
    return new Intl.NumberFormat('es-CL', {style: 'currency', currency: 'CLP'}).format(amount)
}

export function formatDate(dateStr: string) : string {
    const dateObj = new Date(dateStr)
    const options : Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }

    return new Intl.DateTimeFormat('es-CL', options).format(dateObj)
}

export function getPeriod(dateStr: string) : string {
    const dateObj = new Date(dateStr)
    const options : Intl.DateTimeFormatOptions = {
        month: 'long',
        year: 'numeric'
    }

    const formattedDate = new Intl.DateTimeFormat('es-CL', options).format(dateObj)
    return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)
}

export function validarRut(rut: string): boolean {
    rut = rut.replace(/\./g, '').replace(/-/g, '');
    const cuerpo = rut.slice(0, -1);
    const dv = rut.slice(-1).toLowerCase();

    if (!/^\d+$/.test(cuerpo)) {
        return false;
    }

    let suma = 0;
    let multiplo = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo.charAt(i)) * multiplo;
        multiplo = multiplo === 7 ? 2 : multiplo + 1;
    }

    const dvCalculado = 11 - (suma % 11);
    let dvEsperado;
    if (dvCalculado === 11) {
        dvEsperado = "0";
    } else if (dvCalculado === 10) {
        dvEsperado = "k";
    } else {
        dvEsperado = dvCalculado.toString();
    }

    return dv === dvEsperado;
}

export function validarDNI(dni: string): boolean {
    if (!/^\d+$/.test(dni)) {
        return false;
    }
    if (dni.length < 7 || dni.length > 10) {
        return false;
    }
    return true;
}

export function validarIdentificacion(id: string): boolean {
    id = id.trim();
    if (id.indexOf('-') !== -1 || id.toLowerCase().includes('k')) {
        return validarRut(id);
    } else {
        return validarDNI(id);
    }
}