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