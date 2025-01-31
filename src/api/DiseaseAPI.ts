import api from "@/lib/axios"
import { Disease, DiseaseForm, diseaseSchema, DiseaseUpdateForm } from "@/types"
import { isAxiosError } from "axios"

export async function createDisease(formData: DiseaseForm) {
    try {
        const url = '/diseases/create'
        const { data } = await api.post<string>(url, formData)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function getDiseases() {
    try {
        const url = '/diseases/get'
        const { data } = await api.get(url)
        const response = diseaseSchema.array().safeParse(data)
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

export async function getDisease(id: Disease['id']) {
    try {
        const url = `/diseases/get/${id}`
        const { data } = await api.get<string>(url)
        console.log(data)
        const response = diseaseSchema.safeParse(data)
        if(response.success) {
            return response.data
        }
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function updateDisease(formData: DiseaseUpdateForm) {
    try {
        const url = `/diseases/update/${formData.id}`
        const { data } = await api.put<string>(url, formData)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function deleteDisease(id: Disease['id']) {
    try {
        const url = `/diseases/delete/${id}`
        const { data } = await api.delete<string>(url)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function assingDiseaseToParticipant(formData: any) {
    try {
        const url = '/diseases/assign-participant'
        const { data } = await api.post<string>(url, formData)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function updateAssignedDisease(formData: any) {
    try {
        const url = '/diseases/update-participant'
        const { data } = await api.put<string>(url, formData)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function deleteAssignedDisease(id: number) {
    try {
        const url = `/diseases/remove-participant/${id}`
        const { data } = await api.delete<string>(url)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function getAssignedDisease(id: number) {
    try {
        const url = `/diseases/get-disease/${id}`
        const { data } = await api.get(url)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}