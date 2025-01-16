import api from "@/lib/axios"
import { BitacoraForm, bitacoraSchema, BitacoraUpdateForm } from "@/types"
import { isAxiosError } from "axios"

export async function createBitacora(formData: BitacoraForm) {
    try {
        const url = '/bitacoras/create'
        const { data } = await api.post<string>(url, formData)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function getBitacoras() {
    try {
        const url = '/bitacoras/get'
        const { data } = await api.get(url)
        console.log(data)
        const response = bitacoraSchema.array().safeParse(data)
        console.log(response)
        if(response.success) {
            return response.data
        }

    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function getBitacora(id: number) {
    try {
        const url = `/bitacoras/get/${id}`
        const { data } = await api.get<string>(url)
        console.log(data)
        const response = bitacoraSchema.safeParse(data)
        console.log(response)
        if(response.success) {
            return response.data
        }
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function updateBitacora(formData: BitacoraUpdateForm) {
    try {
        const url = `/bitacoras/update/${formData.id}`
        const { data } = await api.put<string>(url, formData)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function deleteBitacora(id: number) {
    try {
        const url = `/bitacoras/delete/${id}`
        const { data } = await api.delete<string>(url)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function changeBitacoraStatus(id: number, status: string) {
    try {
        const url = `/bitacoras/change-status/${id}`
        const { data } = await api.put<string>(url, { status })
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}
