import api from "@/lib/axios"
import { Provision, ProvisionForm, provisionSchema, ProvisionUpdateForm } from "@/types"
import { isAxiosError } from "axios"

export async function createProvision(formData: ProvisionForm) {
    try {
        const url = '/provisions/create'
        const { data } = await api.post<string>(url, formData)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function getProvisions() {
    try {
        const url = '/provisions/get'
        const { data } = await api.get(url)
        const response = provisionSchema.array().safeParse(data)
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

export async function getProvision(id: Provision['id']) {
    try {
        const url = `/provisions/get/${id}`
        const { data } = await api.get<string>(url)
        console.log(data)
        const response = provisionSchema.safeParse(data)
        if(response.success) {
            return response.data
        }
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function updateProvision(formData: ProvisionUpdateForm) {
    try {
        const url = `/provisions/update/${formData.id}`
        const { data } = await api.put<string>(url, formData)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function deleteProvision(id: Provision['id']) {
    try {
        const url = `/provisions/delete/${id}`
        const { data } = await api.delete<string>(url)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function getProvisionsAssignedByDate(date: string, turn: string) {
    try {
        const url = `/provisions/get/assigned-provisions/${date}/${turn}`
        const { data } = await api.get(url)
        console.log(data)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function getProvisionsByParticipant (id: number) {
    try {
        const url = `/provisions/participant/${id}`
        const { data } = await api.get(url)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function getDeliveredBenefit(id: number) {
    try {
        const url = `/provisions/delivered/${id}`
        const { data } = await api.get(url)
        console.log(data)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}