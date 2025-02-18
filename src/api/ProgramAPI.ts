import api from "@/lib/axios"
import { Program, ProgramForm, programSchema, ProgramUpdateForm, ProgramUser, ProgramUserForm } from "@/types"
import { isAxiosError } from "axios"

export async function createProgram(formData: ProgramForm) {
    try {
        const url = '/programs/create'
        const { data } = await api.post<string>(url, formData)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function getPrograms() {
    try {
        const url = '/programs/get'
        const { data } = await api.get(url)
        const response = programSchema.array().safeParse(data)
        if(response.success) {
            return response.data
        }

    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function getProgram(id: Program['id']) {
    try {
        const url = `/programs/get/${id}`
        const { data } = await api.get<string>(url)
        console.log(data)
        const response = programSchema.safeParse(data)
        if(response.success) {
            return response.data
        }
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function updateProgram(formData: ProgramUpdateForm) {
    try {
        const url = `/programs/update/${formData.id}`
        const { data } = await api.put<string>(url, formData)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function deleteProgram(id: Program['id']) {
    try {
        const url = `/programs/delete/${id}`
        const { data } = await api.delete<string>(url)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function associateUser(formData: ProgramUserForm) {
    try {
        const url = `/programs/associate`
        const { data } = await api.post<string>(url, formData)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function disassociateUser(id: ProgramUser['id']) {
    try {
        const url = `/programs/disassociate/${id}`
        const { data } = await api.delete<string>(url)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function updateAssociation(id: ProgramUser['id'], turn: ProgramUser['turn']) {
    try {
        const url = `/programs/update-association/${id}`
        const { data } = await api.put<string>(url, { turn })
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}